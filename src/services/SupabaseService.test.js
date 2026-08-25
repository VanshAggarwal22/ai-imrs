import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('SupabaseService', () => {
    let SupabaseService;
    let supabase;

    beforeEach(async () => {
        vi.resetModules();
        localStorage.setItem('imrs_supabase_url', 'mock_url');
        localStorage.setItem('imrs_supabase_key', 'mock_key');
        const module = await import('./SupabaseService.js');
        SupabaseService = module.SupabaseService;
        supabase = module.supabase;
    });

    it('fetchAllData returns valid data when all selects succeed', async () => {
        const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 1 }] });
        const mockThen = vi.fn().mockImplementation(cb => Promise.resolve(cb({ data: [{ id: 2 }] })));

        supabase.from.mockImplementation((table) => {
            if (table === 'orders' || table === 'purchase_orders') {
                return {
                    select: vi.fn().mockReturnValue({
                        then: mockThen
                    })
                };
            }
            return {
                select: mockSelect
            };
        });

        const data = await SupabaseService.fetchAllData();
        expect(data).toEqual({
            leads: [{ id: 1 }],
            inventory: [{ id: 1 }],
            vendors: [{ id: 1 }],
            quality: [{ id: 1 }],
            products: [{ id: 1 }],
            orders: [{ id: 2 }],
            purchaseOrders: [{ id: 2 }]
        });

        expect(supabase.from).toHaveBeenCalledWith('leads');
        expect(supabase.from).toHaveBeenCalledWith('inventory');
        expect(supabase.from).toHaveBeenCalledWith('vendors');
        expect(supabase.from).toHaveBeenCalledWith('quality_logs');
        expect(supabase.from).toHaveBeenCalledWith('products');
        expect(supabase.from).toHaveBeenCalledWith('orders');
        expect(supabase.from).toHaveBeenCalledWith('purchase_orders');
    });

    it('fetchAllData gracefully handles uncreated orders/purchase_orders tables', async () => {
        const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 1 }] });
        const mockThen = vi.fn().mockImplementation(cb => Promise.resolve(cb({ error: { message: 'relation "public.orders" does not exist' } })));
        const mockThenPO = vi.fn().mockImplementation(cb => Promise.resolve(cb({ error: { message: 'relation "public.purchase_orders" does not exist' } })));

        supabase.from.mockImplementation((table) => {
            if (table === 'orders') {
                return {
                    select: vi.fn().mockReturnValue({
                        then: mockThen
                    })
                };
            }
            if (table === 'purchase_orders') {
                return {
                    select: vi.fn().mockReturnValue({
                        then: mockThenPO
                    })
                };
            }
            return {
                select: mockSelect
            };
        });

        const data = await SupabaseService.fetchAllData();
        expect(data.orders).toEqual([]);
        expect(data.purchaseOrders).toEqual([]);
    });

    it('fetchAllData handles errors and returns null', async () => {
        supabase.from.mockImplementation(() => {
            throw new Error('Test error');
        });

        const data = await SupabaseService.fetchAllData();
        expect(data).toBeNull();
    });

    it('fetchAllData returns null if supabase client is not initialized', async () => {
        vi.resetModules();
        localStorage.removeItem('imrs_supabase_url');
        localStorage.removeItem('imrs_supabase_key');

        const module = await import('./SupabaseService.js');
        const uninitializedService = module.SupabaseService;

        const data = await uninitializedService.fetchAllData();
        expect(data).toBeNull();
    });
});
