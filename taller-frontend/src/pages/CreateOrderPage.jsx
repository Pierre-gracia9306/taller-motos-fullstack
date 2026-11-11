import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { bikeService } from '../services/bike.service';
import { clientService } from '../services/client.service';
import { workOrderService } from '../services/workOrder.service';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    clientName: '',
    documentNumber: '',
    phone: '',
    email: '',
    placa: '',
    brand: '',
    model: '',
    cylinder: '',
    faultDescription: '',
  });

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [showClientCreator, setShowClientCreator] = useState(false);
  const [clientDraft, setClientDraft] = useState({
    name: '',
    document_number: '',
    phone: '',
    email: '',
  });
  const [creatingClient, setCreatingClient] = useState(false);

  const [bikeSearch, setBikeSearch] = useState('');
  const [existingBike, setExistingBike] = useState(null);
  const [isSearchingBike, setIsSearchingBike] = useState(false);
  const [showBikeCreator, setShowBikeCreator] = useState(false);
  const [bikeDraft, setBikeDraft] = useState({
    placa: '',
    brand: '',
    model: '',
    cylinder: '',
  });
  const [creatingBike, setCreatingBike] = useState(false);

  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canUseExistingClient = useMemo(
    () => Boolean(selectedClient || clientResults.length > 0),
    [clientResults.length, selectedClient]
  );

  useEffect(() => {
    const query = clientSearch.trim();

    if (query.length < 2) {
      setClientResults([]);
      return;
    }

    let active = true;
    const searchClients = async () => {
      setIsSearchingClient(true);

      try {
        const data = await clientService.search(query);
        if (!active) return;
        setClientResults(Array.isArray(data) ? data : data?.clients ?? []);
      } catch {
        if (active) setClientResults([]);
      } finally {
        if (active) setIsSearchingClient(false);
      }
    };

    searchClients();

    return () => {
      active = false;
    };
  }, [clientSearch]);

  useEffect(() => {
    const plate = form.placa.trim();

    if (!plate || plate.length < 3) {
      setExistingBike(null);
      return;
    }

    let active = true;
    const searchBike = async () => {
      setIsSearchingBike(true);

      try {
        const data = await bikeService.findByPlate(plate);
        if (!active) return;

        const bike = Array.isArray(data) ? data[0] : data;
        setExistingBike(bike || null);

        if (bike) {
          setForm((current) => ({
            ...current,
            placa: bike.placa || current.placa,
            brand: bike.brand || current.brand,
            model: bike.model || current.model,
            cylinder: bike.cylinder || current.cylinder,
          }));
        }
      } catch {
        if (active) setExistingBike(null);
      } finally {
        if (active) setIsSearchingBike(false);
      }
    };

    searchBike();

    return () => {
      active = false;
    };
  }, [form.placa]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setFeedback('');
  };

  const handleClientDraftChange = (event) => {
    const { name, value } = event.target;
    setClientDraft((current) => ({ ...current, [name]: value }));
    setError('');
    setFeedback('');
  };

  const handleBikeDraftChange = (event) => {
    const { name, value } = event.target;
    setBikeDraft((current) => ({ ...current, [name]: value }));
    setError('');
    setFeedback('');
  };

  const applyClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.name || '');
    setForm((current) => ({
      ...current,
      clientName: client.name || current.clientName,
      documentNumber: client.document_number || current.documentNumber,
      phone: client.phone || current.phone,
      email: client.email || current.email,
    }));
    setError('');
    setFeedback(`Cliente encontrado: ${client.name}`);
    setShowClientCreator(false);
  };

  const handleClientManualReset = () => {
    setSelectedClient(null);
    setClientResults([]);
    setClientSearch('');
    setShowClientCreator(false);
    setClientDraft({ name: '', document_number: '', phone: '', email: '' });
    setForm((current) => ({
      ...current,
      clientName: '',
      documentNumber: '',
      phone: '',
      email: '',
    }));
  };

  const handleCreateClientFromOrder = async () => {
    const { name, document_number, phone, email } = clientDraft;

    if (!name || !document_number || !phone || !email) {
      setError('Completa nombre, documento, teléfono y correo para crear el cliente.');
      return;
    }

    setCreatingClient(true);
    setError('');
    setFeedback('');

    try {
      const createdClient = await clientService.create({
        name: name.trim(),
        document_number: document_number.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      setSelectedClient(createdClient);
      setClientSearch(createdClient.name || '');
      setForm((current) => ({
        ...current,
        clientName: createdClient.name || current.clientName,
        documentNumber: createdClient.document_number || current.documentNumber,
        phone: createdClient.phone || current.phone,
        email: createdClient.email || current.email,
      }));
      setClientDraft({ name: '', document_number: '', phone: '', email: '' });
      setShowClientCreator(false);
      setFeedback('Cliente creado correctamente. Ya puedes continuar con la orden.');
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          'No se pudo crear el cliente.'
      );
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCreateBikeFromOrder = async () => {
    if (!selectedClient) {
      setError('Primero selecciona o crea un cliente antes de registrar la moto.');
      return;
    }

    const { placa, brand, model, cylinder } = bikeDraft;

    if (!placa || !brand || !model) {
      setError('La placa, marca y modelo son obligatorios para crear la motocicleta.');
      return;
    }

    setCreatingBike(true);
    setError('');
    setFeedback('');

    try {
      const createdBike = await bikeService.create({
        placa: placa.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        cylinder: cylinder?.trim() || null,
        client_id: selectedClient.id,
      });

      setExistingBike(createdBike);
      setForm((current) => ({
        ...current,
        placa: createdBike.placa || current.placa,
        brand: createdBike.brand || current.brand,
        model: createdBike.model || current.model,
        cylinder: createdBike.cylinder || current.cylinder,
      }));
      setBikeDraft({ placa: '', brand: '', model: '', cylinder: '' });
      setShowBikeCreator(false);
      setFeedback('Motocicleta creada correctamente. Ya puedes registrar la orden.');
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          'No se pudo crear la motocicleta.'
      );
    } finally {
      setCreatingBike(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      form.clientName,
      form.documentNumber,
      form.phone,
      form.email,
      form.placa,
      form.brand,
      form.model,
      form.faultDescription,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setError('Todos los campos obligatorios deben completarse.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFeedback('');

    try {
      let client = selectedClient;

      if (!client) {
        client = await clientService.create({
          name: form.clientName.trim(),
          document_number: form.documentNumber.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        });
        setSelectedClient(client);
      }

      let bike = existingBike;

      if (!bike) {
        bike = await bikeService.create({
          placa: form.placa.toUpperCase(),
          brand: form.brand.trim(),
          model: form.model.trim(),
          cylinder: form.cylinder || null,
          client_id: client.id,
        });
        setExistingBike(bike);
      }

      const order = await workOrderService.create({
        bike_id: bike.id,
        fault_description: form.faultDescription,
      });

      if (!order || !order.id) {
        throw new Error('La orden no se pudo crear correctamente en el backend.');
      }

      setFeedback('Orden creada correctamente.');
      navigate(`/work-orders/${order.id}`);
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message ||
        submitError?.message ||
        'No se pudo registrar la orden de trabajo.';

      setError(message);

      if (message.toLowerCase().includes('cliente') || message.toLowerCase().includes('no existe') || message.toLowerCase().includes('no encontrado')) {
        setShowClientCreator(true);
      }

      if (message.toLowerCase().includes('moto') || message.toLowerCase().includes('placa')) {
        setShowBikeCreator(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell title="Nueva orden" userName={user?.name || 'Usuario'}>
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Registro</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Registrar ingreso de moto</h1>
        </div>

        {feedback && <Alert variant="success" className="mb-5">{feedback}</Alert>}
        {error && <Alert variant="error" className="mb-5">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Cliente</h2>
              {canUseExistingClient && (
                <button
                  type="button"
                  onClick={handleClientManualReset}
                  className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  Limpiar selección
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={clientSearch}
                onChange={(event) => {
                  setClientSearch(event.target.value);
                  setSelectedClient(null);
                }}
                placeholder="Busca por nombre, documento o correo"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />

              <button
                type="button"
                onClick={() => setClientSearch((current) => current.trim())}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Buscar
              </button>
            </div>

            {isSearchingClient && (
              <p className="text-sm text-slate-400">Buscando clientes disponibles...</p>
            )}

            {!selectedClient && clientSearch.trim().length >= 2 && clientResults.length === 0 && !isSearchingClient && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                No se encontró un cliente con esos datos. Si no existe, puedes crearlo haciendo clic en{' '}
                <button
                  type="button"
                  onClick={() => setShowClientCreator(true)}
                  className="font-bold underline underline-offset-4 text-amber-100 hover:text-white"
                >
                  Crear cliente
                </button>
                .
              </div>
            )}

            {clientResults.length > 0 && (
              <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                {clientResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => applyClient(client)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-left transition hover:border-cyan-500/40 hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.document_number} · {client.phone}</p>
                    </div>
                    <span className="text-xs text-cyan-300">Seleccionar</span>
                  </button>
                ))}
              </div>
            )}

            {!selectedClient && !clientSearch.trim() && (
              <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
                Si no aparece el cliente, crea uno desde{' '}
                <button
                  type="button"
                  onClick={() => setShowClientCreator(true)}
                  className="font-bold underline underline-offset-4 text-cyan-300 hover:text-cyan-200"
                >
                  Crear cliente
                </button>
                .
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="clientName"
                name="clientName"
                label="Nombre"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Juan Pérez"
              />
              <InputField
                id="documentNumber"
                name="documentNumber"
                label="Documento"
                value={form.documentNumber}
                onChange={handleChange}
                placeholder="12345678"
              />
              <InputField
                id="phone"
                name="phone"
                label="Teléfono"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="3001234567"
              />
              <InputField
                id="email"
                name="email"
                label="Correo"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="juan@email.com"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <h2 className="text-xl font-semibold text-white">Motocicleta</h2>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={form.placa}
                onChange={(event) => {
                  const nextValue = event.target.value.toUpperCase();
                  setForm((current) => ({ ...current, placa: nextValue }));
                  setError('');
                }}
                placeholder="Busca por placa (ej. ABC123)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />

              <button
                type="button"
                onClick={() => setBikeSearch(form.placa)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Buscar moto
              </button>
            </div>

            {isSearchingBike && <p className="text-sm text-slate-400">Consultando si la moto ya existe...</p>}

            {!existingBike && form.placa.trim().length >= 3 && !isSearchingBike && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                No se encontró la motocicleta. Puedes registrar una nueva haciendo clic en{' '}
                <button
                  type="button"
                  onClick={() => setShowBikeCreator(true)}
                  className="font-bold underline underline-offset-4 text-amber-100 hover:text-white"
                >
                  Crear motocicleta
                </button>
                .
              </div>
            )}

            {!existingBike && !form.placa.trim() && (
              <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300">
                Si la moto no aparece, puedes crearla desde{' '}
                <button
                  type="button"
                  onClick={() => setShowBikeCreator(true)}
                  className="font-bold underline underline-offset-4 text-cyan-300 hover:text-cyan-200"
                >
                  Crear motocicleta
                </button>
                .
              </div>
            )}

            {existingBike && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                Se encontró una moto registrada: <strong>{existingBike.brand} {existingBike.model}</strong> con placa <strong>{existingBike.placa}</strong>.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="placa"
                name="placa"
                label="Placa"
                value={form.placa}
                onChange={handleChange}
                placeholder="ABC123"
              />
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
              <InputField
                id="cylinder"
                name="cylinder"
                label="Cilindraje"
                value={form.cylinder}
                onChange={handleChange}
                placeholder="155cc"
              />
            </div>
          </section>

          <section>
            <label htmlFor="faultDescription" className="mb-2 block text-sm font-medium text-slate-200">
              Descripción de la falla
            </label>
            <textarea
              id="faultDescription"
              name="faultDescription"
              value={form.faultDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Describe el problema reportado por el cliente..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </section>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" className="max-w-45" onClick={() => navigate('/work-orders')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="max-w-55">
              {isSubmitting ? 'Guardando...' : 'Registrar orden'}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={showClientCreator} onClose={() => setShowClientCreator(false)} title="Crear cliente">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="newClientName"
              name="name"
              label="Nombre del cliente"
              value={clientDraft.name}
              onChange={handleClientDraftChange}
              placeholder="Nombre completo"
            />
            <InputField
              id="newClientDocument"
              name="document_number"
              label="Documento"
              value={clientDraft.document_number}
              onChange={handleClientDraftChange}
              placeholder="12345678"
            />
            <InputField
              id="newClientPhone"
              name="phone"
              label="Teléfono"
              type="tel"
              value={clientDraft.phone}
              onChange={handleClientDraftChange}
              placeholder="3001234567"
            />
            <InputField
              id="newClientEmail"
              name="email"
              label="Correo"
              type="email"
              value={clientDraft.email}
              onChange={handleClientDraftChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowClientCreator(false)} className="max-w-45">
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateClientFromOrder} disabled={creatingClient} className="max-w-55">
              {creatingClient ? 'Creando cliente...' : 'Crear y usar cliente'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBikeCreator} onClose={() => setShowBikeCreator(false)} title="Crear motocicleta">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              id="newBikePlaca"
              name="placa"
              label="Placa"
              value={bikeDraft.placa}
              onChange={handleBikeDraftChange}
              placeholder="ABC123"
            />
            <InputField
              id="newBikeBrand"
              name="brand"
              label="Marca"
              value={bikeDraft.brand}
              onChange={handleBikeDraftChange}
              placeholder="Yamaha"
            />
            <InputField
              id="newBikeModel"
              name="model"
              label="Modelo"
              value={bikeDraft.model}
              onChange={handleBikeDraftChange}
              placeholder="R15"
            />
            <InputField
              id="newBikeCylinder"
              name="cylinder"
              label="Cilindraje"
              value={bikeDraft.cylinder}
              onChange={handleBikeDraftChange}
              placeholder="155cc"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowBikeCreator(false)} className="max-w-45">
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateBikeFromOrder} disabled={creatingBike} className="max-w-55">
              {creatingBike ? 'Registrando moto...' : 'Registrar y usar moto'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
