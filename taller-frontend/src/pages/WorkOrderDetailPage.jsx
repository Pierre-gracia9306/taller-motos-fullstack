import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { workOrderService } from '../services/workOrder.service';

const STATUS_OPTIONS = ['RECIBIDA', 'DIAGNOSTICO', 'EN_REPARACION', 'LISTA', 'ENTREGADA', 'CANCELADA'];

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [itemForm, setItemForm] = useState({ type: 'REPUESTO', description: '', count: 1, unit_value: 0 });

  const loadOrder = async () => {
    try {
      const [orderData, historyData] = await Promise.all([
        workOrderService.getById(id),
        workOrderService.getHistory(id),
      ]);

      setOrder(orderData || null);
      setHistory(Array.isArray(historyData) ? historyData : historyData?.history ?? []);
      setStatus(orderData?.status || '');
      setError('');
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'No se pudo cargar la orden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const total = useMemo(() => {
    return (order?.items ?? []).reduce(
      (sum, item) => sum + Number(item.count || 0) * Number(item.unit_value || 0),
      0
    );
  }, [order]);

  const handleStatusChange = async (event) => {
    event.preventDefault();

    if (!status || !note.trim()) {
      setError('Debes seleccionar un estado y dejar una nota de cambio.');
      return;
    }

    try {
      await workOrderService.updateStatus(id, status, note);
      setNote('');
      await loadOrder();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  const handleAddItem = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        type: itemForm.type,
        description: itemForm.description,
        count: Number(itemForm.count),
        unit_value: Number(itemForm.unit_value),
      };

      if (!payload.description.trim()) {
        setError('La descripción del ítem es obligatoria.');
        return;
      }

      await workOrderService.addItem(id, payload);
      setItemForm({ type: 'REPUESTO', description: '', count: 1, unit_value: 0 });
      await loadOrder();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'No se pudo agregar el ítem.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await workOrderService.removeItem(id, itemId);
      await loadOrder();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'No se pudo eliminar el ítem.');
    }
  };

  if (loading) {
    return (
      <PageShell title="Orden" userName={user?.name || 'Usuario'}>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">
          Cargando detalle de la orden...
        </div>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell title="Orden" userName={user?.name || 'Usuario'}>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-red-200">
          {error || 'No se encontró la orden solicitada.'}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={`Orden #${order.id}`} userName={user?.name || 'Usuario'}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Detalle</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Orden #{order.id}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              type="button"
              onClick={() => navigate('/work-orders')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Volver
            </button>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Resumen del vehículo</h2>
                <span className="text-sm text-slate-300">Ingreso: {order.entry_date || 'Sin fecha'}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.client_name}</p>
                  <p className="mt-1 text-sm text-slate-400">{order.client_document || 'Sin documento'}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Motocicleta</p>
                  <p className="mt-2 text-lg font-semibold text-white">{order.brand} {order.model}</p>
                  <p className="mt-1 text-sm text-slate-400">Placa {order.placa}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Falla reportada</p>
                  <p className="mt-2 text-base text-slate-200">{order.fault_description}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Ítems de la orden</h2>
                <span className="text-sm text-slate-300">Total estimado: ${Number(total).toLocaleString('es-CO')}</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Descripción</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-200">
                    {(order.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          Aún no hay ítems registrados.
                        </td>
                      </tr>
                    ) : (
                      (order.items || []).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.type}</td>
                          <td className="px-4 py-3">{item.description}</td>
                          <td className="px-4 py-3">{item.count}</td>
                          <td className="px-4 py-3">${Number(item.unit_value || 0).toLocaleString('es-CO')}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-xs font-medium text-red-300 hover:text-red-200"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Estado de la orden</h2>

              <form onSubmit={handleStatusChange} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Estado</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="">Selecciona un estado</option>
                    {STATUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Nota</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    placeholder="Describe el cambio de estado..."
                  />
                </div>

                <Button type="submit" className="max-w-full">Guardar estado</Button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Agregar ítem</h2>

              <form onSubmit={handleAddItem} className="space-y-4">
                <select
                  value={itemForm.type}
                  onChange={(event) => setItemForm((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="REPUESTO">Repuesto</option>
                  <option value="MANO_OBRA">Mano de obra</option>
                </select>

                <InputField
                  id="itemDescription"
                  name="description"
                  label="Descripción"
                  value={itemForm.description}
                  onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Cambio de aceite"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    id="itemCount"
                    name="count"
                    label="Cantidad"
                    type="number"
                    value={itemForm.count}
                    onChange={(event) => setItemForm((current) => ({ ...current, count: Number(event.target.value) || 1 }))}
                  />

                  <InputField
                    id="unitValue"
                    name="unit_value"
                    label="Valor unitario"
                    type="number"
                    value={itemForm.unit_value}
                    onChange={(event) => setItemForm((current) => ({ ...current, unit_value: Number(event.target.value) || 0 }))}
                  />
                </div>

                <Button type="submit" variant="secondary">Agregar ítem</Button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Auditoría</h2>

              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin historial de cambios.</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge status={entry.to_status} />
                        <span className="text-xs text-slate-400">{entry.created_at}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{entry.note}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
