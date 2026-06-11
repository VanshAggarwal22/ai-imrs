// ============================================
// IMRS Dashboard - Complete Mock Data
// ============================================

// --- COMPANY DETAILS (Aggarwal Industries) ---
export const companyDetails = {
  name: 'Aggarwal Industries',
  motto: 'Precision. Innovation. Excellence.',
  description: 'Experts in Industrial Manufacturing & Engineering Solutions, building on 30+ years of expertise from Gurudev Springs Pvt. Ltd. Leadership.',
  contact: {
    phone: '9811280333',
    email: 'ashutosh@aggarwal-industries.com',
    website: 'www.aggarwal-industries.com'
  },
  addresses: {
    office: 'A-3, Sector-4, 22/1, Delhi-Mathura Road, Ballabgarh, Faridabad - 121004 (HR.)',
    plant: '42km Stone, Delhi-Mathura Road, Sikri, Faridabad - 121004 (HR.)'
  },
  logo: '/logo.png',
  certifications: ['ISO 9001:2015 Certified']
};

// --- SUPPLIERS ---
export const suppliers = [
  { id: 'SUP001', name: 'Tata Steel Wire Division', location: 'Jamshedpur', rating: 4.8, materials: ['Spring Steel', 'High Carbon Steel'], leadTime: '5-7 days', paymentTerms: 'Net 30' },
  { id: 'SUP002', name: 'Bekaert India', location: 'Pune', rating: 4.5, materials: ['Stainless Steel 302', 'Stainless Steel 304'], leadTime: '7-10 days', paymentTerms: 'Net 45' },
  { id: 'SUP003', name: 'Sundram Fasteners Wire', location: 'Chennai', rating: 4.6, materials: ['Phosphor Bronze', 'Beryllium Copper'], leadTime: '10-14 days', paymentTerms: 'Net 30' },
  { id: 'SUP004', name: 'Kalyani Steels', location: 'Hospet', rating: 4.3, materials: ['Spring Steel', 'Alloy Steel'], leadTime: '4-6 days', paymentTerms: 'Net 15' },
  { id: 'SUP005', name: 'Mukand Ltd', location: 'Thane', rating: 4.1, materials: ['Stainless Steel 316', 'Inconel'], leadTime: '12-15 days', paymentTerms: 'Net 60' },
];

// --- WASHER VENDORS (External Sourcing) ---
export const washerVendors = [
  { id: 'WVEN001', name: 'Precision Flat Wire Tech', location: 'Mumbai', rating: 4.7, leadTime: '3-5 days', paymentTerms: 'Net 30' },
  { id: 'WVEN002', name: 'Global Fasteners & Stampings', location: 'Ahmedabad', rating: 4.4, leadTime: '7-10 days', paymentTerms: 'Net 45' },
  { id: 'WVEN003', name: 'Mahrashi Washers', location: 'Delhi', rating: 4.2, leadTime: '5-7 days', paymentTerms: 'Advance' },
];

