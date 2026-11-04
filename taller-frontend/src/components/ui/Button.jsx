export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 disabled:bg-cyan-500/60',
    secondary:
      'bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-700/60',
    ghost:
      'bg-transparent text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 disabled:text-slate-500',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:cursor-not-allowed ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
