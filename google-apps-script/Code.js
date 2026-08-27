/**
 * Google Apps Script Backend for Aggarwal Industries - AI IMRS
 */

const SHEET_ID = '1T0y1ovU55n8DL1f4hJWq2Zt-nxl1wWxeHcHZJExt0wc';

/**
 * 1. doGet(e)
 * Serve Index.html
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aggarwal Industries - AI IMRS')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 2. setupWorksheets()
 * Create the 12 worksheets with headers if they don't exist
 */
function setupWorksheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  const sheetsConfig = {
    leads: ['id', 'company', 'contact', 'phone', 'email', 'stage', 'product', 'qty', 'value', 'source', 'assignedTo', 'lastActivity', 'notes'],
    clients: ['id', 'name', 'location', 'type', 'contact', 'phone', 'gstin', 'paymentTerms'],
    orders: ['id', 'customer', 'product', 'qty', 'unitPrice', 'total', 'status', 'progress', 'orderDate', 'dueDate', 'material', 'wireGauge', 'stages', 'source', 'sourceRef', 'rfqId'],
    rfqs: ['id', 'source', 'sourceRef', 'customer', 'items', 'quotedAmount', 'status', 'receivedDate', 'deadline', 'quotedDate', 'notes', 'convertedOrderId'],
    inventory: ['id', 'material', 'wireGauge', 'lotNumber', 'supplier', 'supplierId', 'qtyKg', 'minQtyKg', 'location', 'receivedDate', 'status'],
    products: ['id', 'name', 'category', 'type', 'material', 'vendorId', 'stockQty', 'uom', 'unitCost', 'location'],
    purchaseOrders: ['id', 'vendorId', 'vendorName', 'material', 'qtyKg', 'unitPriceKg', 'total', 'status', 'orderDate', 'dueDate', 'notes'],
    vendors: ['id', 'name', 'location', 'materials', 'rating', 'leadTime', 'paymentTerms', 'contact', 'phone', 'email'],
    priceHistory: ['id', 'material', 'wireGauge', 'pricePerKg', 'supplier', 'recordedDate', 'notes'],
    qcReports: ['id', 'orderId', 'date', 'inspector', 'inspectedQty', 'passedQty', 'rejectedQty', 'defectTypes', 'notes'],
    quotes: ['id', 'type', 'customer', 'specs', 'calculations', 'total', 'unitPrice', 'date'],
    settings: ['key', 'value']
  };

  for (const sheetName in sheetsConfig) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheetsConfig[sheetName]);
      // Freeze header row
      sheet.setFrozenRows(1);
    }
  }
  return { success: true, message: 'Worksheets configured successfully.' };
}

/**
 * Helper function: Convert a sheet to an array of objects
 */
function sheetToObjects_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  const headers = data[0];
  const rows = data.slice(1);
  const result = [];
  
  const jsonFields = ['stages', 'items', 'defectTypes', 'specs', 'calculations'];

  for (let r = 0; r < rows.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      let val = rows[r][c];
      // Try to parse JSON fields
      if (jsonFields.includes(headers[c]) && typeof val === 'string' && val.trim() !== '') {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // If parse fails, keep as string
        }
      }
      obj[headers[c]] = val;
    }
    result.push(obj);
  }
  
  return result;
}

/**
 * 3. fetchAllData()
 * Read ALL worksheets and return as an object of arrays
 */
function fetchAllData() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const result = {
      leads: [], clients: [], orders: [], rfqs: [], inventory: [], 
      products: [], purchaseOrders: [], vendors: [], priceHistory: [], 
      qcReports: [], quotes: []
    };
    
    for (const sheetName in result) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        result[sheetName] = sheetToObjects_(sheet);
      }
    }
    
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. fetchSheet(sheetName)
 * Read a single worksheet, return array of objects
 */
function fetchSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    return { success: true, data: sheetToObjects_(sheet) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Helper function: find row index by ID
 * Returns 1-based index (header is 1), or -1 if not found.
 */
function findRowIndex_(sheet, id) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return -1;
  const headers = data[0];
  const idColIndex = headers.indexOf('id');
  if (idColIndex === -1) return -1;
  
  for (let r = 1; r < data.length; r++) {
    if (data[r][idColIndex] === id) {
      return r + 1; // +1 because array is 0-indexed but sheets are 1-indexed
    }
  }
  return -1;
}

/**
 * 5. saveRecord(sheetName, recordJson)
 * Upsert a record in the specified sheet
 */