// --- WASHER STANDARDS DATA ---
export const washerStandards = {
  'DIN 7980 - Spring lock washer for cylinder head screws': {
    description: 'Spring lock washer for cylinder head screws',
    unit: 'mm',
    sizes: {
      'M3': { d1: 3.1, d2: 5.6, s: 1.0, h: 2.0 },
      'M3.5': { d1: 3.6, d2: 6.1, s: 1.0, h: 2.0 },
      'M4': { d1: 4.1, d2: 7.0, s: 1.2, h: 2.4 },
      'M5': { d1: 5.1, d2: 8.8, s: 1.6, h: 3.2 },
      'M6': { d1: 6.1, d2: 9.9, s: 1.6, h: 3.2 },
      'M8': { d1: 8.1, d2: 12.7, s: 2.0, h: 4.0 },
      'M10': { d1: 10.2, d2: 16.0, s: 2.5, h: 5.0 },
      'M12': { d1: 12.2, d2: 18.0, s: 2.5, h: 5.0 },
      'M14': { d1: 14.2, d2: 21.1, s: 3.0, h: 6.0 },
      'M16': { d1: 16.2, d2: 24.4, s: 3.5, h: 7.0 },
      'M18': { d1: 18.2, d2: 26.4, s: 3.5, h: 7.0 },
      'M20': { d1: 20.2, d2: 30.6, s: 4.5, h: 9.0 },
      'M22': { d1: 22.5, d2: 32.9, s: 4.5, h: 9.0 },
      'M24': { d1: 24.5, d2: 35.9, s: 5.0, h: 10.0 },
      'M27': { d1: 27.5, d2: 38.9, s: 5.0, h: 10.0 },
      'M30': { d1: 30.5, d2: 44.1, s: 6.0, h: 12.0 },
      'M33': { d1: 33.5, d2: 47.1, s: 6.0, h: 12.0 },
      'M36': { d1: 36.5, d2: 52.2, s: 7.0, h: 14.0 },
      'M42': { d1: 42.5, d2: 60.2, s: 8.0, h: 16.0 },
    }
  },
  'DIN 127 A - Spring lock washers, From A': {
    description: 'Spring lock washers, Form A',
    unit: 'mm',
    sizes: {
      'M3': { d1: 3.1, d2: 6.2, s: 0.8, h: 1.9 },
      'M3.5': { d1: 3.6, d2: 6.7, s: 0.8, h: 1.9 },
      'M4': { d1: 4.1, d2: 7.6, s: 0.9, h: 2.1 },
      'M5': { d1: 5.1, d2: 9.2, s: 1.2, h: 2.7 },
      'M6': { d1: 6.4, d2: 11.8, s: 1.6, h: 3.6 },
      'M8': { d1: 8.1, d2: 14.8, s: 2.0, h: 4.6 },
      'M10': { d1: 10.2, d2: 18.1, s: 2.2, h: 5.0 },
      'M12': { d1: 12.2, d2: 21.1, s: 2.5, h: 5.8 },
      'M14': { d1: 14.2, d2: 24.1, s: 3.0, h: 6.8 },
      'M16': { d1: 16.2, d2: 27.4, s: 3.5, h: 7.8 },
      'M18': { d1: 18.2, d2: 29.4, s: 3.5, h: 7.8 },
      'M20': { d1: 20.2, d2: 33.6, s: 4.0, h: 8.8 },
      'M22': { d1: 22.5, d2: 35.9, s: 4.0, h: 8.8 },
      'M24': { d1: 24.5, d2: 40.0, s: 5.0, h: 11.0 },
      'M27': { d1: 27.5, d2: 43.0, s: 5.0, h: 11.0 },
      'M30': { d1: 30.5, d2: 48.2, s: 6.0, h: 13.6 },
      'M36': { d1: 36.5, d2: 58.2, s: 6.0, h: 13.6 },
      'M42': { d1: 42.5, d2: 66.2, s: 7.0, h: 15.6 },
      'M48': { d1: 49.0, d2: 75.0, s: 7.0, h: 15.6 },
      'M52': { d1: 53.0, d2: 83.0, s: 8.0, h: 18.0 },
    }
  },
  'BS 4464 Square Spring Washers': {
    description: 'Square Spring Washers',
    unit: 'mm',
    sizes: {
      'M4': { d1: 4.1, d2: 6.95, s: 1.1 },
      'M5': { d1: 5.1, d2: 8.55, s: 1.4 },
      'M6': { d1: 6.1, d2: 9.6, s: 1.4 },
      'M8': { d1: 8.2, d2: 12.75, s: 1.9 },
      'M10': { d1: 10.2, d2: 15.9, s: 2.35 },
      'M12': { d1: 12.2, d2: 17.9, s: 2.35 },
      'M16': { d1: 16.3, d2: 24.3, s: 3.3 },
      'M20': { d1: 20.3, d2: 30.5, s: 4.3 },
      'M22': { d1: 22.4, d2: 32.7, s: 4.3 },
      'M24': { d1: 24.4, d2: 35.7, s: 4.8 },
      'M30': { d1: 30.5, d2: 43.9, s: 5.8 },
      'M36': { d1: 36.5, d2: 52.1, s: 6.75 },
    }
  },
  'Inch Rectangular Section Spring Washer Spring-Steel BS1802B': {
    description: 'Inch Rectangular Section Spring Washer',
    unit: 'inch',
    sizes: {
      '1/8"': { d1: 0.129, d2: 0.237, s: 0.048 },
      '5/32"': { d1: 0.17, d2: 0.3, s: 0.064 },
      '3/16"': { d1: 0.192, d2: 0.387, s: 0.092 },
      '1/4"': { d1: 0.255, d2: 0.465, s: 0.092 },
      '5/16"': { d1: 0.32, d2: 0.6, s: 0.128 },
      '3/8"': { d1: 0.383, d2: 0.694, s: 0.144 },
      '7/16"': { d1: 0.445, d2: 0.789, s: 0.16 },
      '1/2"': { d1: 0.508, d2: 0.851, s: 0.16 },
      '9/16"': { d1: 0.57, d2: 1.009, s: 0.192 },
      '5/8"': { d1: 0.636, d2: 1.072, s: 0.192 },
      '3/4"': { d1: 0.762, d2: 1.276, s: 0.232 },
      '7/8"': { d1: 0.89, d2: 1.442, s: 0.252 },
      '1."': { d1: 1.016, d2: 1.624, s: 0.281 },
      '1.1/8"': { d1: 1.145, d2: 1.75, s: 0.281 },
    }
  }
};

