import { useState, useContext } from 'react';
import {
    Plus, FileText, Trophy, TrendingUp, Clock, Calendar, ChevronRight,
    ArrowRightCircle, Trash2, X, Filter, AlertCircle, Package,
    IndianRupee, Hash, Building2, Send, Eye
} from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const SOURCE_CONFIG = {
    GeM: { color: '#10b981', label: 'GeM' },
    IndiaMART: { color: '#3b82f6', label: 'IndiaMART' },
    Direct: { color: '#64748b', label: 'Direct' },
    Email: { color: '#a855f7', label: 'Email' }
};

const STATUS_CONFIG = {
    received: { color: '#f59e0b', label: 'Received' },
    quoted: { color: '#6366f1', label: 'Quoted' },
    won: { color: '#10b981', label: 'Won' },
    lost: { color: '#ef4444', label: 'Lost' },
    expired: { color: '#64748b', label: 'Expired' }
};

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const getDeadlineStyle = (deadline) => {
    if (!deadline) return { color: 'var(--text-muted)' };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: '#ef4444', fontWeight: 700 };
    if (diffDays <= 3) return { color: '#f59e0b', fontWeight: 600 };
    return { color: 'var(--text-muted)' };
};

const getDeadlineLabel = (deadline) => {
    if (!deadline) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 3) return `${diffDays}d left`;
    return '';
};

