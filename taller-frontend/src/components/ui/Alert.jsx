export default function Alert({ children, variant = 'error', className = '' }) {
  const variants = {
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
  };

  return (
    <div
      role="alert"
      className={`rounded-xl border px-3 py-2 text-sm ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
