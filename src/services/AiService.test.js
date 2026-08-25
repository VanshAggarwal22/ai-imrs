import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './AiService';

describe('AiService', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    describe('gatherIntelligence', () => {
        const mockCompanyName = "TestCorp";
        const mockSerperResponse = {
            organic: [{ snippet: "TestCorp is expanding its manufacturing." }],
            news: [{ title: "TestCorp announces new suppliers." }]
        };

        const mockNvidiaJsonResponse = {
            websiteAnalysis: "TestCorp manufactures widgets and needs springs.",
            newsSignals: "Expanding manufacturing and announcing suppliers.",
            competitorGap: "Pitch reliable OTD as supply chains are strained."
        };

        const createMockResponse = (ok, data) => ({
            ok,
            json: () => Promise.resolve(data)
        });

        it('should successfully gather intelligence (happy path)', async () => {
            global.fetch
                .mockResolvedValueOnce(createMockResponse(true, mockSerperResponse)) // Serper call
                .mockResolvedValueOnce(createMockResponse(true, { // NVIDIA call
                    choices: [{
                        message: {
                            content: JSON.stringify(mockNvidiaJsonResponse)
                        }
                    }]
                }));

            const result = await AiService.gatherIntelligence(mockCompanyName);

            // Verify first fetch (Serper)
            expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/ai/intel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q: `${mockCompanyName} manufacturing OR expansion OR suppliers OR "supply chain"`,
                    num: 5
                })
            });

            // Verify second fetch (NVIDIA)
            expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/ai/chat", expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }));

            // Extract body of second call to verify it contains the rawContent
            const secondCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
            expect(secondCallBody.messages[0].content).toContain("TestCorp is expanding its manufacturing.");
            expect(secondCallBody.messages[0].content).toContain("TestCorp announces new suppliers.");

            expect(result).toEqual(mockNvidiaJsonResponse);
        });

        it('should successfully gather intelligence and strip markdown', async () => {
            const markdownContent = `\`\`\`json\n${JSON.stringify(mockNvidiaJsonResponse)}\n\`\`\``;

            global.fetch
                .mockResolvedValueOnce(createMockResponse(true, mockSerperResponse)) // Serper call
                .mockResolvedValueOnce(createMockResponse(true, { // NVIDIA call
                    choices: [{
                        message: {
                            content: markdownContent
                        }
                    }]
                }));

            const result = await AiService.gatherIntelligence(mockCompanyName);
            expect(result).toEqual(mockNvidiaJsonResponse);
        });

        it('should throw error when Serper search fails', async () => {
            global.fetch.mockResolvedValueOnce(createMockResponse(false, {}));

            await expect(AiService.gatherIntelligence(mockCompanyName)).rejects.toThrow("Serper Search failed");

            // Should not make the second call
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error when AI proxy fails', async () => {
            global.fetch
                .mockResolvedValueOnce(createMockResponse(true, mockSerperResponse)) // Serper call
                .mockResolvedValueOnce(createMockResponse(false, {})); // NVIDIA call fails

            await expect(AiService.gatherIntelligence(mockCompanyName)).rejects.toThrow("Failed to fetch from AI Proxy");

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle missing organic or news arrays in Serper response gracefully', async () => {
            global.fetch
                .mockResolvedValueOnce(createMockResponse(true, {})) // Serper call without organic or news
                .mockResolvedValueOnce(createMockResponse(true, { // NVIDIA call
                    choices: [{
                        message: {
                            content: JSON.stringify(mockNvidiaJsonResponse)
                        }
                    }]
                }));

            const result = await AiService.gatherIntelligence(mockCompanyName);
            expect(result).toEqual(mockNvidiaJsonResponse);

            const secondCallBody = JSON.parse(global.fetch.mock.calls[1][1].body);
            expect(secondCallBody.messages[0].content).toContain('Organic Info:  \nNews: ');
        });
    });
});
