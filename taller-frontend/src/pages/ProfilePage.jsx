import { useEffect, useState } from 'react';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import PageShell from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { getApiErrorMessage } from '../utils/apiError';

const buildInitialProfileForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
});

const buildInitialPasswordForm = () => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

export default function ProfilePage() {
  const { user: sessionUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState(buildInitialProfileForm(sessionUser));
  const [passwordForm, setPasswordForm] = useState(buildInitialPasswordForm());
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response?.data?.user ?? response?.user ?? response;
      setProfile(userData || sessionUser || null);
      setProfileForm(buildInitialProfileForm(userData || sessionUser));
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cargar la información del perfil.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const user = profile || sessionUser || {};

  const initials = (user.name || 'Usuario')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (value) => {
    if (!value) return 'No disponible';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      if (!user?.id) {
        throw new Error('No se pudo identificar al usuario autenticado.');
      }

      const response = await userService.update(user.id, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        role: user.role,
      });

      const updatedUser = response?.data ?? response ?? { ...user, ...profileForm };
      setProfile(updatedUser);
      setProfileForm(buildInitialProfileForm(updatedUser));

      const accessToken = localStorage.getItem('accessToken') || '';
      login({ accessToken, user: updatedUser });

      setMessage({ type: 'success', text: 'Datos principales actualizados correctamente.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo actualizar la información.'),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setChangingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      if (!user?.id) {
        throw new Error('No se pudo identificar al usuario autenticado.');
      }

      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        throw new Error('Debes ingresar la contraseña actual y la nueva contraseña.');
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('La nueva contraseña y la confirmación no coinciden.');
      }

      await userService.changePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(buildInitialPasswordForm());
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cambiar la contraseña.'),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PageShell title="Perfil" userName={user.name || 'Usuario'}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500 text-2xl font-bold text-slate-950">
              {initials}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Cuenta</p>
              <h1 className="mt-2 text-3xl font-bold text-white">{user.name || 'Usuario'}</h1>
              <p className="mt-2 text-slate-300">{user.email || 'Correo no disponible'}</p>
            </div>
          </div>
        </div>

        {message.text && <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>}

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Datos principales</h2>

            <div className="space-y-4">
              <InputField
                id="profile-name"
                name="name"
                label="Nombre completo"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Tu nombre"
              />

              <InputField
                id="profile-email"
                name="email"
                label="Correo electrónico"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="correo@tallermotos.com"
              />
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Cambio de contraseña</h2>

            <div className="space-y-4">
              <InputField
                id="currentPassword"
                name="currentPassword"
                label="Contraseña actual"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />

              <InputField
                id="newPassword"
                name="newPassword"
                label="Nueva contraseña"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />

              <InputField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
            </div>

            <div className="mt-6">
              <Button type="submit" variant="secondary" disabled={changingPassword}>
                {changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rol</p>
            <p className="mt-3 text-lg font-semibold text-white">{user.role || 'Sin rol'}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado</p>
            <p className="mt-3 text-lg font-semibold text-emerald-300">
              {user.active === false ? 'Inactivo' : 'Activo'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Correo</p>
            <p className="mt-3 text-lg font-semibold text-white">{user.email || 'No disponible'}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fecha de creación</p>
            <p className="mt-3 text-lg font-semibold text-white">{formatDate(user.created_at)}</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
            Cargando información del perfil...
          </div>
        )}
      </div>
    </PageShell>
  );
}
