import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AiService } from './AiService.js';

describe('AiService.discoverLeads', () => {
    let fetchSpy;

    beforeEach(() => {
        // Mock global fetch
        fetchSpy = vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
        // Restore fetch to its original implementation
        vi.restoreAllMocks();
    });

    it('should successfully parse clean JSON', async () => {
        const mockJsonResponse = [
            { id: '1', company: 'Tech Corp', location: 'Pune', industry: 'IT', size: '50-200', matchScore: 90, intent: 'High' }
        ];

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify(mockJsonResponse)
                        }
                    }
                ]
            })
        });

        const leads = await AiService.discoverLeads('Find 1 IT company in Pune');

        expect(leads).toEqual(mockJsonResponse);
        expect(fetchSpy).toHaveBeenCalledWith('/api/ai/chat', expect.any(Object));
    });

    it('should successfully parse markdown-wrapped JSON (edge case)', async () => {
        const mockJsonResponse = [
            { id: '1', company: 'Tech Corp', location: 'Pune', industry: 'IT', size: '50-200', matchScore: 90, intent: 'High' }
        ];

        const markdownContent = `\`\`\`json\n${JSON.stringify(mockJsonResponse, null, 2)}\n\`\`\``;

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: markdownContent
                        }
                    }
                ]
            })
        });

        const leads = await AiService.discoverLeads('Find 1 IT company in Pune');

        expect(leads).toEqual(mockJsonResponse);
    });

    it('should throw an error if the AI API fetch fails', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false
        });

        await expect(AiService.discoverLeads('Find 1 IT company in Pune')).rejects.toThrow('Failed to fetch from AI Proxy');
    });
});
