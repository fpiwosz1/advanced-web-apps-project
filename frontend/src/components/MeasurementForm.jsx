import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSeries, createMeasurement } from "../api";
import { formatLocalInput, localInputToIsoUtc } from "../utils/time";

export default function MeasurementForm({ open, onClose, onCreated }) {
  const { token } = useAuth();
  const [series, setSeries] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    seriesId: "",
    value: "",
    timestampLocal: formatLocalInput(new Date()),
    label: "",
  });

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const s = await fetchSeries();
          setSeries(s);
          // preselect first series if available
          setForm((f) => ({ ...f, seriesId: s[0]?.id ?? "" }));
        } catch {
          setErr("Nie udało się pobrać serii.");
        }
      })();
    }
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toIsoUtc = (local) => {
    if (!local) return null;
    const d = new Date(local);
    return d.toISOString();
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Wymagane zalogowanie.");
      return;
    }
    if (!form.seriesId || form.value === "" || !form.timestampLocal) {
      setErr("Wypełnij wszystkie wymagane pola.");
      return;
    }
    try {
      const iso = localInputToIsoUtc(form.timestampLocal);
      const payload = {
        seriesId: Number(form.seriesId),
        value: Number(form.value),
        timestamp: iso,
        label: form.label,
      };
      await createMeasurement(token, payload);
      onCreated?.();
      onClose();
      // reset
      setForm({
        seriesId: series[0]?.id ?? "",
        value: "",
        timestampLocal: "",
        label: "",
      });
    } catch (e2) {
      setErr(
        "Nie udało się utworzyć pomiaru. Upewnij się, że wartość mieści się w zakresie serii."
      );
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Dodaj pomiar</h3>
        <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
          <label>
            Seria
            <select value={form.seriesId} onChange={set("seriesId")} required>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Wartość
            <input
              type="number"
              step="0.01"
              value={form.value}
              onChange={set("value")}
              required
            />
          </label>
          <label>
            Czas
            <input
              type="datetime-local"
              value={form.timestampLocal}
              onChange={set("timestampLocal")}
              required
            />
          </label>
          <label>
            Etykieta (opcjonalnie)
            <input value={form.label} onChange={set("label")} />
          </label>
          {err && <div style={{ color: "red" }}>{err}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={styles.btnOutline}>
              Anuluj
            </button>
            <button type="submit" style={styles.btn}>
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    width: 420,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  btn: {
    padding: "8px 12px",
    background: "#1E90FF",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  btnOutline: {
    padding: "8px 12px",
    background: "#fff",
    color: "#1E90FF",
    border: "1px solid #1E90FF",
    borderRadius: 4,
    cursor: "pointer",
  },
};
