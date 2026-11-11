import api from '../config/axios.js';

const normalizeResponse = (response) => response?.data?.data ?? response?.data ?? [];

export const workOrderService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/work-orders');
    const orders = normalizeResponse(response);

    const items = Array.isArray(orders) ? orders : [];
    const { status, plate } = filters;

    return items.filter((order) => {
      const matchesStatus = !status || order.status === status;
      const matchesPlate = !plate || (order.placa || '').toLowerCase().includes(String(plate).toLowerCase());
      return matchesStatus && matchesPlate;
    });
  },

  getById: async (id) => {
    const response = await api.get(`/work-orders/${id}`);
    return response?.data?.data ?? response?.data ?? null;
  },

  getByPlate: async (plate) => {
    const normalized = String(plate || '').trim();

    if (!normalized) {
      return [];
    }

    const response = await api.get(`/work-orders/placa/${encodeURIComponent(normalized)}`);
    return normalizeResponse(response);
  },

  create: async (payload) => {
    const response = await api.post('/work-orders', payload);
    return response?.data?.data ?? response?.data ?? null;
  },

  updateStatus: async (id, status, note) => {
    const response = await api.patch(`/work-orders/${id}/status`, { status, note });
    return response?.data?.data ?? response?.data ?? null;
  },

  addItem: async (id, item) => {
    const response = await api.post(`/work-orders/${id}/items`, item);
    return response?.data?.data ?? response?.data ?? null;
  },

  removeItem: async (id, itemId) => {
    const response = await api.delete(`/work-orders/${id}/items/${itemId}`);
    return response?.data?.data ?? response?.data ?? null;
  },

  getHistory: async (id) => {
    const response = await api.get(`/work-orders/${id}/history`);
    return normalizeResponse(response);
  },
};
