const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    let msg = 'Forbidden';
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch (_) { /* ignore */ }
    throw new Error(msg);
  }

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.message || msg;
    } catch (_) { /* ignore */ }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export default api;
