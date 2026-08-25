import { useState, useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, AlertTriangle, FileText, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function QualityControl() {
    const { orders, qcReports, addQcReport, deleteQcReport } = useContext(DataContext);
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const activeOrders = orders.filter(o => o.status === 'In Production');

    // New QC Form State
    const [inspector, setInspector] = useState('Quality Team');
    const [inspectedQty, setInspectedQty] = useState('');
    const [passedQty, setPassedQty] = useState('');
    const [rejectedQty, setRejectedQty] = useState('');
    const [notes, setNotes] = useState('');
    const [defectTypes, setDefectTypes] = useState([
        { type: 'Surface Finish', count: 0 },
        { type: 'Dimensional Tolerance', count: 0 },
        { type: 'Material Defect', count: 0 },
        { type: 'Other', count: 0 }
    ]);

    // Derived metrics for Dashboard
    const totalInspected = qcReports.reduce((sum, r) => sum + r.inspectedQty, 0);
    const totalRejected = qcReports.reduce((sum, r) => sum + r.rejectedQty, 0);
    const overallRejectRate = totalInspected > 0 ? ((totalRejected / totalInspected) * 100).toFixed(1) : 0;

    // Defect breakdown for chart
    const defectChartData = useMemo(() => {
        const counts = {};
        qcReports.forEach(report => {
            report.defectTypes?.forEach(dt => {
                if (dt.count > 0) {
                    counts[dt.type] = (counts[dt.type] || 0) + dt.count;
                }
            });
        });
        return Object.keys(counts).map(type => ({ name: type, count: counts[type] }));
    }, [qcReports]);

    const handleDefectChange = (index, value) => {
        const newDefects = [...defectTypes];
        newDefects[index].count = parseInt(value) || 0;
        setDefectTypes(newDefects);

        // Auto-calculate rejected quantity based on defect counts
        const totalDefects = newDefects.reduce((sum, d) => sum + d.count, 0);
        setRejectedQty(totalDefects);
        
        if (inspectedQty) {
            setPassedQty(Math.max(0, parseInt(inspectedQty) - totalDefects));
        }
    };

    const handleInspectedQtyChange = (val) => {
        setInspectedQty(val);
        const inspected = parseInt(val) || 0;
        const rejected = parseInt(rejectedQty) || 0;
        setPassedQty(Math.max(0, inspected - rejected));
    };

    const handleSubmitQC = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !inspectedQty || !passedQty || rejectedQty === '') {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const report = {
            id: 'QC-' + Date.now(),
            orderId: selectedOrder.id,
            date: new Date().toISOString().split('T')[0],
            inspector,
            inspectedQty: parseInt(inspectedQty),
            passedQty: parseInt(passedQty),
            rejectedQty: parseInt(rejectedQty),
            defectTypes: defectTypes.filter(d => d.count > 0),
            notes
        };

        await addQcReport(report);
        setShowModal(false);
        // Reset form
        setSelectedOrder(null);
        setInspectedQty('');
        setPassedQty('');
        setRejectedQty('');
        setNotes('');
        setDefectTypes(defectTypes.map(d => ({ ...d, count: 0 })));
    };

    const openModalForOrder = (order) => {
        setSelectedOrder(order);
        setInspectedQty(order.qty);
        setPassedQty(order.qty);
        setRejectedQty(0);
        setDefectTypes(defectTypes.map(d => ({ ...d, count: 0 })));
        setShowModal(true);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Quality Control</h1>
                    <p>Track defect rates and log inspection reports</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New QC Report
                </button>
            </div>

            <div className="filter-tabs" style={{ marginBottom: '24px' }}>
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: activeTab === 'dashboard' ? 'white' : 'var(--text-muted)' }}>
                    <BarChart2 size={16} /> Dashboard
                </button>
                <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')} style={{ background: activeTab === 'reports' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: activeTab === 'reports' ? 'white' : 'var(--text-muted)' }}>
                    <FileText size={16} /> Inspection Reports ({qcReports.length})
                </button>
                <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')} style={{ background: activeTab === 'pending' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: activeTab === 'pending' ? 'white' : 'var(--text-muted)' }}>
                    <AlertTriangle size={16} /> Pending Inspections ({activeOrders.length})
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="kpi-card blue animate-in">
                            <div className="kpi-icon blue"><CheckCircle2 size={22} /></div>
                            <div className="kpi-info">
                                <div className="kpi-label">Total Inspected</div>
                                <div className="kpi-value">{totalInspected.toLocaleString()} units</div>
                            </div>
                        </div>
                        <div className="kpi-card red animate-in">
                            <div className="kpi-icon red"><XCircle size={22} /></div>
                            <div className="kpi-info">
                                <div className="kpi-label">Total Rejected</div>
                                <div className="kpi-value">{totalRejected.toLocaleString()} units</div>
                            </div>
                        </div>
                        <div className="kpi-card orange animate-in">
                            <div className="kpi-icon orange"><AlertTriangle size={22} /></div>
                            <div className="kpi-info">
                                <div className="kpi-label">Overall Defect Rate</div>
                                <div className="kpi-value">{overallRejectRate}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-in">
                        <div className="card-header">
                            <div className="card-title">Defect Breakdown</div>
                        </div>
                        <div style={{ height: 300, padding: '20px 0' }}>
                            {defectChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={defectChartData} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" tick={{ fill: 'var(--text-muted)' }} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Bar dataKey="count" fill="var(--accent-red)" radius={[0, 4, 4, 0]} name="Defect Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    No defect data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {activeOrders.map(order => (
                        <div key={order.id} className="card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ margin: '0', fontSize: '16px' }}>{order.product}</h3>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>Order: {order.id}</p>
                                </div>
                                <span className="badge blue">{order.status}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Customer: <strong>{order.customer}</strong><br/>
                                Qty to Inspect: <strong>{order.qty}</strong> units
                            </div>
                            <button className="btn btn-sm btn-primary" onClick={() => openModalForOrder(order)} style={{ marginTop: 'auto' }}>
                                Log Inspection
                            </button>
                        </div>
                    ))}
                    {activeOrders.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No active orders in production pending inspection.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="card animate-in">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Date</th>
                                    <th>Order ID</th>
                                    <th>Inspector</th>
                                    <th>Inspected</th>
                                    <th>Passed</th>
                                    <th>Rejected</th>
                                    <th>Defect Rate</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {qcReports.map(report => {
                                    const rate = ((report.rejectedQty / report.inspectedQty) * 100).toFixed(1);
                                    return (
                                        <tr key={report.id}>
                                            <td style={{ fontWeight: 600 }}>{report.id}</td>
                                            <td>{report.date}</td>
                                            <td>{report.orderId}</td>
                                            <td>{report.inspector}</td>
                                            <td>{report.inspectedQty}</td>
                                            <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{report.passedQty}</td>
                                            <td style={{ color: report.rejectedQty > 0 ? 'var(--accent-red)' : 'inherit', fontWeight: 600 }}>{report.rejectedQty}</td>
                                            <td>
                                                <span className={`badge ${rate > 5 ? 'red' : rate > 0 ? 'orange' : 'green'}`}>
                                                    {rate}%
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => { if(confirm('Delete report?')) deleteQcReport(report.id); }}
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '13px' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {qcReports.length === 0 && (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            No QC reports filed yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* QC Log Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Log QC Inspection</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitQC}>
                            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                
                                {!selectedOrder ? (
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Select Order</label>
                                        <select 
                                            className="form-select" 
                                            onChange={(e) => {
                                                const order = orders.find(o => o.id === e.target.value);
                                                if (order) openModalForOrder(order);
                                            }}
                                        >
                                            <option value="">-- Choose Active Order --</option>
                                            {activeOrders.map(o => (
                                                <option key={o.id} value={o.id}>{o.id} - {o.product}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div style={{ gridColumn: 'span 2', padding: '12px', background: 'var(--bg-primary)', borderRadius: '6px', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
                                        <strong>Order:</strong> {selectedOrder.id} - {selectedOrder.product} <br/>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Qty: {selectedOrder.qty}</span>
                                    </div>
                                )}

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Inspector Name</label>
                                    <input className="form-input" type="text" value={inspector} onChange={e => setInspector(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Inspected Qty</label>
                                    <input className="form-input" type="number" min="1" value={inspectedQty} onChange={e => handleInspectedQtyChange(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Passed Qty</label>
                                    <input className="form-input" type="number" min="0" value={passedQty} onChange={e => setPassedQty(e.target.value)} required />
                                </div>

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Defect Breakdown</label>
                                    <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        {defectTypes.map((dt, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '13px' }}>{dt.type}</span>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    value={dt.count || ''} 
                                                    placeholder="0"
                                                    onChange={(e) => handleDefectChange(idx, e.target.value)}
                                                    style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                                />
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                            <strong style={{ fontSize: '14px', color: 'var(--accent-red)' }}>Total Rejected</strong>
                                            <strong style={{ fontSize: '16px', color: 'var(--accent-red)' }}>{rejectedQty}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Notes / Remarks</label>
                                    <textarea className="form-input" rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any details about defects found..."></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-blue)', color: 'white' }}>Save Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .filter-tabs { display: flex; gap: 8px; }
                .filter-tabs button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; alignItems: center; gap: 6px; }
                .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
                .badge.red { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .badge.orange { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .badge.green { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .badge.blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
            `}</style>
        </div>
    );
}