// --- WASHER DIMENSIONS (General/Fallback) ---
export const washerDimensions = {
  'M3': { inner: 3.2, outer: 7.0, thk: 0.5 },
  'M4': { inner: 4.3, outer: 9.0, thk: 0.8 },
  'M5': { inner: 5.3, outer: 10.0, thk: 1.0 },
  'M6': { inner: 6.4, outer: 12.0, thk: 1.6 },
  'M8': { inner: 8.4, outer: 16.0, thk: 1.6 },
  'M10': { inner: 10.5, outer: 20.0, thk: 2.0 },
  'M12': { inner: 13.0, outer: 24.0, thk: 2.5 },
  'M14': { inner: 15.0, outer: 28.0, thk: 2.5 },
  'M16': { inner: 17.0, outer: 30.0, thk: 3.0 },
  'M18': { inner: 19.0, outer: 34.0, thk: 3.0 },
  'M20': { inner: 21.0, outer: 37.0, thk: 3.0 },
  'M22': { inner: 23.0, outer: 39.0, thk: 3.0 },
  'M24': { inner: 25.0, outer: 44.0, thk: 4.0 },
};

export const washerPricingMatrix = {
  // Vendor Name -> Material -> Wire Type -> Size (M) -> Price/kg
  'WVEN001': { // Precision Flat Wire Tech (Specializes in Small to Mid)
    'Spring Steel': {
      'Flat Wire': { 'M3': 145, 'M4': 140, 'M5': 135, 'M6': 135, 'M8': 130, 'M10': 125, 'M12': 125 },
      'Square Wire': { 'M3': 155, 'M4': 150, 'M5': 145, 'M6': 145, 'M8': 140, 'M10': 135, 'M12': 135 },
    },
    'Stainless Steel 304': {
      'Flat Wire': { 'M3': 460, 'M4': 450, 'M5': 440, 'M6': 440, 'M8': 420 },
      'Square Wire': { 'M3': 490, 'M4': 480, 'M5': 470, 'M6': 470, 'M8': 450 },
    }
  },
  'WVEN002': { // Global Fasteners & Stampings (Mass Production, All Sizes)
    'Spring Steel': {
      'Flat Wire': { 'M4': 120, 'M5': 115, 'M6': 115, 'M8': 112, 'M10': 110, 'M12': 110, 'M16': 105, 'M20': 105, 'M24': 100, '1/4"': 125, '1/2"': 118, '3/4"': 112 },
      'Square Wire': { 'M4': 130, 'M5': 125, 'M6': 125, 'M8': 122, 'M10': 120, 'M12': 120, 'M16': 115, 'M20': 115, 'M24': 110, '1/4"': 135, '1/2"': 128, '3/4"': 122 },
    },
    'Stainless Steel 304': {
      'Flat Wire': { 'M4': 400, 'M5': 390, 'M6': 390, 'M8': 370, 'M10': 365, 'M12': 365, 'M16': 355, 'M20': 355, 'M24': 345 },
      'Square Wire': { 'M4': 430, 'M5': 420, 'M6': 420, 'M8': 400, 'M10': 395, 'M12': 395, 'M16': 385, 'M20': 385, 'M24': 375 },
    }
  },
  'WVEN003': { // Mahrashi Washers (Mid to Large Sizes, Heavy Duty)
    'Spring Steel': {
      'Flat Wire': { 'M8': 150, 'M10': 145, 'M12': 145, 'M16': 140, 'M20': 140, 'M24': 135 },
      'Square Wire': { 'M8': 165, 'M10': 160, 'M12': 160, 'M16': 155, 'M20': 155, 'M24': 150 },
    },
    'Stainless Steel 304': {
      'Flat Wire': { 'M16': 460, 'M20': 460, 'M24': 450 },
      'Square Wire': { 'M16': 500, 'M20': 500, 'M24': 490 },
    }
  }
};

