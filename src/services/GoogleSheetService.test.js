import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetService } from './GoogleSheetService';

describe('GoogleSheetService.fetchAll', () => {
    // Mock the global fetch
    const originalFetch = global.fetch;
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        // Reset webAppUrl before each test
        GoogleSheetService.webAppUrl = 'http://mock-url.com';
        vi.clearAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        mockConsoleError.mockClear();
    });

    it('should return data on successful fetch', async () => {
        const mockData = [{ id: 1, name: 'Item 1' }];
        const mockResponse = {
            json: vi.fn().mockResolvedValue({ success: true, data: mockData }),
        };
        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        const result = await GoogleSheetService.fetchAll();

        expect(global.fetch).toHaveBeenCalledWith('http://mock-url.com');
        expect(result).toEqual(mockData);
    });

    it('should return null if webAppUrl is not set', async () => {
        GoogleSheetService.webAppUrl = '';
        global.fetch = vi.fn();

        const result = await GoogleSheetService.fetchAll();

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('should return falsy if fetch succeeds but success is false', async () => {
        const mockResponse = {
            json: vi.fn().mockResolvedValue({ success: false, data: [] }),
        };
        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        const result = await GoogleSheetService.fetchAll();

        expect(global.fetch).toHaveBeenCalledWith('http://mock-url.com');
        expect(result).toBeFalsy();
    });

    it('should return falsy and log error if fetch throws an error', async () => {
        const mockError = new Error('Network error');
        global.fetch = vi.fn().mockRejectedValue(mockError);

        const result = await GoogleSheetService.fetchAll();

        expect(global.fetch).toHaveBeenCalledWith('http://mock-url.com');
        expect(mockConsoleError).toHaveBeenCalledWith("Failed to fetch from Google Sheets", mockError);
        expect(result).toBeFalsy();
    });
});
