import { useLocation } from 'react-router-dom';
import { Search, Bell, Sun } from 'lucide-react';

const pageTitles = {
    '/': 'Executive Dashboard',
    '/ai-sales': 'AI Lead Automation',
    '/sales': 'Sales Pipeline',
    '/quoting': 'Quoting Engine',
    '/marketing': 'Marketing ROI',
    '/inventory': 'Inventory & MRP',
    '/purchase-orders': 'Purchase Orders',
    '/orders': 'Orders Management',
    '/quality': 'Quality Control',
    '/portal': 'Customer Portal',
    '/settings': 'Settings',
};

export default function Header() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';

    return (
        <header className="header">
            <div className="header-left">
                <h2>{title}</h2>
                <span className="header-breadcrumb">IMRS / {title}</span>
            </div>
            <div className="header-right">
                <div className="header-search">
                    <Search />
                    <input placeholder="Search orders, leads, inventory..." />
                </div>
                <button className="header-btn">
                    <Bell size={18} />
                    <span className="badge-dot"></span>
                </button>
                <div className="header-avatar">VS</div>
            </div>
        </header>
    );
}