// --- MATERIAL PRICING (per kg, indexed by supplier) ---
export const materialPricing = {
  'Spring Steel': { SUP001: 85, SUP004: 88, default: 90 },
  'High Carbon Steel': { SUP001: 92, SUP004: 95, default: 98 },
  'Stainless Steel 302': { SUP002: 210, SUP005: 225, default: 230 },
  'Stainless Steel 304': { SUP002: 240, SUP005: 255, default: 260 },
  'Stainless Steel 316': { SUP005: 320, default: 340 },
  'Phosphor Bronze': { SUP003: 680, default: 720 },
  'Beryllium Copper': { SUP003: 2800, default: 3100 },
  'Inconel': { SUP005: 4200, default: 4500 },
  'Alloy Steel': { SUP004: 105, default: 115 },
};

export const materials = Object.keys(materialPricing);

// --- WIRE DENSITY (kg/m³) ---
export const wireDensity = {
  'Spring Steel': 7850,
  'High Carbon Steel': 7850,
  'Stainless Steel 302': 7880,
  'Stainless Steel 304': 7900,
  'Stainless Steel 316': 7990,
  'Phosphor Bronze': 8800,
  'Beryllium Copper': 8250,
  'Inconel': 8440,
  'Alloy Steel': 7850,
};

// --- LEADS / CRM PIPELINE ---
export const pipelineStages = [
  'New Lead',
  'Specs Received',
  'Quoted',
  'Sample Sent',
  'Approved',
  'In Production',
];

