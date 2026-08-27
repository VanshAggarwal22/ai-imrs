function getWireDensity() {
  return {
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
}

function getMaterialPricing() {
  return {
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
}

function getWasherStandards() {
  return {
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
}

function getWasherPricingMatrix() {
  return {
    'WVEN001': {
      'Spring Steel': {
        'Flat Wire': { 'M3': 145, 'M4': 140, 'M5': 135, 'M6': 135, 'M8': 130, 'M10': 125, 'M12': 125 },
        'Square Wire': { 'M3': 155, 'M4': 150, 'M5': 145, 'M6': 145, 'M8': 140, 'M10': 135, 'M12': 135 },
      },
      'Stainless Steel 304': {
        'Flat Wire': { 'M3': 460, 'M4': 450, 'M5': 440, 'M6': 440, 'M8': 420 },
        'Square Wire': { 'M3': 490, 'M4': 480, 'M5': 470, 'M6': 470, 'M8': 450 },
      }
    },
    'WVEN002': {
      'Spring Steel': {
        'Flat Wire': { 'M4': 120, 'M5': 115, 'M6': 115, 'M8': 112, 'M10': 110, 'M12': 110, 'M16': 105, 'M20': 105, 'M24': 100, '1/4"': 125, '1/2"': 118, '3/4"': 112 },
        'Square Wire': { 'M4': 130, 'M5': 125, 'M6': 125, 'M8': 122, 'M10': 120, 'M12': 120, 'M16': 115, 'M20': 115, 'M24': 110, '1/4"': 135, '1/2"': 128, '3/4"': 122 },
      },
      'Stainless Steel 304': {
        'Flat Wire': { 'M4': 400, 'M5': 390, 'M6': 390, 'M8': 370, 'M10': 365, 'M12': 365, 'M16': 355, 'M20': 355, 'M24': 345 },
        'Square Wire': { 'M4': 430, 'M5': 420, 'M6': 420, 'M8': 400, 'M10': 395, 'M12': 395, 'M16': 385, 'M20': 385, 'M24': 375 },
      }
    },
    'WVEN003': {
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
}

function getSuppliers() {
  return [
    { id: 'SUP001', name: 'Tata Steel Wire Division', location: 'Jamshedpur', rating: 4.8, materials: ['Spring Steel', 'High Carbon Steel'], leadTime: '5-7 days', paymentTerms: 'Net 30' },
    { id: 'SUP002', name: 'Bekaert India', location: 'Pune', rating: 4.5, materials: ['Stainless Steel 302', 'Stainless Steel 304'], leadTime: '7-10 days', paymentTerms: 'Net 45' },
    { id: 'SUP003', name: 'Sundram Fasteners Wire', location: 'Chennai', rating: 4.6, materials: ['Phosphor Bronze', 'Beryllium Copper'], leadTime: '10-14 days', paymentTerms: 'Net 30' },
    { id: 'SUP004', name: 'Kalyani Steels', location: 'Hospet', rating: 4.3, materials: ['Spring Steel', 'Alloy Steel'], leadTime: '4-6 days', paymentTerms: 'Net 15' },
    { id: 'SUP005', name: 'Mukand Ltd', location: 'Thane', rating: 4.1, materials: ['Stainless Steel 316', 'Inconel'], leadTime: '12-15 days', paymentTerms: 'Net 60' },
  ];
}

function getWasherVendors() {
  return [
    { id: 'WVEN001', name: 'Precision Flat Wire Tech', location: 'Mumbai', rating: 4.7, leadTime: '3-5 days', paymentTerms: 'Net 30' },
    { id: 'WVEN002', name: 'Global Fasteners & Stampings', location: 'Ahmedabad', rating: 4.4, leadTime: '7-10 days', paymentTerms: 'Net 45' },
    { id: 'WVEN003', name: 'Mahrashi Washers', location: 'Delhi', rating: 4.2, leadTime: '5-7 days', paymentTerms: 'Advance' },
  ];
}

function getCompanyDetails() {
  return {
    name: 'Aggarwal Spring Industries',
    tagline: 'Precision Springs & Washers Manufacturer',
    address: 'A-3, Sector-4, 22/1, Delhi-Mathura Road, Ballabgarh, Faridabad - 121004 (HR.)',
    phone: '9811280333',
    email: 'ashutosh@aggarwal-industries.com',
    gstin: '04AAAAA0000A1Z5',
    iso: 'ISO 9001:2015 Certified',
    bankName: 'HDFC Bank',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: ''
  };
}

function getMaterials() {
  return [
    'Spring Steel',
    'High Carbon Steel',
    'Stainless Steel 302',
    'Stainless Steel 304',
    'Stainless Steel 316',
    'Phosphor Bronze',
    'Beryllium Copper',
    'Inconel',
    'Alloy Steel'
  ];
}

function getSpringTypes() {
  return ['Compression', 'Extension', 'Torsion', 'Wave', 'Disc/Belleville'];
}

function getWasherTypes() {
  return ['Spring Lock Washer', 'Belleville Washer', 'Wave Washer', 'Curved Washer', 'Conical Washer'];
}

function getSurfaceFinishes() {
  return ['Zinc Plated', 'Black Oxide', 'Phosphate Coated', 'Nickel Plated', 'Passivated', 'None'];
}

function getWireTypes() {
  return ['Flat Wire', 'Square Wire', 'Round Wire'];
}

function getPipelineStages() {
  return ['New Lead', 'Specs Received', 'Quoted', 'Sample Sent', 'Approved', 'In Production'];
}

function getOrderStages() {
  return ['Coiling', 'Heat Treatment', 'QC', 'Dispatch'];
}

function getAllStaticData() {
  return {
    wireDensity: getWireDensity(),
    materialPricing: getMaterialPricing(),
    washerStandards: getWasherStandards(),
    washerPricingMatrix: getWasherPricingMatrix(),
    suppliers: getSuppliers(),
    washerVendors: getWasherVendors(),
    companyDetails: getCompanyDetails(),
    materials: getMaterials(),
    springTypes: getSpringTypes(),
    washerTypes: getWasherTypes(),
    surfaceFinishes: getSurfaceFinishes(),
    wireTypes: getWireTypes(),
    pipelineStages: getPipelineStages(),
    orderStages: getOrderStages()
  };
}
