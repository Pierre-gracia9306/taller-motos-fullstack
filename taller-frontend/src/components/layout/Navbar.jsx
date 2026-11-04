export default function Navbar({ title = 'Taller Motos', userName = 'Usuario' }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Panel</p>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-slate-200">{userName}</span>
        </div>
      </div>
    </header>
  );
}
