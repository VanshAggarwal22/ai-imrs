import { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Users, TrendingUp, Star, Phone, Mail, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorPortal() {
    const { vendors, priceHistory, addPriceEntry, addVendor } = useContext(DataContext);
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('directory');
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);

    // New Price Entry State
    const [material, setMaterial] = useState('');
    const [wireGauge, setWireGauge] = useState('');
    const [price, setPrice] = useState('');
    const [supplierId, setSupplierId] = useState('');
    
    // New Vendor State
    const [newVendor, setNewVendor] = useState({ name: '', location: '', leadTime: '', type: 'procurement', rating: 5, paymentTerms: 'Net 30' });

    const handleLogPrice = async (e) => {
        e.preventDefault();
        const supplier = vendors.find(v => v.id === supplierId)?.name || supplierId;
        const entry = {
            id: 'PH-' + Date.now(),
            material,
            wireGauge,
            pricePerKg: parseFloat(price),
            supplier,
            recordedDate: new Date().toISOString().split('T')[0],
            notes: ''
        };
        await addPriceEntry(entry);
        showToast('Material price logged successfully!', 'success');
        setShowPriceModal(false);
        setMaterial(''); setWireGauge(''); setPrice('');
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        const v = {
            id: 'VND-' + Date.now(),
            ...newVendor
        };
        await addVendor(v);
        showToast('Vendor added successfully!', 'success');
        setShowVendorModal(false);
        setNewVendor({ name: '', location: '', leadTime: '', type: 'procurement', rating: 5, paymentTerms: 'Net 30' });
    };

    // Prepare chart data for a specific material over time
    const chartData = [...priceHistory]
        .sort((a, b) => new Date(a.recordedDate) - new Date(b.recordedDate))
        .map(p => ({
            date: p.recordedDate,
            price: p.pricePerKg,
            material: p.material,
            supplier: p.supplier
        }));

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Vendor & Supplier Portal</h1>
                    <p>Manage procurement relationships and track material pricing trends</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowPriceModal(true)}>
                        <TrendingUp size={16} /> Log Price Update
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowVendorModal(true)}>
                        <Users size={16} /> Add Vendor
                    </button>
                </div>
            </div>

            <div className="filter-tabs" style={{ marginBottom: '24px' }}>
                <button className={activeTab === 'directory' ? 'active' : ''} onClick={() => setActiveTab('directory')} style={{ background: activeTab === 'directory' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: activeTab === 'directory' ? 'white' : 'var(--text-muted)' }}>
                    <Users size={16} /> Vendor Directory
                </button>
                <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => setActiveTab('pricing')} style={{ background: activeTab === 'pricing' ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: activeTab === 'pricing' ? 'white' : 'var(--text-muted)' }}>
                    <TrendingUp size={16} /> Material Pricing Trends
                </button>
            </div>

            {activeTab === 'directory' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {vendors.map(vendor => (
                            <div key={vendor.id} className="card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <h3 style={{ margin: '0', fontSize: '16px' }}>{vendor.name}</h3>
                                        <span className="badge blue" style={{ marginTop: '4px', display: 'inline-block' }}>{vendor.type ? vendor.type.toUpperCase() : 'SUPPLIER'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)' }}>
                                        <Star size={14} fill="currentColor" /> {vendor.rating || 5}/5
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={14} color="var(--text-muted)" /> {vendor.location || 'Location not specified'}</div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><strong>Terms:</strong> {vendor.paymentTerms || 'Net 30'}</div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><strong>Lead Time:</strong> {vendor.leadTime || '7-10 Days'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {vendors.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)', marginTop: '16px' }}>
                            <Users size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                            <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No Vendors Registered Yet</h3>
                            <p style={{ margin: '0 0 20px', fontSize: '14px' }}>Add procurement partners, wire mills, and plating vendors to track contracts and pricing.</p>
                            <button className="btn btn-primary" onClick={() => setShowVendorModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={16} /> Add First Vendor
                            </button>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'pricing' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div className="card animate-in">
                        <div className="card-header">
                            <div className="card-title">All Material Prices Over Time</div>
                        </div>
                        <div style={{ height: 350, padding: '20px 0' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ left: 10, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={val => `₹${val}`} />
                                        <Tooltip 
                                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                                            formatter={(value, name, props) => [`₹${value}`, `${props.payload.material} (${props.payload.supplier})`]}
                                        />
                                        <Line type="monotone" dataKey="price" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-blue)' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    No historical price data found.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card animate-in">
                        <div className="card-header"><div className="card-title">Recent Price Logs</div></div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Material</th>
                                    <th>Supplier</th>
                                    <th>Price / Kg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceHistory.slice(0, 10).map(p => (
                                    <tr key={p.id}>
                                        <td>{p.recordedDate}</td>
                                        <td style={{ fontWeight: 500 }}>{p.material} {p.wireGauge ? `(${p.wireGauge})` : ''}</td>
                                        <td>{p.supplier}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>₹{p.pricePerKg.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Log Price Modal */}
            {showPriceModal && (
                <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Log Material Price</h2>
                            <button className="close-btn" onClick={() => setShowPriceModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleLogPrice}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Vendor / Supplier</label>
                                    <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                                        <option value="">-- Select Vendor --</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Material Name</label>
                                    <input type="text" className="form-input" value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. Spring Steel Grade 1" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Wire Gauge / Spec (Optional)</label>
                                    <input type="text" className="form-input" value={wireGauge} onChange={e => setWireGauge(e.target.value)} placeholder="e.g. 2.5mm" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price per Kg (₹)</label>
                                    <input type="number" step="0.01" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPriceModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-green)', color: 'white' }}>Save Price</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Vendor Modal */}
            {showVendorModal && (
                <div className="modal-overlay" onClick={() => setShowVendorModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Vendor</h2>
                            <button className="close-btn" onClick={() => setShowVendorModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddVendor}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Vendor Name</label>
                                    <input type="text" className="form-input" value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location / Area</label>
                                    <input type="text" className="form-input" value={newVendor.location} onChange={e => setNewVendor({...newVendor, location: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vendor Type</label>
                                    <select className="form-select" value={newVendor.type} onChange={e => setNewVendor({...newVendor, type: e.target.value})}>
                                        <option value="procurement">Raw Material Procurement</option>
                                        <option value="outsourcing">Outsourcing (Plating/Heat Treat)</option>
                                        <option value="logistics">Logistics / Transport</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Standard Lead Time</label>
                                    <input type="text" className="form-input" value={newVendor.leadTime} onChange={e => setNewVendor({...newVendor, leadTime: e.target.value})} placeholder="e.g. 3-5 days" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Terms</label>
                                    <input type="text" className="form-input" value={newVendor.paymentTerms} onChange={e => setNewVendor({...newVendor, paymentTerms: e.target.value})} placeholder="e.g. Net 30, Advance" required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowVendorModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-blue)', color: 'white' }}>Save Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .filter-tabs { display: flex; gap: 8px; }
                .filter-tabs button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; alignItems: center; gap: 6px; }
                .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
                .badge.blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
            `}</style>
        </div>
    );
}
