export default function StatusBadge({ status }) {
  const map = {
    RECIBIDA: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
    DIAGNOSTICO: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    EN_REPARACION: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
    LISTA: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    ENTREGADA: 'border-emerald-600/40 bg-emerald-600/10 text-emerald-100',
    CANCELADA: 'border-red-500/40 bg-red-500/10 text-red-200',
  };

  const label = String(status || '').replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${map[status] || 'border-slate-600 bg-slate-800 text-slate-200'}`}
    >
      {label}
    </span>
  );
}
