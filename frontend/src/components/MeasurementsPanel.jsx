import { useEffect, useMemo, useState } from "react";
import { fetchSeries, fetchMeasurements, deleteMeasurement } from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatLocalInput, localInputToIsoUtc } from "../utils/time";

export default function MeasurementsPanel({ onOpenCreate, reloadKey }) {
  const { token, user } = useAuth();
  const [series, setSeries] = useState([]);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState([]);

  // domyślne zakresy: [now-12h, now]
  const [fromLocal, setFromLocal] = useState(() =>
    formatLocalInput(new Date(Date.now() - 12 * 60 * 60 * 1000))
  );
  const [toLocal, setToLocal] = useState(() => formatLocalInput(new Date()));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Pobierz serie raz
  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSeries();
        setSeries(s);
        setSelectedSeriesIds(s.map((x) => x.id));
      } catch {
        setErr("Nie udało się pobrać serii.");
      }
    })();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchMeasurements({
        seriesIds: selectedSeriesIds,
        from: localInputToIsoUtc(fromLocal),
        to: localInputToIsoUtc(toLocal),
      });
      setItems(data);
    } catch {
      setErr("Nie udało się pobrać pomiarów.");
    } finally {
      setLoading(false);
    }
  };

  // Inicjalne pobranie po wczytaniu serii
  useEffect(() => {
    if (series.length) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series.length]);

  // Reaguj na zewnętrzny reloadKey (np. po dodaniu/usunięciu)
  useEffect(() => {
    if (series.length) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const seriesById = useMemo(() => {
    const map = new Map();
    series.forEach((s) => map.set(s.id, s));
    return map;
  }, [series]);

  const toggleSeries = (id) => {
    setSelectedSeriesIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const remove = async (id) => {
    if (!token) {
      alert("Wymagane zalogowanie.");
      return;
    }
    if (!confirm("Usunąć ten pomiar?")) return;
    try {
      await deleteMeasurement(token, id);
      load();
    } catch {
      alert("Nie udało się usunąć pomiaru.");
    }
  };

  return (
    <section style={{ padding: 16, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Pomiary</h2>
        {user && (
          <button style={btn} onClick={onOpenCreate}>
            Dodaj pomiar
          </button>
        )}
      </div>

      <div style={filters}>
        <div>
          <strong>Serie:</strong>
          <div
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
          >
            {series.map((s) => (
              <label
                key={s.id}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <input
                  type="checkbox"
                  checked={selectedSeriesIds.includes(s.id)}
                  onChange={() => toggleSeries(s.id)}
                />
                <span style={{ ...dot, background: s.color }} />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <label>
            Od
            <input
              type="datetime-local"
              value={fromLocal}
              onChange={(e) => setFromLocal(e.target.value)}
            />
          </label>
          <label>
            Do
            <input
              type="datetime-local"
              value={toLocal}
              onChange={(e) => setToLocal(e.target.value)}
            />
          </label>
          <button style={btnOutline} onClick={load}>
            Zastosuj
          </button>
        </div>
      </div>

      {loading ? (
        <div>Ładowanie...</div>
      ) : err ? (
        <div style={{ color: "red" }}>{err}</div>
      ) : (
        <table style={table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Seria</th>
              <th>Wartość</th>
              <th>Czas</th>
              <th>Etykieta</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#666" }}>
                  Brak danych.
                </td>
              </tr>
            ) : (
              items.map((m) => {
                const s = seriesById.get(m.seriesId);
                return (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      <span style={{ ...dot, background: s?.color }} />{" "}
                      {s?.name ?? m.seriesId}
                    </td>
                    <td>
                      {m.value} {s?.unit ?? ""}
                    </td>
                    <td>{new Date(m.timestamp).toLocaleString()}</td>
                    <td>{m.label ?? ""}</td>
                    <td>
                      {user && (
                        <button
                          style={btnSmallOutline}
                          onClick={() => remove(m.id)}
                        >
                          Usuń
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

const filters = {
  display: "grid",
  gap: 12,
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 12,
  background: "#fafafa",
};
const table = { width: "100%", borderCollapse: "collapse" };
const dot = { width: 10, height: 10, borderRadius: 5, display: "inline-block" };
const btn = {
  padding: "8px 12px",
  background: "#1E90FF",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
const btnOutline = {
  padding: "8px 12px",
  background: "#fff",
  color: "#1E90FF",
  border: "1px solid #1E90FF",
  borderRadius: 4,
  cursor: "pointer",
};
const btnSmallOutline = {
  padding: "4px 8px",
  background: "#fff",
  color: "#FF4500",
  border: "1px solid #FF4500",
  borderRadius: 4,
  cursor: "pointer",
};
