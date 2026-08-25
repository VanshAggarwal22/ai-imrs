import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './AiService.js';

describe('AiService', () => {
    describe('discoverLeads', () => {
        beforeEach(() => {
            global.fetch = vi.fn();
        });

        it('should successfully parse a valid JSON response', async () => {
            const mockLeads = [
                {
                    id: '1',
                    company: 'Test Company',
                    location: 'Test City',
                    industry: 'Automotive',
                    size: '50-200',
                    matchScore: 95,
                    intent: 'High (Expansion)'
                }
            ];

            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: JSON.stringify(mockLeads)
                            }
                        }
                    ]
                })
            };

            global.fetch.mockResolvedValue(mockFetchResponse);

            const result = await AiService.discoverLeads('Find 1 automotive manufacturer');

            expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }));
            expect(result).toEqual(mockLeads);
        });

        it('should strip markdown formatting and parse JSON correctly', async () => {
            const mockLeads = [
                {
                    id: '2',
                    company: 'Markdown Company',
                    location: 'Test City',
                    industry: 'Manufacturing',
                    size: '1000+',
                    matchScore: 85,
                    intent: 'Medium'
                }
            ];

            const markdownContent = `\`\`\`json\n${JSON.stringify(mockLeads)}\n\`\`\``;

            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: markdownContent
                            }
                        }
                    ]
                })
            };

            global.fetch.mockResolvedValue(mockFetchResponse);

            const result = await AiService.discoverLeads('Find 1 manufacturing company');
            expect(result).toEqual(mockLeads);
        });

        it('should throw an error if the fetch response is not ok', async () => {
            const mockFetchResponse = {
                ok: false,
                status: 500
            };

            global.fetch.mockResolvedValue(mockFetchResponse);

            await expect(AiService.discoverLeads('Find leads')).rejects.toThrow('Failed to fetch from AI Proxy');
        });
    });
});
