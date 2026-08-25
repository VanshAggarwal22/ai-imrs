import { vi, describe, it, expect, beforeEach } from 'vitest';

// vitest hoisting workaround: we need to use vi.hoisted for variables used inside vi.mock
const { mockFrom, mockDelete, mockEq } = vi.hoisted(() => {
    const mockEq = vi.fn();
    const mockDelete = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ delete: mockDelete }));
    return { mockFrom, mockDelete, mockEq };
});

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: mockFrom
    }))
}));

import { SupabaseService } from './SupabaseService';

describe('SupabaseService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('deleteProduct', () => {
        it('should delete a product by id', async () => {
            const expectedId = 'test-id-123';
            await SupabaseService.deleteProduct(expectedId);

            expect(mockFrom).toHaveBeenCalledWith('products');
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', expectedId);
        });
    });
});
