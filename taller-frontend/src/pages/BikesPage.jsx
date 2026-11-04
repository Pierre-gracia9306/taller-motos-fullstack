import PageShell from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';

export default function BikesPage() {
  const { user } = useAuth();

  return (
    <PageShell title="Motos" userName={user?.name || 'Usuario'}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Módulo</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Motos</h1>
        <p className="mt-4 text-slate-300">
          Aquí se gestionará el inventario de motocicletas, por placa, marca, modelo y cliente asociado.
        </p>
      </div>
    </PageShell>
  );
}
