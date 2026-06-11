import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Save, Settings as SettingsIcon, Wifi, WifiOff, TestTube2, Globe, KeyRound } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { EmailService } from '../../services/EmailService';
import { supabase } from '../../services/SupabaseService';

export default function Settings() {
    const { showToast } = useToast();
    const [emailConfig, setEmailConfig] = useState({
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        fromName: 'Aggarwal Industries'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [cloudSync, setCloudSync] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            // Try cloud first, then fall back to local
            const cloudConfig = await EmailService.loadConfigFromCloud();
            if (cloudConfig) {
                setEmailConfig(cloudConfig);
                setCloudSync(true);
            } else {
                const localConfig = EmailService.getConfig();
                if (localConfig) setEmailConfig(localConfig);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await EmailService.saveConfig(emailConfig);
            setCloudSync(!!supabase);
            showToast('✅ SMTP settings saved' + (supabase ? ' & synced to cloud!' : ' locally!'));
        } catch (e) {
            showToast('Failed to save: ' + e.message);
        }
        setIsSaving(false);
    };

    const handleTestConnection = async () => {
        if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass) {
            showToast('Please fill all SMTP fields before testing.');
            return;
        }
        setIsTesting(true);
        try {
            await EmailService.sendEmail(
                emailConfig.smtpUser, 
                '✅ IMRS Test Email - Connection Successful', 
                `<div style="font-family:sans-serif;padding:20px"><h2 style="color:#1e3a8a">🎉 SMTP Connection Verified!</h2><p>This confirms your IMRS email integration is working correctly.</p><p style="color:#64748b;font-size:12px">Sent at: ${new Date().toLocaleString()}</p></div>`
            );
            showToast('✅ Test email sent to ' + emailConfig.smtpUser + '! Check your inbox.');
        } catch (e) {
            showToast('❌ Test failed: ' + e.message);
        }
        setIsTesting(false);
    };

    return (
        <div className="page-content" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <SettingsIcon size={24} color="var(--accent-blue-light)" />
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>System Settings</h1>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: cloudSync ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: cloudSync ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                    {cloudSync ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {cloudSync ? 'Cloud Synced' : 'Local Only'}
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Email Configuration (SMTP)</h3>
                            <p className="card-subtitle">Configure outbound mail for AI Sales, Quotations, and CoC.</p>
                        </div>
                        <Mail className="text-blue" size={20} color="var(--accent-blue)" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label className="form-label">SMTP Host</label>
                            <input
                                type="text"
                                className="form-input"
                                value={emailConfig.smtpHost}
                                onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                                placeholder="smtp.gmail.com"
                            />
                        </div>

                        <div className="grid-2" style={{ marginBottom: 0, gap: '14px' }}>
                            <div>
                                <label className="form-label">SMTP Port</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={emailConfig.smtpPort}
                                    onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})}
                                    placeholder="587"
                                />
                            </div>
                            <div>
                                <label className="form-label">Sender Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={emailConfig.fromName}
                                    onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
                                    placeholder="Company Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Email Address (SMTP User)</label>
                            <input
                                type="email"
                                className="form-input"
                                value={emailConfig.smtpUser}
                                onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})}
                                placeholder="your.email@domain.com"
                            />
                        </div>

                        <div>
                            <label className="form-label">App Password / SMTP Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={emailConfig.smtpPass}
                                onChange={(e) => setEmailConfig({...emailConfig, smtpPass: e.target.value})}
                                placeholder="Enter App Password"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? <CheckCircle2 className="spin" size={16} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Configuration'}
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                style={{ justifyContent: 'center' }}
                                onClick={handleTestConnection}
                                disabled={isTesting || !emailConfig.smtpHost}
                            >
                                {isTesting ? <CheckCircle2 className="spin" size={16} /> : <TestTube2 size={16} />}
                                {isTesting ? 'Sending...' : 'Test'}
                            </button>
                        </div>
                        
                        {EmailService.getConfig()?.smtpHost && (
                            <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={14} /> Mail integration is currently active — using <strong>{EmailService.getConfig().smtpUser}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">How to Connect Your Email</h3>
                                <p className="card-subtitle">Works with personal & business accounts</p>
                            </div>
                            <AlertCircle size={20} color="var(--accent-orange)" />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                            <div style={{ padding: '10px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid var(--accent-blue)' }}>
                                <strong style={{ color: 'var(--accent-blue-light)' }}>📧 Gmail / Google Workspace (Business)</strong>
                                <ul style={{ paddingLeft: '16px', margin: '6px 0 0' }}>
                                    <li>Host: <code>smtp.gmail.com</code> — Port: <code>587</code></li>
                                    <li>Enable 2-Step Verification → <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{color: 'var(--accent-blue-light)'}}>Create App Password</a></li>
                                    <li>Works for both <code>you@gmail.com</code> and <code>you@yourdomain.com</code> (Google Workspace)</li>
                                </ul>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid var(--accent-purple)' }}>
                                <strong style={{ color: 'var(--accent-purple)' }}>🏢 Outlook / Office 365 (Business)</strong>
                                <ul style={{ paddingLeft: '16px', margin: '6px 0 0' }}>
                                    <li>Host: <code>smtp-mail.outlook.com</code> — Port: <code>587</code></li>
                                    <li>Use your regular login password or App Password</li>
                                </ul>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid var(--accent-orange)' }}>
                                <strong style={{ color: 'var(--accent-orange)' }}>🌐 Custom Domain / cPanel / Hostinger</strong>
                                <ul style={{ paddingLeft: '16px', margin: '6px 0 0' }}>
                                    <li>Host: <code>mail.yourdomain.com</code> — Port: <code>587</code> or <code>465</code> (SSL)</li>
                                    <li>Use your business email & password from your hosting panel</li>
                                </ul>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(236,72,153,0.08)', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
                                <strong style={{ color: '#ec4899' }}>📱 Yahoo / Other Personal</strong>
                                <ul style={{ paddingLeft: '16px', margin: '6px 0 0' }}>
                                    <li>Host: <code>smtp.mail.yahoo.com</code> — Port: <code>587</code></li>
                                    <li>Generate an App Password from your account security settings</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Where Are My Credentials Stored?</h3>
                                <p className="card-subtitle">Security & sync information</p>
                            </div>
                            <KeyRound size={20} color="var(--accent-green)" />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <Globe size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-blue-light)' }} />
                                <div>
                                    <strong>Cloud Sync (Supabase):</strong> If Supabase is connected, your SMTP settings are stored in your private database and will <strong>sync across all devices & browsers</strong> automatically.
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                <WifiOff size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-orange)' }} />
                                <div>
                                    <strong>Local Fallback:</strong> If no cloud DB is connected, credentials are saved in your browser's localStorage. They <strong>will not sync</strong> across devices—you'll need to re-enter them on each new browser.
                                </div>
                            </div>
                            <div style={{ padding: '8px', background: 'rgba(16,185,129,0.08)', borderRadius: '6px', fontSize: '11px', color: 'var(--accent-green)' }}>
                                💡 <strong>Tip:</strong> Credentials are never sent to any third-party. They go directly from your browser to your own SMTP server.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
}
