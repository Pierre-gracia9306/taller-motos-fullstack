import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { workOrderService } from '../services/workOrder.service';

const statusOptions = ['RECIBIDA', 'DIAGNOSTICO', 'EN_REPARACION', 'LISTA', 'ENTREGADA', 'CANCELADA'];

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await workOrderService.getAll();
        setOrders(Array.isArray(data) ? data : data?.orders ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const recibidas = orders.filter((order) => order.status === 'RECIBIDA').length;
    const enProceso = orders.filter((order) => ['DIAGNOSTICO', 'EN_REPARACION', 'LISTA'].includes(order.status)).length;
    const entregadas = orders.filter((order) => order.status === 'ENTREGADA').length;
    const canceladas = orders.filter((order) => order.status === 'CANCELADA').length;
    const valorEstimado = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return { total, recibidas, enProceso, entregadas, canceladas, valorEstimado };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.placa?.toLowerCase().includes(query) ||
        order.client_name?.toLowerCase().includes(query) ||
        String(order.id).includes(query);

      const matchesStatus = !status || order.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  return (
    <PageShell title="Órdenes de trabajo" userName={user?.name || 'Usuario'}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Operación</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Listado de órdenes</h1>
          </div>

          <Link
            to="/work-orders/new"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Registrar ingreso
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total" value={stats.total} hint="órdenes activas" accent="cyan" />
          <StatCard label="Recibidas" value={stats.recibidas} hint="por entrar" accent="amber" />
          <StatCard label="En proceso" value={stats.enProceso} hint="diagnóstico y reparación" accent="violet" />
          <StatCard label="Entregadas" value={stats.entregadas} hint="cerradas" accent="emerald" />
          <StatCard label="Valor estimado" value={`$${stats.valorEstimado.toLocaleString('es-CO')}`} hint="total acumulado" accent="red" />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por orden, placa o cliente"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">
            Cargando órdenes...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-cyan-500/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Orden</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Moto</th>
                    <th className="px-4 py-3 font-medium">Falla</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No hay órdenes con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-medium text-white"># {order.id}</td>
                        <td className="px-4 py-3">{order.client_name || 'Sin cliente'}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-100">{order.brand || 'Moto'} {order.model || ''}</div>
                          <div className="text-xs text-slate-400">{order.placa || 'Sin placa'}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{order.fault_description || 'Sin descripción'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-100">
                          ${Number(order.total || 0).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/work-orders/${order.id}`)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-500/40 hover:bg-slate-700"
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
