import { Search, Activity, Globe, TrendingUp, AlertCircle, Play } from 'lucide-react';

export function IntelligenceTab({
    allLeads,
    selectedIntelligenceLeadId,
    setSelectedIntelligenceLeadId,
    isGatheringIntel,
    handleGatherIntelligence,
    intelData,
    setActiveTab,
    setSelectedOutreachLeadId
}) {
    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Select Lead for Intelligence Scraping</h3>
                        <p className="card-subtitle">Scrapes Google & News using Serper + NVIDIA</p>
                    </div>
                    <Activity size={20} color="var(--accent-blue)"/>
                </div>
                <div className="flex gap-4">
                    <select
                        className="form-select flex-1"
                        value={selectedIntelligenceLeadId}
                        onChange={(e) => setSelectedIntelligenceLeadId(e.target.value)}
                    >
                        <option value="" disabled>Select a lead from your pipeline...</option>
                        {allLeads.map(lead => (
                            <option key={lead.id} value={lead.id}>{lead.company}</option>
                        ))}
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={handleGatherIntelligence}
                        disabled={isGatheringIntel || !selectedIntelligenceLeadId}
                        style={{ padding: '0 32px' }}
                    >
                        {isGatheringIntel ? <Activity className="spin" size={14} /> : <Search size={14}/>}
                        {isGatheringIntel ? 'Gathering...' : 'Gather Intel'}
                    </button>
                </div>
            </div>

            {intelData && (
                <div className="grid-2">
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Website Analysis Tools</h3>
                                <p className="card-subtitle">AI parsing of target prospect</p>
                            </div>
                            <Globe className="text-blue" size={20} color="var(--accent-blue)"/>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'white' }}>AI Conclusion:</strong> {intelData.websiteAnalysis}
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Job Postings & News Signals</h3>
                                <p className="card-subtitle">Indications of demand expansion</p>
                            </div>
                            <TrendingUp className="text-green" size={20} color="var(--accent-green)"/>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ padding: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', borderRadius: '6px' }}><Play size={16}/></div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Recent News / Signals</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{intelData.newsSignals}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Competitor & Supplier Gap Analysis</h3>
                                <p className="card-subtitle">Identify weak suppliers used by leads in your CRM</p>
                            </div>
                            <AlertCircle size={20} color="orange"/>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Actionable Pitch Strategy:</h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    <strong>{intelData.competitorGap}</strong>
                                </p>
                            </div>
                            <button className="btn btn-primary" onClick={() => { setActiveTab('outreach'); setSelectedOutreachLeadId(selectedIntelligenceLeadId); }}>Generate Strike Pitch</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
