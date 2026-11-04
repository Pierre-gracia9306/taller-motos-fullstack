export default function StatCard({ label, value, hint, accent = 'cyan' }) {
  const accentClasses = {
    cyan: 'from-cyan-500/20 to-sky-500/5 text-cyan-200 border-cyan-500/30',
    amber: 'from-amber-500/20 to-yellow-500/5 text-amber-200 border-amber-500/30',
    violet: 'from-violet-500/20 to-fuchsia-500/5 text-violet-200 border-violet-500/30',
    emerald: 'from-emerald-500/20 to-green-500/5 text-emerald-200 border-emerald-500/30',
    red: 'from-red-500/20 to-rose-500/5 text-red-200 border-red-500/30',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${accentClasses[accent] || accentClasses.cyan}`}>
      <p className="text-sm text-slate-300">{label}</p>
      <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
      {hint && <p className="mt-2 text-xs text-slate-300">{hint}</p>}
    </div>
  );
}
