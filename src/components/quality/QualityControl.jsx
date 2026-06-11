import { useState } from 'react';
import {
    ShieldCheck, AlertTriangle, CheckCircle, XCircle,
    FileDown, Plus, Eye, Search
} from 'lucide-react';
import { inspectionLogs, companyDetails } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { EmailService } from '../../services/EmailService';
import { Mail, Send } from 'lucide-react';

export default function QualityControl() {
    const { showToast } = useToast();
    const [receiverEmail, setReceiverEmail] = useState('');
    const [tab, setTab] = useState('logs');
    const [showCoC, setShowCoC] = useState(null);

    // New inspection form
    const [newInspection, setNewInspection] = useState({
        orderId: '',
        batchNo: '',
        product: '',
        freeLength: '',
        flSpec: '45.0',
        flTol: '0.5',
        solidHeight: '',
        shSpec: '18.0',
        shTol: '0.3',
        springRate: '',
        srSpec: '12.5',
        srTol: '0.5',
        loadTest: '',
        ltSpec: '56.0',
        ltTol: '1.0',
    });

    const checkTolerance = (value, spec, tolerance) => {
        const v = parseFloat(value);
        const s = parseFloat(spec);
        const t = parseFloat(tolerance);
        if (!value || isNaN(v)) return 'pending';
        return Math.abs(v - s) <= t ? 'Pass' : 'Fail';
    };

    const passCount = inspectionLogs.filter(l => l.overallStatus === 'Pass').length;
    const failCount = inspectionLogs.filter(l => l.overallStatus === 'Fail').length;
    const passRate = ((passCount / inspectionLogs.length) * 100).toFixed(0);

    const handleQuickSendCoC = async () => {
        if (!receiverEmail) {
            showToast('Please enter a receiver email address in the field below.');
            return;
        }

        try {
            showToast('📎 Generating CoC PDF & sending...');
            const subject = `Certificate of Compliance - Order: ${showCoC.orderId}`;
            const bodyHtml = `
                <p>Dear Customer,</p>
                <p>Please find the certified inspection results for your recent order: <strong>${showCoC.orderId}</strong>.</p>
                <ul>
                    <li><strong>Batch No:</strong> ${showCoC.batchNo}</li>
                    <li><strong>Product:</strong> ${showCoC.product}</li>
                </ul>
                <p style="color: green; font-weight: bold;">All parameters were tested and found to be strictly within specifications.</p>
                <p>Please find the official Certificate of Compliance attached as a PDF.</p>
                <br/>
                <p>Regards,</p>
                <p><strong>Quality Assurance Dept.</strong><br/>Aggarwal Industries</p>
            `;

            // Generate PDF from the CoC modal content
            const cocEl = document.querySelector('.quote-preview');
            let attachments = [];
            if (cocEl) {
                try {
                    const pdfBase64 = await EmailService.generatePdfBase64(cocEl.outerHTML, `CoC_${showCoC.id}.pdf`);
                    attachments = [{
                        filename: `CoC_${showCoC.id}.pdf`,
                        content: pdfBase64,
                        encoding: 'base64'
                    }];
                } catch (pdfErr) {
                    console.warn('CoC PDF generation failed, sending without attachment:', pdfErr);
                }
            }

            await EmailService.sendEmail(receiverEmail, subject, bodyHtml, attachments);
            showToast('✅ CoC with PDF dispatched successfully!');
        } catch (e) {
            showToast(e.message || 'Failed to send CoC. Check SMTP Settings.');
        }
    };

    const handleDownloadCoC = () => {
        showToast('Opening CoC Print Dialog...');

        const log = showCoC;
        const params = ['freeLength', 'solidHeight', 'springRate', 'loadTest'].map(key => {
            const d = log[key];
            return `<tr>
                <td style="text-transform:capitalize;padding:10px 8px;border-bottom:1px solid #e2e8f0">${key.replace(/([A-Z])/g, ' $1')}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center">${d.spec}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center">± ${d.tolerance}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700">${d.value}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;color:${d.status === 'Pass' ? '#16a34a' : '#dc2626'};font-weight:700">${d.status}</td>
            </tr>`;
        }).join('');

        const printHTML = `<!DOCTYPE html>
<html><head><title>CoC_${log.id}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
  .page { width: 794px; min-height: 1123px; padding: 40px; position: relative; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; }
  .header-left { display: flex; align-items: center; gap: 15px; }
  .header-left img { width: 80px; height: 80px; object-fit: contain; }
  .header-left h1 { font-size: 24px; font-weight: 900; color: #1e3a8a; }
  .header-left p { font-size: 10px; color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; }
  .header-right { text-align: right; font-size: 10px; color: #475569; line-height: 1.5; }
  .cert-badge { border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: #1e40af; display: inline-block; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th { text-align: left; padding: 10px 8px; font-size: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; }
</style></head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <img src="${window.location.origin}/logo.png" alt="Logo" />
      <div>
        <h1>${companyDetails.name.toUpperCase()}</h1>
        <p>${companyDetails.motto}</p>
      </div>
    </div>
    <div class="header-right">
      <div class="cert-badge">${companyDetails.certifications[0]}</div><br/>
      <strong>Plant:</strong> ${companyDetails.addresses.plant}<br/>
      <strong>Office:</strong> ${companyDetails.addresses.office}
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <h2 style="color:#1e3a8a;letter-spacing:2px;font-weight:700">CERTIFICATE OF COMPLIANCE</h2>
      <div style="font-size:12px;color:#64748b;margin-top:4px">CoC No: QC-${log.id.replace('QC-', '')} • Date: ${log.date}</div>
    </div>
  </div>

  <div style="margin-top:15px;font-size:12px;line-height:1.6">
    This is to certify that the materials mentioned below have been inspected and tested by our Quality Control department and found to be in complete compliance with the required specifications and standards.
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:15px;font-size:12px">
    <div><strong>Order ID:</strong> ${log.orderId}<br/><strong>Batch No:</strong> ${log.batchNo}</div>
    <div style="text-align:right"><strong>Product:</strong> ${log.product}</div>
  </div>

  <div style="margin:16px 0;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;color:#16a34a;font-weight:700;font-size:14px">
    ✅ ALL PARAMETERS WITHIN SPECIFICATION
  </div>

  <table>
    <thead><tr>
      <th>Parameter</th><th style="text-align:center">Specification</th><th style="text-align:center">Tolerance</th><th style="text-align:center">Measured</th><th style="text-align:center">Result</th>
    </tr></thead>
    <tbody>${params}</tbody>
  </table>

  <div style="margin-top:30px;display:flex;justify-content:space-between;align-items:flex-end">
    <div style="font-size:10px;color:#64748b;font-style:italic">* This is a computer generated document, hence signature not required.</div>
    <div style="text-align:center">
      <div style="font-size:11px;font-weight:700">For AGGARWAL INDUSTRIES</div>
      <div style="width:140px;height:40px;margin:5px auto;border:1px dashed #cbd5e1;border-radius:4px"></div>
      <div style="font-size:10px;color:#475569">QUALITY ASSURANCE DEPT.</div>
    </div>
  </div>
</div>
<script>
  const img = document.querySelector('img');
  function doPrint() { setTimeout(function(){ window.print(); }, 400); }
  if (img && !img.complete) { img.onload = doPrint; img.onerror = doPrint; }
  else { doPrint(); }
</script>
</body></html>`;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Pop-up blocked! Please allow pop-ups for this site.');
            return;
        }
        printWindow.document.write(printHTML);
        printWindow.document.close();
    };

    return (
        <div className="page-content">
            {/* KPIs */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="kpi-card green animate-in">
                    <div className="kpi-icon green"><CheckCircle size={22} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Inspections Passed</div>
                        <div className="kpi-value">{passCount}</div>
                    </div>
                </div>
                <div className="kpi-card red animate-in">
                    <div className="kpi-icon red"><XCircle size={22} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Inspections Failed</div>
                        <div className="kpi-value">{failCount}</div>
                    </div>
                </div>
                <div className="kpi-card blue animate-in">
                    <div className="kpi-icon blue"><ShieldCheck size={22} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">Pass Rate</div>
                        <div className="kpi-value">{passRate}%</div>
                        <div className={`kpi-change ${parseInt(passRate) >= 95 ? 'up' : 'down'}`}>
                            {parseInt(passRate) >= 95 ? 'On Target' : 'Below 95% Target'}
                        </div>
                    </div>
                </div>
                <div className="kpi-card purple animate-in">
                    <div className="kpi-icon purple"><FileDown size={22} /></div>
                    <div className="kpi-info">
                        <div className="kpi-label">CoCs Generated</div>
                        <div className="kpi-value">{passCount}</div>
                    </div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>📋 Inspection Logs</button>
                <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>➕ New Inspection</button>
            </div>

            {tab === 'logs' && (
                <div className="card animate-in">
                    <div className="card-header">
                        <div className="card-title">Digital Inspection Records</div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>QC ID</th>
                                    <th>Order</th>
                                    <th>Batch</th>
                                    <th>Product</th>
                                    <th>Date</th>
                                    <th>Free Length</th>
                                    <th>Solid Height</th>
                                    <th>Spring Rate</th>
                                    <th>Load Test</th>
                                    <th>Result</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspectionLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>{log.id}</td>
                                        <td>{log.orderId}</td>
                                        <td>{log.batchNo}</td>
                                        <td style={{ fontSize: 12 }}>{log.product}</td>
                                        <td style={{ fontSize: 12 }}>{log.date}</td>
                                        <td>
                                            <span className={log.freeLength.status === 'Pass' ? 'tolerance-pass' : 'tolerance-fail'}>
                                                {log.freeLength.value}
                                            </span>
                                            <span className="text-xs text-muted"> /{log.freeLength.spec}±{log.freeLength.tolerance}</span>
                                        </td>
                                        <td>
                                            <span className={log.solidHeight.status === 'Pass' ? 'tolerance-pass' : 'tolerance-fail'}>
                                                {log.solidHeight.value}
                                            </span>
                                            <span className="text-xs text-muted"> /{log.solidHeight.spec}±{log.solidHeight.tolerance}</span>
                                        </td>
                                        <td>
                                            <span className={log.springRate.status === 'Pass' ? 'tolerance-pass' : 'tolerance-fail'}>
                                                {log.springRate.value}
                                            </span>
                                            <span className="text-xs text-muted"> /{log.springRate.spec}±{log.springRate.tolerance}</span>
                                        </td>
                                        <td>
                                            <span className={log.loadTest.status === 'Pass' ? 'tolerance-pass' : 'tolerance-fail'}>
                                                {log.loadTest.value}
                                            </span>
                                            <span className="text-xs text-muted"> /{log.loadTest.spec}±{log.loadTest.tolerance}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${log.overallStatus === 'Pass' ? 'green' : 'red'}`}>
                                                {log.overallStatus === 'Pass' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {log.overallStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {log.overallStatus === 'Pass' && (
                                                <button className="btn btn-sm btn-secondary" onClick={() => setShowCoC(log)}>
                                                    <FileDown size={10} /> CoC
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'new' && (
                <div className="card animate-in">
                    <div className="card-header">
                        <div className="card-title">New Quality Inspection</div>
                        <div className="card-subtitle">Enter measured values — tolerance violations are flagged automatically</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Order ID</label>
                            <input className="form-input" placeholder="ORD-2026-XXX" value={newInspection.orderId} onChange={e => setNewInspection(p => ({ ...p, orderId: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Batch No.</label>
                            <input className="form-input" placeholder="B1-001" value={newInspection.batchNo} onChange={e => setNewInspection(p => ({ ...p, batchNo: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Product</label>
                            <input className="form-input" placeholder="Compression Spring 2.5mm" value={newInspection.product} onChange={e => setNewInspection(p => ({ ...p, product: e.target.value }))} />
                        </div>
                    </div>

                    <div className="divider"></div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Measured Dimensions</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                        {[
                            { label: 'Free Length (mm)', key: 'freeLength', spec: newInspection.flSpec, tol: newInspection.flTol },
                            { label: 'Solid Height (mm)', key: 'solidHeight', spec: newInspection.shSpec, tol: newInspection.shTol },
                            { label: 'Spring Rate (N/mm)', key: 'springRate', spec: newInspection.srSpec, tol: newInspection.srTol },
                            { label: 'Load Test (N)', key: 'loadTest', spec: newInspection.ltSpec, tol: newInspection.ltTol },
                        ].map(field => {
                            const status = checkTolerance(newInspection[field.key], field.spec, field.tol);
                            return (
                                <div className="form-group" key={field.key}>
                                    <label className="form-label">{field.label}</label>
                                    <input
                                        className={`form-input ${status === 'Fail' ? 'error' : status === 'Pass' ? 'success' : ''}`}
                                        type="number"
                                        step="0.1"
                                        placeholder={`Spec: ${field.spec} ± ${field.tol}`}
                                        value={newInspection[field.key]}
                                        onChange={e => setNewInspection(p => ({ ...p, [field.key]: e.target.value }))}
                                    />
                                    {status === 'Fail' && (
                                        <div className="tolerance-fail" style={{ marginTop: 4, fontSize: 11, display: 'inline-block' }}>
                                            <XCircle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                                            OUT OF TOLERANCE — Spec: {field.spec} ± {field.tol}
                                        </div>
                                    )}
                                    {status === 'Pass' && (
                                        <div className="tolerance-pass" style={{ marginTop: 4, fontSize: 11 }}>
                                            <CheckCircle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                                            Within tolerance
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={() => showToast(`Inspection for Batch ${newInspection.batchNo} submitted successfully!`)}>
                            <ShieldCheck size={14} /> Submit Inspection
                        </button>
                    </div>
                </div>
            )}

            {/* CoC Modal */}
            {showCoC && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
                        background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowCoC(null)}
                >
                    <div
                        className="quote-preview"
                        style={{ width: 794, height: 1123, boxSizing: 'border-box', animation: 'slideUp 0.3s ease', padding: '40px', background: '#fff', color: '#1e293b' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* CoC Header with Aggarwal Industries Styling */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img src="/logo.png" alt="Aggarwal Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                <div>
                                    <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 900, color: '#1e3a8a' }}>{companyDetails.name.toUpperCase()}</h1>
                                    <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0', fontWeight: 600, textTransform: 'uppercase' }}>{companyDetails.motto}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>
                                <strong>Plant:</strong> {companyDetails.addresses.plant}<br />
                                <strong>Office:</strong> {companyDetails.addresses.office}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 style={{ color: '#1e3a8a', letterSpacing: '2px', fontWeight: 700 }}>CERTIFICATE OF COMPLIANCE</h2>
                                <div className="quote-number" style={{ fontSize: '12px' }}>
                                    CoC No: QC-{showCoC.id.replace('QC-', '')} • Date: {showCoC.date}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 11, color: '#64748b' }}>
                                <div style={{ border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, color: '#1e40af' }}>
                                    {companyDetails.certifications[0]}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '12px', lineHeight: '1.6' }}>
                            This is to certify that the materials mentioned below have been inspected and tested by our Quality Control department and found to be in complete compliance with the required specifications and standards.
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                            <div style={{ fontSize: '12px' }}>
                                <strong>Order ID:</strong> {showCoC.orderId}<br />
                                <strong>Batch No:</strong> {showCoC.batchNo}
                            </div>
                            <div style={{ fontSize: '12px', textAlign: 'right' }}>
                                <strong>Product:</strong> {showCoC.product}
                            </div>
                        </div>

                        <div style={{ margin: '16px 0', padding: '12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 700, fontSize: 14 }}>
                                <CheckCircle size={18} /> ALL PARAMETERS WITHIN SPECIFICATION
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr><th>Parameter</th><th>Specification</th><th>Tolerance</th><th>Measured</th><th>Result</th></tr>
                            </thead>
                            <tbody>
                                {['freeLength', 'solidHeight', 'springRate', 'loadTest'].map(key => {
                                    const d = showCoC[key];
                                    return (
                                        <tr key={key}>
                                            <td style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                                            <td>{d.spec}</td>
                                            <td>± {d.tolerance}</td>
                                            <td style={{ fontWeight: 700 }}>{d.value}</td>
                                            <td style={{ color: d.status === 'Pass' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{d.status}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                                * This is a computer generated document, hence signature not required.
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700 }}>For AGGARWAL INDUSTRIES</div>
                                <div style={{ width: '140px', height: '40px', margin: '5px auto', border: '1px dashed #cbd5e1', borderRadius: '4px' }}></div>
                                <div style={{ fontSize: '10px', color: '#475569' }}>QUALITY ASSURANCE DEPT.</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                            <input 
                                type="email" 
                                className="form-input flex-1" 
                                placeholder="Customer Email (e.g. buyer@domain.com)"
                                value={receiverEmail}
                                onChange={e => setReceiverEmail(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleQuickSendCoC}>
                                <Send size={14} /> Quick Send
                            </button>
                            <button className="btn btn-secondary" onClick={handleDownloadCoC}>
                                <FileDown size={14} /> Download
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowCoC(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
