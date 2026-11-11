import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';
import { bikeService } from '../services/bike.service';
import { clientService } from '../services/client.service';
import { getApiErrorMessage } from '../utils/apiError';

const emptyClientForm = {
  name: '',
  document_number: '',
  phone: '',
  email: '',
};

const emptyBikeForm = {
  placa: '',
  brand: '',
  model: '',
  cylinder: '',
};

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientBikes, setClientBikes] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [bikeForm, setBikeForm] = useState(emptyBikeForm);

  const loadClients = async () => {
    try {
      const response = await clientService.getAll();
      setClients(Array.isArray(response) ? response : []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cargar la lista de clientes.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (clientId) => {
    if (!clientId) {
      setClientBikes([]);
      setClientOrders([]);
      return;
    }

    try {
      const [bikesResponse, ordersResponse] = await Promise.all([
        bikeService.getByClient(clientId),
        api.get('/work-orders'),
      ]);

      const normalizedBikes = Array.isArray(bikesResponse) ? bikesResponse : [];
      const allOrders = Array.isArray(ordersResponse?.data?.data)
        ? ordersResponse.data.data
        : Array.isArray(ordersResponse?.data)
          ? ordersResponse.data
          : [];

      const clientOrdersFiltered = allOrders.filter((order) => {
        const orderClientName = String(order.client_name || '').toLowerCase();
        const orderClientDocument = String(order.client_document || '').toLowerCase();
        const selectedName = String(selectedClient?.name || '').toLowerCase();
        const selectedDocument = String(selectedClient?.document_number || '').toLowerCase();

        return (
          orderClientName.includes(selectedName) ||
          orderClientDocument.includes(selectedDocument) ||
          orderClientName === selectedName ||
          orderClientDocument === selectedDocument
        );
      });

      setClientBikes(normalizedBikes);
      setClientOrders(clientOrdersFiltered);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cargar la información del cliente.'),
      });
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!selectedClient) {
      setClientBikes([]);
      setClientOrders([]);
      return;
    }

    loadClientDetails(selectedClient.id);
  }, [selectedClient]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) => {
      const searchable = [
        client.name,
        client.document_number,
        client.phone,
        client.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [clients, search]);

  const handleClientChange = (event) => {
    const { name, value } = event.target;
    setClientForm((current) => ({ ...current, [name]: value }));
  };

  const handleBikeChange = (event) => {
    const { name, value } = event.target;
    setBikeForm((current) => ({ ...current, [name]: value }));
  };

  const resetClientForm = () => {
    setClientForm(emptyClientForm);
    setEditingClientId(null);
  };

  const openCreateClientModal = () => {
    resetClientForm();
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setEditingClientId(client.id);
    setClientForm({
      name: client.name || '',
      document_number: client.document_number || '',
      phone: client.phone || '',
      email: client.email || '',
    });
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (event) => {
    event.preventDefault();

    if (!clientForm.name || !clientForm.document_number || !clientForm.phone || !clientForm.email) {
      setMessage({ type: 'error', text: 'Todos los datos del cliente son obligatorios.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingClientId) {
        await clientService.update(editingClientId, clientForm);
        setMessage({ type: 'success', text: 'Cliente actualizado correctamente.' });
      } else {
        const createdClient = await clientService.create(clientForm);
        setSelectedClient(createdClient);
        setMessage({ type: 'success', text: 'Cliente creado correctamente.' });
      }

      setIsClientModalOpen(false);
      resetClientForm();
      await loadClients();
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo guardar el cliente.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBikeForClient = async (event) => {
    event.preventDefault();

    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Primero selecciona un cliente.' });
      return;
    }

    if (!bikeForm.placa || !bikeForm.brand || !bikeForm.model) {
      setMessage({ type: 'error', text: 'La placa, marca y modelo de la moto son obligatorios.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await bikeService.create({
        placa: bikeForm.placa.trim().toUpperCase(),
        brand: bikeForm.brand.trim(),
        model: bikeForm.model.trim(),
        cylinder: bikeForm.cylinder?.trim() || null,
        client_id: Number(selectedClient.id),
      });

      setBikeForm(emptyBikeForm);
      setIsBikeModalOpen(false);
      setMessage({ type: 'success', text: 'Motocicleta creada correctamente.' });
      await loadClientDetails(selectedClient.id);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo crear la motocicleta.'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Clientes" userName={user?.name || 'Usuario'}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Clientes</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Gestión de clientes</h1>
            </div>

            <Button type="button" className="max-w-56" onClick={openCreateClientModal}>
              Nuevo cliente
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <InputField
            id="search-client"
            label="Buscar cliente"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, documento, teléfono o correo"
          />
        </div>

        {message.text && message.type && !isClientModalOpen && !isBikeModalOpen && (
          <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Documento</th>
                    <th className="px-4 py-3 font-medium">Teléfono</th>
                    <th className="px-4 py-3 font-medium">Correo</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
                  {!loading && filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No se encontraron clientes.
                      </td>
                    </tr>
                  )}

                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={`cursor-pointer transition hover:bg-slate-800/40 ${
                        selectedClient?.id === client.id ? 'bg-cyan-500/5' : ''
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="px-4 py-3 font-medium text-white">{client.name || 'Sin nombre'}</td>
                      <td className="px-4 py-3">{client.document_number || 'Sin documento'}</td>
                      <td className="px-4 py-3">{client.phone || 'Sin teléfono'}</td>
                      <td className="px-4 py-3">{client.email || 'Sin correo'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditClientModal(client);
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-700"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedClient(client);
                              setIsBikeModalOpen(true);
                              setBikeForm(emptyBikeForm);
                            }}
                            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            + Moto
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            {selectedClient ? (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Cliente seleccionado</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{selectedClient.name}</h2>
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    <p>Documento: {selectedClient.document_number}</p>
                    <p>Teléfono: {selectedClient.phone}</p>
                    <p>Correo: {selectedClient.email}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">Motos</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBikeModalOpen(true);
                        setBikeForm(emptyBikeForm);
                      }}
                      className="text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      Agregar moto
                    </button>
                  </div>

                  {clientBikes.length === 0 ? (
                    <p className="text-sm text-slate-400">Este cliente todavía no tiene motos registradas.</p>
                  ) : (
                    <ul className="space-y-2">
                      {clientBikes.map((bike) => (
                        <li key={bike.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-200">
                          <div className="font-medium text-white">{bike.placa}</div>
                          <div className="mt-1 text-slate-400">
                            {bike.brand} {bike.model}
                            {bike.cylinder ? ` • ${bike.cylinder}` : ''}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                  <h3 className="text-lg font-semibold text-white">Historial de trabajos</h3>

                  {clientOrders.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">
                      No hay órdenes asociadas a este cliente en este momento.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {clientOrders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-white">{order.placa}</span>
                            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-sky-200">
                              {order.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {order.brand} • {order.model}
                          </p>
                          <p className="mt-2 text-sm text-slate-200">{order.fault_description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-6 text-slate-400">
                Selecciona un cliente para ver sus motos y trabajos asociados.
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
            Cargando clientes...
          </div>
        )}
      </div>

      <Modal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          resetClientForm();
        }}
        title={editingClientId ? 'Editar cliente' : 'Crear cliente'}
      >
        <form onSubmit={handleClientSubmit} className="space-y-4">
          {message.text && message.type && isClientModalOpen && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
          )}

          <InputField
            id="client-name"
            name="name"
            label="Nombre completo"
            value={clientForm.name}
            onChange={handleClientChange}
            placeholder="Ej: Ana García"
          />

          <InputField
            id="client-document"
            name="document_number"
            label="Documento"
            value={clientForm.document_number}
            onChange={handleClientChange}
            placeholder="1012345678"
          />

          <InputField
            id="client-phone"
            name="phone"
            label="Teléfono"
            value={clientForm.phone}
            onChange={handleClientChange}
            placeholder="3001234567"
          />

          <InputField
            id="client-email"
            name="email"
            label="Correo electrónico"
            type="email"
            value={clientForm.email}
            onChange={handleClientChange}
            placeholder="cliente@correo.com"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsClientModalOpen(false); resetClientForm(); }} className="w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-auto">
              {saving ? 'Guardando...' : editingClientId ? 'Actualizar cliente' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBikeModalOpen}
        onClose={() => {
          setIsBikeModalOpen(false);
          setBikeForm(emptyBikeForm);
        }}
        title={selectedClient ? `Agregar moto a ${selectedClient.name}` : 'Agregar moto'}
      >
        <form onSubmit={handleCreateBikeForClient} className="space-y-4">
          {message.text && message.type && isBikeModalOpen && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
          )}

          <InputField
            id="bike-placa"
            name="placa"
            label="Placa"
            value={bikeForm.placa}
            onChange={handleBikeChange}
            placeholder="RN-07"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="bike-brand"
              name="brand"
              label="Marca"
              value={bikeForm.brand}
              onChange={handleBikeChange}
              placeholder="Yamaha"
            />

            <InputField
              id="bike-model"
              name="model"
              label="Modelo"
              value={bikeForm.model}
              onChange={handleBikeChange}
              placeholder="R15"
            />
          </div>

          <InputField
            id="bike-cylinder"
            name="cylinder"
            label="Cilindrada"
            value={bikeForm.cylinder}
            onChange={handleBikeChange}
            placeholder="150 cc"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsBikeModalOpen(false); setBikeForm(emptyBikeForm); }} className="w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-auto">
              {saving ? 'Guardando...' : 'Guardar moto'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
