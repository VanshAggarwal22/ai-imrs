export const GoogleSheetService = {
    webAppUrl: localStorage.getItem('imrs_gas_url') || '',

    setWebAppUrl(url) {
        this.webAppUrl = url;
        localStorage.setItem('imrs_gas_url', url);
    },

    async fetchAll() {
        if (!this.webAppUrl) return null;
        try {
            const res = await fetch(this.webAppUrl);
            const json = await res.json();
            if (json.success) return json.data;
        } catch (e) {
            console.error("Failed to fetch from Google Sheets", e);
        }
        return null;
    },

    async syncAll(payload) {
        if (!this.webAppUrl) return;
        try {
            await fetch(this.webAppUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'text/plain' to avoid CORS preflight to Google Apps Script
                body: JSON.stringify({ action: 'sync_all', payload })
            });
        } catch (e) {
            console.error("Failed to sync to Google Sheets", e);
        }
    }
};
