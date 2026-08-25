import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from './server.js';

describe('AI Intelligence Proxy API (/api/ai/intel)', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv };
        global.fetch = vi.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('should return 400 if query (q) is missing', async () => {
        const response = await request(app)
            .post('/api/ai/intel')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Missing search query parameter' });
    });

    it('should return mock results if SERPER_API_KEY is missing', async () => {
        delete process.env.SERPER_API_KEY;
        const companyName = 'TestCorp';

        const response = await request(app)
            .post('/api/ai/intel')
            .send({ q: `${companyName} manufacturing` });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('organic');
        expect(response.body).toHaveProperty('news');
        expect(response.body.organic.length).toBeGreaterThan(0);
        expect(response.body.organic[0].title).toContain(companyName);
    });

    it('should make API call and return data if SERPER_API_KEY is provided', async () => {
        process.env.SERPER_API_KEY = 'fake-api-key';
        const mockData = {
            organic: [{ title: 'Real API Result', snippet: 'Content' }]
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const response = await request(app)
            .post('/api/ai/intel')
            .send({ q: 'manufacturing', num: 3 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': 'fake-api-key',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: 'manufacturing', num: 3 })
        });
    });

    it('should handle API errors and return error data', async () => {
        process.env.SERPER_API_KEY = 'fake-api-key';
        const errorData = { message: 'Unauthorized' };

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => errorData
        });

        const response = await request(app)
            .post('/api/ai/intel')
            .send({ q: 'manufacturing' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual(errorData);
    });

    it('should handle fetch exception and return 500', async () => {
        process.env.SERPER_API_KEY = 'fake-api-key';

        global.fetch.mockRejectedValueOnce(new Error('Network failure'));

        const response = await request(app)
            .post('/api/ai/intel')
            .send({ q: 'manufacturing' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Network failure' });
    });
});
