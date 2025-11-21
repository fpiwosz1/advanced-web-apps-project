import { useEffect, useState } from "react";
import { fetchSeries } from "../api";

export default function Home({ reloadKey = 0 }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchSeries();
      setSeries(data);
    } catch {
      setErr("Nie udało się pobrać serii.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // reaguje za każdym razem, gdy App zwiększy reloadKey
  }, [reloadKey]);

  if (loading) return <div style={{ padding: 16 }}>Ładowanie...</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  return (
    <main style={{ padding: 16, display: "grid", gap: 12 }}>
      <h2>Serie temperatur</h2>
      {series.length === 0 ? (
        <div>Brak serii.</div>
      ) : (
        <div style={grid}>
          {series.map((s) => (
            <div key={s.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...colorDot, background: s.color }} />
                <strong>{s.name}</strong>
              </div>
              {s.description && (
                <div style={{ color: "#666", marginTop: 4 }}>
                  {s.description}
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Zakres: {s.minValue} — {s.maxValue} {s.unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 12,
};
const card = {
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 12,
  background: "#fff",
};
const colorDot = {
  width: 12,
  height: 12,
  borderRadius: 6,
  display: "inline-block",
};