export const leads = [
  { id: 'L001', company: 'Bosch India Pvt Ltd', contact: 'Rajesh Mehta', phone: '+91 98765 43210', email: 'rajesh.m@bosch.com', stage: 'In Production', product: 'Compression Springs', qty: 50000, value: 425000, source: 'Trade Show', assignedTo: 'Vikram S.', lastActivity: '2026-03-09', notes: 'Repeat order, same specs as PO#4521' },
  { id: 'L002', company: 'Bajaj Auto Ltd', contact: 'Sneha Patil', phone: '+91 87654 32109', email: 'sneha.p@bajaj.com', stage: 'Approved', product: 'Spring Washers - M10', qty: 200000, value: 880000, source: 'LinkedIn', assignedTo: 'Priya K.', lastActivity: '2026-03-08', notes: 'Approved after 2nd sample. Production to start next week.' },
  { id: 'L003', company: 'Tata Motors', contact: 'Amit Sharma', phone: '+91 76543 21098', email: 'amit.s@tatamotors.com', stage: 'Sample Sent', product: 'Torsion Springs', qty: 25000, value: 312000, source: 'Google Ads', assignedTo: 'Vikram S.', lastActivity: '2026-03-07', notes: 'Sample dispatched via DTDC. Tracking #DTC9876543' },
  { id: 'L004', company: 'Godrej Appliances', contact: 'Neha Desai', phone: '+91 65432 10987', email: 'neha.d@godrej.com', stage: 'Quoted', product: 'Extension Springs', qty: 75000, value: 195000, source: 'Direct Outbound', assignedTo: 'Priya K.', lastActivity: '2026-03-06', notes: 'Quote sent. Follow up on March 11.' },
  { id: 'L005', company: 'Mahindra & Mahindra', contact: 'Karan Singh', phone: '+91 54321 09876', email: 'karan.s@mahindra.com', stage: 'Specs Received', product: 'Belleville Washers', qty: 100000, value: 560000, source: 'Trade Show', assignedTo: 'Vikram S.', lastActivity: '2026-03-05', notes: 'Need to clarify DIN 2093 group spec' },
  { id: 'L006', company: 'Siemens India', contact: 'Priya Nair', phone: '+91 43210 98765', email: 'priya.n@siemens.com', stage: 'New Lead', product: 'Compression Springs', qty: 30000, value: 210000, source: 'Google Ads', assignedTo: 'Priya K.', lastActivity: '2026-03-09', notes: 'Inbound inquiry from website form' },
  { id: 'L007', company: 'Ashok Leyland', contact: 'Deepak Rao', phone: '+91 32109 87654', email: 'deepak.r@ashokleyland.com', stage: 'New Lead', product: 'Spring Washers - M12', qty: 500000, value: 1750000, source: 'LinkedIn', assignedTo: 'Vikram S.', lastActivity: '2026-03-09', notes: 'Large volume opportunity. Set up call.' },
  { id: 'L008', company: 'Havells India', contact: 'Meera Iyer', phone: '+91 21098 76543', email: 'meera.i@havells.com', stage: 'Quoted', product: 'Wave Springs', qty: 15000, value: 135000, source: 'Direct Outbound', assignedTo: 'Priya K.', lastActivity: '2026-03-04', notes: 'Custom design. Awaiting approval from their R&D.' },
  { id: 'L009', company: 'Hero MotoCorp', contact: 'Suresh Kumar', phone: '+91 10987 65432', email: 'suresh.k@heromotocorp.com', stage: 'In Production', product: 'Compression Springs', qty: 120000, value: 960000, source: 'Trade Show', assignedTo: 'Vikram S.', lastActivity: '2026-03-09', notes: 'Batch 1 of 3 dispatched. Batch 2 in coiling.' },
  { id: 'L010', company: 'Kirloskar Brothers', contact: 'Anita Joshi', phone: '+91 09876 54321', email: 'anita.j@kirloskar.com', stage: 'Specs Received', product: 'Disc Springs', qty: 8000, value: 96000, source: 'Google Ads', assignedTo: 'Priya K.', lastActivity: '2026-03-03', notes: 'Specs received, need to verify material compatibility' },
];

// --- MARKETING CAMPAIGNS ---
export const campaigns = [
  { id: 'C001', name: 'AutoExpo 2026', channel: 'Trade Show', spend: 250000, leadsGenerated: 45, conversions: 12, revenue: 2450000, status: 'Completed' },
  { id: 'C002', name: 'Google Ads - Spring Manufacturer India', channel: 'Google Ads', spend: 85000, leadsGenerated: 120, conversions: 8, revenue: 640000, status: 'Active' },
  { id: 'C003', name: 'LinkedIn B2B Outreach', channel: 'LinkedIn', spend: 45000, leadsGenerated: 35, conversions: 5, revenue: 380000, status: 'Active' },
  { id: 'C004', name: 'Direct Cold Outbound Q1', channel: 'Direct Outbound', spend: 15000, leadsGenerated: 60, conversions: 3, revenue: 195000, status: 'Active' },
];

