const TEMP_API = import.meta.env.VITE_TEMP_API_BASE_URL;
const AUTH_API = import.meta.env.VITE_AUTH_API_BASE_URL;

export async function fetchSeries() {
  const res = await fetch(`${TEMP_API}/api/v1/series`);
  if (!res.ok) throw new Error(`Failed to fetch series: ${res.status}`);
  return res.json();
}

export async function createSeries(token, payload) {
  const res = await fetch(`${TEMP_API}/api/v1/series`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create series: ${res.status}`);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${AUTH_API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json(); // { accessToken, refreshToken, expiresInMs }
}

export function getUsernameFromToken(token) {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json.username ?? 'admin';
  } catch {
    return 'admin';
  }
}