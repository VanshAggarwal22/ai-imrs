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
            const [leads, inventory, vendors, quality, products, orders, pos] = await Promise.all([
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
                })
            ]);

            return {
                leads: leads.data || [],
                inventory: inventory.data || [],
                vendors: vendors.data || [],
                quality: quality.data || [],
                products: products.data || [],
                orders: orders.data || [],
                purchaseOrders: pos.data || []
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
            vendor_id: item.vendorId,
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
            vendor_id: item.vendorId,
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
        const mapped = {
            id: order.id,
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
            stages: order.stages
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
            stages: order.stages
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
    }
};
