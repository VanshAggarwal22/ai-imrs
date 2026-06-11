import { supabase } from './SupabaseService';

const CONFIG_KEY = 'imrs_smtp_config';
const SUPABASE_TABLE = 'app_settings';
const SUPABASE_ROW_ID = 'smtp_config';

export const EmailService = {
    // ---- LOCAL STORAGE (fallback & cache) ----
    getConfig() {
        try {
            const stored = localStorage.getItem(CONFIG_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse email config', e);
        }
        return null;
    },

    saveConfigLocal(config) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    },

    // ---- SUPABASE SYNC (persistent across all devices) ----
    async saveConfig(config) {
        // Always save locally as cache
        this.saveConfigLocal(config);

        // If Supabase is connected, also persist there
        if (supabase) {
            const { error } = await supabase.from(SUPABASE_TABLE).upsert({
                id: SUPABASE_ROW_ID,
                data: JSON.stringify(config),
                updated_at: new Date().toISOString()
            });

            if (error) {
                console.error("Supabase upsert error:", error);
                throw new Error(error.message);
            }
        }
    },

    async loadConfigFromCloud() {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from(SUPABASE_TABLE)
                .select('data')
                .eq('id', SUPABASE_ROW_ID)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error("Supabase load error:", error);
            }
            
            if (data && data.data) {
                const config = JSON.parse(data.data);
                // Cache locally so it's fast on next load
                this.saveConfigLocal(config);
                return config;
            }
        } catch (e) {
            console.warn('Could not load email config from cloud:', e.message);
        }
        return null;
    },

    // ---- PDF GENERATION (for email attachments) ----
    async generatePdfBase64(htmlString, filename = 'document.pdf') {
        // Load html2pdf if not loaded
        if (!window.html2pdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }

        // Build a fresh wrapper to hold it without corrupting the original inline flex/padding styles
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.zIndex = '-9999';
        wrapper.style.pointerEvents = 'none';
        
        wrapper.innerHTML = htmlString;
        document.body.appendChild(wrapper);

        const pageEl = wrapper.firstElementChild;
        // Reinforce exact dimensions just in case, while preserving flex
        pageEl.style.width = '794px';
        pageEl.style.height = '1123px';
        pageEl.style.boxSizing = 'border-box';
        pageEl.style.overflow = 'hidden';

        // Wait for images to load
        const images = pageEl.querySelectorAll('img');
        await Promise.all([...images].map(img => 
            img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
        ));

        const opt = {
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, width: 794, height: 1123, scrollX: 0, scrollY: 0 },
            jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }
        };

        try {
            const pdfDataUri = await window.html2pdf().set(opt).from(pageEl).outputPdf('datauristring');
            const base64 = pdfDataUri.split(',')[1];
            return base64;
        } finally {
            if (wrapper.parentNode) document.body.removeChild(wrapper);
        }
    },

    // ---- SEND EMAIL ----
    async sendEmail(to, subject, htmlContent, attachments = []) {
        const config = this.getConfig();
        
        if (!config || !config.smtpHost || !config.smtpUser || !config.smtpPass) {
            throw new Error('SMTP Configuration is missing. Please configure it in the Settings page.');
        }

        const payload = {
            ...config,
            to,
            subject,
            html: htmlContent,
            fromName: config.fromName || 'IMRS',
            attachments
        };

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send email.');
        }
        return data;
    }
};