export default function RFQTracker() {
    const { rfqs, addRFQ, updateRFQ, deleteRFQ, addOrder } = useContext(DataContext);
    const { showToast } = useToast();

    // UI State
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRfq, setSelectedRfq] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Add RFQ Form State
    const [newRfq, setNewRfq] = useState({
        source: 'GeM',
        sourceRef: '',
        customer: '',
        items: [{ product: '', qty: '', specs: '' }],
        deadline: '',
        notes: ''
    });

    // Detail modal editable state
    const [quotedAmount, setQuotedAmount] = useState('');

    // --- Filtering ---
    const filteredRfqs = rfqs.filter(rfq => {
        if (statusFilter !== 'all' && rfq.status !== statusFilter) return false;
        if (sourceFilter !== 'all' && rfq.source !== sourceFilter) return false;
        return true;
    }).sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

    // --- Summary Stats ---
    const totalRfqs = rfqs.length;
    const pendingResponse = rfqs.filter(r => r.status === 'received').length;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = rfqs.filter(r => r.status === 'won' && new Date(r.receivedDate) >= firstOfMonth).length;
    const closedRfqs = rfqs.filter(r => r.status === 'won' || r.status === 'lost');
    const winRate = closedRfqs.length > 0 ? Math.round((rfqs.filter(r => r.status === 'won').length / closedRfqs.length) * 100) : 0;

    const statusTabs = [
        { key: 'all', label: 'All', count: rfqs.length },
        { key: 'received', label: 'Received', count: rfqs.filter(r => r.status === 'received').length },
        { key: 'quoted', label: 'Quoted', count: rfqs.filter(r => r.status === 'quoted').length },
        { key: 'won', label: 'Won', count: rfqs.filter(r => r.status === 'won').length },
        { key: 'lost', label: 'Lost', count: rfqs.filter(r => r.status === 'lost').length }
    ];

    // --- Handlers ---
    const resetForm = () => {
        setNewRfq({
            source: 'GeM',
            sourceRef: '',
            customer: '',
            items: [{ product: '', qty: '', specs: '' }],
            deadline: '',
            notes: ''
        });
    };

    const handleAddItem = () => {
        setNewRfq(prev => ({
            ...prev,
            items: [...prev.items, { product: '', qty: '', specs: '' }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (newRfq.items.length <= 1) return;
        setNewRfq(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        setNewRfq(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: field === 'qty' ? (value === '' ? '' : Number(value)) : value } : item
            )
        }));
    };

    const handleSubmitRfq = () => {
        if (!newRfq.customer.trim()) {
            showToast('Customer name is required', 'error');
            return;
        }
        if (!newRfq.items.some(i => i.product.trim())) {
            showToast('At least one item with a product name is required', 'error');
            return;
        }

        const rfq = {
            id: 'RFQ-' + Date.now(),
            source: newRfq.source,
            sourceRef: newRfq.sourceRef.trim(),
            customer: newRfq.customer.trim(),
            items: newRfq.items.filter(i => i.product.trim()).map(i => ({
                product: i.product.trim(),
                qty: Number(i.qty) || 0,
                specs: i.specs?.trim() || ''
            })),
            deadline: newRfq.deadline || null,
            notes: newRfq.notes.trim(),
            status: 'received',
            receivedDate: new Date().toISOString().split('T')[0],
            quotedAmount: null,
            convertedOrderId: null
        };

        addRFQ(rfq);
        showToast('RFQ added successfully');
        resetForm();
        setShowAddModal(false);
    };

    const handleStatusChange = (rfq, newStatus) => {
        if (newStatus === 'quoted' && !rfq.quotedAmount) {
            showToast('Set a quoted amount first', 'error');
            return;
        }
        const updated = { ...rfq, status: newStatus };
        updateRFQ(updated);
        setSelectedRfq(updated);
        showToast(`RFQ marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    };

    const handleSaveQuotedAmount = (rfq) => {
        const amount = parseFloat(quotedAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Enter a valid quoted amount', 'error');
            return;
        }
        const updated = { ...rfq, quotedAmount: amount };
        updateRFQ(updated);
        setSelectedRfq(updated);
        showToast('Quoted amount saved');
    };

    const handleConvertToOrder = (rfq) => {
        const newOrder = {
            id: 'ORD-' + Date.now(),
            customer: rfq.customer,
            product: rfq.items.map(i => i.product).join(', '),
            qty: rfq.items.reduce((sum, i) => sum + (i.qty || 0), 0),
            unitPrice: 0,
            total: rfq.quotedAmount || 0,
            status: 'Pending',
            progress: 0,
            orderDate: new Date().toISOString().split('T')[0],
            dueDate: rfq.deadline,
            material: '',
            wireGauge: '',
            stages: [
                { name: 'Coiling', status: 'Pending' },
                { name: 'Heat Treatment', status: 'Pending' },
                { name: 'QC', status: 'Pending' },
                { name: 'Dispatch', status: 'Pending' }
            ],
            source: rfq.source,
            sourceRef: rfq.sourceRef,
            rfqId: rfq.id
        };

        addOrder(newOrder);

        const updatedRfq = { ...rfq, convertedOrderId: newOrder.id };
        updateRFQ(updatedRfq);
        setSelectedRfq(updatedRfq);
        showToast(`Order ${newOrder.id} created from RFQ`);
    };

    const handleDeleteRfq = (rfqId) => {
        deleteRFQ(rfqId);
        setShowDetailModal(false);
        setSelectedRfq(null);
        setDeleteConfirm(false);
        showToast('RFQ deleted');
    };

    const openDetail = (rfq) => {
        setSelectedRfq(rfq);
        setQuotedAmount(rfq.quotedAmount ? String(rfq.quotedAmount) : '');
        setDeleteConfirm(false);
        setShowDetailModal(true);
    };

    // --- Stat Cards ---
    const stats = [
        { icon: FileText, label: 'Total RFQs', value: totalRfqs, color: 'var(--accent-blue)' },
        { icon: Clock, label: 'Pending Response', value: pendingResponse, color: 'var(--accent-orange)' },
        { icon: Trophy, label: 'Won This Month', value: wonThisMonth, color: 'var(--accent-green)' },
        { icon: TrendingUp, label: 'Win Rate', value: `${winRate}%`, color: 'var(--accent-purple)' }
    ];

    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>RFQ Tracker</h1>
                    <p>Manage Request for Quotations from GeM, IndiaMART & direct inquiries</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--gradient-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Plus size={16} />
                    New RFQ
                </button>
            </div>

            {/* Summary Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-sm)',
                            background: `${stat.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={22} style={{ color: stat.color }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>
                                {stat.value}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '24px'
            }}>
                {/* Status Tabs */}
                <div className="filter-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {statusTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: statusFilter === tab.key ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                color: statusFilter === tab.key ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Source Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={sourceFilter}
                        onChange={e => setSourceFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="all">All Sources</option>
                        <option value="GeM">GeM</option>
                        <option value="IndiaMART">IndiaMART</option>
                        <option value="Direct">Direct</option>
                        <option value="Email">Email</option>
                    </select>
                </div>
            </div>

            {/* RFQ Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {filteredRfqs.map(rfq => {
                    const srcCfg = SOURCE_CONFIG[rfq.source] || SOURCE_CONFIG.Direct;
                    const stsCfg = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.received;
                    const deadlineStyle = getDeadlineStyle(rfq.deadline);
                    const deadlineLabel = getDeadlineLabel(rfq.deadline);

                    return (
                        <div
                            key={rfq.id}
                            className="card"
                            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                            onClick={() => openDetail(rfq)}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                        >
                            {/* Header: Source badge + Status badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        background: `${srcCfg.color}20`,
                                        color: srcCfg.color,
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.3px'
                                    }}>
                                        {srcCfg.label}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {rfq.id}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    background: stsCfg.color,
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: 600
                                }}>
                                    {stsCfg.label}
                                </span>
                            </div>

                            {/* Customer */}
                            <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600 }}>
                                {rfq.customer}
                            </h3>

                            {/* Items summary */}
                            <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {rfq.items?.map(i => `${i.product}${i.qty ? ` (×${i.qty})` : ''}`).join(', ') || 'No items'}
                            </p>

                            {/* Bottom row: Amount, Deadline, Date */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '10px',
                                borderTop: '1px solid var(--border-color)',
                                fontSize: '13px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    <IndianRupee size={13} style={{ color: 'var(--text-muted)' }} />
                                    {rfq.quotedAmount ? Number(rfq.quotedAmount).toLocaleString('en-IN') : '—'}
                                </div>

                                {rfq.deadline && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', ...deadlineStyle, fontSize: '12px' }}>
                                        <Clock size={12} />
                                        {formatDate(rfq.deadline)}
                                        {deadlineLabel && (
                                            <span style={{
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                background: deadlineStyle.color === '#ef4444' ? '#ef444420' : deadlineStyle.color === '#f59e0b' ? '#f59e0b20' : 'transparent',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                marginLeft: '2px'
                                            }}>
                                                {deadlineLabel}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <Calendar size={12} />
                                    {formatDate(rfq.receivedDate)}
                                </div>
                            </div>

                            {/* Converted Order indicator */}
                            {rfq.convertedOrderId && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    background: '#10b98115',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    color: '#10b981',
                                    fontWeight: 600
                                }}>
                                    <ArrowRightCircle size={13} />
                                    Converted → {rfq.convertedOrderId}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredRfqs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Package size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '6px' }}>
                        {rfqs.length === 0 ? 'No RFQs yet' : 'No matching RFQs'}
                    </p>
                    <p style={{ fontSize: '13px' }}>
                        {rfqs.length === 0
                            ? 'Click "+ New RFQ" to add your first Request for Quotation'
                            : 'Try adjusting your filters'
                        }
                    </p>
                </div>
            )}

            {/* ===== ADD RFQ MODAL ===== */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>Add New RFQ</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                        </div>

                        {/* Source + Source Ref */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>Source *</label>
                                <select
                                    value={newRfq.source}
                                    onChange={e => setNewRfq(prev => ({ ...prev, source: e.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="GeM">GeM</option>
                                    <option value="IndiaMART">IndiaMART</option>
                                    <option value="Direct">Direct</option>
                                    <option value="Email">Email</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Source Reference</label>
                                <input
                                    type="text"
                                    value={newRfq.sourceRef}
                                    onChange={e => setNewRfq(prev => ({ ...prev, sourceRef: e.target.value }))}
                                    placeholder={newRfq.source === 'GeM' ? 'GeM Bid Number' : newRfq.source === 'IndiaMART' ? 'Enquiry ID' : 'Reference ID'}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Customer */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Customer Name *</label>
                            <input
                                type="text"
                                value={newRfq.customer}
                                onChange={e => setNewRfq(prev => ({ ...prev, customer: e.target.value }))}
                                placeholder="Enter customer / company name"
                                style={inputStyle}
                            />
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ ...labelStyle, margin: 0 }}>Items *</label>
                                <button
                                    onClick={handleAddItem}
                                    style={{
                                        padding: '4px 10px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--accent-blue)',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>
                            {newRfq.items.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 80px 2fr 28px',
                                    gap: '8px',
                                    marginBottom: '8px',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        type="text"
                                        value={item.product}
                                        onChange={e => handleItemChange(idx, 'product', e.target.value)}
                                        placeholder="Product name"
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    />
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                                        placeholder="Qty"
                                        min="0"
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    />
                                    <input
                                        type="text"
                                        value={item.specs}
                                        onChange={e => handleItemChange(idx, 'specs', e.target.value)}
                                        placeholder="Specs / notes"
                                        style={{ ...inputStyle, marginBottom: 0 }}
                                    />
                                    <button
                                        onClick={() => handleRemoveItem(idx)}
                                        disabled={newRfq.items.length <= 1}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: newRfq.items.length <= 1 ? 'var(--text-muted)' : 'var(--accent-red)',
                                            cursor: newRfq.items.length <= 1 ? 'default' : 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            opacity: newRfq.items.length <= 1 ? 0.3 : 1
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Deadline */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Deadline</label>
                            <input
                                type="date"
                                value={newRfq.deadline}
                                onChange={e => setNewRfq(prev => ({ ...prev, deadline: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Notes</label>
                            <textarea
                                value={newRfq.notes}
                                onChange={e => setNewRfq(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes..."
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRfq}
                                style={{
                                    padding: '10px 24px',
                                    background: 'var(--gradient-primary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Send size={14} /> Create RFQ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RFQ DETAIL MODAL ===== */}
            {showDetailModal && selectedRfq && (
                <div className="modal-overlay" onClick={() => { setShowDetailModal(false); setDeleteConfirm(false); }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <h2 style={{ margin: 0, fontSize: '18px' }}>{selectedRfq.customer}</h2>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        background: (SOURCE_CONFIG[selectedRfq.source]?.color || '#64748b') + '20',
                                        color: SOURCE_CONFIG[selectedRfq.source]?.color || '#64748b',
                                        fontSize: '11px',
                                        fontWeight: 700
                                    }}>
                                        {SOURCE_CONFIG[selectedRfq.source]?.label || selectedRfq.source}
                                    </span>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        background: STATUS_CONFIG[selectedRfq.status]?.color || '#64748b',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 600
                                    }}>
                                        {STATUS_CONFIG[selectedRfq.status]?.label || selectedRfq.status}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{selectedRfq.id}</p>
                            </div>
                            <button onClick={() => { setShowDetailModal(false); setDeleteConfirm(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <p style={detailLabelStyle}>Received Date</p>
                                <p style={detailValueStyle}>{formatDate(selectedRfq.receivedDate)}</p>
                            </div>
                            <div>
                                <p style={detailLabelStyle}>Deadline</p>
                                <p style={{ ...detailValueStyle, ...getDeadlineStyle(selectedRfq.deadline) }}>
                                    {formatDate(selectedRfq.deadline)}
                                    {getDeadlineLabel(selectedRfq.deadline) && (
                                        <span style={{ marginLeft: '6px', fontSize: '11px' }}>({getDeadlineLabel(selectedRfq.deadline)})</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p style={detailLabelStyle}>Source Reference</p>
                                <p style={detailValueStyle}>{selectedRfq.sourceRef || '—'}</p>
                            </div>
                        </div>

                        {/* Quoted Amount */}
                        {selectedRfq.quotedAmount && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={detailLabelStyle}>Quoted Amount</p>
                                <p style={{ ...detailValueStyle, fontSize: '20px', color: 'var(--accent-green)' }}>
                                    {formatCurrency(selectedRfq.quotedAmount)}
                                </p>
                            </div>
                        )}

                        {/* Converted Order */}
                        {selectedRfq.convertedOrderId && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: '#10b98115',
                                border: '1px solid #10b98130',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ArrowRightCircle size={16} style={{ color: '#10b981' }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                                    Converted to Order: {selectedRfq.convertedOrderId}
                                </span>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedRfq.notes && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={detailLabelStyle}>Notes</p>
                                <p style={{ ...detailValueStyle, fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                                    {selectedRfq.notes}
                                </p>
                            </div>
                        )}

                        {/* Items Table */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600 }}>Items</h3>
                            <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)' }}>
                                            <th style={thStyle}>Product</th>
                                            <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Qty</th>
                                            <th style={thStyle}>Specs / Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRfq.items?.map((item, i) => (
                                            <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{item.product}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>{item.qty || '—'}</td>
                                                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{item.specs || '—'}</td>
                                            </tr>
                                        ))}
                                        {(!selectedRfq.items || selectedRfq.items.length === 0) && (
                                            <tr>
                                                <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No items</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quote Builder (only for received status) */}
                        {selectedRfq.status === 'received' && (
                            <div style={{
                                marginBottom: '20px',
                                padding: '16px',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <IndianRupee size={15} /> Quote Builder
                                </h3>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}>₹</span>
                                        <input
                                            type="number"
                                            value={quotedAmount}
                                            onChange={e => setQuotedAmount(e.target.value)}
                                            placeholder="Enter quoted amount"
                                            style={{ ...inputStyle, marginBottom: 0, paddingLeft: '28px' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSaveQuotedAmount(selectedRfq)}
                                        style={{
                                            padding: '10px 16px',
                                            background: 'var(--accent-blue)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status Transition Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {selectedRfq.status === 'received' && (
                                <button
                                    onClick={() => handleStatusChange(selectedRfq, 'quoted')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        background: '#6366f1',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        opacity: selectedRfq.quotedAmount ? 1 : 0.5
                                    }}
                                >
                                    <Send size={14} /> Mark as Quoted
                                </button>
                            )}

                            {selectedRfq.status === 'quoted' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange(selectedRfq, 'won')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: '#10b981',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Trophy size={14} /> Mark as Won
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(selectedRfq, 'lost')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: '#ef4444',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <X size={14} /> Mark as Lost
                                    </button>
                                </>
                            )}

                            {selectedRfq.status === 'won' && !selectedRfq.convertedOrderId && (
                                <button
                                    onClick={() => handleConvertToOrder(selectedRfq)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        background: 'var(--gradient-info)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <ArrowRightCircle size={14} /> Convert to Order
                                </button>
                            )}
                        </div>

                        {/* Delete */}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            {!deleteConfirm ? (
                                <button
                                    onClick={() => setDeleteConfirm(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'transparent',
                                        border: '1px solid #ef444440',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Trash2 size={14} /> Delete RFQ
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', color: '#ef4444' }}>Delete this RFQ permanently?</span>
                                    <button
                                        onClick={() => handleDeleteRfq(selectedRfq.id)}
                                        style={{
                                            padding: '6px 14px',
                                            background: '#ef4444',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '12px'
                                        }}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(false)}
                                        style={{
                                            padding: '6px 14px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Styles */}
            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.15s ease;
                }
                .modal {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 24px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// --- Shared Styles ---
const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
};

const detailLabelStyle = {
    margin: '0 0 4px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const detailValueStyle = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600
};

const thStyle = {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tdStyle = {
    padding: '10px 12px',
    fontSize: '13px'
};
