import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('imrs_supabase_url') || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('imrs_supabase_key') || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const SupabaseService = {
    // Set dynamic credentials (e.g. from UI)
    setCredentials(url, key) {
        localStorage.setItem('imrs_supabase_url', url);
        localStorage.setItem('imrs_supabase_key', key);
        window.location.reload();
    },

    // ---- FETCHERS ----
    async fetchAllData() {
        if (!supabase) return null;
        try {
            const [leads, inventory, vendors, quality, products, orders, pos, rfqs, priceHistory, qcReports] = await Promise.all([
                supabase.from('leads').select('*'),
                supabase.from('inventory').select('*'),
                supabase.from('vendors').select('*'),
                supabase.from('quality_logs').select('*'),
                supabase.from('products').select('*'),
                supabase.from('orders').select('*').then(res => {
                    if (res.error && res.error.message.includes('public.orders')) {
                        return { data: [] }; // Gracefully handle if tables aren't created yet
                    }
                    return res;
                }),
                supabase.from('purchase_orders').select('*').then(res => {
                    if (res.error && res.error.message.includes('public.purchase_orders')) {
                        return { data: [] }; // Gracefully handle if tables aren't created yet
                    }
                    return res;
                }),
                supabase.from('rfqs').select('*').then(res => { if (res.error && res.error.message.includes('public.rfqs')) { return { data: [] }; } return res; }),
                supabase.from('material_price_history').select('*').order('recorded_date', { ascending: false }).then(res => { if (res.error && res.error.message.includes('public.material_price_history')) { return { data: [] }; } return res; }),
                supabase.from('qc_reports').select('*').order('date', { ascending: false }).then(res => { if (res.error && res.error.message.includes('public.qc_reports')) { return { data: [] }; } return res; })
            ]);

            return {
                leads: leads.data || [],
                inventory: inventory.data || [],
                vendors: vendors.data || [],
                quality: quality.data || [],
                products: products.data || [],
                orders: orders.data || [],
                purchaseOrders: pos.data || [],
                rfqs: rfqs.data || [],
                priceHistory: priceHistory.data || [],
                qcReports: qcReports.data || []
            };
        } catch (e) {
            console.error("Fetch Error:", e);
            return null;
        }
    },

    // ---- PRODUCTS SYNC ----
    async insertProduct(item) {
        if (!supabase) return;
        const mapped = {
            id: item.id,
            name: item.name,
            category: item.category,
            type: item.type,
            material: item.material,
            vendor_id: item.vendorId || null,
            stock_qty: item.stockQty,
            uom: item.uom,
            unit_cost: item.unitCost,
            location: item.location
        };
        const { error } = await supabase.from('products').insert(mapped);
        if (error) console.error("Error inserting product:", error);
    },
    async updateProduct(item) {
        if (!supabase) return;
        const mapped = {
            name: item.name,
            category: item.category,
            type: item.type,
            material: item.material,
            vendor_id: item.vendorId || null,
            stock_qty: item.stockQty,
            uom: item.uom,
            unit_cost: item.unitCost,
            location: item.location
        };
        const { error } = await supabase.from('products').update(mapped).eq('id', item.id);
        if (error) console.error("Error updating product:", error);
    },
    async deleteProduct(id) {
        if (!supabase) return;
        await supabase.from('products').delete().eq('id', id);
    },

    // ---- INVENTORY SYNC ----
    async insertInventory(item) {
        if (!supabase) return;
        const mapped = {
            id: item.id,
            material: item.material,
            wire_gauge: item.wireGauge,
            lot_number: item.lotNumber,
            supplier: item.supplier,
            qty_kg: item.qtyKg,
            min_qty_kg: item.minQtyKg,
            location: item.location,
            received_date: item.receivedDate,
            status: item.status
        };
        const { error } = await supabase.from('inventory').insert(mapped);
        if (error) console.error("Error inserting inventory:", error);
    },
    async updateInventory(item) {
        if (!supabase) return;
        const mapped = {
            material: item.material,
            wire_gauge: item.wireGauge,
            lot_number: item.lotNumber,
            supplier: item.supplier,
            qty_kg: item.qtyKg,
            min_qty_kg: item.minQtyKg,
            location: item.location,
            received_date: item.receivedDate,
            status: item.status
        };
        const { error } = await supabase.from('inventory').update(mapped).eq('id', item.id);
        if (error) console.error("Error updating inventory:", error);
    },
    async deleteInventory(id) {
        if (!supabase) return;
        await supabase.from('inventory').delete().eq('id', id);
    },

    // ---- VENDORS SYNC ----
    async insertVendor(v) {
        if (!supabase) return;
        const mapped = {
            id: v.id,
            name: v.name,
            location: v.location,
            lead_time: v.leadTime,
            payment_terms: v.paymentTerms,
            rating: v.rating,
            type: v.type || 'procurement'
        };
        const { error } = await supabase.from('vendors').insert(mapped);
        if (error) console.error("Error inserting vendor:", error);
    },
    async updateVendor(v) {
        if (!supabase) return;
        const mapped = {
            name: v.name,
            location: v.location,
            lead_time: v.leadTime,
            payment_terms: v.paymentTerms,
            rating: v.rating,
            type: v.type || 'procurement'
        };
        const { error } = await supabase.from('vendors').update(mapped).eq('id', v.id);
        if (error) console.error("Error updating vendor:", error);
    },
    async deleteVendor(id) {
        if (!supabase) return;
        await supabase.from('vendors').delete().eq('id', id);
    },

    // ---- LEADS SYNC ----
    async insertLead(l) {
        if (!supabase) return;
        const mapped = {
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
        };
        const { error } = await supabase.from('leads').insert(mapped);
        if (error) console.error("Error inserting lead:", error);
    },
    async updateLead(l) {
        if (!supabase) return;
        const mapped = {
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
        };
        const { error } = await supabase.from('leads').update(mapped).eq('id', l.id);
        if (error) console.error("Error updating lead:", error);
    },
    async deleteLead(id) {
        if (!supabase) return;
        await supabase.from('leads').delete().eq('id', id);
    },

    // ---- ORDERS SYNC ----
    async insertOrder(order) {
        if (!supabase) return;
        const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const defaultStages = [
            { name: 'Coiling', status: order.status === 'Coiling' ? 'in_progress' : (['Heat Treatment', 'QC', 'Dispatch', 'Completed'].includes(order.status) ? 'completed' : 'pending') },
            { name: 'Heat Treatment', status: order.status === 'Heat Treatment' ? 'in_progress' : (['QC', 'Dispatch', 'Completed'].includes(order.status) ? 'completed' : 'pending') },
            { name: 'QC', status: order.status === 'QC' ? 'in_progress' : (['Dispatch', 'Completed'].includes(order.status) ? 'completed' : 'pending') },
            { name: 'Dispatch', status: order.status === 'Dispatch' ? 'in_progress' : (order.status === 'Completed' ? 'completed' : 'pending') },
            { name: 'Completed', status: order.status === 'Completed' ? 'completed' : 'pending' }
        ];
        const mapped = {
            id: order.id,
            customer: order.customer || 'Unknown Customer',
            product: order.product || 'Standard Springs',
            qty: order.qty || 1000,
            unit_price: order.unitPrice || 0,
            total: order.total || 0,
            status: order.status || 'Coiling',
            progress: order.progress !== undefined ? order.progress : 20,
            order_date: order.orderDate || new Date().toISOString().split('T')[0],
            due_date: order.dueDate || defaultDueDate,
            material: order.material || 'Spring Steel Gr. 2',
            wire_gauge: order.wireGauge || '2.0mm',
            stages: order.stages || defaultStages,
            source: order.source || 'Direct',
            source_ref: order.sourceRef || null,
            rfq_id: order.rfqId || null
        };
        const { error } = await supabase.from('orders').insert(mapped);
        if (error) console.error("Error inserting order:", error);
    },
    async updateOrder(order) {
        if (!supabase) return;
        const mapped = {
            customer: order.customer,
            product: order.product,
            qty: order.qty,
            unit_price: order.unitPrice,
            total: order.total,
            status: order.status,
            progress: order.progress,
            order_date: order.orderDate,
            due_date: order.dueDate,
            material: order.material,
            wire_gauge: order.wireGauge,
            stages: order.stages,
            source: order.source,
            source_ref: order.sourceRef,
            rfq_id: order.rfqId
        };
        const { error } = await supabase.from('orders').update(mapped).eq('id', order.id);
        if (error) console.error("Error updating order:", error);
    },
    async deleteOrder(id) {
        if (!supabase) return;
        await supabase.from('orders').delete().eq('id', id);
    },

    // ---- PURCHASE ORDERS SYNC ----
    async insertPO(po) {
        if (!supabase) return;
        const mapped = {
            id: po.id,
            vendor_id: po.vendorId,
            vendor_name: po.vendorName,
            material: po.material,
            qty_kg: po.qtyKg,
            unit_price_kg: po.unitPriceKg,
            total: po.total,
            status: po.status,
            order_date: po.orderDate,
            due_date: po.dueDate,
            notes: po.notes
        };
        const { error } = await supabase.from('purchase_orders').insert(mapped);
        if (error) console.error("Error inserting purchase order:", error);
    },
    async updatePO(po) {
        if (!supabase) return;
        const mapped = {
            vendor_id: po.vendorId,
            vendor_name: po.vendorName,
            material: po.material,
            qty_kg: po.qtyKg,
            unit_price_kg: po.unitPriceKg,
            total: po.total,
            status: po.status,
            order_date: po.orderDate,
            due_date: po.dueDate,
            notes: po.notes
        };
        const { error } = await supabase.from('purchase_orders').update(mapped).eq('id', po.id);
        if (error) console.error("Error updating purchase order:", error);
    },
    async deletePO(id) {
        if (!supabase) return;
        await supabase.from('purchase_orders').delete().eq('id', id);
    },

    // ---- RFQS SYNC ----
    async insertRFQ(rfq) {
        if (!supabase) return;
        const mapped = {
            id: rfq.id,
            source: rfq.source,
            source_ref: rfq.sourceRef,
            customer: rfq.customer,
            items: rfq.items,
            quoted_amount: rfq.quotedAmount,
            status: rfq.status,
            received_date: rfq.receivedDate,
            deadline: rfq.deadline,
            quoted_date: rfq.quotedDate,
            notes: rfq.notes,
            converted_order_id: rfq.convertedOrderId
        };
        const { error } = await supabase.from('rfqs').insert(mapped);
        if (error) console.error('Error inserting RFQ:', error);
    },
    async updateRFQ(rfq) {
        if (!supabase) return;
        const mapped = {
            source: rfq.source,
            source_ref: rfq.sourceRef,
            customer: rfq.customer,
            items: rfq.items,
            quoted_amount: rfq.quotedAmount,
            status: rfq.status,
            received_date: rfq.receivedDate,
            deadline: rfq.deadline,
            quoted_date: rfq.quotedDate,
            notes: rfq.notes,
            converted_order_id: rfq.convertedOrderId
        };
        const { error } = await supabase.from('rfqs').update(mapped).eq('id', rfq.id);
        if (error) console.error('Error updating RFQ:', error);
    },
    async deleteRFQ(id) {
        if (!supabase) return;
        await supabase.from('rfqs').delete().eq('id', id);
    },

    // ---- MATERIAL PRICE HISTORY ----
    async insertPriceEntry(entry) {
        if (!supabase) return;
        const mapped = {
            id: entry.id,
            material: entry.material,
            wire_gauge: entry.wireGauge,
            price_per_kg: entry.pricePerKg,
            supplier: entry.supplier,
            recorded_date: entry.recordedDate,
            notes: entry.notes
        };
        const { error } = await supabase.from('material_price_history').insert(mapped);
        if (error) console.error('Error inserting price entry:', error);
    },
    async deletePriceEntry(id) {
        if (!supabase) return;
        await supabase.from('material_price_history').delete().eq('id', id);
    },

    // ---- QC REPORTS ----
    async insertQcReport(report) {
        if (!supabase) return;
        const mapped = {
            id: report.id,
            order_id: report.orderId,
            date: report.date,
            inspector: report.inspector,
            inspected_qty: report.inspectedQty,
            passed_qty: report.passedQty,
            rejected_qty: report.rejectedQty,
            defect_types: report.defectTypes,
            notes: report.notes
        };
        const { error } = await supabase.from('qc_reports').insert(mapped);
        if (error) console.error('Error inserting QC report:', error);
    },
    async deleteQcReport(id) {
        if (!supabase) return;
        await supabase.from('qc_reports').delete().eq('id', id);
    }
};