// --- ORDERS ---
export const orders = [
  { id: 'ORD-2026-001', customer: 'Bosch India Pvt Ltd', product: 'Compression Springs 2.5mm', qty: 50000, unitPrice: 8.50, total: 425000, status: 'In Production', progress: 65, orderDate: '2026-02-15', dueDate: '2026-03-20', material: 'Spring Steel', wireGauge: '2.5mm' },
  { id: 'ORD-2026-002', customer: 'Hero MotoCorp', product: 'Compression Springs 1.8mm', qty: 120000, unitPrice: 8.00, total: 960000, status: 'In Production', progress: 40, orderDate: '2026-02-20', dueDate: '2026-04-05', material: 'High Carbon Steel', wireGauge: '1.8mm' },
  { id: 'ORD-2026-003', customer: 'Bajaj Auto Ltd', product: 'Spring Washers M10 SS304', qty: 200000, unitPrice: 4.40, total: 880000, status: 'Pending', progress: 0, orderDate: '2026-03-08', dueDate: '2026-04-15', material: 'Stainless Steel 304', wireGauge: '2.0mm' },
  { id: 'ORD-2026-004', customer: 'TVS Motors', product: 'Torsion Springs Custom', qty: 35000, unitPrice: 12.00, total: 420000, status: 'Completed', progress: 100, orderDate: '2026-01-10', dueDate: '2026-02-28', material: 'Spring Steel', wireGauge: '3.0mm' },
  { id: 'ORD-2026-005', customer: 'Godrej Appliances', product: 'Extension Springs 1.2mm', qty: 75000, unitPrice: 6.50, total: 487500, status: 'Quoted', progress: 0, orderDate: '2026-03-06', dueDate: '2026-04-20', material: 'Phosphor Bronze', wireGauge: '1.2mm' },
];

// --- INVENTORY / SPOOLS ---
export const inventory = [
  { id: 'INV001', material: 'Spring Steel', wireGauge: '1.5mm', lotNumber: 'LOT-TSW-2026-0312', supplier: 'Tata Steel Wire Division', supplierId: 'SUP001', qtyKg: 450, minQtyKg: 100, location: 'Rack A1', receivedDate: '2026-02-28', expiryDate: null, status: 'In Stock' },
  { id: 'INV002', material: 'Spring Steel', wireGauge: '2.0mm', lotNumber: 'LOT-TSW-2026-0298', supplier: 'Tata Steel Wire Division', supplierId: 'SUP001', qtyKg: 80, minQtyKg: 200, location: 'Rack A2', receivedDate: '2026-02-15', expiryDate: null, status: 'Low Stock' },
  { id: 'INV003', material: 'Spring Steel', wireGauge: '2.5mm', lotNumber: 'LOT-KS-2026-0154', supplier: 'Kalyani Steels', supplierId: 'SUP004', qtyKg: 320, minQtyKg: 150, location: 'Rack A3', receivedDate: '2026-03-01', expiryDate: null, status: 'In Stock' },
  { id: 'INV004', material: 'Stainless Steel 304', wireGauge: '2.0mm', lotNumber: 'LOT-BEK-2026-0087', supplier: 'Bekaert India', supplierId: 'SUP002', qtyKg: 25, minQtyKg: 100, location: 'Rack B1', receivedDate: '2026-01-20', expiryDate: null, status: 'Critical' },
  { id: 'INV005', material: 'Phosphor Bronze', wireGauge: '1.2mm', lotNumber: 'LOT-SFW-2026-0043', supplier: 'Sundram Fasteners Wire', supplierId: 'SUP003', qtyKg: 180, minQtyKg: 50, location: 'Rack C1', receivedDate: '2026-02-10', expiryDate: null, status: 'In Stock' },
  { id: 'INV006', material: 'High Carbon Steel', wireGauge: '1.8mm', lotNumber: 'LOT-TSW-2026-0315', supplier: 'Tata Steel Wire Division', supplierId: 'SUP001', qtyKg: 550, minQtyKg: 200, location: 'Rack A4', receivedDate: '2026-03-05', expiryDate: null, status: 'In Stock' },
  { id: 'INV007', material: 'Stainless Steel 302', wireGauge: '1.5mm', lotNumber: 'LOT-BEK-2026-0092', supplier: 'Bekaert India', supplierId: 'SUP002', qtyKg: 95, minQtyKg: 100, location: 'Rack B2', receivedDate: '2026-02-22', expiryDate: null, status: 'Low Stock' },
];

// --- MRP ALERTS ---
export const mrpAlerts = [
  { id: 'MRP001', material: 'Spring Steel 2.0mm', currentStock: 80, requiredFor: 'ORD-2026-003 (Bajaj Auto)', requiredQty: 180, shortfall: 100, suggestedPO: 'SUP001 - Tata Steel Wire', urgency: 'Critical', autoGenerated: true },
  { id: 'MRP002', material: 'Stainless Steel 304 2.0mm', currentStock: 25, requiredFor: 'ORD-2026-003 (Bajaj Auto)', requiredQty: 400, shortfall: 375, suggestedPO: 'SUP002 - Bekaert India', urgency: 'Critical', autoGenerated: true },
  { id: 'MRP003', material: 'Stainless Steel 302 1.5mm', currentStock: 95, requiredFor: 'Upcoming Quote L008 (Havells)', requiredQty: 120, shortfall: 25, suggestedPO: 'SUP002 - Bekaert India', urgency: 'Medium', autoGenerated: false },
];

