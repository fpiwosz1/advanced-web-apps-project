import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createSeries, updateSeries } from "../api";
import ModalPortal from "./ModalPortal";

export default function SeriesForm({
  open,
  onClose,
  onCreated,
  initial = null,
  onSaved,
}) {
  if (!open) return null;

  const { token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    minValue: -40.0,
    maxValue: 50.0,
    color: "#1E90FF",
    unit: "°C",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open && initial) {
      setForm({
        name: initial.name ?? "",
        description: initial.description ?? "",
        minValue: initial.minValue ?? -40.0,
        maxValue: initial.maxValue ?? 50.0,
        color: initial.color ?? "#1E90FF",
        unit: initial.unit ?? "°C",
      });
    } else if (open && !initial) {
      setForm({
        name: "",
        description: "",
        minValue: -40.0,
        maxValue: 50.0,
        color: "#1E90FF",
        unit: "°C",
      });
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Login required.");
      return;
    }
    if (Number(form.minValue) >= Number(form.maxValue)) {
      setErr("minValue < maxValue.");
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.color)) {
      setErr("Color must be in format #RRGGBB.");
      return;
    }
    try {
      const payload = {
        ...form,
        minValue: Number(form.minValue),
        maxValue: Number(form.maxValue),
      };
      if (initial?.id) {
        await updateSeries(token, initial.id, payload);
        onSaved?.();
      } else {
        await createSeries(token, payload);
        onCreated?.();
      }
      onClose();
    } catch {
      setErr("Unable to save series.");
    }
  };

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3>Add series</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
            <label>
              Name
              <input value={form.name} onChange={set("name")} required />
            </label>
            <label>
              Description
              <input value={form.description} onChange={set("description")} />
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
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
              Color
              <input
                value={form.color}
                onChange={set("color")}
                pattern="^#[0-9A-Fa-f]{6}$"
                required
              />
            </label>
            <label>
              Unit
              <input
                value={form.unit}
                onChange={set("unit")}
                maxLength={10}
                required
              />
            </label>
            {err && <div style={{ color: "red" }}>{err}</div>}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button type="button" onClick={onClose} style={styles.btnOutline}>
                Cancel
              </button>
              <button type="submit" style={styles.btn}>
                Save
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
