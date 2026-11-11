import api from '../config/axios.js';

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/users', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },

  changePassword: async (id, payload) => {
    const response = await api.patch(`/users/${id}/change-password`, payload);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  },
};
