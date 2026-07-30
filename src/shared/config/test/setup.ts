import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from '@/shared/api/mocks/server';
import { mockStore } from '@/shared/api/mocks/store';

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  mockStore.reset();
});

afterAll(() => {
  server.close();
});
