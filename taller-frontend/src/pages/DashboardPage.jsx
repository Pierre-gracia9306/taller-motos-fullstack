import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { workOrderService } from '../services/workOrder.service';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
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
    const recibida = orders.filter((order) => order.status === 'RECIBIDA').length;
    const diagnostico = orders.filter((order) => order.status === 'DIAGNOSTICO').length;
    const reparacion = orders.filter((order) => order.status === 'EN_REPARACION').length;
    const lista = orders.filter((order) => order.status === 'LISTA').length;
    const entregada = orders.filter((order) => order.status === 'ENTREGADA').length;

    return { total, recibida, diagnostico, reparacion, lista, entregada };
  }, [orders]);

  const latestOrders = orders.slice(0, 5);

  return (
    <PageShell title="Dashboard" userName={user?.name || 'Usuario'}>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Vista general</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Panel del taller</h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/work-orders"
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Ver órdenes
            </Link>
            <Link
              to="/work-orders/new"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Nueva orden
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">
            Cargando información del taller...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Total" value={stats.total} hint="órdenes registradas" accent="cyan" />
              <StatCard label="Recibidas" value={stats.recibida} hint="en ingreso" accent="amber" />
              <StatCard label="Diagnóstico" value={stats.diagnostico} hint="pendientes" accent="violet" />
              <StatCard label="En reparación" value={stats.reparacion} hint="trabajo activo" accent="violet" />
              <StatCard label="Entregadas" value={stats.entregada} hint="cerradas" accent="emerald" />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Últimas órdenes</h2>
                <Link to="/work-orders" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
                  Ver todas
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Orden</th>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Placa</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-200">
                    {latestOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3"># {order.id}</td>
                        <td className="px-4 py-3">{order.client_name || 'Sin nombre'}</td>
                        <td className="px-4 py-3">{order.placa || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
