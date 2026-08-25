import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from './EmailService';
import * as SupabaseService from './SupabaseService';

// Mock SupabaseService
vi.mock('./SupabaseService', () => {
    return {
        supabase: {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
        }
    };
});

describe('EmailService', () => {
    describe('loadConfigFromCloud', () => {
        let setItemSpy;

        beforeEach(() => {
            vi.clearAllMocks();

            // Mock localStorage
            setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

            // Mock console errors/warnings
            vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('returns null if supabase is not initialized', async () => {
            // Need to mock the getter for supabase so it returns null
            Object.defineProperty(SupabaseService, 'supabase', {
                get: () => null,
                configurable: true
            });

            const result = await EmailService.loadConfigFromCloud();
            expect(result).toBeNull();
        });

        it('parses config, calls saveConfigLocal, and returns config on success', async () => {
            const mockData = { host: 'smtp.example.com', user: 'test' };

            // Setup supabase mock
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { data: JSON.stringify(mockData) }, error: null })
            };

            Object.defineProperty(SupabaseService, 'supabase', {
                get: () => mockSupabase,
                configurable: true
            });

            const result = await EmailService.loadConfigFromCloud();

            expect(mockSupabase.from).toHaveBeenCalledWith('app_settings');
            expect(mockSupabase.select).toHaveBeenCalledWith('data');
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'smtp_config');
            expect(mockSupabase.single).toHaveBeenCalled();

            expect(setItemSpy).toHaveBeenCalledWith('imrs_smtp_config', JSON.stringify(mockData));
            expect(result).toEqual(mockData);
        });

        it('returns null without logging an error if error code is PGRST116', async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
            };

            Object.defineProperty(SupabaseService, 'supabase', {
                get: () => mockSupabase,
                configurable: true
            });

            const result = await EmailService.loadConfigFromCloud();

            expect(console.error).not.toHaveBeenCalled();
            expect(result).toBeNull();
            expect(setItemSpy).not.toHaveBeenCalled();
        });

        it('logs error and returns null if error code is different', async () => {
            const mockError = { code: 'OTHER_ERR', message: 'Something went wrong' };
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: mockError })
            };

            Object.defineProperty(SupabaseService, 'supabase', {
                get: () => mockSupabase,
                configurable: true
            });

            const result = await EmailService.loadConfigFromCloud();

            expect(console.error).toHaveBeenCalledWith('Supabase load error:', mockError);
            expect(result).toBeNull();
            expect(setItemSpy).not.toHaveBeenCalled();
        });

        it('catches exceptions, logs warning, and returns null', async () => {
            const mockError = new Error('Network error');
            const mockSupabase = {
                from: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockRejectedValue(mockError)
            };

            Object.defineProperty(SupabaseService, 'supabase', {
                get: () => mockSupabase,
                configurable: true
            });

            const result = await EmailService.loadConfigFromCloud();

            expect(console.warn).toHaveBeenCalledWith('Could not load email config from cloud:', mockError.message);
            expect(result).toBeNull();
            expect(setItemSpy).not.toHaveBeenCalled();
        });
    });
});
