import { Mail, Activity, Zap, Download, MessageSquare, PhoneCall, Target } from 'lucide-react';

export function OutreachTab({
    allLeads,
    selectedOutreachLeadId,
    setSelectedOutreachLeadId,
    isGeneratingEmail,
    handleGenerateEmail,
    generatedEmail,
    receiverEmail,
    setReceiverEmail,
    handleSendEmail,
    handleDownloadEmail,
    showToast
}) {
    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }} className="grid-2">
            {/* Email Generator */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Smart Email Generation</h3>
                        <p className="card-subtitle">Pick a CRM Lead & Contextually generate outreach</p>
                    </div>
                    <Mail size={20} color="var(--accent-blue-light)"/>
                </div>
                <div className="form-group">
                    <label className="form-label">Target Prospect from CRM</label>
                    <select
                        className="form-select"
                        value={selectedOutreachLeadId}
                        onChange={(e) => setSelectedOutreachLeadId(e.target.value)}
                    >
                        <option value="" disabled>Select a lead from your pipeline...</option>
                        {allLeads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                                {lead.company} ({lead.stage})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '20px' }}
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail || !selectedOutreachLeadId}
                >
                    {isGeneratingEmail ? <Activity className="spin" size={14} /> : <Zap size={14}/>}
                    {isGeneratingEmail ? 'AI is drafting...' : 'Generate Hyper-Personalized Email'}
                </button>

                    {generatedEmail && (
                        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {generatedEmail}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="email"
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        placeholder="Receiver Email (e.g. buyer@domain.com)"
                                        value={receiverEmail}
                                        onChange={e => setReceiverEmail(e.target.value)}
                                    />
                                    <button className="btn btn-success" onClick={handleSendEmail}>
                                        <Mail size={16}/> Send Now
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleDownloadEmail}>
                                        <Download size={16}/> Download
                                    </button>
                                </div>
                                <button className="btn btn-secondary" onClick={() => showToast('WhatsApp outreach queued!')}>
                                    <MessageSquare size={16}/> Send WhatsApp
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* Call Script Generator */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">AI Audio/Call Script</h3>
                        <p className="card-subtitle">Objection handling and pitch scripts</p>
                    </div>
                    <PhoneCall size={20} color="var(--accent-green)"/>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="badge green" style={{ marginBottom: '12px' }}>Opening Pitch</div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                        "Hi {allLeads.find(l => l.id === selectedOutreachLeadId)?.contact || '[Name]'}, I'm calling because we help OEMs eliminate production delays caused by spring suppliers. I know you're ramping up production—are you open to a backup supplier to ensure zero downtime?"
                    </p>

                    <div className="badge purple" style={{ marginBottom: '12px' }}>Objection: "We already have a supplier"</div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                        "I completely understand. Most of our best clients started by just keeping us as a secondary vendor for emergencies or complex small batches. No commitment required. Can I send over our technical tolerance specs?"
                    </p>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }} onClick={() => showToast('Voice AI Dialing initialized...')}>
                    <Target size={14}/> Launch Voice AI Assistant
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>Let our AI voice agent perform the cold call and qualify them.</p>
            </div>
        </div>
    );
}
