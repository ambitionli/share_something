import { describe, it, expect } from 'vitest';
import { api, ADMIN_TOKEN_KEY } from './api';

describe('api client', () => {
  it('uses baseURL http://localhost:8000', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8000');
  });

  it('exposes admin token storage key', () => {
    expect(ADMIN_TOKEN_KEY).toBe('admin_token');
  });
});
