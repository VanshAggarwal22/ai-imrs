import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: mockFrom
        }))
    };
});

describe('SupabaseService', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => {
                if (key === 'imrs_supabase_url') return 'http://mock-url';
                if (key === 'imrs_supabase_key') return 'mock-key';
                return null;
            }),
            setItem: vi.fn(),
        });
        vi.resetModules();
        mockFrom.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('successfully fetches all data when no errors occur', async () => {
        const { SupabaseService, supabase } = await import('./SupabaseService');

        supabase.from.mockImplementation((table) => {
            return {
                select: vi.fn().mockResolvedValue({ data: [{ id: `${table}_1` }] })
            };
        });

        const data = await SupabaseService.fetchAllData();

        expect(data).not.toBeNull();
        expect(data.leads).toEqual([{ id: 'leads_1' }]);
        expect(data.inventory).toEqual([{ id: 'inventory_1' }]);
        expect(data.vendors).toEqual([{ id: 'vendors_1' }]);
        expect(data.quality).toEqual([{ id: 'quality_logs_1' }]);
        expect(data.products).toEqual([{ id: 'products_1' }]);
        expect(data.orders).toEqual([{ id: 'orders_1' }]);
        expect(data.purchaseOrders).toEqual([{ id: 'purchase_orders_1' }]);
    });

    it('gracefully handles missing public.orders and public.purchase_orders tables', async () => {
        const { SupabaseService, supabase } = await import('./SupabaseService');

        supabase.from.mockImplementation((table) => {
            if (table === 'orders') {
                return {
                    select: vi.fn().mockResolvedValue({
                        error: { message: 'relation "public.orders" does not exist' },
                        data: null
                    })
                };
            }
            if (table === 'purchase_orders') {
                return {
                    select: vi.fn().mockResolvedValue({
                        error: { message: 'relation "public.purchase_orders" does not exist' },
                        data: null
                    })
                };
            }
            return {
                select: vi.fn().mockResolvedValue({ data: [{ id: `${table}_1` }] })
            };
        });

        const data = await SupabaseService.fetchAllData();

        expect(data).not.toBeNull();
        expect(data.orders).toEqual([]); // Fallback to empty array
        expect(data.purchaseOrders).toEqual([]); // Fallback to empty array
        // Other tables should still be populated
        expect(data.leads).toEqual([{ id: 'leads_1' }]);
    });

    it('returns null on fetchAllData if supabase client is not initialized', async () => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => null), // clear credentials so supabase client is null
            setItem: vi.fn(),
        });

        // Mock import.meta.env to be undefined
        vi.stubEnv('VITE_SUPABASE_URL', '');
        vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
        vi.resetModules();

        const { SupabaseService, supabase } = await import('./SupabaseService');
        expect(supabase).toBeNull();

        const data = await SupabaseService.fetchAllData();
        expect(data).toBeNull();
    });

    it('catches and returns null when an unexpected rejection occurs', async () => {
        const { SupabaseService, supabase } = await import('./SupabaseService');

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        supabase.from.mockImplementation(() => {
            return {
                select: vi.fn().mockRejectedValue(new Error('Network error'))
            };
        });

        const data = await SupabaseService.fetchAllData();

        expect(data).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch Error:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });
});
