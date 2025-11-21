import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createSeries } from "../api";

export default function SeriesForm({ open, onClose, onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    minValue: -40.0,
    maxValue: 50.0,
    color: "#1E90FF",
    icon: "thermometer",
    unit: "°C",
  });
  const [err, setErr] = useState("");

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Wymagane zalogowanie.");
      return;
    }
    if (Number(form.minValue) >= Number(form.maxValue)) {
      setErr("minValue < maxValue.");
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.color)) {
      setErr("Kolor musi być w formacie #RRGGBB.");
      return;
    }
    try {
      const payload = {
        ...form,
        minValue: Number(form.minValue),
        maxValue: Number(form.maxValue),
      };
      await createSeries(token, payload);
      onCreated?.();
      onClose();
    } catch (e2) {
      setErr("Nie udało się utworzyć serii.");
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Dodaj serię</h3>
        <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
          <label>
            Nazwa
            <input value={form.name} onChange={set("name")} required />
          </label>
          <label>
            Opis
            <input value={form.description} onChange={set("description")} />
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <label>
              Min
              <input
                type="number"
                step="0.01"
                value={form.minValue}
                onChange={set("minValue")}
              />
            </label>
            <label>
              Max
              <input
                type="number"
                step="0.01"
                value={form.maxValue}
                onChange={set("maxValue")}
              />
            </label>
          </div>
          <label>
            Kolor
            <input value={form.color} onChange={set("color")} />
          </label>
          <label>
            Ikona
            <input value={form.icon} onChange={set("icon")} />
          </label>
          <label>
            Jednostka
            <input value={form.unit} onChange={set("unit")} />
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