function saveRecord(sheetName, recordJson) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    let record;
    if (typeof recordJson === 'string') {
      record = JSON.parse(recordJson);
    } else {
      record = recordJson;
    }
    
    const headers = sheet.getDataRange().getValues()[0];
    const jsonFields = ['stages', 'items', 'defectTypes', 'specs', 'calculations'];
    
    // Convert JSON fields to string before saving
    const recordRow = headers.map(header => {
      let val = record[header] !== undefined ? record[header] : '';
      if (jsonFields.includes(header) && (typeof val === 'object')) {
        val = JSON.stringify(val);
      }
      return val;
    });

    if (record.id) {
      const rowIndex = findRowIndex_(sheet, record.id);
      if (rowIndex > 1) {
        // Update existing
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([recordRow]);
        return { success: true, record: record };
      }
    }
    
    // Append new
    sheet.appendRow(recordRow);
    return { success: true, record: record };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 6. deleteRecord(sheetName, id)
 * Delete a record by ID
 */
function deleteRecord(sheetName, id) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    const rowIndex = findRowIndex_(sheet, id);
    if (rowIndex > 1) {
      sheet.deleteRow(rowIndex);
      return { success: true };
    } else {
      throw new Error("Record ID not found: " + id);
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 7. batchSave(sheetName, recordsJson)
 * Upsert multiple records
 */
function batchSave(sheetName, recordsJson) {
  try {
    let records;
    if (typeof recordsJson === 'string') {
      records = JSON.parse(recordsJson);
    } else {
      records = recordsJson;
    }
    
    let successCount = 0;
    for (const record of records) {
      const res = saveRecord(sheetName, record);
      if (res.success) successCount++;
    }
    
    return { success: true, count: successCount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 8. getNextId(prefix)
 * Generate IDs like 'L-001', 'ORD-2026-001'
 */
function getNextId(prefix) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheetName = '';
    
    switch (prefix) {
      case 'L': sheetName = 'leads'; break;
      case 'ORD': sheetName = 'orders'; break;
      case 'RFQ': sheetName = 'rfqs'; break;
      case 'PO': sheetName = 'purchaseOrders'; break;
      case 'INV': sheetName = 'inventory'; break;
      case 'QC': sheetName = 'qcReports'; break;
      case 'QT': sheetName = 'quotes'; break;
      default: throw new Error("Unknown prefix: " + prefix);
    }
    
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found for prefix.");
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      if (prefix === 'ORD') {
        const year = new Date().getFullYear();
        return `${prefix}-${year}-001`;
      }
      return `${prefix}-001`;
    }
    
    const headers = data[0];
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) throw new Error("No ID column in sheet.");
    
    let maxNum = 0;
    const year = new Date().getFullYear();
    const isOrd = (prefix === 'ORD');
    const expectedPrefix = isOrd ? `${prefix}-${year}-` : `${prefix}-`;
    
    for (let r = 1; r < data.length; r++) {
      const idStr = data[r][idColIndex];
      if (idStr && idStr.startsWith(expectedPrefix)) {
        const parts = idStr.split('-');
        const numStr = parts[parts.length - 1];
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    const nextNum = maxNum + 1;
    const numPadded = nextNum.toString().padStart(3, '0');
    return isOrd ? `${prefix}-${year}-${numPadded}` : `${prefix}-${numPadded}`;
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 9. convertRfqToOrder(rfqId)
 * Convert an RFQ to an Order
 */
function convertRfqToOrder(rfqId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const rfqSheet = ss.getSheetByName('rfqs');
    
    const rfqs = sheetToObjects_(rfqSheet);
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) throw new Error("RFQ not found: " + rfqId);
    if (rfq.convertedOrderId) throw new Error("RFQ already converted to order: " + rfq.convertedOrderId);
    
    const items = typeof rfq.items === 'string' ? JSON.parse(rfq.items || '[]') : (rfq.items || []);
    
    const productDesc = items.map(item => item.description || 'Unknown').join(', ');
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    const quotedAmt = parseFloat(rfq.quotedAmount) || 0;
    const unitPrice = totalQty > 0 ? (quotedAmt / totalQty).toFixed(2) : 0;
    
    const now = new Date();
    const dueDateStr = rfq.deadline || new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    const orderIdStr = getNextId('ORD');
    const orderId = typeof orderIdStr === 'object' ? orderIdStr.error : orderIdStr;
    if (orderIdStr.error) throw new Error(orderIdStr.error);
    
    const stages = [
      { name: 'Coiling', status: 'Pending' },
      { name: 'Heat Treatment', status: 'Pending' },
      { name: 'QC', status: 'Pending' },
      { name: 'Dispatch', status: 'Pending' }
    ];
    
    const newOrder = {
      id: orderId,
      customer: rfq.customer,
      product: productDesc,
      qty: totalQty,
      unitPrice: unitPrice,
      total: quotedAmt,
      status: 'Pending',
      progress: 0,
      orderDate: now.toISOString().split('T')[0],
      dueDate: dueDateStr,
      material: '',
      wireGauge: '',
      stages: stages,
      source: rfq.source,
      sourceRef: rfq.sourceRef,
      rfqId: rfq.id
    };
    
    const saveOrdRes = saveRecord('orders', newOrder);
    if (!saveOrdRes.success) throw new Error("Failed to save new order: " + saveOrdRes.error);
    
    rfq.status = 'won';
    rfq.convertedOrderId = orderId;
    
    const saveRfqRes = saveRecord('rfqs', rfq);
    if (!saveRfqRes.success) throw new Error("Failed to update RFQ: " + saveRfqRes.error);
    
    return { success: true, orderId: orderId };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 10. receivePO(poId)
 * Mark PO Received, update inventory
 */
function receivePO(poId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const poSheet = ss.getSheetByName('purchaseOrders');
    const pos = sheetToObjects_(poSheet);
    
    const po = pos.find(p => p.id === poId);
    if (!po) throw new Error("PO not found: " + poId);
    if (po.status === 'Received') throw new Error("PO already received.");
    
    po.status = 'Received';
    const poRes = saveRecord('purchaseOrders', po);
    if (!poRes.success) throw new Error("Failed to update PO: " + poRes.error);
    
    const invSheet = ss.getSheetByName('inventory');
    const inventory = sheetToObjects_(invSheet);
    let invItem = inventory.find(i => i.material === po.material);
    
    if (invItem) {
      const currentQty = parseFloat(invItem.qtyKg) || 0;
      const addedQty = parseFloat(po.qtyKg) || 0;
      invItem.qtyKg = currentQty + addedQty;
      const minQty = parseFloat(invItem.minQtyKg) || 0;
      invItem.status = invItem.qtyKg > minQty ? 'In Stock' : 'Low Stock';
      const invRes = saveRecord('inventory', invItem);
      if (!invRes.success) throw new Error("Failed to update Inventory: " + invRes.error);
    } else {
      const invIdRes = getNextId('INV');
      const invId = typeof invIdRes === 'object' ? invIdRes.error : invIdRes;
      if (invIdRes.error) throw new Error("Error generating INV id.");
      
      const newInv = {
        id: invId,
        material: po.material,
        wireGauge: '',
        lotNumber: 'PO-' + poId,
        supplier: po.vendorName,
        supplierId: po.vendorId,
        qtyKg: po.qtyKg,
        minQtyKg: 100, // Default arbitrary
        location: 'Warehouse A',
        receivedDate: new Date().toISOString().split('T')[0],
        status: parseFloat(po.qtyKg) > 100 ? 'In Stock' : 'Low Stock'
      };
      const invRes = saveRecord('inventory', newInv);
      if (!invRes.success) throw new Error("Failed to create Inventory item: " + invRes.error);
    }
    
    return { success: true };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 11. progressOrder(orderId)
 * Advance order progress
 */
function progressOrder(orderId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('orders');
    const orders = sheetToObjects_(sheet);
    
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found: " + orderId);
    
    let stages = typeof order.stages === 'string' ? JSON.parse(order.stages || '[]') : (order.stages || []);
    let nextStageUpdated = false;
    
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].status === 'Pending') {
        stages[i].status = 'Completed';
        nextStageUpdated = true;
        break;
      }
    }
    
    let progress = parseFloat(order.progress) || 0;
    progress = Math.min(progress + 25, 100);
    order.progress = progress;
    order.stages = stages;
    
    if (progress >= 100) {
      order.status = 'Completed';
    } else {
      order.status = 'In Production';
    }
    
    const saveRes = saveRecord('orders', order);
    if (!saveRes.success) throw new Error("Failed to save Order: " + saveRes.error);
    
    return { success: true, progress: progress };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 12. getStaticData()
 * Return static engineering data from Data.js
 */
function getStaticData() {
  try {
    // Assuming Data.js has functions returning the following objects
    return {
      success: true,
      data: {
        wireDensity: typeof getWireDensity === 'function' ? getWireDensity() : null,
        materialPricing: typeof getMaterialPricing === 'function' ? getMaterialPricing() : null,
        washerStandards: typeof getWasherStandards === 'function' ? getWasherStandards() : null,
        washerPricingMatrix: typeof getWasherPricingMatrix === 'function' ? getWasherPricingMatrix() : null,
        suppliers: typeof getSuppliers === 'function' ? getSuppliers() : null,
        washerVendors: typeof getWasherVendors === 'function' ? getWasherVendors() : null,
        companyDetails: typeof getCompanyDetails === 'function' ? getCompanyDetails() : null
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 13. cleanAllWorksheets()
 * Clears all data rows (row 2 onwards) across all 12 sheets, preserving header rows.
 */
function cleanAllWorksheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetNames = [
      'leads', 'clients', 'orders', 'rfqs', 'inventory', 
      'products', 'purchaseOrders', 'vendors', 'priceHistory', 
      'qcReports', 'quotes', 'settings'
    ];
    
    let totalCleared = 0;
    for (const name of sheetNames) {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
          totalCleared += (lastRow - 1);
        }
      }
    }
    return { success: true, message: `Successfully cleared ${totalCleared} data rows across all sheets. Headers preserved.` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 14. testDatabaseOperations()
 * Executes E2E test suite for Create, Read, Update, Delete on Google Sheets.
 */
function testDatabaseOperations() {
  try {
    const log = [];
    
    // 1. Create Test Lead
    const testLead = {
      id: 'L-TEST-99', company: 'Test Dynamics Pvt Ltd', contact: 'Anil Gupta',
      phone: '+91 99999 88888', email: 'anil@testdynamics.com', stage: 'New Lead',
      product: 'Compression Spring 10x40', qty: 5000, value: 75000, source: 'Direct',
      assignedTo: 'Sales Team', lastActivity: '2026-08-26', notes: 'Automated test record'
    };
    const createRes = saveRecord('leads', testLead);
    log.push({ step: '1. Create Record (saveRecord)', status: createRes.success ? 'PASS' : 'FAIL', details: createRes });
    
    // 2. Read Back Record
    const fetchRes = fetchSheet('leads');
    const foundLead = fetchRes.data.find(r => r.id === 'L-TEST-99');
    log.push({ step: '2. Read Record (fetchSheet)', status: foundLead ? 'PASS' : 'FAIL', details: foundLead });
    
    // 3. Update Record
    testLead.stage = 'Quoted';
    testLead.value = 85000;
    const updateRes = saveRecord('leads', testLead);
    log.push({ step: '3. Update Record (saveRecord)', status: updateRes.success ? 'PASS' : 'FAIL', details: updateRes });
    
    // 4. Delete Record
    const deleteRes = deleteRecord('leads', 'L-TEST-99');
    log.push({ step: '4. Delete Record (deleteRecord)', status: deleteRes.success ? 'PASS' : 'FAIL', details: deleteRes });
    
    // 5. Clean all sheets
    const cleanRes = cleanAllWorksheets();
    log.push({ step: '5. Clear All Sheets (cleanAllWorksheets)', status: cleanRes.success ? 'PASS' : 'FAIL', details: cleanRes });
    
    return { success: true, testLog: log };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 15. seedSampleData()
 * Populates clean, production-ready sample records into Google Sheets for demonstration.
 */
function seedSampleData() {
  try {
    cleanAllWorksheets();
    
    // Seed Leads
    const sampleLeads = [
      { id: 'L-101', company: 'Tata Motors Ltd', contact: 'Rajesh Sharma', phone: '+91 98100 12345', email: 'rajesh@tatamotors.com', stage: 'New Lead', product: 'Engine Valve Springs', qty: 10000, value: 145000, source: 'Direct', assignedTo: 'Sales Manager', lastActivity: '2026-08-25', notes: 'High volume spring requirement' },
      { id: 'L-102', company: 'Hero MotoCorp', contact: 'Sanjay Verma', phone: '+91 98200 23456', email: 'sanjay@heromotocorp.com', stage: 'Quoted', product: 'Clutch Compression Springs', qty: 25000, value: 320000, source: 'IndiaMART', assignedTo: 'Sales Team', lastActivity: '2026-08-26', notes: 'Sample approved, awaiting PO' },
      { id: 'L-103', company: 'Maruti Suzuki India', contact: 'Deepak Patel', phone: '+91 98300 34567', email: 'deepak@maruti.co.in', stage: 'Specs Received', product: 'Suspension Coils', qty: 5000, value: 210000, source: 'GeM', assignedTo: 'Tech Sales', lastActivity: '2026-08-24', notes: 'Drawing received DIN 127' }
    ];
    sampleLeads.forEach(l => saveRecord('leads', l));
    
    // Seed Orders
    const sampleOrders = [
      { id: 'ORD-2026-001', customer: 'Maruti Suzuki India', product: 'Heavy Duty Suspension Springs', qty: 5000, unitPrice: 42, total: 210000, status: 'Coiling', progress: 25, orderDate: '2026-08-20', dueDate: '2026-09-10', material: 'Spring Steel Gr. 2', wireGauge: '3.0mm', source: 'Direct' },
      { id: 'ORD-2026-002', customer: 'Bajaj Auto Ltd', product: 'Tension Springs 15x60', qty: 8000, unitPrice: 18, total: 144000, status: 'Heat Treatment', progress: 50, orderDate: '2026-08-15', dueDate: '2026-09-02', material: 'SS 304', wireGauge: '2.0mm', source: 'GeM' },
      { id: 'ORD-2026-003', customer: 'Sundram Fasteners', product: 'DIN 7980 M12 Lock Washers', qty: 50000, unitPrice: 2.5, total: 125000, status: 'Completed', progress: 100, orderDate: '2026-08-01', dueDate: '2026-08-20', material: 'Spring Steel', wireGauge: 'Flat Wire', source: 'Direct' }
    ];
    sampleOrders.forEach(o => saveRecord('orders', o));
    
    // Seed RFQs
    const sampleRfqs = [
      { id: 'RFQ-2026-0801', source: 'GeM', sourceRef: 'GEM/2026/B/8821', customer: 'Ministry of Defence', summary: '15,000x High Tension Compression Springs', value: 275000, status: 'received', receivedDate: '2026-08-25', deadline: '2026-09-05', notes: 'Urgent defence tender' },
      { id: 'RFQ-2026-0802', source: 'IndiaMART', sourceRef: 'IM-99212', customer: 'Precision Engineering Corp', summary: '50,000x Wave Washers M10', value: 95000, status: 'quoted', receivedDate: '2026-08-22', deadline: '2026-09-01', notes: 'SS 316 grade required' }
    ];
    sampleRfqs.forEach(r => saveRecord('rfqs', r));
    
    // Seed Inventory
    const sampleInventory = [
      { id: 'INV-001', material: 'Spring Steel Gr. 2', wireGauge: '2.0mm', lotNumber: 'LOT-TSW-2026-0298', supplier: 'Tata Steel Wire', qtyKg: 450, minQtyKg: 100, location: 'Rack A1', receivedDate: '2026-07-15', status: 'In Stock' },
      { id: 'INV-002', material: 'Stainless Steel 304', wireGauge: '1.5mm', lotNumber: 'LOT-SS-2026-0150', supplier: 'Sundram Fasteners', qtyKg: 35, minQtyKg: 80, location: 'Rack B2', receivedDate: '2026-06-20', status: 'Low Stock' },
      { id: 'INV-003', material: 'High Carbon Steel', wireGauge: '3.0mm', lotNumber: 'LOT-TSW-2026-0312', supplier: 'Tata Steel Wire', qtyKg: 18, minQtyKg: 100, location: 'Rack A3', receivedDate: '2026-05-10', status: 'Critical' }
    ];
    sampleInventory.forEach(i => saveRecord('inventory', i));
    
    // Seed Vendors
    const sampleVendors = [
      { id: 'V-001', name: 'Tata Steel Wire Division', location: 'Jamshedpur, Jharkhand', materials: ['Spring Steel', 'High Carbon Steel'], rating: 5, leadTime: '7-10 days', paymentTerms: '30 Days Credit', contact: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@tatasteel.com' },
      { id: 'V-002', name: 'Sundram Fasteners Ltd', location: 'Chennai, Tamil Nadu', materials: ['Stainless Steel 304', 'Stainless Steel 316'], rating: 4, leadTime: '10-14 days', paymentTerms: '45 Days Credit', contact: 'Priya Nair', phone: '+91 98765 43211', email: 'priya@sundram.com' }
    ];
    sampleVendors.forEach(v => saveRecord('vendors', v));

    return { success: true, message: 'Sample demo data successfully seeded into Google Sheets!' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


