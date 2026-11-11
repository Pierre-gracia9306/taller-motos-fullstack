import { useEffect, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Alert from '../components/ui/Alert';
import { getApiErrorMessage } from '../utils/apiError';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'MECANICO',
};

export default function UsersPage() {
  const { user: sessionUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      const list = response?.data ?? response ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo cargar la lista de usuarios.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      if (!payload.name || !payload.email || !payload.password) {
        throw new Error('Nombre, correo y contraseña son obligatorios.');
      }

      const response = await userService.create(payload);
      const createdUser = response?.data ?? response ?? null;

      if (createdUser) {
        await loadUsers();
      }

      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Usuario creado correctamente.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo crear el usuario.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (userId, active) => {
    const nextActive = !active;

    try {
      await userService.toggleStatus(userId);
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          String(user.id) === String(userId) ? { ...user, active: nextActive } : user
        )
      );
      setMessage({ type: 'success', text: nextActive ? 'Usuario activado.' : 'Usuario desactivado.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo actualizar el estado.'),
      });
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const userToUpdate = users.find((item) => String(item.id) === String(userId));
      if (!userToUpdate) return;

      await userService.update(userId, { ...userToUpdate, role });
      await loadUsers();
      setMessage({ type: 'success', text: 'Rol actualizado correctamente.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(error, 'No se pudo actualizar el rol.'),
      });
    }
  };

  return (
    <PageShell title="Usuarios" userName={sessionUser?.name || 'Administrador'}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Administración</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Usuarios del sistema</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">Crear nuevo usuario</h2>

            <div className="space-y-4">
              <InputField
                id="name"
                name="name"
                label="Nombre completo"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Ana García"
              />

              <InputField
                id="email"
                name="email"
                label="Correo electrónico"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@tallermotos.com"
              />

              <InputField
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />

              <div className="w-full">
                <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-200">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MECANICO">MECANICO</option>
                </select>
              </div>
            </div>

            {message.text && message.type && <div className="mt-5"><Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert></div>}

            <div className="mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? 'Creando usuario...' : 'Crear usuario'}
              </Button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Correo</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}

                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-white">{item.name || 'Sin nombre'}</td>
                      <td className="px-4 py-3">{item.email || 'Sin correo'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.role || 'MECANICO'}
                          onChange={(event) => handleRoleChange(item.id, event.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MECANICO">MECANICO</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.active === false
                              ? 'bg-red-500/10 text-red-200'
                              : 'bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          {item.active === false ? 'Inactivo' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, item.active)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-500/40 hover:bg-slate-700"
                        >
                          {item.active === false ? 'Activar' : 'Desactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
            Cargando usuarios...
          </div>
        )}
      </div>
    </PageShell>
  );
}
