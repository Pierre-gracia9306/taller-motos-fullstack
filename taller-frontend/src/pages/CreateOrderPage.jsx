import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
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

  const [bikeSearch, setBikeSearch] = useState('');
  const [existingBike, setExistingBike] = useState(null);
  const [isSearchingBike, setIsSearchingBike] = useState(false);

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
  };

  const handleClientManualReset = () => {
    setSelectedClient(null);
    setClientResults([]);
    setClientSearch('');
    setForm((current) => ({
      ...current,
      clientName: '',
      documentNumber: '',
      phone: '',
      email: '',
    }));
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
          name: form.clientName,
          document_number: form.documentNumber,
          phone: form.phone,
          email: form.email,
        });
      }

      let bike = existingBike;

      if (!bike) {
        bike = await bikeService.create({
          placa: form.placa.toUpperCase(),
          brand: form.brand,
          model: form.model,
          cylinder: form.cylinder || null,
          client_id: client.id,
        });
      }

      const order = await workOrderService.create({
        bike_id: bike.id,
        fault_description: form.faultDescription,
      });

      setFeedback('Orden creada correctamente.');
      navigate(`/work-orders/${order.id}`);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          'No se pudo registrar la orden de trabajo.'
      );
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
            <Button type="button" variant="secondary" className="max-w-[180px]" onClick={() => navigate('/work-orders')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="max-w-[220px]">
              {isSubmitting ? 'Guardando...' : 'Registrar orden'}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
