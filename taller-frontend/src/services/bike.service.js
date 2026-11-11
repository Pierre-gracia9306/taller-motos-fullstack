import api from '../config/axios.js';

const normalizeResponse = (response) => response?.data?.data ?? response?.data ?? [];

export const bikeService = {
  getAll: async () => {
    const response = await api.get('/bikes');
    return normalizeResponse(response);
  },

  findByPlate: async (plate) => {
    const normalized = String(plate || '').trim();

    if (!normalized) {
      return null;
    }

    const response = await api.get(`/bikes/placa/${encodeURIComponent(normalized)}`);
    return response?.data?.data ?? response?.data ?? null;
  },

  getByClient: async (clientId) => {
    const response = await api.get(`/bikes/client/${encodeURIComponent(clientId)}`);
    return normalizeResponse(response);
  },

  create: async (payload) => {
    const response = await api.post('/bikes', payload);
    return response?.data?.data ?? response?.data ?? null;
  },

  update: async (id, payload) => {
    const response = await api.put(`/bikes/${id}`, payload);
    return response?.data?.data ?? response?.data ?? null;
  },
};
