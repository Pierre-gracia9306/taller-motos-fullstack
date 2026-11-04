import { mockClients } from '../data/mockData.js';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const clientService = {
  getAll: async () => {
    await delay();
    return mockClients;
  },

  search: async (query = '') => {
    await delay();
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return mockClients;
    }

    return mockClients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalized) ||
        client.document_number.includes(normalized) ||
        client.email.toLowerCase().includes(normalized)
    );
  },

  create: async (payload) => {
    await delay();
    const client = {
      id: Date.now(),
      ...payload,
    };

    mockClients.push(client);
    return client;
  },
};
