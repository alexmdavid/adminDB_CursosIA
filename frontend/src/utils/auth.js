const AUTH_API = '/api/auth';
const TOKEN_KEY = 'playdiom_jwt_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function isSessionValid() {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${AUTH_API}/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return false;
    }
    const data = await res.json();
    return data.valid === true;
  } catch {
    clearToken();
    return false;
  }
}

export async function loginToBackend(username, password) {
  const res = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciales incorrectas');
  }
  saveToken(data.token);
  return data;
}