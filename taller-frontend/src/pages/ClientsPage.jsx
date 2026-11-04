import PageShell from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';

export default function ClientsPage() {
  const { user } = useAuth();

  return (
    <PageShell title="Clientes" userName={user?.name || 'Usuario'}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Módulo</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Clientes</h1>
        <p className="mt-4 text-slate-300">
          Aquí se mostrará el listado de clientes, búsqueda por documento y registro de nuevos clientes.
        </p>
      </div>
    </PageShell>
  );
}
