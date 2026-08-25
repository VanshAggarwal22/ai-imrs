import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleSheetService } from './GoogleSheetService';

describe('GoogleSheetService', () => {
    beforeEach(() => {
        // Mock global fetch
        global.fetch = vi.fn();

        // Spy on console.error
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // Reset webAppUrl
        GoogleSheetService.webAppUrl = '';
        localStorage.clear();
    });

    describe('syncAll', () => {
        it('should return early if webAppUrl is not set', async () => {
            GoogleSheetService.setWebAppUrl(''); // Ensure it's not set

            await GoogleSheetService.syncAll({ some: 'payload' });

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should call fetch with correct URL, method, headers, and body when webAppUrl is set', async () => {
            const testUrl = 'https://script.google.com/macros/s/test-id/exec';
            GoogleSheetService.setWebAppUrl(testUrl);

            const payload = { data: 'test_data' };
            await GoogleSheetService.syncAll(payload);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(testUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'sync_all', payload })
            });
        });

        it('should catch and log errors if fetch fails', async () => {
            const testUrl = 'https://script.google.com/macros/s/test-id/exec';
            GoogleSheetService.setWebAppUrl(testUrl);

            const error = new Error('Network error');
            global.fetch.mockRejectedValueOnce(error);

            const payload = { data: 'test_data' };
            await GoogleSheetService.syncAll(payload);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('Failed to sync to Google Sheets', error);
        });
    });
});
