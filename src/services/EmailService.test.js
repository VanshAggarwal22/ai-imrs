import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from './EmailService';

const CONFIG_KEY = 'imrs_smtp_config';

describe('EmailService.getConfig', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Spy on console.error to prevent it from printing during tests and allow assertions
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return parsed config when valid JSON is in localStorage', () => {
        const mockConfig = {
            smtpHost: 'smtp.example.com',
            smtpUser: 'user@example.com',
            smtpPass: 'password123'
        };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(mockConfig));

        const result = EmailService.getConfig();

        expect(result).toEqual(mockConfig);
    });

    it('should return null when localStorage has no config', () => {
        const result = EmailService.getConfig();

        expect(result).toBeNull();
    });

    it('should return null and log error when localStorage contains invalid JSON', () => {
        localStorage.setItem(CONFIG_KEY, 'invalid-json');

        const result = EmailService.getConfig();

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Failed to parse email config', expect.any(Error));
    });
});
