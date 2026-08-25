import { Search, Filter, MapPin, Star, Target, Activity, Zap } from 'lucide-react';

export function DiscoveryTab({
    searchPrompt,
    setSearchPrompt,
    isSearching,
    handleSearchClick,
    discoveredData,
    handleAddToCRM
}) {
    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Search Bar Block */}
            <div className="card-glass" style={{ marginBottom: '24px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--accent-blue-light)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            AI Search Prompt
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--accent-blue)' }}>
                                <Search size={18} />
                            </div>
                            <input
                                value={searchPrompt}
                                onChange={(e) => setSearchPrompt(e.target.value)}
                                style={{
                                    width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                    borderRadius: '8px', padding: '14px 16px 14px 44px', color: 'white', fontSize: '15px',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', transition: 'border 0.2s', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>
                    <div style={{ paddingTop: '24px' }}>
                        <button
                            className="btn btn-primary" style={{ padding: '14px 24px', fontSize: '14px' }}
                            onClick={handleSearchClick}
                            disabled={isSearching}
                        >
                            {isSearching ? <Activity className="spin" size={18} /> : <Zap size={18} />}
                            {isSearching ? 'Scanning Sources...' : 'Discover Leads'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Discovered Prospects</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sourced from LinkedIn, TradeIndia, and Google Maps API.</p>
                    </div>
                    <button className="btn btn-secondary btn-sm"><Filter size={14}/> Filter Results</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Industry</th>
                                <th>AI Match Score</th>
                                <th>Buying Intent</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discoveredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                        All discovered leads added. Run a new search to find more.
                                    </td>
                                </tr>
                            ) : (
                                discoveredData.map(lead => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{lead.company}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Size: {lead.size}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {lead.location}</div>
                                        </td>
                                        <td>{lead.industry}</td>
                                        <td>
                                            <div className="badge" style={{ background: lead.matchScore > 90 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: lead.matchScore > 90 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                                                <Star size={10} style={{ fill: 'currentColor' }}/> {lead.matchScore}% Match
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px', color: lead.intent.includes('High') ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                                                {lead.intent.includes('High') ? '🔥 ' : lead.intent.includes('Medium') ? '⚠️ ' : '❄️ '}{lead.intent}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleAddToCRM(lead)}>
                                                <Target size={12} /> Add to CRM
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
