import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from '../AiService';

describe('AiService.generateEmail', () => {
    const mockLead = {
        contact: 'John Doe',
        company: 'Tech Corp',
        industry: 'Software',
        location: 'San Francisco',
        size: '100-500',
        intent: 'High (Looking for new suppliers)'
    };

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('should successfully generate an email using default company name', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: '  Subject: Streamline your supply chain\n\nHi John,\n\nThis is a mocked email.  '
                    }
                }
            ]
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        const result = await AiService.generateEmail(mockLead);

        expect(result).toBe('Subject: Streamline your supply chain\n\nHi John,\n\nThis is a mocked email.');

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }));

        const fetchCall = global.fetch.mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);

        expect(requestBody.model).toBe('meta/llama-3.1-70b-instruct');
        expect(requestBody.temperature).toBe(0.7);
        expect(requestBody.max_tokens).toBe(4096);
        expect(requestBody.messages).toHaveLength(1);
        expect(requestBody.messages[0].role).toBe('user');

        const prompt = requestBody.messages[0].content;
        expect(prompt).toContain('John Doe');
        expect(prompt).toContain('Tech Corp');
        expect(prompt).toContain('Software');
        expect(prompt).toContain('San Francisco');
        expect(prompt).toContain('100-500');
        expect(prompt).toContain('High (Looking for new suppliers)');
        expect(prompt).toContain('Aggarwal Industries');
    });

    it('should use custom company name when provided', async () => {
        const mockResponse = {
            choices: [
                {
                    message: {
                        content: 'Mocked email'
                    }
                }
            ]
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        await AiService.generateEmail(mockLead, 'Custom Springs Inc');

        const fetchCall = global.fetch.mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);
        const prompt = requestBody.messages[0].content;

        expect(prompt).toContain('Custom Springs Inc');
        expect(prompt).not.toContain('Aggarwal Industries');
    });

    it('should use default contact title when contact is "TBD"', async () => {
        const mockResponse = {
            choices: [{ message: { content: 'Mocked email' } }]
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        const leadWithoutContact = { ...mockLead, contact: 'TBD' };
        await AiService.generateEmail(leadWithoutContact);

        const fetchCall = global.fetch.mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);
        const prompt = requestBody.messages[0].content;

        expect(prompt).toContain('The Procurement Manager');
        expect(prompt).not.toContain('TBD');
    });

    it('should throw an error when fetch fails', async () => {
        global.fetch.mockResolvedValue({
            ok: false
        });

        await expect(AiService.generateEmail(mockLead)).rejects.toThrow('Failed to fetch from AI Proxy');
    });
});
