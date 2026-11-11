import api from '../config/axios.js';

const normalizeResponse = (response) => response?.data?.data ?? response?.data ?? [];

export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients');
    return normalizeResponse(response);
  },

  search: async (query = '') => {
    const q = String(query || '').trim();

    if (!q) {
      return [];
    }

    const response = await api.get('/clients/search', {
      params: { q },
    });

    return normalizeResponse(response);
  },

  create: async (payload) => {
    const response = await api.post('/clients', payload);
    return response?.data?.data ?? response?.data ?? null;
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response?.data?.data ?? response?.data ?? null;
  },

  update: async (id, payload) => {
    const response = await api.put(`/clients/${id}`, payload);
    return response?.data?.data ?? response?.data ?? null;
  },
};
