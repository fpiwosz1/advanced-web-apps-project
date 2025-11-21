const TEMP_API = import.meta.env.VITE_TEMP_API_BASE_URL;
const AUTH_API = import.meta.env.VITE_AUTH_API_BASE_URL;

export async function fetchSeries() {
  const res = await fetch(`${TEMP_API}/api/v1/series`);
  if (!res.ok) throw new Error(`Failed to fetch series: ${res.status}`);
  return res.json();
}

export async function createSeries(accessToken, payload) {
  const res = await fetch(`${TEMP_API}/api/v1/series`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create series: ${res.status}`);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${AUTH_API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json(); // { accessToken, refreshToken?, expiresInMs }
}

export async function refresh() {
  const res = await fetch(`${AUTH_API}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Refresh failed");
  return res.json(); // { accessToken, refreshToken?, expiresInMs }
}

export async function logout() {
  const res = await fetch(`${AUTH_API}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) throw new Error("Logout failed");
}

export function getUsernameFromToken(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json.username ?? "admin";
  } catch {
    return "admin";
  }
}

export function getJwtExpMs(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json.exp ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function fetchMeasurements({
  seriesIds = [],
  from = null,
  to = null,
} = {}) {
  const params = new URLSearchParams();
  if (seriesIds.length) params.set("seriesIds", seriesIds.join(","));
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const url = `${TEMP_API}/api/v1/measurements?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch measurements: ${res.status}`);
  return res.json();
}

export async function createMeasurement(accessToken, payload) {
  const res = await fetch(`${TEMP_API}/api/v1/measurements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create measurement: ${res.status}`);
  return res.json();
}

export async function deleteMeasurement(accessToken, id) {
  const res = await fetch(`${TEMP_API}/api/v1/measurements/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok && res.status !== 204)
    throw new Error(`Failed to delete measurement: ${res.status}`);
}
