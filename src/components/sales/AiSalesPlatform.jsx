import { useState } from 'react';
import { 
    Search, Activity, Mail, Users, BarChart3, Zap
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';

import { useDiscovery } from './hooks/useDiscovery';
import { useIntelligence } from './hooks/useIntelligence';
import { useOutreach } from './hooks/useOutreach';

import { DiscoveryTab } from './tabs/DiscoveryTab';
import { IntelligenceTab } from './tabs/IntelligenceTab';
import { OutreachTab } from './tabs/OutreachTab';

export default function AiSalesPlatform() {
    const { showToast } = useToast();
    const { allLeads, setAllLeads } = useData();
    const [activeTab, setActiveTab] = useState('discovery');

    const discovery = useDiscovery(showToast, allLeads, setAllLeads);
    const intelligence = useIntelligence(showToast, allLeads);
    const outreach = useOutreach(showToast, allLeads);

    return (
        <div className="page-content" style={{ padding: '0 0 24px 0', overflowX: 'hidden' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(10, 14, 26, 0) 100%)',
                padding: '32px 32px 0 32px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: 'var(--gradient-primary)', padding: '8px', borderRadius: '8px', color: 'white', display: 'flex' }}>
                                <Zap size={20} />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>AI Sales Platform</h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px' }}>
                            End-to-end autonomous lead generation, qualification, and smart outreach. 
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    {[
                        { id: 'discovery', icon: Search, label: 'Lead Discovery' },
                        { id: 'intelligence', icon: Activity, label: 'Lead Intelligence' },
                        { id: 'outreach', icon: Mail, label: 'Smart Outreach' },
                        { id: 'crm', icon: Users, label: 'CRM Pipeline' },
                        { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px', background: 'none', border: 'none',
                                color: activeTab === t.id ? 'var(--accent-blue-light)' : 'var(--text-muted)',
                                borderBottom: activeTab === t.id ? '2px solid var(--accent-blue-light)' : '2px solid transparent',
                                fontWeight: activeTab === t.id ? 700 : 500,
                                fontSize: '13px', cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            <t.icon size={16} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 32px' }}>
                {activeTab === 'discovery' && (
                    <DiscoveryTab
                        {...discovery}
                    />
                )}

                {activeTab === 'intelligence' && (
                    <IntelligenceTab
                        {...intelligence}
                        allLeads={allLeads}
                        setActiveTab={setActiveTab}
                        setSelectedOutreachLeadId={outreach.setSelectedOutreachLeadId}
                    />
                )}

                {activeTab === 'outreach' && (
                    <OutreachTab
                        {...outreach}
                        allLeads={allLeads}
                        showToast={showToast}
                    />
                )}
                
                {activeTab === 'crm' && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
                        <Users size={48} color="var(--text-muted)" />
                        <h3 style={{ fontSize: '18px' }}>CRM Pipeline Ready</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
                            Your AI leads have been successfully synced to the database. <br/><br/>
                            Verify them by navigating to the "CRM Pipeline" menu externally, where you can move them across your Kanban flow.
                        </p>
                    </div>
                )}
                {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
                        <BarChart3 size={48} color="var(--text-muted)" />
                        <h3 style={{ fontSize: '18px' }}>Intelligence Analytics</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>Track revenue per AI lead source, test open rates across campaigns, and see voice agent success metrics.</p>
                    </div>
                )}
            </div>

            {/* Floating CSS overrides for animations specific to this page */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
}
