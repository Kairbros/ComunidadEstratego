export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Wrapper de fetch que adjunta el token JWT automáticamente.
 * Lanza un Error con el mensaje del servidor si la respuesta no es 2xx.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  return res.json();
}

/**
 * Envía un FormData (multipart) con el token JWT.
 * No fija Content-Type para que el navegador ponga el boundary correcto.
 */
export async function apiUpload(path, formData, method = 'POST') {
  const token = localStorage.getItem('admin_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: formData });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  return res.json();
}
