import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock sqlite3 before importing the app
vi.mock('sqlite3', () => {
    const mockDb = {
        get: vi.fn(),
        run: vi.fn()
    };
    return {
        default: {
            Database: function() { return mockDb; }
        }
    };
});

import { app } from './server.js';
import sqlite3 from 'sqlite3';

const mockDb = new sqlite3.Database();

describe('Server API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/data/:id', () => {
        it('should return JSON parsed data when id exists (Happy Path)', async () => {
            const testId = '123';
            const testData = { name: 'Test Data', value: 42 };

            // Mock db.get to yield the test row
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(null, { data: JSON.stringify(testData) });
            });

            const response = await request(app).get(`/api/data/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testData);
            expect(mockDb.get).toHaveBeenCalledTimes(1);
            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT data FROM storage WHERE id = ?',
                [testId],
                expect.any(Function)
            );
        });

        it('should return null when id does not exist (Not Found Path)', async () => {
            const testId = 'nonexistent';

            // Mock db.get to yield undefined (no row found)
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(null, undefined);
            });

            const response = await request(app).get(`/api/data/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeNull();
            expect(mockDb.get).toHaveBeenCalledTimes(1);
        });

        it('should return 500 when database error occurs (Error Path)', async () => {
            const testId = 'error-id';
            const dbError = new Error('Database connection failed');

            // Mock db.get to yield an error
            mockDb.get.mockImplementation((query, params, callback) => {
                callback(dbError, null);
            });

            const response = await request(app).get(`/api/data/${testId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: dbError.message });
            expect(mockDb.get).toHaveBeenCalledTimes(1);
        });
    });
});
