import { useState } from 'react';
import {
    Package, Clock, CheckCircle, Truck, Eye, RefreshCw,
    ShoppingCart, FileText, ArrowRight
} from 'lucide-react';
import { customerPortalOrders, orders } from '../../data/mockData';

export default function CustomerPortal() {
    const [selectedOrder, setSelectedOrder] = useState(customerPortalOrders[0]);

    const customer = { name: 'Bosch India Pvt Ltd', id: 'CUST-001', since: 'March 2022' };

    return (
        <div className="page-content">
            {/* Customer Header */}
            <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.06))' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div style={{
                            width: 56, height: 56, borderRadius: 'var(--radius-md)',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 800
                        }}>
                            BI
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{customer.name}</h2>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {customer.id} • Customer since {customer.since}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary"><FileText size={14} /> View Invoices</button>
                        <button className="btn btn-primary"><ShoppingCart size={14} /> Re-Order</button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="kpi-card blue animate-in">
                    <div className="kpi-icon blue"><Package size={20} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Total Orders</div>
                        <div className="kpi-value">23</div>
                    </div>
                </div>
                <div className="kpi-card green animate-in">
                    <div className="kpi-icon green"><CheckCircle size={20} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Completed</div>
                        <div className="kpi-value">21</div>
                    </div>
                </div>
                <div className="kpi-card orange animate-in">
                    <div className="kpi-icon orange"><Clock size={20} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">In Progress</div>
                        <div className="kpi-value">2</div>
                    </div>
                </div>
                <div className="kpi-card purple animate-in">
                    <div className="kpi-icon purple"><Truck size={20} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Avg Delivery</div>
                        <div className="kpi-value">18 days</div>
                    </div>
                </div>
            </div>

            <div className="grid-3-7">
                {/* Order List */}
                <div className="card animate-in">
                    <div className="card-header">
                        <div className="card-title">My Orders</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {customerPortalOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                    padding: 14,
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${selectedOrder?.id === order.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                                    background: selectedOrder?.id === order.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{order.id}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.product}</div>
                                <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                                    <span className={`badge ${order.status === 'Completed' ? 'green' : 'blue'}`} style={{ fontSize: 10 }}>
                                        <span className="badge-dot"></span>
                                        {order.status}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.qty.toLocaleString('en-IN')} pcs</span>
                                </div>
                                {order.status !== 'Completed' && (
                                    <div style={{ marginTop: 6 }}>
                                        <div className="progress-bar">
                                            <div className="progress-fill green" style={{ width: `${order.progress}%` }}></div>
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{order.progress}% complete</div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }}>
                            <RefreshCw size={12} /> Re-Order Previous
                        </button>
                    </div>
                </div>

                {/* Order Detail + Live Tracker */}
                {selectedOrder && (
                    <div className="card animate-in">
                        <div className="card-header">
                            <div>
                                <div className="card-title" style={{ fontSize: 16 }}>{selectedOrder.id}</div>
                                <div className="card-subtitle">{selectedOrder.product} • {selectedOrder.qty.toLocaleString('en-IN')} pcs</div>
                            </div>
                            <span className={`badge ${selectedOrder.status === 'Completed' ? 'green' : 'blue'}`}>
                                <span className="badge-dot"></span>
                                {selectedOrder.status}
                            </span>
                        </div>

                        {/* Manufacturing Stage Tracker */}
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Live Manufacturing Status</h4>
                        <div style={{ marginBottom: 20 }}>
                            <div className="stepper">
                                {selectedOrder.stages.map((stage, i) => {
                                    const isLast = i === selectedOrder.stages.length - 1;
                                    const isActive = stage.completed && !selectedOrder.stages[i + 1]?.completed;
                                    return (
                                        <>
                                            <div className={`step ${stage.completed ? (isActive ? 'active' : 'completed') : ''}`}>
                                                <div className="step-circle">
                                                    {stage.completed ? '✓' : i + 1}
                                                </div>
                                                <div className="step-label">
                                                    {stage.name}
                                                    {stage.date && <div style={{ fontSize: 9, marginTop: 2 }}>{stage.date}</div>}
                                                </div>
                                            </div>
                                            {!isLast && <div className={`step-line ${stage.completed ? 'completed' : ''}`}></div>}
                                        </>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: 20 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Progress</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-green)' }}>{selectedOrder.progress}%</span>
                            </div>
                            <div className="progress-bar" style={{ height: 10, borderRadius: 5 }}>
                                <div className="progress-fill green" style={{ width: `${selectedOrder.progress}%`, height: 10, borderRadius: 5 }}></div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="divider"></div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Order Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <div>
                                <div className="text-xs text-muted">Quantity</div>
                                <div style={{ fontWeight: 700 }}>{selectedOrder.qty.toLocaleString('en-IN')} pcs</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted">Product</div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{selectedOrder.product}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted">Status</div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: selectedOrder.status === 'Completed' ? 'var(--accent-green)' : 'var(--accent-blue-light)' }}>
                                    {selectedOrder.status}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }} className="flex gap-2">
                            <button className="btn btn-secondary"><FileText size={14} /> Download Invoice</button>
                            <button className="btn btn-primary"><ShoppingCart size={14} /> Re-Order This Item</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
