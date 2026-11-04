export const mockUser = {
  id: 1,
  name: 'Ana Gómez',
  email: 'admin@tallermotos.com',
  role: 'ADMIN',
};

export const mockClients = [
  {
    id: 1,
    name: 'Ana Gómez',
    document_number: '12345678',
    phone: '3001234567',
    email: 'ana@tallermotos.com',
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    document_number: '98765432',
    phone: '3109876543',
    email: 'carlos@correo.com',
  },
  {
    id: 3,
    name: 'Luisa Torres',
    document_number: '45678901',
    phone: '3011122334',
    email: 'luisa@correo.com',
  },
];

export const mockBikes = [
  {
    id: 1,
    placa: 'ABC123',
    brand: 'Yamaha',
    model: 'R15',
    cylinder: '155cc',
    client_id: 1,
  },
  {
    id: 2,
    placa: 'XYZ987',
    brand: 'Honda',
    model: 'CB 190',
    cylinder: '190cc',
    client_id: 2,
  },
  {
    id: 3,
    placa: 'DEF456',
    brand: 'Kawasaki',
    model: 'Ninja 400',
    cylinder: '400cc',
    client_id: 3,
  },
];

export const mockOrders = [
  {
    id: 1,
    bike_id: 1,
    entry_date: '2026-11-02',
    fault_description: 'Moto con falla en encendido y pérdida de aceleración.',
    status: 'RECIBIDA',
    total: 0,
    created_at: '2026-11-02T09:00:00.000Z',
    updated_at: '2026-11-02T09:00:00.000Z',
    placa: 'ABC123',
    brand: 'Yamaha',
    model: 'R15',
    cylinder: '155cc',
    client_id: 1,
    client_name: 'Ana Gómez',
    client_document: '12345678',
    client_phone: '3001234567',
    client_email: 'ana@tallermotos.com',
    items: [
      { id: 11, type: 'REPUESTO', description: 'Bujía NGK', count: 1, unit_value: 28000 },
      { id: 12, type: 'MANO_DE_OBRA', description: 'Diagnóstico y ajuste de encendido', count: 1, unit_value: 65000 },
    ],
    history: [
      {
        id: 101,
        work_order_id: 1,
        from_status: null,
        to_status: 'RECIBIDA',
        note: 'Orden registrada por ingreso del cliente.',
        created_at: '2026-11-02T09:00:00.000Z',
      },
    ],
  },
  {
    id: 2,
    bike_id: 2,
    entry_date: '2026-11-03',
    fault_description: 'Freno delantero con ruido y desgaste de disco.',
    status: 'EN_REPARACION',
    total: 0,
    created_at: '2026-11-03T11:15:00.000Z',
    updated_at: '2026-11-03T11:15:00.000Z',
    placa: 'XYZ987',
    brand: 'Honda',
    model: 'CB 190',
    cylinder: '190cc',
    client_id: 2,
    client_name: 'Carlos Ruiz',
    client_document: '98765432',
    client_phone: '3109876543',
    client_email: 'carlos@correo.com',
    items: [
      { id: 21, type: 'REPUESTO', description: 'Pastillas de freno', count: 2, unit_value: 42000 },
      { id: 22, type: 'MANO_DE_OBRA', description: 'Cambio y ajuste de frenos', count: 1, unit_value: 90000 },
    ],
    history: [
      {
        id: 201,
        work_order_id: 2,
        from_status: null,
        to_status: 'RECIBIDA',
        note: 'Ingreso de moto con falla de frenos.',
        created_at: '2026-11-03T11:15:00.000Z',
      },
      {
        id: 202,
        work_order_id: 2,
        from_status: 'RECIBIDA',
        to_status: 'EN_REPARACION',
        note: 'Se inició diagnóstico y reparación.',
        created_at: '2026-11-03T13:00:00.000Z',
      },
    ],
  },
  {
    id: 3,
    bike_id: 3,
    entry_date: '2026-11-04',
    fault_description: 'Revisión general y ajuste de cadena.',
    status: 'LISTA',
    total: 0,
    created_at: '2026-11-04T08:45:00.000Z',
    updated_at: '2026-11-04T12:20:00.000Z',
    placa: 'DEF456',
    brand: 'Kawasaki',
    model: 'Ninja 400',
    cylinder: '400cc',
    client_id: 3,
    client_name: 'Luisa Torres',
    client_document: '45678901',
    client_phone: '3011122334',
    client_email: 'luisa@correo.com',
    items: [
      { id: 31, type: 'REPUESTO', description: 'Cadena y piñón', count: 1, unit_value: 180000 },
      { id: 32, type: 'MANO_DE_OBRA', description: 'Alineación y ajuste final', count: 1, unit_value: 110000 },
    ],
    history: [
      {
        id: 301,
        work_order_id: 3,
        from_status: null,
        to_status: 'RECIBIDA',
        note: 'Moto recibida para revisión.',
        created_at: '2026-11-04T08:45:00.000Z',
      },
      {
        id: 302,
        work_order_id: 3,
        from_status: 'RECIBIDA',
        to_status: 'LISTA',
        note: 'Reparación completada y lista para entrega.',
        created_at: '2026-11-04T12:20:00.000Z',
      },
    ],
  },
];

export function getMockOrderTotal(items = []) {
  return items.reduce((sum, item) => sum + Number(item.count || 0) * Number(item.unit_value || 0), 0);
}
