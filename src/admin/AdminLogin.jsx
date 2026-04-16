import { useState } from 'react';
import { API_URL } from '../api';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);
      onLogin();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/VersiónPrincipalDorada.svg" alt="Estratego" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-white text-xl font-bold font-mono">Panel de Admin</h1>
          <p className="text-gray-500 text-xs font-mono mt-1">Comunidad Estrategas</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="text-gray-400 text-xs font-mono block mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-mono block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg py-2.5 px-3 text-white text-sm font-mono focus:outline-none focus:border-[#d4af37]/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono text-center bg-red-400/10 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#0a0a0a] rounded-lg py-2.5 text-sm font-mono font-bold hover:bg-[#c9a227] disabled:opacity-50 transition-all"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <a href="/" className="block text-center text-gray-600 text-xs font-mono mt-4 hover:text-gray-400 transition-colors">
          ← Volver a la comunidad
        </a>
      </div>
    </div>
  );
}
