import { vi } from 'vitest';
process.env.VITE_SUPABASE_URL = 'http://localhost';
process.env.VITE_SUPABASE_ANON_KEY = 'anon-key';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;
