import { createContext, useContext, useState, useEffect } from 'react';
import {
    inventory as initialInventory,
    suppliers as initialSuppliers,
    washerVendors as initialVendors,
    leads as initialLeads,
    orders as initialOrders
} from '../data/mockData';
import { SupabaseService, supabase } from '../services/SupabaseService';
import { useToast } from './ToastContext';

const DataContext = createContext(null);

export { DataContext };

export const DataProvider = ({ children }) => {
    const { showToast } = useToast();
    
    // Helper to init state from localStorage or fallback to mockData
    const initData = (key, initialData) => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse local storage data', e);
        }
        return initialData;
    };

    const [inventoryItems, setInventoryItems] = useState(() => initData('imrs_inventory', initialInventory));
    const [suppliersList, setSuppliersList] = useState(() => initData('imrs_suppliers', initialSuppliers));
    const [vendors, setVendors] = useState(() => initData('imrs_vendors', initialVendors));
    const [allLeads, setAllLeads] = useState(() => initData('imrs_leads', initialLeads));
    const [products, setProducts] = useState(() => initData('imrs_products', []));
    const [orders, setOrders] = useState(() => initData('imrs_orders', initialOrders));
    const [purchaseOrders, setPurchaseOrders] = useState(() => initData('imrs_pos', []));
    const [rfqs, setRFQs] = useState(() => initData('imrs_rfqs', []));
    const [priceHistory, setPriceHistory] = useState(() => initData('imrs_price_history', []));
    const [qcReports, setQcReports] = useState(() => initData('imrs_qc_reports', []));
    const [pendingPO, setPendingPO] = useState(null); // For pre-filling PO form from MRP alerts
    const isSupabaseConnected = !!supabase;

    // Initial load from Supabase
    useEffect(() => {
        const loadInitialData = async () => {
            // Try fetching from Supabase if connected
            if (isSupabaseConnected) {
                const cloudData = await SupabaseService.fetchAllData();
                if (cloudData) {
                    // Map Inventory
                    if (cloudData.inventory) {
                        const mappedInventory = cloudData.inventory.map(i => ({
                            id: i.id,
                            material: i.material,
                            wireGauge: i.wire_gauge,
                            lotNumber: i.lot_number,
                            supplier: i.supplier,
                            qtyKg: parseFloat(i.qty_kg),
                            minQtyKg: parseFloat(i.min_qty_kg),
                            location: i.location,
                            receivedDate: i.received_date,
                            status: i.status
                        }));
                        setInventoryItems(mappedInventory);
                    }

                    // Map Vendors
                    if (cloudData.vendors) {
                        const mappedVendors = cloudData.vendors.map(v => ({
                            id: v.id,
                            name: v.name,
                            location: v.location,
                            leadTime: v.lead_time,
                            paymentTerms: v.payment_terms,
                            rating: v.rating,
                            type: v.type
                        }));
                        setVendors(mappedVendors);
                    }

                    // Map Products
                    if (cloudData.products) {
                        const mappedProducts = cloudData.products.map(p => ({
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            type: p.type,
                            material: p.material,
                            vendorId: p.vendor_id,
                            stockQty: p.stock_qty,
                            uom: p.uom,
                            unitCost: p.unit_cost,
                            location: p.location
                        }));
                        setProducts(mappedProducts);
                    }

                    // Map Leads
                    if (cloudData.leads) {
                        const mappedLeads = cloudData.leads.map(l => ({
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
                            assignedTo: l.assigned_to,
                            lastActivity: l.last_activity,
                            notes: l.notes
                        }));
                        setAllLeads(mappedLeads);
                    }

                    // Map Orders
                    if (cloudData.orders) {
                        const mappedOrders = cloudData.orders.map(o => ({
                            id: o.id,
                            customer: o.customer,
                            product: o.product,
                            qty: parseInt(o.qty),
                            unitPrice: parseFloat(o.unit_price),
                            total: parseFloat(o.total),
                            status: o.status,
                            progress: parseInt(o.progress),
                            orderDate: o.order_date,
                            dueDate: o.due_date,
                            material: o.material,
                            wireGauge: o.wire_gauge,
                            stages: typeof o.stages === 'string' ? JSON.parse(o.stages) : o.stages,
                            source: o.source,
                            sourceRef: o.source_ref,
                            rfqId: o.rfq_id
                        }));
                        setOrders(mappedOrders);
                    }

                    // Map POs
                    if (cloudData.purchaseOrders) {
                        const mappedPOs = cloudData.purchaseOrders.map(po => ({
                            id: po.id,
                            vendorId: po.vendor_id,
                            vendorName: po.vendor_name,
                            material: po.material,
                            qtyKg: parseFloat(po.qty_kg),
                            unitPriceKg: parseFloat(po.unit_price_kg),
                            total: parseFloat(po.total),
                            status: po.status,
                            orderDate: po.order_date,
                            dueDate: po.due_date,
                            notes: po.notes
                        }));
                        setPurchaseOrders(mappedPOs);
                    }

                    // Map RFQs
                    if (cloudData.rfqs) {
                        const mappedRFQs = cloudData.rfqs.map(r => ({
                            id: r.id,
                            source: r.source,
                            sourceRef: r.source_ref,
                            customer: r.customer,
                            items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
                            quotedAmount: r.quoted_amount ? parseFloat(r.quoted_amount) : null,
                            status: r.status,
                            receivedDate: r.received_date,
                            deadline: r.deadline,
                            quotedDate: r.quoted_date,
                            notes: r.notes,
                            convertedOrderId: r.converted_order_id,
                            createdAt: r.created_at
                        }));
                        setRFQs(mappedRFQs);
                    }

                    // Map Price History
                    if (cloudData.priceHistory) {
                        const mappedPrices = cloudData.priceHistory.map(p => ({
                            id: p.id,
                            material: p.material,
                            wireGauge: p.wire_gauge,
                            pricePerKg: parseFloat(p.price_per_kg),
                            supplier: p.supplier,
                            recordedDate: p.recorded_date,
                            notes: p.notes,
                            createdAt: p.created_at
                        }));
                        setPriceHistory(mappedPrices);
                    }

                    // Map QC Reports
                    if (cloudData.qcReports) {
                        const mappedQc = cloudData.qcReports.map(q => ({
                            id: q.id,
                            orderId: q.order_id,
                            date: q.date,
                            inspector: q.inspector,
                            inspectedQty: parseInt(q.inspected_qty),
                            passedQty: parseInt(q.passed_qty),
                            rejectedQty: parseInt(q.rejected_qty),
                            defectTypes: typeof q.defect_types === 'string' ? JSON.parse(q.defect_types) : q.defect_types,
                            notes: q.notes,
                            createdAt: q.created_at
                        }));
                        setQcReports(mappedQc);
                    }
                }
            }
        };
        loadInitialData();
    }, [isSupabaseConnected]);

    // Keep LocalStorage in sync (cache layer) - separate effects for efficiency
    useEffect(() => { localStorage.setItem('imrs_inventory', JSON.stringify(inventoryItems)); }, [inventoryItems]);
    useEffect(() => { localStorage.setItem('imrs_suppliers', JSON.stringify(suppliersList)); }, [suppliersList]);
    useEffect(() => { localStorage.setItem('imrs_vendors', JSON.stringify(vendors)); }, [vendors]);
    useEffect(() => { localStorage.setItem('imrs_leads', JSON.stringify(allLeads)); }, [allLeads]);
    useEffect(() => { localStorage.setItem('imrs_products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('imrs_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('imrs_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
    useEffect(() => { localStorage.setItem('imrs_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
    useEffect(() => { localStorage.setItem('imrs_price_history', JSON.stringify(priceHistory)); }, [priceHistory]);
    useEffect(() => { localStorage.setItem('imrs_qc_reports', JSON.stringify(qcReports)); }, [qcReports]);

    // ---- GRANULAR CRUD OPERATIONS (Direct Local + Async Supabase) ----

    // LEADS
    const addLead = async (lead) => {
        setAllLeads(prev => [...prev, lead]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertLead(lead);
            } catch (e) {
                console.error('Failed to add lead to Supabase:', e);
                showToast('Failed to save lead to cloud', 'error');
            }
        }
    };
    const updateLead = async (lead) => {
        setAllLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateLead(lead);
            } catch (e) {
                console.error('Failed to update lead in Supabase:', e);
                showToast('Failed to update lead in cloud', 'error');
            }
        }
    };
    const deleteLead = async (id) => {
        setAllLeads(prev => prev.filter(l => l.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteLead(id);
            } catch (e) {
                console.error('Failed to delete lead from Supabase:', e);
                showToast('Failed to delete lead from cloud', 'error');
            }
        }
    };

    // INVENTORY
    const addInventoryItem = async (item) => {
        setInventoryItems(prev => [...prev, item]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertInventory(item);
            } catch (e) {
                console.error('Failed to add inventory item to Supabase:', e);
                showToast('Failed to save inventory item to cloud', 'error');
            }
        }
    };
    const updateInventoryItem = async (item) => {
        setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateInventory(item);
            } catch (e) {
                console.error('Failed to update inventory item in Supabase:', e);
                showToast('Failed to update inventory item in cloud', 'error');
            }
        }
    };
    const deleteInventoryItem = async (id) => {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteInventory(id);
            } catch (e) {
                console.error('Failed to delete inventory item from Supabase:', e);
                showToast('Failed to delete inventory item from cloud', 'error');
            }
        }
    };

    // VENDORS
    const addVendor = async (v) => {
        setVendors(prev => [...prev, v]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertVendor(v);
            } catch (e) {
                console.error('Failed to add vendor to Supabase:', e);
                showToast('Failed to save vendor to cloud', 'error');
            }
        }
    };
    const updateVendor = async (v) => {
        setVendors(prev => prev.map(item => item.id === v.id ? v : item));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateVendor(v);
            } catch (e) {
                console.error('Failed to update vendor in Supabase:', e);
                showToast('Failed to update vendor in cloud', 'error');
            }
        }
    };
    const deleteVendor = async (id) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteVendor(id);
            } catch (e) {
                console.error('Failed to delete vendor from Supabase:', e);
                showToast('Failed to delete vendor from cloud', 'error');
            }
        }
    };

    // PRODUCTS
    const addProduct = async (p) => {
        setProducts(prev => [...prev, p]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertProduct(p);
            } catch (e) {
                console.error('Failed to add product to Supabase:', e);
                showToast('Failed to save product to cloud', 'error');
            }
        }
    };
    const updateProduct = async (p) => {
        setProducts(prev => prev.map(item => item.id === p.id ? p : item));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateProduct(p);
            } catch (e) {
                console.error('Failed to update product in Supabase:', e);
                showToast('Failed to update product in cloud', 'error');
            }
        }
    };
    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteProduct(id);
            } catch (e) {
                console.error('Failed to delete product from Supabase:', e);
                showToast('Failed to delete product from cloud', 'error');
            }
        }
    };

    // ORDERS
    const addOrder = async (order) => {
        setOrders(prev => [...prev, order]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertOrder(order);
            } catch (e) {
                console.error('Failed to add order to Supabase:', e);
                showToast('Failed to save order to cloud', 'error');
            }
        }
    };
    const updateOrder = async (order) => {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateOrder(order);
            } catch (e) {
                console.error('Failed to update order in Supabase:', e);
                showToast('Failed to update order in cloud', 'error');
            }
        }
    };
    const deleteOrder = async (id) => {
        setOrders(prev => prev.filter(o => o.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteOrder(id);
            } catch (e) {
                console.error('Failed to delete order from Supabase:', e);
                showToast('Failed to delete order from cloud', 'error');
            }
        }
    };

    // PURCHASE ORDERS
    const addPO = async (po) => {
        setPurchaseOrders(prev => [...prev, po]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertPO(po);
            } catch (e) {
                console.error('Failed to add purchase order to Supabase:', e);
                showToast('Failed to save purchase order to cloud', 'error');
            }
        }
    };
    const updatePO = async (po) => {
        setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updatePO(po);
            } catch (e) {
                console.error('Failed to update purchase order in Supabase:', e);
                showToast('Failed to update purchase order in cloud', 'error');
            }
        }
    };
    const deletePO = async (id) => {
        setPurchaseOrders(prev => prev.filter(p => p.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deletePO(id);
            } catch (e) {
                console.error('Failed to delete purchase order from Supabase:', e);
                showToast('Failed to delete purchase order from cloud', 'error');
            }
        }
    };

    // RFQS
    const addRFQ = async (rfq) => {
        setRFQs(prev => [...prev, rfq]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertRFQ(rfq);
            } catch (e) {
                console.error('Failed to add RFQ to Supabase:', e);
                showToast('Failed to save RFQ to cloud', 'error');
            }
        }
    };
    const updateRFQ = async (rfq) => {
        setRFQs(prev => prev.map(r => r.id === rfq.id ? rfq : r));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.updateRFQ(rfq);
            } catch (e) {
                console.error('Failed to update RFQ in Supabase:', e);
                showToast('Failed to update RFQ in cloud', 'error');
            }
        }
    };
    const deleteRFQ = async (id) => {
        setRFQs(prev => prev.filter(r => r.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteRFQ(id);
            } catch (e) {
                console.error('Failed to delete RFQ from Supabase:', e);
                showToast('Failed to delete RFQ from cloud', 'error');
            }
        }
    };

    // PRICE HISTORY
    const addPriceEntry = async (entry) => {
        setPriceHistory(prev => [entry, ...prev]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertPriceEntry(entry);
            } catch (e) {
                console.error('Failed to add price entry to Supabase:', e);
                showToast('Failed to save price entry to cloud', 'error');
            }
        }
    };
    const deletePriceEntry = async (id) => {
        setPriceHistory(prev => prev.filter(p => p.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deletePriceEntry(id);
            } catch (e) {
                console.error('Failed to delete price entry from Supabase:', e);
                showToast('Failed to delete price entry from cloud', 'error');
            }
        }
    };

    // QC REPORTS
    const addQcReport = async (report) => {
        setQcReports(prev => [report, ...prev]);
        if (isSupabaseConnected) {
            try {
                await SupabaseService.insertQcReport(report);
            } catch (e) {
                console.error('Failed to add QC report to Supabase:', e);
                showToast('Failed to save QC report to cloud', 'error');
            }
        }
    };
    const deleteQcReport = async (id) => {
        setQcReports(prev => prev.filter(q => q.id !== id));
        if (isSupabaseConnected) {
            try {
                await SupabaseService.deleteQcReport(id);
            } catch (e) {
                console.error('Failed to delete QC report from Supabase:', e);
                showToast('Failed to delete QC report from cloud', 'error');
            }
        }
    };

    return (
        <DataContext.Provider value={{
            inventoryItems, setInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem,
            suppliersList, setSuppliersList,
            vendors, setVendors, addVendor, updateVendor, deleteVendor,
            allLeads, setAllLeads, addLead, updateLead, deleteLead,
            products, setProducts, addProduct, updateProduct, deleteProduct,
            orders, setOrders, addOrder, updateOrder, deleteOrder,
            purchaseOrders, setPurchaseOrders, addPO, updatePO, deletePO,
            rfqs, setRFQs, addRFQ, updateRFQ, deleteRFQ,
            priceHistory, setPriceHistory, addPriceEntry, deletePriceEntry,
            qcReports, setQcReports, addQcReport, deleteQcReport,
            pendingPO, setPendingPO,
            isSupabaseConnected,
            connectSupabase: SupabaseService.setCredentials
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
