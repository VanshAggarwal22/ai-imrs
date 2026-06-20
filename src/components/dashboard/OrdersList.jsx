import { useState, useContext } from 'react';
import { ChevronRight, CheckCircle2, Package, Zap } from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function OrdersList() {
    const { orders, updateOrder } = useContext(DataContext);
    const { showToast } = useToast();
    const [filter, setFilter] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const activeOrders = orders.filter(o => o.status !== 'Completed');
    const completedOrders = orders.filter(o => o.status === 'Completed');

    const filteredOrders = filter === 'active' ? activeOrders : completedOrders;

    const stages = ['Coiling', 'Heat Treatment', 'QC', 'Dispatch'];

    const getCurrentStageIndex = (order) => {
        const stageIndex = order.stages?.findIndex(s => s.status === 'In Progress') ?? -1;
        return stageIndex >= 0 ? stageIndex : 0;
    };

    const progressOrder = async (order) => {
        const currentIndex = getCurrentStageIndex(order);
        const newStages = order.stages?.map((s, i) => {
            if (i === currentIndex) return { ...s, status: 'Completed' };
            if (i === currentIndex + 1) return { ...s, status: 'In Progress' };
            return s;
        }) || stages.map((name, i) => ({
            name,
            status: i === 0 ? 'In Progress' : i === 1 ? 'Pending' : 'Pending'
        }));

        const isLastStage = currentIndex === stages.length - 1;
        const updatedOrder = {
            ...order,
            stages: newStages,
            progress: Math.min(100, order.progress + 25),
            status: isLastStage ? 'Completed' : 'In Production'
        };

        try {
            await updateOrder(updatedOrder);
            showToast(isLastStage ? '✅ Order completed!' : `✅ Moved to ${stages[currentIndex + 1]}`);
        } catch {
            showToast('❌ Failed to update order');
        }
    };

    const handleCompleteOrder = async (order) => {
        if (confirm('Mark this order as completed?')) {
            try {
                await updateOrder({
                    ...order,
                    status: 'Completed',
                    progress: 100,
                    stages: order.stages?.map(s => ({ ...s, status: 'Completed' })) || []
                });
                showToast('✅ Order marked as completed');
                setShowDetail(false);
            } catch {
                showToast('❌ Failed to complete order');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Orders Management</h1>
                    <p>Track manufacturing progress and order status</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs" style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => setFilter('active')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: filter === 'active' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                        color: filter === 'active' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Active Orders ({activeOrders.length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: filter === 'completed' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                        color: filter === 'completed' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Completed Orders ({completedOrders.length})
                </button>
            </div>

            {/* Orders Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {filteredOrders.map(order => (
                    <div key={order.id} className="card" style={{ cursor: 'pointer' }} onClick={() => { setSelectedOrder(order); setShowDetail(true); }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ margin: '0', fontSize: '16px' }}>{order.product}</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>Order {order.id}</p>
                            </div>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                background: order.status === 'Completed' ? '#10b981' : '#3b82f6',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 600
                            }}>
                                {order.status}
                            </span>
                        </div>

                        {/* Customer & Details */}
                        <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                            <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>
                                <strong>Customer:</strong> {order.customer}
                            </p>
                            <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>
                                <strong>Qty:</strong> {order.qty} units
                            </p>
                            <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>
                                <strong>Due:</strong> {order.dueDate}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '4px',
                                height: '6px',
                                overflow: 'hidden',
                                marginBottom: '4px'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                                    height: '100%',
                                    width: `${order.progress}%`,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                {order.progress}% Complete
                            </p>
                        </div>

                        {/* Current Stage */}
                        <div style={{
                            padding: '8px',
                            borderRadius: '4px',
                            background: 'var(--bg-secondary)',
                            marginBottom: '12px',
                            fontSize: '12px'
                        }}>
                            <p style={{ margin: '0', color: 'var(--text-muted)' }}>Current Stage:</p>
                            <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                {stages[getCurrentStageIndex(order)]}
                            </p>
                        </div>

                        {/* Action Button */}
                        {order.status !== 'Completed' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); progressOrder(order); }}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'var(--accent-blue)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}
                            >
                                <ChevronRight size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Progress
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Package size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>No {filter} orders</p>
                </div>
            )}

            {/* Order Detail Modal */}
            {showDetail && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>{selectedOrder.product} - Order #{selectedOrder.id}</h2>
                            <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                        </div>

                        {/* Order Details */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Customer</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.customer}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Quantity</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.qty} units</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Order Date</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.orderDate}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Due Date</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.dueDate}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Total Value</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>₹{selectedOrder.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Material</p>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.material}</p>
                                </div>
                            </div>
                        </div>

                        {/* Manufacturing Stages */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Manufacturing Progress</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {stages.map((stage, i) => {
                                    const stageObj = selectedOrder.stages?.[i] || { name: stage, status: 'Pending' };
                                    const isActive = stageObj.status === 'In Progress';
                                    const isCompleted = stageObj.status === 'Completed';

                                    return (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isCompleted ? 'var(--accent-green)' : isActive ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                                color: isCompleted || isActive ? 'white' : 'var(--text-muted)',
                                                fontWeight: 600,
                                                marginBottom: '8px'
                                            }}>
                                                {isCompleted ? <CheckCircle2 size={20} /> : (i + 1)}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                {stage}
                                            </p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {stageObj.status}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>Overall Progress</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedOrder.progress}%</span>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '4px',
                                height: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                                    height: '100%',
                                    width: `${selectedOrder.progress}%`,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {selectedOrder.status !== 'Completed' && (
                                <button
                                    onClick={() => progressOrder(selectedOrder)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'var(--accent-blue)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    <Zap size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Progress to Next Stage
                                </button>
                            )}
                            {selectedOrder.status !== 'Completed' && selectedOrder.progress >= 75 && (
                                <button
                                    onClick={() => handleCompleteOrder(selectedOrder)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'var(--accent-green)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    <CheckCircle2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    borderRadius: '8px';
                    padding: '24px';
                    maxWidth: '600px';
                    width: '90%';
                    maxHeight: '90vh';
                    overflow: 'auto';
                }
            `}</style>
        </div>
    );
}
