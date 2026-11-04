import { mockBikes } from '../data/mockData.js';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const bikeService = {
  getAll: async () => {
    await delay();
    return mockBikes;
  },

  findByPlate: async (plate) => {
    await delay();
    const normalized = String(plate || '').trim().toUpperCase();

    if (!normalized) {
      return null;
    }

    return mockBikes.find((bike) => bike.placa.toUpperCase() === normalized) ?? null;
  },

  create: async (payload) => {
    await delay();
    const bike = {
      id: Date.now(),
      ...payload,
      placa: String(payload.placa || '').toUpperCase(),
    };

    mockBikes.push(bike);
    return bike;
  },
};
