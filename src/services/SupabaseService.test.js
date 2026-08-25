import { describe, it, expect, vi, beforeEach } from 'vitest';

import { supabase, SupabaseService } from './SupabaseService';

// Mock the insert method directly on the instantiated supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null })
      })
    }))
  };
});

describe('SupabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('insertProduct', () => {
    it('should map and insert the product correctly', async () => {
      const item = {
        id: 'p1',
        name: 'Test Product',
        category: 'Cat',
        type: 'Type',
        material: 'Mat',
        vendorId: 'v1',
        stockQty: 10,
        uom: 'kg',
        unitCost: 100,
        location: 'A1'
      };

      await SupabaseService.insertProduct(item);

      const expectedMapped = {
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

      expect(supabase).not.toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('products');

      const insertMock = supabase.from('products').insert;
      expect(insertMock).toHaveBeenCalledWith(expectedMapped);
    });

    it('should log an error if insertion fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // We need to mock the resolved value for this specific test
      supabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValueOnce({ error: 'Database error' })
      });

      const item = {
        id: 'p2'
      };

      await SupabaseService.insertProduct(item);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error inserting product:", "Database error");
      consoleErrorSpy.mockRestore();
    });
  });
});
