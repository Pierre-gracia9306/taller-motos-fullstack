import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/axios.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../config/axios.js';
import { authService } from './auth.service.js';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe exponer un objeto con las propiedades esperadas', () => {
    expect(authService).toEqual(
      expect.objectContaining({
        login: expect.any(Function),
        logout: expect.any(Function),
        getProfile: expect.any(Function),
      })
    );
  });

  it.each([
    {
      name: 'login',
      method: 'login',
      args: ['juan@test.com', '123456'],
      request: ['/auth/login', { email: 'juan@test.com', password: '123456' }],
      apiMethod: 'post',
      response: { data: { token: 'abc123' } },
    },
    {
      name: 'logout',
      method: 'logout',
      args: [],
      request: ['/auth/logout'],
      apiMethod: 'post',
      response: { data: { success: true } },
    },
    {
      name: 'getProfile',
      method: 'getProfile',
      args: [],
      request: ['/auth/me'],
      apiMethod: 'get',
      response: { data: { id: 1, name: 'Juan' } },
    },
  ])(
    '$name debe invocar la operación esperada',
    async ({ method, args, request, apiMethod, response }) => {
      api[apiMethod].mockResolvedValue(response);

      const result = await authService[method](...args);

      expect(api[apiMethod]).toHaveBeenCalledTimes(1);
      expect(api[apiMethod]).toHaveBeenCalledWith(...request);
      expect(result).toEqual(response.data);
    }
  );
});