// --- QUALITY INSPECTION LOGS ---
export const inspectionLogs = [
  { id: 'QC001', orderId: 'ORD-2026-001', batchNo: 'B1-001', date: '2026-03-08', inspector: 'Ramesh K.', product: 'Compression Spring 2.5mm', freeLength: { value: 45.2, spec: 45.0, tolerance: 0.5, status: 'Pass' }, solidHeight: { value: 18.1, spec: 18.0, tolerance: 0.3, status: 'Pass' }, springRate: { value: 12.4, spec: 12.5, tolerance: 0.5, status: 'Pass' }, loadTest: { value: 55.8, spec: 56.0, tolerance: 1.0, status: 'Pass' }, overallStatus: 'Pass' },
  { id: 'QC002', orderId: 'ORD-2026-001', batchNo: 'B1-002', date: '2026-03-09', inspector: 'Ramesh K.', product: 'Compression Spring 2.5mm', freeLength: { value: 45.1, spec: 45.0, tolerance: 0.5, status: 'Pass' }, solidHeight: { value: 18.5, spec: 18.0, tolerance: 0.3, status: 'Fail' }, springRate: { value: 12.3, spec: 12.5, tolerance: 0.5, status: 'Pass' }, loadTest: { value: 55.2, spec: 56.0, tolerance: 1.0, status: 'Pass' }, overallStatus: 'Fail' },
  { id: 'QC003', orderId: 'ORD-2026-002', batchNo: 'B2-001', date: '2026-03-09', inspector: 'Sunil P.', product: 'Compression Spring 1.8mm', freeLength: { value: 32.0, spec: 32.0, tolerance: 0.3, status: 'Pass' }, solidHeight: { value: 14.2, spec: 14.0, tolerance: 0.3, status: 'Pass' }, springRate: { value: 8.8, spec: 9.0, tolerance: 0.5, status: 'Pass' }, loadTest: { value: 28.5, spec: 28.0, tolerance: 1.0, status: 'Pass' }, overallStatus: 'Pass' },
  { id: 'QC004', orderId: 'ORD-2026-004', batchNo: 'B4-005', date: '2026-02-25', inspector: 'Ramesh K.', product: 'Torsion Spring Custom', freeLength: { value: 60.1, spec: 60.0, tolerance: 0.5, status: 'Pass' }, solidHeight: { value: 22.0, spec: 22.0, tolerance: 0.3, status: 'Pass' }, springRate: { value: 15.0, spec: 15.0, tolerance: 0.5, status: 'Pass' }, loadTest: { value: 75.0, spec: 75.0, tolerance: 1.5, status: 'Pass' }, overallStatus: 'Pass' },
];

// --- REVENUE DATA ---
export const revenueData = [
  { month: 'Oct', revenue: 1850000, target: 2000000, expenses: 1200000 },
  { month: 'Nov', revenue: 2100000, target: 2000000, expenses: 1350000 },
  { month: 'Dec', revenue: 1950000, target: 2200000, expenses: 1280000 },
  { month: 'Jan', revenue: 2400000, target: 2200000, expenses: 1500000 },
  { month: 'Feb', revenue: 2650000, target: 2500000, expenses: 1680000 },
  { month: 'Mar', revenue: 2200000, target: 2500000, expenses: 1400000 },
];

export const productionData = [
  { month: 'Oct', springs: 180000, washers: 450000, capacity: 750000 },
  { month: 'Nov', springs: 210000, washers: 520000, capacity: 750000 },
  { month: 'Dec', springs: 195000, washers: 480000, capacity: 750000 },
  { month: 'Jan', springs: 240000, washers: 550000, capacity: 800000 },
  { month: 'Feb', springs: 265000, washers: 600000, capacity: 800000 },
  { month: 'Mar', springs: 220000, washers: 510000, capacity: 800000 },
];

