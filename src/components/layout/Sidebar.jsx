import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, FileText, Users, Package,
    ShieldCheck, UserCircle, Settings, HelpCircle, Zap, ClipboardList
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Sidebar() {
    const { allLeads, inventoryItems, orders, rfqs } = useData();

    const activeLeadCount = allLeads?.length || 0;
    const criticalInventoryCount = inventoryItems?.filter(i => i.status === 'Critical' || (Number(i.qtyKg) || 0) < (Number(i.minQtyKg) || 0)).length || 0;
    const activeOrderCount = orders?.filter(o => o.status !== 'Completed').length || 0;
    const pendingRfqCount = rfqs?.filter(r => r.status === 'received').length || 0;

    const navItems = [
        {
            section: 'Overview',
            items: [
                { path: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            section: 'Sales & Marketing',
            items: [
                { path: '/ai-sales', label: 'AI Lead Automation', icon: Zap, badge: 'NEW' },
                { path: '/sales', label: 'CRM Pipeline', icon: TrendingUp, badge: activeLeadCount > 0 ? activeLeadCount : null },
                { path: '/quoting', label: 'Quoting Engine', icon: FileText },
                { path: '/marketing', label: 'Marketing ROI', icon: Zap },
            ]
        },
        {
            section: 'Operations',
            items: [
                { path: '/rfqs', label: 'RFQ Tracker', icon: ClipboardList, badge: pendingRfqCount > 0 ? pendingRfqCount : null },
                { path: '/inventory', label: 'Inventory & MRP', icon: Package, badge: criticalInventoryCount > 0 ? criticalInventoryCount : null },
                { path: '/purchase-orders', label: 'Purchase Orders', icon: FileText },
                { path: '/vendors', label: 'Vendor Portal', icon: Users },
                { path: '/orders', label: 'Orders Management', icon: TrendingUp, badge: activeOrderCount > 0 ? activeOrderCount : null },
                { path: '/quality', label: 'Quality Control', icon: ShieldCheck },
            ]
        },
        {
            section: 'Portal',
            items: [
                { path: '/portal', label: 'Customer Portal', icon: UserCircle },
            ]
        }
    ];
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.png" alt="Aggarwal Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'white', borderRadius: '4px', padding: '2px' }} />
                    <div>
                        <h1 style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>Aggarwal</h1>
                        <span style={{ color: 'var(--accent-blue-light)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Industries</span>
                    </div>
                </div>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div className="sidebar-section" key={section.section}>
                        <div className="sidebar-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon />
                                {item.label}
                                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                <NavLink 
                    to="/settings" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <Settings />
                    Settings
                </NavLink>
            </div>
        </aside>
    );
}
