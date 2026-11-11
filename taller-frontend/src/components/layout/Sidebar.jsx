import SidebarItem from './SidebarItem';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: '▣' },
  { label: 'Órdenes', to: '/work-orders', icon: '🧾' },
  { label: 'Nuevo ingreso', to: '/work-orders/new', icon: '＋' },
  { label: 'Clientes', to: '/clients', icon: '👥' },
  { label: 'Motos', to: '/bikes', icon: '🏍️' },
  { label: 'Usuarios', to: '/users', icon: '👤' },
  { label: 'Perfil', to: '/profile', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-900/80 p-5 lg:block">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
          Taller Motos
        </div>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} label={item.label} to={item.to} icon={item.icon} />
        ))}
      </nav>
    </aside>
  );
}
