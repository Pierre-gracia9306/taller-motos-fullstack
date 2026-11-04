import api from '../config/axios.js';
import { mockUser } from '../data/mockData.js';

export const authService = {
  login: async (email, password) => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      if (!email || !password) {
        throw new Error('Email y contraseña requeridos.');
      }

      return {
        accessToken: 'mock-access-token',
        user: {
          ...mockUser,
          email,
        },
      };
    }

    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return { success: true };
    }

    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return { user: mockUser };
    }

    const response = await api.get('/auth/me');
    return response.data;
  },
};