// --- CUSTOMER PORTAL DATA ---
export const customerPortalOrders = [
  {
    id: 'ORD-2026-001', product: 'Compression Springs 2.5mm', qty: 50000, status: 'In Production', progress: 65, stages: [
      { name: 'Order Confirmed', date: '2026-02-15', completed: true },
      { name: 'Material Sourced', date: '2026-02-18', completed: true },
      { name: 'Coiling', date: '2026-02-22', completed: true },
      { name: 'Heat Treatment', date: '2026-03-01', completed: true },
      { name: 'Surface Finish', date: '2026-03-06', completed: false },
      { name: 'Quality Check', date: null, completed: false },
      { name: 'Dispatch', date: null, completed: false },
    ]
  },
  {
    id: 'ORD-2025-089', product: 'Compression Springs 2.5mm', qty: 50000, status: 'Completed', progress: 100, stages: [
      { name: 'Order Confirmed', date: '2025-12-01', completed: true },
      { name: 'Material Sourced', date: '2025-12-03', completed: true },
      { name: 'Coiling', date: '2025-12-08', completed: true },
      { name: 'Heat Treatment', date: '2025-12-15', completed: true },
      { name: 'Surface Finish', date: '2025-12-20', completed: true },
      { name: 'Quality Check', date: '2025-12-24', completed: true },
      { name: 'Dispatch', date: '2025-12-26', completed: true },
    ]
  },
];

// --- AI CHAT MOCK RESPONSES ---
export const aiResponses = {
  'pending orders': `📋 **Pending Orders Summary:**\n\n| Order | Customer | Product | Qty | Status | Due |\n|-------|----------|---------|-----|--------|-----|\n| ORD-2026-001 | Bosch India | Compression Springs 2.5mm | 50,000 | In Production (65%) | Mar 20 |\n| ORD-2026-002 | Hero MotoCorp | Compression Springs 1.8mm | 120,000 | In Production (40%) | Apr 05 |\n| ORD-2026-003 | Bajaj Auto | Spring Washers M10 | 200,000 | Pending | Apr 15 |\n\nTotal value: ₹22,65,000`,
  'inventory': `📦 **Current Inventory Status:**\n\n🔴 **Critical:** SS304 2.0mm — only 25 kg left (min: 100 kg)\n🟡 **Low Stock:** Spring Steel 2.0mm — 80 kg (min: 200 kg)\n🟡 **Low Stock:** SS302 1.5mm — 95 kg (min: 100 kg)\n🟢 **Healthy:** 4 other materials are well-stocked\n\n⚠️ 2 auto-POs have been generated for critical items.`,
  'revenue': `💰 **Revenue Summary (FY 2025-26):**\n\n• YTD Revenue: ₹1.32 Cr\n• This Month: ₹22.0 Lakh (Target: ₹25.0 Lakh)\n• Best Month: Feb — ₹26.5 Lakh\n• Avg Monthly Growth: 8.2%\n• Pipeline Value: ₹55.6 Lakh`,
  'acme': `🔍 No orders found for "Acme Corp." Did you mean:\n• **Bosch India** — 1 active order (ORD-2026-001)\n• **Bajaj Auto** — 1 pending order (ORD-2026-003)`,
  'quality': `🔬 **Quality Summary (Last 7 Days):**\n\n✅ **3 Passed** inspections\n❌ **1 Failed** — QC002 (ORD-2026-001, Batch B1-002)\n   Issue: Solid height 18.5mm exceeds tolerance (spec: 18.0 ± 0.3mm)\n\n📊 Pass Rate: 75% (Target: 95%)\nAction: Batch B1-002 quarantined for rework.`,
};

// --- DASHBOARD KPI ---
export const dashboardKPIs = {
  monthlyRevenue: 2200000,
  revenueChange: 8.2,
  activeOrders: 3,
  pendingQuotes: 2,
  machineUtilization: 78,
  inventoryAlerts: 3,
  qualityPassRate: 75,
  conversionRate: 23.5,
  avgDealSize: 467000,
  pipelineValue: 5560000,
};
