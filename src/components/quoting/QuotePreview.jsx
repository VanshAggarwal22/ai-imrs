import React from 'react';

export default function QuotePreview({ companyDetails, quoteNumber, activeForm, tab, activeCalc }) {
    return (
        <div className="quote-preview-container" style={{
            background: '#f1f5f9',
            padding: '40px 0',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto'
        }}>
            <div className="quote-preview" style={{
                width: '794px',
                height: '1123px',
                background: '#fff',
                padding: '40px',
                boxSizing: 'border-box',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                color: '#1e293b'
            }}>
                {/* Corporate Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="/logo.png" alt="Company Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div>
                            <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 900, color: '#1e3a8a', letterSpacing: '-1px' }}>{companyDetails.name.toUpperCase()}</h1>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{companyDetails.motto}</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.6', color: '#475569' }}>
                        <div style={{ background: '#1e3a8a', color: '#fff', padding: '4px 10px', borderRadius: '4px', marginBottom: '8px', fontWeight: 700, display: 'inline-block' }}>
                            {companyDetails.certifications[0]}
                        </div><br />
                        <strong>Plant:</strong> {companyDetails.addresses.plant}<br />
                        <strong>Office:</strong> {companyDetails.addresses.office}<br />
                        <strong>T:</strong> {companyDetails.contact.phone} | <strong>E:</strong> {companyDetails.contact.email}
                    </div>
                </div>

                {/* Quotation Info Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', alignItems: 'flex-end' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', margin: 0, color: '#1e3a8a', fontWeight: 800 }}>QUOTATION</h2>
                        <div style={{ fontSize: '14px', marginTop: '5px', color: '#64748b', fontWeight: 600 }}>
                            REF: AST-{quoteNumber} | DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700 }}>Quotation For:</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{activeForm.customerName || 'Valued Customer'}</div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Item Description</th>
                                <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Quantity</th>
                                <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Amount (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '24px 0', verticalAlign: 'top' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{activeForm.type}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
                                        {tab === 'spring'
                                            ? `• Material: ${activeForm.material}\n• Wire Dia: ${activeForm.wireDia}mm | Outer Dia: ${activeForm.outerDia}mm\n• Free Length: ${activeForm.freeLength}mm | Total Coils: ${activeForm.totalCoils}`
                                            : tab === 'washer'
                                                ? `• Standard: ${activeForm.standard}\n• Material: ${activeForm.material}\n• ID: ${activeForm.innerDia}mm | OD: ${activeForm.outerDia}mm | T: ${activeForm.thickness}mm`
                                                : `• Standard: ${activeForm.standard}\n• Material: ${activeForm.material} (${activeForm.wireType})\n• Size: ${activeForm.mSize} | Dimensions: ${activeForm.innerDia} x ${activeForm.outerDia} x ${activeForm.thickness}mm`
                                        }
                                        <br />• Surface Finish: {activeForm.surfaceFinish}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '15px' }}>{parseInt(activeForm.quantity).toLocaleString('en-IN')} pcs</td>
                                <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '15px' }}>₹{activeCalc.unitPrice}</td>
                                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '16px', color: '#1e3a8a' }}>₹{parseInt(activeCalc.total).toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ width: '100%', borderTop: '2px solid #1e3a8a', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 700 }}>GRAND TOTAL:</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a8a' }}>₹{parseInt(activeCalc.total).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '2px', fontStyle: 'italic' }}>
                        (Amount inclusive of all basic costs, margins, and estimated overheads)
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.8' }}>
                        <strong style={{ color: '#1e3a8a', fontSize: '11px', display: 'block', marginBottom: '8px' }}>TERMS AND CONDITIONS:</strong>
                        1. <strong>Validity:</strong> Prices are valid for 15 days from the date of quote.<br />
                        2. <strong>Taxes:</strong> GST extra as applicable at the time of invoicing.<br />
                        3. <strong>Delivery:</strong> 2-3 weeks from the date of purchase order receipt.<br />
                        4. <strong>Payment:</strong> As per agreed credit terms.<br />
                        5. <strong>Inspection:</strong> Goods inspected as per our standard QA processes (CoC available).
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '60px' }}></div>
                        <div style={{ width: '160px', borderTop: '1px solid #cbd5e1', margin: '0 auto 8px' }}></div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>FOR AGGARWAL INDUSTRIES</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Authorized Signatory</div>
                    </div>
                </div>

                {/* Footer Line */}
                <div style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', textAlign: 'center', fontSize: '9px', color: '#94a3b8' }}>
                    Precision Engineered Springs & Washers for Railway & Industrial Applications Global
                </div>
            </div>
        </div>
    );
}
