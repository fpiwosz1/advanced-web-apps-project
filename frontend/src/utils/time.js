export function formatLocalInput(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${mi}`;
}

export function localInputToIsoUtc(local) {
  if (!local) return new Date().toISOString();
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return new Date().toISOString();
  const y = Number(m[1]),
    mo = Number(m[2]) - 1,
    d = Number(m[3]),
    h = Number(m[4]),
    mi = Number(m[5]);
  return new Date(Date.UTC(y, mo, d, h, mi, 0)).toISOString();
}
