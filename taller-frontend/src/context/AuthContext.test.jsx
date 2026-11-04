import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function AuthConsumer() {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</span>
      <span data-testid="token">{token || 'no-token'}</span>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <button
        type="button"
        onClick={() =>
          login({
            accessToken: 'token-123',
            user: { id: 1, name: 'Ana' },
          })
        }
      >
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debe inicializar con usuario y token vacíos cuando no hay sesión guardada', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('debe cargar la sesión guardada desde localStorage al montar', () => {
    localStorage.setItem('accessToken', 'saved-token');
    localStorage.setItem('user', JSON.stringify({ id: 7, name: 'Luis' }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 7, name: 'Luis' }));
    expect(screen.getByTestId('token').textContent).toBe('saved-token');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
  });

  it('debe guardar sesión al llamar login y actualizar el estado', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('login'));
    });

    expect(localStorage.getItem('accessToken')).toBe('token-123');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 1, name: 'Ana' });
    expect(screen.getByTestId('token').textContent).toBe('token-123');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 1, name: 'Ana' }));
  });

  it('debe limpiar sesión al llamar logout', async () => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('user', JSON.stringify({ id: 5, name: 'Marta' }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('logout'));
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('debe lanzar error si useAuth se usa fuera del provider', () => {
    function BrokenConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<BrokenConsumer />)).toThrow('useAuth debe usarse dentro de AuthProvider');
  });
});
