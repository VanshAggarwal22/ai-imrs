import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from './server.js';

describe('POST /api/ai/chat', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NVIDIA_API_KEY = 'test-key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NVIDIA_API_KEY;
  });

  test('should return 500 and error data when fetch response is not ok', async () => {
    const mockErrorData = { error: { message: 'Invalid API key' } };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue(mockErrorData)
    });

    const response = await request(app)
      .post('/api/ai/chat')
      .send({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'hello' }]
      });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
    expect(response.body).toEqual(mockErrorData);
  });
});
