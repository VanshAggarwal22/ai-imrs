import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
        }
        env[key] = val.trim();
    }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Supabase URL or Anon Key is missing from .env');
    process.exit(1);
}

const supabase = createClient(url, key);

// Import mock data from local source
import { leads, inventory, suppliers, washerVendors, orders, inspectionLogs } from '../src/data/mockData.js';

const products = [
    { id: 'PROD001', name: 'Compression Springs 2.5mm', category: 'Springs', type: 'Compression', material: 'Spring Steel', vendor_id: 'SUP001', stock_qty: 1000, uom: 'pcs', unit_cost: 8.50, location: 'Rack A3' },
    { id: 'PROD002', name: 'Compression Springs 1.8mm', category: 'Springs', type: 'Compression', material: 'High Carbon Steel', vendor_id: 'SUP001', stock_qty: 5000, uom: 'pcs', unit_cost: 8.00, location: 'Rack A4' },
    { id: 'PROD003', name: 'Spring Washers M10 SS304', category: 'Washers', type: 'Spring Washer', material: 'Stainless Steel 304', vendor_id: 'WVEN001', stock_qty: 2000, uom: 'pcs', unit_cost: 4.40, location: 'Rack B1' },
    { id: 'PROD004', name: 'Torsion Springs Custom', category: 'Springs', type: 'Torsion', material: 'Spring Steel', vendor_id: 'SUP001', stock_qty: 1500, uom: 'pcs', unit_cost: 12.00, location: 'Rack A1' },
    { id: 'PROD005', name: 'Extension Springs 1.2mm', category: 'Springs', type: 'Extension', material: 'Phosphor Bronze', vendor_id: 'SUP003', stock_qty: 3000, uom: 'pcs', unit_cost: 6.50, location: 'Rack C1' }
];

const purchase_orders = [
    { id: 'PO-2026-001', vendor_id: 'WVEN001', vendor_name: 'Precision Flat Wire Tech', material: 'Spring Steel', qty_kg: 200, unit_price_kg: 130, total: 26000, status: 'Completed', order_date: '2026-02-10', due_date: '2026-02-15', notes: 'Urgent spring steel washers batch' },
    { id: 'PO-2026-002', vendor_id: 'SUP001', vendor_name: 'Tata Steel Wire Division', material: 'Spring Steel', qty_kg: 500, unit_price_kg: 85, total: 42500, status: 'Ordered', order_date: '2026-03-08', due_date: '2026-03-15', notes: 'Restocking wire spools' }
];

const mappedVendors = [
    ...suppliers.map(s => ({
        id: s.id,
        name: s.name,
        location: s.location,
        lead_time: s.leadTime,
        payment_terms: s.paymentTerms,
        rating: s.rating,
        type: 'supplier'
    })),
    ...washerVendors.map(w => ({
        id: w.id,
        name: w.name,
        location: w.location,
        lead_time: w.leadTime,
        payment_terms: w.paymentTerms,
        rating: w.rating,
        type: 'vendor'
    }))
];

const mappedLeads = leads.map(l => ({
    id: l.id,
    company: l.company,
    contact: l.contact,
    phone: l.phone,
    email: l.email,
    stage: l.stage,
    product: l.product,
    qty: l.qty,
    value: l.value,
    source: l.source,
    assigned_to: l.assignedTo,
    last_activity: l.lastActivity,
    notes: l.notes
}));

const mappedInventory = inventory.map(i => ({
    id: i.id,
    material: i.material,
    wire_gauge: i.wireGauge,
    lot_number: i.lotNumber,
    supplier: i.supplier,
    qty_kg: i.qtyKg,
    min_qty_kg: i.minQtyKg,
    location: i.location,
    received_date: i.receivedDate,
    status: i.status
}));

const mappedOrders = orders.map(o => {
    // Generate stages status matching order progress
    const stages = ['Coiling', 'Heat Treatment', 'QC', 'Dispatch'].map((name, idx) => {
        let status = 'Pending';
        if (o.progress === 100) {
            status = 'Completed';
        } else if (o.progress > 0) {
            const completedCount = Math.floor(o.progress / 25);
            if (idx < completedCount) {
                status = 'Completed';
            } else if (idx === completedCount) {
                status = 'In Progress';
            }
        }
        return { name, status };
    });

    return {
        id: o.id,
        customer: o.customer,
        product: o.product,
        qty: o.qty,
        unit_price: o.unitPrice,
        total: o.total,
        status: o.status,
        progress: o.progress,
        order_date: o.orderDate,
        due_date: o.dueDate,
        material: o.material,
        wire_gauge: o.wireGauge,
        stages: JSON.stringify(stages)
    };
});

// Since quality_logs is JSONB/plain structure, we insert standard mock values
const mappedQualityLogs = inspectionLogs.map(l => ({
    id: l.id,
    order_id: l.orderId,
    batch_no: l.batchNo,
    date: l.date,
    inspector: l.inspector,
    product: l.product,
    free_length: l.freeLength,
    solid_height: l.solidHeight,
    spring_rate: l.springRate,
    load_test: l.loadTest,
    overall_status: l.overallStatus
}));

async function seed() {
    console.log('Seeding Supabase tables with initial mock data...');
    
    const jobs = [
        { table: 'vendors', data: mappedVendors },
        { table: 'products', data: products },
        { table: 'leads', data: mappedLeads },
        { table: 'inventory', data: mappedInventory },
        { table: 'orders', data: mappedOrders },
        { table: 'purchase_orders', data: purchase_orders },
        { table: 'quality_logs', data: mappedQualityLogs }
    ];

    for (const job of jobs) {
        console.log(`Inserting ${job.data.length} records into table '${job.table}'...`);
        const { error } = await supabase.from(job.table).insert(job.data);
        if (error) {
            console.error(`Error inserting into table '${job.table}':`, error.message);
        } else {
            console.log(`Table '${job.table}' seeded successfully.`);
        }
    }
    
    console.log('Seeding finished!');
}

seed();
