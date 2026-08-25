import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, db } from './server.js';

vi.mock('sqlite3', () => {
    return {
        default: {
            Database: vi.fn().mockImplementation(function (filename, callback) {
                // Return immediately without calling callback right away
                // The issue was calling the callback synchronously which made `db` variable undefined
                // in the closure when `db.run` was called on initialization.

                setTimeout(() => {
                    if (callback) callback(null);
                }, 0);

                return {
                    run: vi.fn(),
                    get: vi.fn()
                };
            })
        }
    };
});

describe('POST /api/data/:id', () => {
    it('should return success: true on successful insert', async () => {
        // Mock the implementation for this specific test
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback.call(db, null);
        });

        const response = await request(app)
            .post('/api/data/123')
            .send({ hello: 'world' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });

        expect(db.run).toHaveBeenCalledWith(
            'INSERT OR REPLACE INTO storage (id, data) VALUES (?, ?)',
            ['123', JSON.stringify({ hello: 'world' })],
            expect.any(Function)
        );
    });

    it('should return 500 on database error', async () => {
        const mockError = new Error('Database insertion failed');

        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback.call(db, mockError);
        });

        const response = await request(app)
            .post('/api/data/123')
            .send({ hello: 'world' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database insertion failed' });
    });
});