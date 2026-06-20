import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, FileText, Users, Package,
    ShieldCheck, UserCircle, Settings, HelpCircle, Zap
} from 'lucide-react';

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
            { path: '/sales', label: 'CRM Pipeline', icon: TrendingUp, badge: 3 },
            { path: '/quoting', label: 'Quoting Engine', icon: FileText },
            { path: '/marketing', label: 'Marketing ROI', icon: Zap },
        ]
    },
    {
        section: 'Operations',
        items: [
            { path: '/inventory', label: 'Inventory & MRP', icon: Package, badge: 2 },
            { path: '/purchase-orders', label: 'Purchase Orders', icon: FileText },
            { path: '/orders', label: 'Orders Management', icon: TrendingUp },
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

export default function Sidebar() {
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
