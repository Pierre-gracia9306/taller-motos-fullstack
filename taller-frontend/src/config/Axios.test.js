import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from './axios.js'; // Importamos tu archivo de configuración de axios

describe('Configuración de api (axios.js)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('Debe agregar el token de autorización en los headers si existe en localStorage', () => {
    localStorage.setItem('accessToken', 'token-super-secreto-123');
    const config = { headers: {} };
    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = interceptorHandler(config);
    expect(modifiedConfig.headers.Authorization).toBe('Bearer token-super-secreto-123');
  });

  it('No debe agregar el header de autorización si no hay token en localStorage', () => {
    const config = { headers: {} };
    const interceptorHandler = api.interceptors.request.handlers[0].fulfilled;
    const modifiedConfig = interceptorHandler(config);
    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('Debe refrescar el token y reintentar la petición al recibir 401', async () => {
    localStorage.setItem('accessToken', 'old-token');

    const originalRequest = { url: '/protected', headers: {} };
    const error = { config: originalRequest, response: { status: 401 } };

    const refreshResp = { data: { data: { accessToken: 'new-token-456' } } };
    api.post = vi.fn(() => Promise.resolve(refreshResp));
    api.request = vi.fn(() => Promise.resolve({ data: { success: true } }));

    const rejectedHandler = api.interceptors.response.handlers[0].rejected;
    const result = await rejectedHandler(error);

    expect(api.post).toHaveBeenCalledWith('/auth/refresh-token');
    expect(localStorage.getItem('accessToken')).toBe('new-token-456');
    expect(api.request).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: { success: true } });
  });

  it('Si el refresh falla debe limpiar localStorage y redirigir a /', async () => {
    localStorage.setItem('accessToken', 'old-token');

    const originalRequest = { url: '/protected', headers: {} };
    const error = { config: originalRequest, response: { status: 401 } };

    api.post = vi.fn(() => Promise.reject(new Error('refresh failed')));

    const originalLocation = window.location;
    // Reemplazamos window.location para poder evaluar la redirección
    // eslint-disable-next-line no-global-assign
    delete window.location;
    // eslint-disable-next-line no-global-assign
    window.location = { href: '' };

    const rejectedHandler = api.interceptors.response.handlers[0].rejected;

    await rejectedHandler(error).catch(() => {});

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/');

    // Restaurar location
    // eslint-disable-next-line no-global-assign
    window.location = originalLocation;
  });
});