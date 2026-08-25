/* global global */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from './EmailService';

describe('EmailService', () => {
    describe('sendEmail', () => {
        let getConfigSpy;
        let originalFetch;

        beforeEach(() => {
            getConfigSpy = vi.spyOn(EmailService, 'getConfig');
            originalFetch = global.fetch;
            global.fetch = vi.fn();
        });

        afterEach(() => {
            vi.restoreAllMocks();
            global.fetch = originalFetch;
        });

        it('should throw an error if SMTP configuration is missing', async () => {
            getConfigSpy.mockReturnValue(null);

            await expect(EmailService.sendEmail('test@example.com', 'Test', '<p>Test</p>'))
                .rejects
                .toThrow('SMTP Configuration is missing. Please configure it in the Settings page.');
        });

        it('should throw an error if required SMTP properties are missing', async () => {
            getConfigSpy.mockReturnValue({ smtpHost: 'smtp.example.com' }); // Missing user and pass

            await expect(EmailService.sendEmail('test@example.com', 'Test', '<p>Test</p>'))
                .rejects
                .toThrow('SMTP Configuration is missing. Please configure it in the Settings page.');
        });

        it('should throw an error if the API response is not ok', async () => {
            getConfigSpy.mockReturnValue({
                smtpHost: 'smtp.example.com',
                smtpUser: 'user',
                smtpPass: 'pass'
            });

            global.fetch.mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'API Error' })
            });

            await expect(EmailService.sendEmail('test@example.com', 'Test', '<p>Test</p>'))
                .rejects
                .toThrow('API Error');
        });

        it('should successfully send an email with correct payload', async () => {
            const config = {
                smtpHost: 'smtp.example.com',
                smtpUser: 'user',
                smtpPass: 'pass',
                fromName: 'Custom Name'
            };
            getConfigSpy.mockReturnValue(config);

            const mockResponseData = { success: true };
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponseData
            });

            const to = 'test@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<p>Hello</p>';
            const attachments = [{ filename: 'test.pdf', content: 'base64' }];

            const result = await EmailService.sendEmail(to, subject, htmlContent, attachments);

            expect(result).toEqual(mockResponseData);
            expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    to,
                    subject,
                    html: htmlContent,
                    fromName: 'Custom Name',
                    attachments
                })
            });
        });

        it('should use default fromName if not provided in config', async () => {
            const config = {
                smtpHost: 'smtp.example.com',
                smtpUser: 'user',
                smtpPass: 'pass'
            };
            getConfigSpy.mockReturnValue(config);

            const mockResponseData = { success: true };
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponseData
            });

            const to = 'test@example.com';
            const subject = 'Test Subject';
            const htmlContent = '<p>Hello</p>';

            const result = await EmailService.sendEmail(to, subject, htmlContent);

            expect(result).toEqual(mockResponseData);
            expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    to,
                    subject,
                    html: htmlContent,
                    fromName: 'IMRS', // default value
                    attachments: []
                })
            });
        });
    });
});
