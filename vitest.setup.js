import { vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: vi.fn()
        }))
    };
});
