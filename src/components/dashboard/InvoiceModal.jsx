import { Printer, FileText } from 'lucide-react';

export default function InvoiceModal({ order, onClose }) {
    if (!order) return null;

    const invoiceNo = `INV-${new Date(order.orderDate).getFullYear()}-${order.id.split('-')[1] || '0001'}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Hardcoded GST rate for springs (18%)
    const gstRate = 0.18;
    const subtotal = order.total;
    const cgst = subtotal * (gstRate / 2);
    const sgst = subtotal * (gstRate / 2);
    const grandTotal = subtotal + cgst + sgst;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', padding: '0', background: '#f8fafc' }}>
                <div className="modal-header no-print" style={{ padding: '20px', background: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} color="var(--accent-blue)" /> Generate Invoice
                    </h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={16} /> Print / Save as PDF
                        </button>
                        <button className="close-btn" onClick={onClose} style={{ marginLeft: '10px' }}>×</button>
                    </div>
                </div>
                
                <div className="modal-body" style={{ padding: '20px', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                    {/* A4 Print Container */}
                    <div className="invoice-preview" style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '842px', color: '#1e293b' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 4px', fontSize: '28px', color: '#0f172a', fontWeight: 800 }}>AGGARWAL INDUSTRIES</h1>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Plot No. 45, Industrial Area Phase 1</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Chandigarh, 160002, India</p>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}><strong>GSTIN:</strong> 04AAAAA0000A1Z5</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ margin: '0 0 10px', fontSize: '32px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '2px' }}>TAX INVOICE</h2>
                                <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Invoice No:</strong> {invoiceNo}</p>
                                <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Date:</strong> {invoiceDate}</p>
                                <p style={{ margin: 0, fontSize: '14px' }}><strong>Order Ref:</strong> {order.id}</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Billed To:</h3>
                            <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{order.customer}</p>
                            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#475569' }}>Purchasing Department</p>
                            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#475569' }}>Source: {order.source || 'Direct'}</p>
                            {order.sourceRef && <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>PO/Ref: {order.sourceRef}</p>}
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#475569', width: '5%' }}>#</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#475569', width: '45%' }}>Item Description</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#475569', width: '10%' }}>HSN</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#475569', width: '15%' }}>Qty (Nos)</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#475569', width: '10%' }}>Rate (₹)</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#475569', width: '15%' }}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>1</td>
                                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                                        <strong>{order.product}</strong>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Material: {order.material} | Wire Gauge: {order.wireGauge}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>7320</td>
                                    <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>{order.qty.toLocaleString()}</td>
                                    <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>{order.unitPrice.toFixed(2)}</td>
                                    <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'right' }}>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
                            <div style={{ width: '350px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    <span style={{ color: '#475569' }}>Taxable Amount:</span>
                                    <strong>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    <span style={{ color: '#475569' }}>CGST (9%):</span>
                                    <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid #cbd5e1', fontSize: '14px' }}>
                                    <span style={{ color: '#475569' }}>SGST (9%):</span>
                                    <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                                    <span>Invoice Total:</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <strong>Bank Details:</strong><br/>
                                    HDFC Bank, Sector 17 Branch<br/>
                                    A/C No: 50200000000000<br/>
                                    IFSC: HDFC0000017
                                </div>
                                <div style={{ textAlign: 'center', width: '200px' }}>
                                    <div style={{ height: '60px', borderBottom: '1px solid #0f172a', marginBottom: '8px' }}></div>
                                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Authorized Signatory</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>For Aggarwal Industries</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .invoice-preview, .invoice-preview * { visibility: visible; }
                    .invoice-preview { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .modal-overlay { background: white !important; }
                }
            `}</style>
        </div>
    );
}
