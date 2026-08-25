import { useState, useMemo } from 'react';
import { Calculator, Download, RotateCcw, ChevronDown, PackageSearch, Save, Send, FileText } from 'lucide-react';
import {
    suppliers, materials, materialPricing, wireDensity, washerVendors,
    washerDimensions, washerPricingMatrix, washerStandards, companyDetails
} from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
import { EmailService } from '../../services/EmailService';
import QuotePreview from './QuotePreview';
import CostBreakdown from './CostBreakdown';

export default function QuotingEngine() {
    const { showToast } = useToast();
    const [receiverEmail, setReceiverEmail] = useState('');
    const [tab, setTab] = useState('spring'); // spring, washer, washerSource

    // Spring form
    const [springForm, setSpringForm] = useState({
        type: 'Compression',
        wireDia: '2.0',
        outerDia: '15.0',
        freeLength: '40.0',
        activeCoils: '8',
        totalCoils: '10',
        material: 'Spring Steel',
        supplier: 'SUP001',
        quantity: '10000',
        surfaceFinish: 'Zinc Plated',
        customerName: 'Standard Customer',
    });

    // Washer form
    const [washerForm, setWasherForm] = useState({
        type: 'Spring Lock Washer',
        standard: 'DIN 127 A - Spring lock washers, From A',
        mSize: 'M10',
        innerDia: '10.2',
        outerDia: '18.1',
        thickness: '2.2',
        material: 'Spring Steel',
        supplier: 'SUP001',
        quantity: '50000',
        surfaceFinish: 'Black Oxide',
        customerName: 'Standard Customer',
    });

    // Washer Source form (Procurement)
    const [washerSourceForm, setWasherSourceForm] = useState({
        type: 'Flat Washer',
        standard: 'DIN 7980 - Spring lock washer for cylinder head screws',
        mSize: 'M8',
        wireType: 'Flat Wire',
        innerDia: '8.1',
        outerDia: '12.7',
        thickness: '2.0',
        material: 'Spring Steel',
        vendor: 'WVEN001',
        quantity: '100000',
        surfaceFinish: 'Zinc Plated',
        customMargin: '35', // Allow user to edit margin
        customerName: 'Standard Customer',
    });

    const springTypes = ['Compression', 'Extension', 'Torsion', 'Wave', 'Disc/Belleville'];
    const washerTypes = ['Spring Lock Washer', 'Belleville Washer', 'Wave Washer', 'Curved Washer', 'Conical Washer'];
    const washerSourceTypes = ['Flat Washer', 'Spring Lock Washer', 'Square Washer', 'Belleville Washer'];
    const wireTypes = ['Flat Wire', 'Square Wire', 'Round Wire'];
    const finishes = ['Zinc Plated', 'Black Oxide', 'Phosphate Coated', 'Nickel Plated', 'Passivated', 'None'];

    // Spring calculation
    const springCalc = useMemo(() => {
        const d = parseFloat(springForm.wireDia) || 0;
        const D = parseFloat(springForm.outerDia) || 0;
        const L = parseFloat(springForm.freeLength) || 0;
        const n = parseFloat(springForm.totalCoils) || 0;
        const qty = parseInt(springForm.quantity) || 0;
        const mat = springForm.material;
        const sup = springForm.supplier;

        const meanDia = D - d;
        const wireLength = Math.PI * meanDia * n + (L * 0.1);
        const wireLengthM = wireLength / 1000;
        const crossSection = Math.PI * (d / 2000) ** 2;
        const volume = crossSection * wireLengthM;
        const density = wireDensity[mat] || 7850;
        const weightPerPc = volume * density * 1000;

        const totalWeightKg = (weightPerPc * qty) / 1000;
        const pricePerKg = materialPricing[mat]?.[sup] || materialPricing[mat]?.default || 100;
        const materialCost = totalWeightKg * pricePerKg;

        const machineTimePerPc = 0.8 + (n * 0.15);
        const totalMachineTimeMins = machineTimePerPc * qty;
        const machineCostPerMin = 1.2;
        const machineCost = totalMachineTimeMins * machineCostPerMin;

        const finishCost = springForm.surfaceFinish === 'None' ? 0 : totalWeightKg * 25;
        const overhead = (materialCost + machineCost + finishCost) * 0.15;
        const subtotal = materialCost + machineCost + finishCost + overhead;
        const margin = subtotal * 0.20;
        const total = subtotal + margin;
        const unitPrice = qty > 0 ? total / qty : 0;

        return {
            weightPerPc: weightPerPc.toFixed(3),
            totalWeightKg: totalWeightKg.toFixed(1),
            pricePerKg: pricePerKg.toFixed(0),
            materialCost: materialCost.toFixed(0),
            machineTime: machineTimePerPc.toFixed(1),
            machineCost: machineCost.toFixed(0),
            finishCost: finishCost.toFixed(0),
            overhead: overhead.toFixed(0),
            margin: margin.toFixed(0),
            total: total.toFixed(0),
            unitPrice: unitPrice.toFixed(2),
        };
    }, [springForm]);

    // Washer calculation
    const washerCalc = useMemo(() => {
        const standardUnit = washerStandards[washerForm.standard]?.unit || 'mm';
        const factor = standardUnit === 'inch' ? 25.4 : 1;

        const id = parseFloat(washerForm.innerDia) || 0;
        const od = parseFloat(washerForm.outerDia) || 0;
        const t = parseFloat(washerForm.thickness) || 0;
        const qty = parseInt(washerForm.quantity) || 0;
        const mat = washerForm.material;
        const sup = washerForm.supplier;

        const id_mm = id * factor;
        const od_mm = od * factor;
        const t_mm = t * factor;

        const area = Math.PI * ((od_mm / 2000) ** 2 - (id_mm / 2000) ** 2);
        const volume = area * (t_mm / 1000);
        const density = wireDensity[mat] || 7850;
        const weightPerPc = volume * density * 1000;

        const totalWeightKg = (weightPerPc * qty) / 1000;
        const pricePerKg = materialPricing[mat]?.[sup] || materialPricing[mat]?.default || 100;
        const materialCost = totalWeightKg * pricePerKg;

        const machineTimePerPc = 0.3;
        const totalMachineTimeMins = machineTimePerPc * qty;
        const machineCost = totalMachineTimeMins * 1.0;

        const finishCost = washerForm.surfaceFinish === 'None' ? 0 : totalWeightKg * 20;
        const overhead = (materialCost + machineCost + finishCost) * 0.12;
        const subtotal = materialCost + machineCost + finishCost + overhead;
        const margin = subtotal * 0.18;
        const total = subtotal + margin;
        const unitPrice = qty > 0 ? total / qty : 0;

        return {
            weightPerPc: weightPerPc.toFixed(3),
            totalWeightKg: totalWeightKg.toFixed(1),
            pricePerKg: pricePerKg.toFixed(0),
            materialCost: materialCost.toFixed(0),
            machineCost: machineCost.toFixed(0),
            finishCost: finishCost.toFixed(0),
            overhead: overhead.toFixed(0),
            margin: margin.toFixed(0),
            total: total.toFixed(0),
            unitPrice: unitPrice.toFixed(3),
        };
    }, [washerForm]);

    // Washer Source calculation (Procurement pricing)
    const washerSourceCalc = useMemo(() => {
        const qty = parseInt(washerSourceForm.quantity) || 0;
        const vendorId = washerSourceForm.vendor;
        const mat = washerSourceForm.material;
        const mSize = washerSourceForm.mSize;
        const wireType = washerSourceForm.wireType;
        const standardUnit = washerStandards[washerSourceForm.standard]?.unit || 'mm';
        const ID = parseFloat(washerSourceForm.innerDia) || 0;
        const OD = parseFloat(washerSourceForm.outerDia) || 0;
        const THK = parseFloat(washerSourceForm.thickness) || 0;
        const factor = standardUnit === 'inch' ? 0.0254 : 0.001;

        // 1. Calculate the weight per piece (in kg)
        const density = wireDensity[mat] || 7850;
        const volumeM3 = (Math.PI / 4) * (Math.pow(OD * factor, 2) - Math.pow(ID * factor, 2)) * (THK * factor);
        const weightPerPcKg = volumeM3 * density;
        const totalWeightKg = weightPerPcKg * qty;

        // 2. Lookup exact pricing from the matrix
        // The matrix uses base materials like 'Spring Steel' and 'Stainless Steel 304'.
        const matrixMatName = mat.includes('Stainless') ? 'Stainless Steel 304' : 'Spring Steel';
        let pricePerKg = 150; // ultimate fallback

        if (washerPricingMatrix[vendorId] &&
            washerPricingMatrix[vendorId][matrixMatName] &&
            washerPricingMatrix[vendorId][matrixMatName][wireType] &&
            washerPricingMatrix[vendorId][matrixMatName][wireType][mSize]) {
            pricePerKg = washerPricingMatrix[vendorId][matrixMatName][wireType][mSize];
        }

        const totalProcurementCost = totalWeightKg * pricePerKg;
        // cost per 1000 to display on UI
        const procurementCostPer1000 = qty > 0 ? (totalProcurementCost / qty) * 1000 : 0;

        // 3. User Custom Margin
        const marginPercentage = parseFloat(washerSourceForm.customMargin) || 0;
        const margin = totalProcurementCost * (marginPercentage / 100);
        const total = totalProcurementCost + margin;
        const unitPrice = qty > 0 ? total / qty : 0;

        return {
            totalWeightKg: totalWeightKg.toFixed(1),
            pricePerKg: pricePerKg.toFixed(0),
            procurementCostPer1000: procurementCostPer1000.toFixed(2),
            totalProcurementCost: totalProcurementCost.toFixed(0),
            marginPercent: marginPercentage,
            margin: margin.toFixed(0),
            total: total.toFixed(0),
            unitPrice: unitPrice.toFixed(3),
        };
    }, [washerSourceForm]);


    const activeForm = tab === 'spring' ? springForm : (tab === 'washer' ? washerForm : washerSourceForm);
    const setActiveForm = tab === 'spring' ? setSpringForm : (tab === 'washer' ? setWasherForm : setWasherSourceForm);
    const activeCalc = tab === 'spring' ? springCalc : (tab === 'washer' ? washerCalc : washerSourceCalc);

    const supplierOptions = suppliers.filter(s => s.materials.includes(activeForm.material));

    // Auto-update helpers
    const updateField = (field, value) => {
        if (field === 'standard' && (tab === 'washer' || tab === 'washerSource')) {
            const standardData = washerStandards[value];
            if (standardData) {
                const firstSize = Object.keys(standardData.sizes)[0];
                const dims = standardData.sizes[firstSize];
                setActiveForm(prev => ({
                    ...prev,
                    [field]: value,
                    mSize: firstSize,
                    innerDia: dims.d1.toString(),
                    outerDia: dims.d2.toString(),
                    thickness: dims.s ? dims.s.toString() : (dims.thk ? dims.thk.toString() : prev.thickness)
                }));
                return;
            }
        }

        if (field === 'mSize' && (tab === 'washer' || tab === 'washerSource')) {
            const standard = activeForm.standard || 'DIN 127 A - Spring lock washers, From A';
            const dims = washerStandards[standard]?.sizes[value] || washerDimensions[value];
            if (dims) {
                setActiveForm(prev => ({
                    ...prev,
                    [field]: value,
                    innerDia: (dims.d1 || dims.inner).toString(),
                    outerDia: (dims.d2 || dims.outer).toString(),
                    thickness: (dims.s || dims.thk).toString()
                }));
                return;
            }
        }

        setActiveForm(prev => ({ ...prev, [field]: value }));
        // auto-update supplier if material changes (for internal mfg)
        if (field === 'material' && tab !== 'washerSource') {
            const validSups = suppliers.filter(s => s.materials.includes(value));
            if (validSups.length > 0) {
                setActiveForm(prev => ({ ...prev, [field]: value, supplier: validSups[0].id }));
            }
        }
    };

    const [quoteNumber] = useState(() => `QT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`);

    const handleQuickSend = async () => {
        if (!receiverEmail) {
            showToast('Please enter a receiver email address below the quote.');
            return;
        }

        try {
            showToast('📎 Generating PDF & sending quotation...');
            const subjectLine = `Quotation for ${activeForm.customerName || 'Valued Customer'} - ${quoteNumber}`;
            const bodyHtml = `
                <p>Dear ${activeForm.customerName || 'Customer'},</p>
                <p>Thank you for considering Aggarwal Industries.</p>
                <p>We are pleased to provide you with the attached quotation.</p>
                <ul>
                    <li><strong>Item:</strong> ${activeForm.type} (${activeForm.material})</li>
                    <li><strong>Quantity:</strong> ${parseInt(activeForm.quantity).toLocaleString('en-IN')} pcs</li>
                    <li><strong>Unit Price:</strong> ₹${activeCalc.unitPrice}</li>
                    <li><strong>Total Amount:</strong> ₹${parseInt(activeCalc.total).toLocaleString('en-IN')}</li>
                </ul>
                <p>Please find the formal quotation attached as a PDF.</p>
                <p>Best Regards,</p>
                <p><strong>Aggarwal Industries Sales Team</strong></p>
            `;

            // Generate PDF from the on-screen quote preview
            const quoteEl = document.querySelector('.quote-preview');
            let attachments = [];
            if (quoteEl) {
                try {
                    const pdfBase64 = await EmailService.generatePdfBase64(quoteEl.outerHTML, `Quotation_${quoteNumber}.pdf`);
                    attachments = [{
                        filename: `Quotation_${quoteNumber}.pdf`,
                        content: pdfBase64,
                        encoding: 'base64'
                    }];
                } catch (pdfErr) {
                    console.warn('PDF generation failed, sending without attachment:', pdfErr);
                }
            }

            await EmailService.sendEmail(receiverEmail, subjectLine, bodyHtml, attachments);
            showToast('✅ Quotation with PDF sent successfully!');
        } catch (error) {
            showToast(error.message || 'Failed to send Quote. Check SMTP settings.');
        }
    };
    
    const handleDownload = () => {
        showToast('Opening Print Dialog...');

        const itemDesc = tab === 'spring'
            ? `Material: ${activeForm.material} | Wire Dia: ${activeForm.wireDia}mm | OD: ${activeForm.outerDia}mm | Free Length: ${activeForm.freeLength}mm | Total Coils: ${activeForm.totalCoils} | Finish: ${activeForm.surfaceFinish}`
            : tab === 'washer'
                ? `Standard: ${activeForm.standard} | Material: ${activeForm.material} | ID: ${activeForm.innerDia}mm | OD: ${activeForm.outerDia}mm | T: ${activeForm.thickness}mm | Finish: ${activeForm.surfaceFinish}`
                : `Standard: ${activeForm.standard} | Material: ${activeForm.material} (${activeForm.wireType}) | Size: ${activeForm.mSize} | ${activeForm.innerDia} x ${activeForm.outerDia} x ${activeForm.thickness}mm | Finish: ${activeForm.surfaceFinish}`;

        const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

        const printHTML = `<!DOCTYPE html>
<html><head><title>Quotation ${quoteNumber}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #1e293b; }
  .page { width: 794px; min-height: 1123px; padding: 40px; position: relative; display: flex; flex-direction: column; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
  .header-left { display: flex; align-items: center; gap: 15px; }
  .header-left img { width: 80px; height: 80px; object-fit: contain; }
  .header-left h1 { font-size: 28px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; }
  .header-left p { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .header-right { text-align: right; font-size: 11px; line-height: 1.6; color: #475569; }
  .cert-badge { background: #1e3a8a; color: #fff; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; font-weight: 700; display: inline-block; }
  .quote-row { display: flex; justify-content: space-between; margin-top: 20px; align-items: flex-end; }
  .quote-row h2 { font-size: 32px; color: #1e3a8a; font-weight: 800; }
  .quote-row .ref { font-size: 14px; margin-top: 5px; color: #64748b; font-weight: 600; }
  .quote-for-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; }
  .quote-for-name { font-size: 18px; font-weight: 800; color: #1e293b; }
  .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; flex: 1; }
  .items-table th { text-align: left; padding: 12px 0; font-size: 13px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  .items-table th:nth-child(2), .items-table th:nth-child(3) { text-align: center; }
  .items-table th:nth-child(4) { text-align: right; }
  .items-table td { padding: 24px 0; vertical-align: top; }
  .items-table td:nth-child(2), .items-table td:nth-child(3) { text-align: center; font-weight: 600; font-size: 15px; }
  .items-table td:nth-child(4) { text-align: right; font-weight: 800; font-size: 16px; color: #1e3a8a; }
  .item-name { font-size: 16px; font-weight: 700; color: #1e293b; }
  .item-specs { font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.6; }
  .total-section { width: 100%; border-top: 2px solid #1e3a8a; padding-top: 15px; }
  .total-row { display: flex; justify-content: flex-end; align-items: center; gap: 20px; }
  .total-label { font-size: 14px; color: #64748b; font-weight: 700; }
  .total-amount { font-size: 28px; font-weight: 900; color: #1e3a8a; }
  .total-note { font-size: 11px; color: #94a3b8; text-align: right; margin-top: 2px; font-style: italic; }
  .terms-grid { margin-top: 20px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
  .terms { font-size: 10px; color: #64748b; line-height: 1.8; }
  .terms strong.title { color: #1e3a8a; font-size: 11px; display: block; margin-bottom: 8px; }
  .signature { text-align: center; }
  .sig-space { height: 60px; }
  .sig-line { width: 160px; border-top: 1px solid #cbd5e1; margin: 0 auto 8px; }
  .sig-name { font-size: 12px; font-weight: 800; color: #1e293b; }
  .sig-role { font-size: 10px; color: #94a3b8; }
  .footer { position: absolute; bottom: 20px; left: 40px; right: 40px; border-top: 1px solid #f1f5f9; padding-top: 10px; text-align: center; font-size: 9px; color: #94a3b8; }
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
      <strong>Office:</strong> ${companyDetails.addresses.office}<br/>
      <strong>T:</strong> ${companyDetails.contact.phone} | <strong>E:</strong> ${companyDetails.contact.email}
    </div>
  </div>
  <div class="quote-row">
    <div>
      <h2>QUOTATION</h2>
      <div class="ref">REF: AST-${quoteNumber} | DATE: ${dateStr}</div>
    </div>
    <div style="text-align:right">
      <div class="quote-for-label">Quotation For:</div>
      <div class="quote-for-name">${activeForm.customerName || 'Valued Customer'}</div>
    </div>
  </div>
  <table class="items-table">
    <thead><tr>
      <th>Item Description</th><th>Quantity</th><th>Unit Price</th><th>Amount (INR)</th>
    </tr></thead>
    <tbody><tr>
      <td><div class="item-name">${activeForm.type}</div><div class="item-specs">${itemDesc}</div></td>
      <td>${parseInt(activeForm.quantity).toLocaleString('en-IN')} pcs</td>
      <td>₹${activeCalc.unitPrice}</td>
      <td>₹${parseInt(activeCalc.total).toLocaleString('en-IN')}</td>
    </tr></tbody>
  </table>
  <div class="total-section">
    <div class="total-row">
      <div class="total-label">GRAND TOTAL:</div>
      <div class="total-amount">₹${parseInt(activeCalc.total).toLocaleString('en-IN')}</div>
    </div>
    <div class="total-note">(Amount inclusive of all basic costs, margins, and estimated overheads)</div>
  </div>
  <div class="terms-grid">
    <div class="terms">
      <strong class="title">TERMS AND CONDITIONS:</strong>
      1. <strong>Validity:</strong> Prices are valid for 15 days from the date of quote.<br/>
      2. <strong>Taxes:</strong> GST extra as applicable at the time of invoicing.<br/>
      3. <strong>Delivery:</strong> 2-3 weeks from the date of purchase order receipt.<br/>
      4. <strong>Payment:</strong> As per agreed credit terms.<br/>
      5. <strong>Inspection:</strong> Goods inspected as per our standard QA processes (CoC available).
    </div>
    <div class="signature">
      <div class="sig-space"></div>
      <div class="sig-line"></div>
      <div class="sig-name">FOR AGGARWAL INDUSTRIES</div>
      <div class="sig-role">Authorized Signatory</div>
    </div>
  </div>
  <div class="footer">Precision Engineered Springs &amp; Washers for Railway &amp; Industrial Applications Global</div>
</div>
<script>
  // Wait for all images to load, then auto-print
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
            <div className="tabs">
                <button className={`tab ${tab === 'spring' ? 'active' : ''}`} onClick={() => setTab('spring')}>🔩 Spring Calculator</button>
                <button className={`tab ${tab === 'washer' ? 'active' : ''}`} onClick={() => setTab('washer')}>⚙️ Washer Calculator</button>
                <button className={`tab ${tab === 'washerSource' ? 'active' : ''}`} onClick={() => setTab('washerSource')}><PackageSearch size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Washer Source</button>
            </div>

            <div className="grid-2">
                {/* Left: Input Form */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><Calculator size={16} style={{ display: 'inline', marginRight: 6 }} />
                            {tab === 'spring' ? 'Spring Specifications' : (tab === 'washer' ? 'Washer Specifications' : 'Source Specifications')}
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            if (tab === 'spring') setSpringForm({ type: 'Compression', wireDia: '2.0', outerDia: '15.0', freeLength: '40.0', activeCoils: '8', totalCoils: '10', material: 'Spring Steel', supplier: 'SUP001', quantity: '10000', surfaceFinish: 'Zinc Plated' })
                            else if (tab === 'washer') setWasherForm({ type: 'Spring Lock Washer', innerDia: '10.0', outerDia: '18.0', thickness: '2.5', material: 'Spring Steel', supplier: 'SUP001', quantity: '50000', surfaceFinish: 'Black Oxide' })
                            else setWasherSourceForm({ type: 'Flat Washer', mSize: 'M8', wireType: 'Flat Wire', innerDia: '8.4', outerDia: '16.0', thickness: '1.6', material: 'Spring Steel', vendor: 'WVEN001', quantity: '100000', surfaceFinish: 'Zinc Plated', customMargin: '35' })
                        }}>
                            <RotateCcw size={12} /> Reset
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Customer / Company Name</label>
                            <input
                                className="form-input"
                                placeholder="Enter customer or company name"
                                value={activeForm.customerName}
                                onChange={e => updateField('customerName', e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">{tab === 'spring' ? 'Spring Type' : 'Washer Type'}</label>
                            <select className="form-select" value={activeForm.type} onChange={e => updateField('type', e.target.value)}>
                                {(tab === 'spring' ? springTypes : (tab === 'washer' ? washerTypes : washerSourceTypes)).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {(tab === 'washer' || tab === 'washerSource') && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Standard</label>
                                    <select className="form-select" value={activeForm.standard} onChange={e => updateField('standard', e.target.value)}>
                                        {Object.keys(washerStandards).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Size</label>
                                    <select className="form-select" value={activeForm.mSize} onChange={e => updateField('mSize', e.target.value)}>
                                        {Object.keys(washerStandards[activeForm.standard || 'DIN 127 A - Spring lock washers, From A']?.sizes || {}).map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                                {tab === 'washerSource' && (
                                    <div className="form-group">
                                        <label className="form-label">Wire Type</label>
                                        <select className="form-select" value={activeForm.wireType} onChange={e => updateField('wireType', e.target.value)}>
                                            {wireTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        {tab === 'spring' ? (<>
                            <div className="form-group">
                                <label className="form-label">Wire Diameter (mm)</label>
                                <input className="form-input" type="number" step="0.1" value={springForm.wireDia} onChange={e => updateField('wireDia', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Outer Diameter (mm)</label>
                                <input className="form-input" type="number" step="0.1" value={springForm.outerDia} onChange={e => updateField('outerDia', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Free Length (mm)</label>
                                <input className="form-input" type="number" step="0.1" value={springForm.freeLength} onChange={e => updateField('freeLength', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Active Coils</label>
                                <input className="form-input" type="number" value={springForm.activeCoils} onChange={e => updateField('activeCoils', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Coils</label>
                                <input className="form-input" type="number" value={springForm.totalCoils} onChange={e => updateField('totalCoils', e.target.value)} />
                            </div>
                        </>) : (<>
                            <div className="form-group">
                                <label className="form-label">Inner Diameter ({washerStandards[activeForm.standard]?.unit || 'mm'})</label>
                                <input className="form-input" type="number" step="0.001" value={activeForm.innerDia} onChange={e => updateField('innerDia', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Outer Diameter ({washerStandards[activeForm.standard]?.unit || 'mm'})</label>
                                <input className="form-input" type="number" step="0.001" value={activeForm.outerDia} onChange={e => updateField('outerDia', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Thickness ({washerStandards[activeForm.standard]?.unit || 'mm'})</label>
                                <input className="form-input" type="number" step="0.001" value={activeForm.thickness} onChange={e => updateField('thickness', e.target.value)} />
                            </div>
                        </>)}

                        <div className="form-group">
                            <label className="form-label">Quantity (pcs)</label>
                            <input className="form-input" type="number" value={activeForm.quantity} onChange={e => updateField('quantity', e.target.value)} />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Material</label>
                            <select className="form-select" value={activeForm.material} onChange={e => updateField('material', e.target.value)}>
                                {materials.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {tab !== 'washerSource' ? (
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Supplier (affects formulation limit)</label>
                                <select className="form-select" value={activeForm.supplier} onChange={e => updateField('supplier', e.target.value)}>
                                    {supplierOptions.length > 0 ? supplierOptions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — ₹{materialPricing[activeForm.material]?.[s.id] || materialPricing[activeForm.material]?.default}/kg
                                        </option>
                                    )) : (
                                        <option value="default">Default Supplier — ₹{materialPricing[activeForm.material]?.default}/kg</option>
                                    )}
                                </select>
                            </div>
                        ) : (() => {
                            const matrixMatName = washerSourceForm.material.includes('Stainless') ? 'Stainless Steel 304' : 'Spring Steel';
                            const filteredVendors = washerVendors.filter(v =>
                                washerPricingMatrix[v.id]?.[matrixMatName]?.[washerSourceForm.wireType]?.[washerSourceForm.mSize]
                            );

                            return (
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Vendor (Sourcing Partner)</label>
                                    {filteredVendors.length > 0 ? (
                                        <select className="form-select" value={activeForm.vendor} onChange={e => updateField('vendor', e.target.value)}>
                                            {filteredVendors.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name} ({v.leadTime})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={{
                                            padding: '10px 14px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: 'var(--radius-md)',
                                            color: '#ef4444',
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            ⚠️ No vendor supplies this specific configuration.
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Surface Finish</label>
                            <select className="form-select" value={activeForm.surfaceFinish} onChange={e => updateField('surfaceFinish', e.target.value)}>
                                {finishes.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        {tab === 'washerSource' && (
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Custom Markup Margin (%)</label>
                                <input className="form-input" type="number" step="1" value={activeForm.customMargin} onChange={e => updateField('customMargin', e.target.value)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Cost Breakdown + Quote Preview */}
                <div className="flex flex-col gap-4">
                    {/* Cost Breakdown */}
                    <CostBreakdown tab={tab} activeCalc={activeCalc} />

                    {/* Professional A4 Quotation Preview */}
                    <QuotePreview companyDetails={companyDetails} quoteNumber={quoteNumber} activeForm={activeForm} tab={tab} activeCalc={activeCalc} />

                    <div className="flex flex-col gap-3" style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="email" 
                                className="form-input flex-1" 
                                placeholder="Receiver Email (e.g. buyer@domain.com)"
                                value={receiverEmail}
                                onChange={e => setReceiverEmail(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary flex-1" onClick={() => showToast('Quote saved successfully')}>
                                <Save size={16} /> Save Quote
                            </button>
                            <button className="btn btn-primary flex-1" onClick={handleDownload}>
                                <Download size={16} /> Download
                            </button>
                            <button className="btn btn-primary flex-1" onClick={handleQuickSend}>
                                <Send size={16} /> Quick Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
