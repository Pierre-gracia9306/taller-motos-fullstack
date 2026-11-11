import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { bikeService } from '../services/bike.service';
import { clientService } from '../services/client.service';
import { getApiErrorMessage } from '../utils/apiError';

const emptyForm = {
  placa: '',
  brand: '',
  model: '',
  cylinder: '',
  client_id: '',
};

const emptyClientForm = {
  name: '',
  document_number: '',
  phone: '',
  email: '',
};

export default function BikesPage() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [showClientCreator, setShowClientCreator] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const bikeResponse = await bikeService.getAll();
      const normalizedBikes = Array.isArray(bikeResponse) ? bikeResponse : [];

      setBikes(normalizedBikes);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cargar la información de motos.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const query = clientQuery.trim();

    if (!query) {
      setClientResults([]);
      return;
    }

    let active = true;

    const searchClients = async () => {
      try {
        const data = await clientService.search(query);
        if (!active) return;
        setClientResults(Array.isArray(data) ? data : []);
      } catch {
        if (active) setClientResults([]);
      }
    };

    searchClients();

    return () => {
      active = false;
    };
  }, [clientQuery]);

  const filteredBikes = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return bikes;

    return bikes.filter((bike) => {
      const searchableText = [
        bike.placa,
        bike.brand,
        bike.model,
        bike.client_name,
        bike.client_document,
        bike.client_email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(q);
    });
  }, [bikes, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleClientFormChange = (event) => {
    const { name, value } = event.target;
    setClientForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setClientForm(emptyClientForm);
    setEditingId(null);
    setSelectedClient(null);
    setClientQuery('');
    setClientResults([]);
    setShowClientCreator(false);
    setCreatingClient(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.placa || !form.brand || !form.model || !form.client_id) {
      setMessage({ type: 'error', text: 'Placa, marca, modelo y propietario son obligatorios.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        placa: form.placa.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        cylinder: form.cylinder?.trim() || null,
        client_id: Number(form.client_id),
      };

      if (editingId) {
        await bikeService.update(editingId, payload);
        setMessage({ type: 'success', text: 'Motocicleta actualizada correctamente.' });
      } else {
        await bikeService.create(payload);
        setMessage({ type: 'success', text: 'Motocicleta creada correctamente.' });
      }

      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo guardar la motocicleta.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bike) => {
    setEditingId(bike.id);
    setForm({
      placa: bike.placa || '',
      brand: bike.brand || '',
      model: bike.model || '',
      cylinder: bike.cylinder || '',
      client_id: bike.client_id ? String(bike.client_id) : '',
    });
    setSelectedClient({
      id: bike.client_id,
      name: bike.client_name,
      document_number: bike.client_document,
      phone: bike.client_phone,
      email: bike.client_email,
    });
    setClientQuery(bike.client_name || '');
    setClientResults([]);
    setClientForm(emptyClientForm);
    setShowClientCreator(false);
    setIsModalOpen(true);
    setMessage({ type: '', text: '' });
  };

  const handleClientPick = (client) => {
    setSelectedClient(client);
    setClientQuery(client.name || '');
    setForm((current) => ({ ...current, client_id: String(client.id) }));
    setClientResults([]);
    setShowClientCreator(false);
    setMessage({ type: '', text: '' });
  };

  const handleCreateClient = async () => {
    const { name, document_number, phone, email } = clientForm;

    if (!name || !document_number || !phone || !email) {
      setMessage({
        type: 'error',
        text: 'Para crear el cliente debes completar nombre, documento, teléfono y correo.',
      });
      return;
    }

    setCreatingClient(true);
    setMessage({ type: '', text: '' });

    try {
      const newClient = await clientService.create({
        name: name.trim(),
        document_number: document_number.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      setSelectedClient(newClient);
      setClientQuery(newClient.name || '');
      setClientForm(emptyClientForm);
      setForm((current) => ({ ...current, client_id: String(newClient.id) }));
      setShowClientCreator(false);
      setMessage({ type: 'success', text: 'Cliente creado correctamente. Ya puedes guardar la motocicleta.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo crear el cliente.'),
      });
    } finally {
      setCreatingClient(false);
    }
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <PageShell title="Motos" userName={user?.name || 'Usuario'}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Inventario</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Motos</h1>
            </div>

            <Button type="button" className="max-w-56" onClick={handleOpenCreateModal}>
              {editingId ? 'Nueva motocicleta' : 'Agregar motocicleta'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <InputField
                id="search-bike"
                label="Buscar motocicleta"
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Placa, marca, modelo o cliente"
              />
            </div>
          </div>
        </div>

        {message.text && message.type && !isModalOpen && (
          <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Placa</th>
                  <th className="px-4 py-3 font-medium">Marca</th>
                  <th className="px-4 py-3 font-medium">Modelo</th>
                  <th className="px-4 py-3 font-medium">Cilindrada</th>
                  <th className="px-4 py-3 font-medium">Propietario</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
                {!loading && filteredBikes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No se encontraron motocicletas.
                    </td>
                  </tr>
                )}

                {filteredBikes.map((bike) => (
                  <tr key={bike.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-white">{bike.placa || 'Sin placa'}</td>
                    <td className="px-4 py-3">{bike.brand || 'Sin marca'}</td>
                    <td className="px-4 py-3">{bike.model || 'Sin modelo'}</td>
                    <td className="px-4 py-3">{bike.cylinder || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-100">{bike.client_name || 'Sin propietario'}</span>
                        <span className="text-xs text-slate-400">{bike.client_document || 'Sin documento'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEdit(bike)}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
            Cargando motocicletas...
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? 'Editar motocicleta' : 'Crear motocicleta'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message.text && message.type && isModalOpen && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="client-search" className="block text-sm font-medium text-slate-200">
              Propietario
            </label>

            <input
              id="client-search"
              type="text"
              value={clientQuery}
              onChange={(event) => setClientQuery(event.target.value)}
              placeholder="Buscar cliente por nombre o documento"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />

            {!editingId && !selectedClient && !showClientCreator && clientQuery.trim() && clientResults.length === 0 && (
              <button
                type="button"
                onClick={() => setShowClientCreator(true)}
                className="mt-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                No encontré el cliente. Crear nuevo cliente
              </button>
            )}

            {clientResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                {clientResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientPick(client)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                  >
                    <span>
                      <span className="block font-medium">{client.name}</span>
                      <span className="text-xs text-slate-400">{client.document_number}</span>
                    </span>
                    <span className="text-xs text-cyan-300">Seleccionar</span>
                  </button>
                ))}
              </div>
            )}

            {selectedClient && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <div className="font-medium">Cliente seleccionado</div>
                <div>{selectedClient.name}</div>
                <div className="text-xs text-emerald-200/80">{selectedClient.document_number}</div>
              </div>
            )}
          </div>

          {showClientCreator && (
            <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Crear cliente</h3>
                <button
                  type="button"
                  onClick={() => setShowClientCreator(false)}
                  className="text-xs text-slate-400 transition hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  id="client-name"
                  name="name"
                  label="Nombre completo"
                  value={clientForm.name}
                  onChange={handleClientFormChange}
                  placeholder="Ej: Carlos Gómez"
                />

                <InputField
                  id="client-document"
                  name="document_number"
                  label="Documento"
                  value={clientForm.document_number}
                  onChange={handleClientFormChange}
                  placeholder="123456789"
                />

                <InputField
                  id="client-phone"
                  name="phone"
                  label="Teléfono"
                  value={clientForm.phone}
                  onChange={handleClientFormChange}
                  placeholder="3001234567"
                />

                <InputField
                  id="client-email"
                  name="email"
                  label="Correo"
                  type="email"
                  value={clientForm.email}
                  onChange={handleClientFormChange}
                  placeholder="cliente@correo.com"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  className="w-auto"
                  disabled={creatingClient}
                  onClick={handleCreateClient}
                >
                  {creatingClient ? 'Creando cliente...' : 'Guardar cliente'}
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="placa"
              name="placa"
              label="Placa"
              value={form.placa}
              onChange={handleChange}
              placeholder="RN-07"
            />

            <InputField
              id="cylinder"
              name="cylinder"
              label="Cilindrada"
              value={form.cylinder}
              onChange={handleChange}
              placeholder="150 cc"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="brand"
              name="brand"
              label="Marca"
              value={form.brand}
              onChange={handleChange}
              placeholder="Yamaha"
            />

            <InputField
              id="model"
              name="model"
              label="Modelo"
              value={form.model}
              onChange={handleChange}
              placeholder="R15"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-auto">
              {saving ? 'Guardando...' : editingId ? 'Actualizar moto' : 'Crear moto'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
