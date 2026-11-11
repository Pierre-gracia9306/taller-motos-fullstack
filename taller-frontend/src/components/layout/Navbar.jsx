import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import Button from '../ui/Button';

export default function Navbar({ title = 'Taller Motos', userName = 'Usuario' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout: clearSession } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearSession();
      setIsOpen(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">Panel</p>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="menu"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group flex items-center gap-3 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-2 text-left transition hover:border-cyan-500/40 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <span className="text-sm text-slate-200">{userName}</span>

            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30">
              <Button
                type="button"
                variant="ghost"
                onClick={handleLogout}
                className="justify-between rounded-none border-0 bg-transparent px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
              >
                <span>Cerrar sesión</span>
                <span aria-hidden="true">↗</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
