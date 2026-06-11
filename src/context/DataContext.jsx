import { createContext, useContext, useState, useEffect } from 'react';
import {
    inventory as initialInventory,
    suppliers as initialSuppliers,
    washerVendors as initialVendors,
    leads as initialLeads,
    orders as initialOrders
} from '../data/mockData';
import { SupabaseService, supabase } from '../services/SupabaseService';

const DataContext = createContext(null);

export { DataContext };

export const DataProvider = ({ children }) => {
    // Helper to init state from localStorage or fallback to mockData
    const initData = (key, initialData) => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load local storage data', e);
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
    const [pendingPO, setPendingPO] = useState(null); // For pre-filling PO form from MRP alerts
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(!!supabase);

    // Initial load from SQLite and Supabase
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Try fetching from Local SQLite (if local)
            try {
                const res = await fetch('/api/data/app_state');
                const remoteData = await res.json();
                if (remoteData) {
                    if (remoteData.inventoryItems?.length) setInventoryItems(remoteData.inventoryItems);
                    if (remoteData.suppliersList?.length) setSuppliersList(remoteData.suppliersList);
                    if (remoteData.vendors?.length) setVendors(remoteData.vendors);
                    if (remoteData.allLeads?.length) setAllLeads(remoteData.allLeads);
                    if (remoteData.orders?.length) setOrders(remoteData.orders);
                    if (remoteData.purchaseOrders?.length) setPurchaseOrders(remoteData.purchaseOrders);
                }
            } catch (e) {
                console.warn('SQLite backend not reachable, using localStorage/mockData');
            }

            // 2. Try fetching from Supabase if connected
            if (isSupabaseConnected) {
                const cloudData = await SupabaseService.fetchAllData();
                if (cloudData) {
                    // Map Inventory
                    if (cloudData.inventory?.length) {
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
                    if (cloudData.vendors?.length) {
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
                    if (cloudData.products?.length) {
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
                    if (cloudData.leads?.length) {
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
                    if (cloudData.orders?.length) {
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
                            stages: typeof o.stages === 'string' ? JSON.parse(o.stages) : o.stages
                        }));
                        setOrders(mappedOrders);
                    }

                    // Map POs
                    if (cloudData.purchaseOrders?.length) {
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
                }
            }
        };
        loadInitialData();
    }, [isSupabaseConnected]);

    // Keep LocalStorage in sync (cache layer)
    useEffect(() => {
        localStorage.setItem('imrs_inventory', JSON.stringify(inventoryItems));
        localStorage.setItem('imrs_suppliers', JSON.stringify(suppliersList));
        localStorage.setItem('imrs_vendors', JSON.stringify(vendors));
        localStorage.setItem('imrs_leads', JSON.stringify(allLeads));
        localStorage.setItem('imrs_products', JSON.stringify(products));
        localStorage.setItem('imrs_orders', JSON.stringify(orders));
        localStorage.setItem('imrs_pos', JSON.stringify(purchaseOrders));
    }, [inventoryItems, suppliersList, vendors, allLeads, products, orders, purchaseOrders]);

    // ---- GRANULAR CRUD OPERATIONS (Direct Local + Async Supabase) ----

    // LEADS
    const addLead = async (lead) => {
        setAllLeads(prev => [...prev, lead]);
        if (isSupabaseConnected) {
            await SupabaseService.insertLead(lead);
        }
    };
    const updateLead = async (lead) => {
        setAllLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
        if (isSupabaseConnected) {
            await SupabaseService.updateLead(lead);
        }
    };
    const deleteLead = async (id) => {
        setAllLeads(prev => prev.filter(l => l.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deleteLead(id);
        }
    };

    // INVENTORY
    const addInventoryItem = async (item) => {
        setInventoryItems(prev => [...prev, item]);
        if (isSupabaseConnected) {
            await SupabaseService.insertInventory(item);
        }
    };
    const updateInventoryItem = async (item) => {
        setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
        if (isSupabaseConnected) {
            await SupabaseService.updateInventory(item);
        }
    };
    const deleteInventoryItem = async (id) => {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deleteInventory(id);
        }
    };

    // VENDORS
    const addVendor = async (v) => {
        setVendors(prev => [...prev, v]);
        if (isSupabaseConnected) {
            await SupabaseService.insertVendor(v);
        }
    };
    const updateVendor = async (v) => {
        setVendors(prev => prev.map(item => item.id === v.id ? v : item));
        if (isSupabaseConnected) {
            await SupabaseService.updateVendor(v);
        }
    };
    const deleteVendor = async (id) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deleteVendor(id);
        }
    };

    // PRODUCTS
    const addProduct = async (p) => {
        setProducts(prev => [...prev, p]);
        if (isSupabaseConnected) {
            await SupabaseService.insertProduct(p);
        }
    };
    const updateProduct = async (p) => {
        setProducts(prev => prev.map(item => item.id === p.id ? p : item));
        if (isSupabaseConnected) {
            await SupabaseService.updateProduct(p);
        }
    };
    const deleteProduct = async (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deleteProduct(id);
        }
    };

    // ORDERS
    const addOrder = async (order) => {
        setOrders(prev => [...prev, order]);
        if (isSupabaseConnected) {
            await SupabaseService.insertOrder(order);
        }
    };
    const updateOrder = async (order) => {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        if (isSupabaseConnected) {
            await SupabaseService.updateOrder(order);
        }
    };
    const deleteOrder = async (id) => {
        setOrders(prev => prev.filter(o => o.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deleteOrder(id);
        }
    };

    // PURCHASE ORDERS
    const addPO = async (po) => {
        setPurchaseOrders(prev => [...prev, po]);
        if (isSupabaseConnected) {
            await SupabaseService.insertPO(po);
        }
    };
    const updatePO = async (po) => {
        setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
        if (isSupabaseConnected) {
            await SupabaseService.updatePO(po);
        }
    };
    const deletePO = async (id) => {
        setPurchaseOrders(prev => prev.filter(p => p.id !== id));
        if (isSupabaseConnected) {
            await SupabaseService.deletePO(id);
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
