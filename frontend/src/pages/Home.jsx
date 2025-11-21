import { useEffect, useState } from "react";
import { fetchSeries, deleteSeries } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function Home({ reloadKey = 0 }) {
  const { token, user } = useAuth();
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
  }, [reloadKey]);

  const removeSeries = async (id) => {
    if (!user || !token) {
      alert("Wymagane zalogowanie.");
      return;
    }
    if (!confirm("Usunąć tę serię? Spowoduje to usunięcie jej pomiarów."))
      return;
    try {
      await deleteSeries(token, id);
      await load();
      onChanged?.();
    } catch {
      alert("Nie udało się usunąć serii.");
    }
  };

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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...colorDot, background: s.color }} />
                  <strong>{s.name}</strong>
                </div>
                {user && (
                  <button
                    style={btnSmallOutline}
                    onClick={() => removeSeries(s.id)}
                  >
                    Usuń
                  </button>
                )}
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
const btnSmallOutline = {
  padding: "4px 8px",
  background: "#fff",
  color: "#FF4500",
  border: "1px solid #FF4500",
  borderRadius: 4,
  cursor: "pointer",
};
