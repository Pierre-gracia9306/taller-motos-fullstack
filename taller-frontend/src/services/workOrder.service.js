import { getMockOrderTotal, mockOrders } from '../data/mockData.js';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const workOrderService = {
  getAll: async (filters = {}) => {
    await delay();

    let orders = [...mockOrders];

    if (filters.status) {
      orders = orders.filter((order) => order.status === filters.status);
    }

    if (filters.plate) {
      orders = orders.filter((order) =>
        (order.placa || '').toLowerCase().includes(String(filters.plate).toLowerCase())
      );
    }

    return orders.map((order) => ({
      ...order,
      total: getMockOrderTotal(order.items || []),
    }));
  },

  getById: async (id) => {
    await delay();
    const order = mockOrders.find((item) => String(item.id) === String(id));

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    return {
      ...order,
      total: getMockOrderTotal(order.items || []),
    };
  },

  getByPlate: async (plate) => {
    await delay();
    return mockOrders.filter((order) =>
      (order.placa || '').toLowerCase().includes(String(plate).toLowerCase())
    );
  },

  create: async (payload) => {
    await delay();
    const newOrder = {
      id: Date.now(),
      bike_id: payload.bike_id,
      entry_date: new Date().toISOString().slice(0, 10),
      fault_description: payload.fault_description,
      status: 'RECIBIDA',
      total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      placa: 'N/A',
      brand: 'Moto',
      model: 'Nueva',
      client_name: 'Cliente nuevo',
      items: [],
      history: [
        {
          id: Date.now() + 1,
          work_order_id: Date.now(),
          from_status: null,
          to_status: 'RECIBIDA',
          note: 'Orden creada desde registro de ingreso.',
          created_at: new Date().toISOString(),
        },
      ],
    };

    const orderWithDetails = {
      ...newOrder,
      ...payload,
    };

    mockOrders.push(orderWithDetails);
    return orderWithDetails;
  },

  updateStatus: async (id, status, note) => {
    await delay();
    const order = mockOrders.find((item) => String(item.id) === String(id));

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const previousStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();
    order.history.push({
      id: Date.now(),
      work_order_id: order.id,
      from_status: previousStatus,
      to_status: status,
      note,
      created_at: new Date().toISOString(),
    });

    return {
      ...order,
      total: getMockOrderTotal(order.items || []),
    };
  },

  addItem: async (id, item) => {
    await delay();
    const order = mockOrders.find((entry) => String(entry.id) === String(id));

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const newItem = {
      id: Date.now(),
      ...item,
    };

    order.items = [...(order.items || []), newItem];
    order.total = getMockOrderTotal(order.items || []);
    order.updated_at = new Date().toISOString();

    return {
      ...order,
      total: order.total,
    };
  },

  removeItem: async (id, itemId) => {
    await delay();
    const order = mockOrders.find((entry) => String(entry.id) === String(id));

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    order.items = (order.items || []).filter((item) => String(item.id) !== String(itemId));
    order.total = getMockOrderTotal(order.items || []);
    order.updated_at = new Date().toISOString();

    return {
      ...order,
      total: order.total,
    };
  },

  getHistory: async (id) => {
    await delay();
    const order = mockOrders.find((entry) => String(entry.id) === String(id));

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    return order.history || [];
  },
};
