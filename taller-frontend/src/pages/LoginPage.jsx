import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Ingresa tu email y contraseña para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await authService.login(form.email, form.password);
      const accessToken = response?.accessToken ?? response?.data?.accessToken;
      const sessionUser = response?.user ?? response?.data?.user;

      if (!accessToken || !sessionUser) {
        throw new Error('La respuesta del servidor no incluye una sesión válida.');
      }

      login({ accessToken, user: sessionUser });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm lg:grid-cols-2">
          <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-700 to-slate-950 p-10 lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),transparent_40%)]" />

            <div className="relative z-10 max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
                Taller Motos
              </div>

              <h1 className="text-4xl font-black leading-tight text-white">
                Gestiona tu taller con control total.
              </h1>

              <p className="mt-4 text-base text-slate-200">
                Centraliza clientes, motocicletas, órdenes y seguimiento operativo desde un solo panel.
              </p>

              <div className="mt-8 space-y-4 text-sm text-slate-100/90">
                {['Control de órdenes en tiempo real', 'Seguimiento de clientes y motos', 'Acceso seguro para el equipo'].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-200">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">Bienvenido</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Iniciar sesión</h2>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <InputField
                  id="email"
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nombre@tallermotos.com"
                />

                <InputField
                  id="password"
                  name="password"
                  label="Contraseña"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    Recordarme
                  </label>

                  <button type="button" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && <Alert variant="error">{error}</Alert>}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </form>

              <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
                ¿Necesitas ayuda?{' '}
                <button type="button" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Contacta al administrador
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
