export default function InputField({
  id,
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">
          {label}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${
          error ? 'border-red-500/60 focus:border-red-400' : 'border-slate-700 focus:border-cyan-400'
        } ${className}`.trim()}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
