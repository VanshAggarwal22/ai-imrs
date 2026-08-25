import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from './server.js';

describe('POST /api/ai/chat', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        // Reset fetch mock safely
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('should return 500 when neither NVIDIA nor Groq API keys are provided', async () => {
        // Ensure keys are undefined
        delete process.env.NVIDIA_API_KEY;
        delete process.env.VITE_NVIDIA_API_KEY;
        delete process.env.GROQ_API_KEY;
        delete process.env.VITE_GROQ_API_KEY;

        const response = await request(app)
            .post('/api/ai/chat')
            .send({ model: 'test-model', messages: [] });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'AI API Key not configured on server (neither NVIDIA nor Groq set)' });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should successfully proxy to NVIDIA API when NVIDIA key is set', async () => {
        process.env.NVIDIA_API_KEY = 'test-nvidia-key';

        const mockApiResponse = { choices: [{ message: { content: 'NVIDIA reply' } }] };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const reqBody = { model: 'nvidia-model', messages: [{ role: 'user', content: 'hello' }] };

        const response = await request(app)
            .post('/api/ai/chat')
            .send(reqBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApiResponse);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-nvidia-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqBody)
            })
        );
    });

    it('should fallback to Groq when NVIDIA key is missing, and map deepseek-r1 correctly', async () => {
        delete process.env.NVIDIA_API_KEY;
        delete process.env.VITE_NVIDIA_API_KEY;
        process.env.GROQ_API_KEY = 'test-groq-key';

        const mockApiResponse = { choices: [{ message: { content: 'Groq reply' } }] };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const reqBody = { model: 'some-deepseek-r1-model', messages: [{ role: 'user', content: 'hi' }] };

        const response = await request(app)
            .post('/api/ai/chat')
            .send(reqBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApiResponse);

        const expectedBody = { ...reqBody, model: 'deepseek-r1-distill-llama-70b' };

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.groq.com/openai/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-groq-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expectedBody)
            })
        );
    });

    it('should fallback to Groq when NVIDIA key is missing, and map default model correctly', async () => {
        delete process.env.NVIDIA_API_KEY;
        delete process.env.VITE_NVIDIA_API_KEY;
        process.env.VITE_GROQ_API_KEY = 'test-vite-groq-key';

        const mockApiResponse = { choices: [{ message: { content: 'Groq default reply' } }] };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const reqBody = { model: 'other-model', messages: [{ role: 'user', content: 'hi' }] };

        const response = await request(app)
            .post('/api/ai/chat')
            .send(reqBody);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockApiResponse);

        const expectedBody = { ...reqBody, model: 'llama-3.3-70b-versatile' };

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.groq.com/openai/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-vite-groq-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expectedBody)
            })
        );
    });

    it('should forward upstream error status and data when fetch response is not ok', async () => {
        process.env.NVIDIA_API_KEY = 'test-nvidia-key';

        const mockErrorResponse = { error: { message: 'Invalid token' } };
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => mockErrorResponse
        });

        const reqBody = { model: 'nvidia-model', messages: [] };

        const response = await request(app)
            .post('/api/ai/chat')
            .send(reqBody);

        expect(response.status).toBe(401);
        expect(response.body).toEqual(mockErrorResponse);
    });

    it('should return 500 when fetch throws an error', async () => {
        process.env.NVIDIA_API_KEY = 'test-nvidia-key';

        global.fetch.mockRejectedValueOnce(new Error('Network failure'));

        const reqBody = { model: 'nvidia-model', messages: [] };

        const response = await request(app)
            .post('/api/ai/chat')
            .send(reqBody);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Network failure' });
    });
});
