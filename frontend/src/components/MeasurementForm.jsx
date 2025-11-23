import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSeries, createMeasurement, updateMeasurement } from "../api";
import { formatLocalInput, localInputToIsoUtc } from "../utils/time";
import ModalPortal from "./ModalPortal";

export default function MeasurementForm({
  open,
  onClose,
  onCreated,
  initial = null,
  onSaved,
}) {
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
          setForm((f) => ({
            ...f,
            seriesId: initial?.seriesId ?? s[0]?.id ?? "",
            value: initial?.value ?? "",
            timestampLocal: initial?.timestamp
              ? formatLocalInput(new Date(initial.timestamp))
              : formatLocalInput(new Date()),
            label: initial?.label ?? "",
          }));
        } catch {
          setErr("Unable to fetch series");
        }
      })();
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Wymagane zalogowanie.");
      return;
    }
    if (!form.seriesId || form.value === "") {
      setErr("Wypełnij wymagane pola.");
      return;
    }

    try {
      const payload = {
        seriesId: Number(form.seriesId),
        value: Number(form.value),
        timestamp: localInputToIsoUtc(form.timestampLocal),
        label: form.label,
      };
      if (initial?.id) {
        await updateMeasurement(token, initial.id, payload);
        onSaved?.();
      } else {
        await createMeasurement(token, payload);
        onCreated?.();
      }
      onClose();
    } catch {
      setErr("Nie udało się zapisać pomiaru.");
    }
  };

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3>Dodaj pomiar</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
            <label>
              Series
              <select value={form.seriesId} onChange={set("seriesId")} required>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Value
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={set("value")}
                required
              />
            </label>
            <label>
              Time
              <input
                type="datetime-local"
                value={form.timestampLocal}
                onChange={set("timestampLocal")}
                required
              />
            </label>
            <label>
              Label (optional)
              <input value={form.label} onChange={set("label")} />
            </label>
            {err && <div style={{ color: "red" }}>{err}</div>}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
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
    </ModalPortal>
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
    zIndex: 10000,
  },
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    width: 420,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    zIndex: 10001,
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
