import { useEffect, useState } from "react";
import { fetchSeries, deleteSeries } from "../api";
import { useAuth } from "../auth/AuthContext";
import SeriesForm from "../components/SeriesForm";

export default function Home({ reloadKey = 0, onChanged }) {
  const { token, user } = useAuth();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await fetchSeries();
      setSeries(data);
    } catch {
      setErr("Unable to fetch series.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [reloadKey]);

  const removeSeries = async (id) => {
    if (!user || !token) {
      alert("Login required.");
      return;
    }
    if (
      !confirm("Delete this series? All associated measurements will be lost.")
    )
      return;
    try {
      await deleteSeries(token, id);
      await load();
      onChanged?.();
    } catch (err) {
      console.error(err);
      alert("Unable to delete series.");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;

  const openEdit = (s) => {
    setEditing(s);
    setEditOpen(true);
  };
  const onSaved = async () => {
    await load();
    onChanged?.();
  };

  return (
    <main style={{ padding: 16, display: "grid", gap: 12 }}>
      <h2>Temperature series</h2>
      {series.length === 0 ? (
        <div>No series</div>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={btnSmallOutline} onClick={() => openEdit(s)}>
                      Edit
                    </button>
                    <button
                      style={btnSmallOutline}
                      onClick={() => removeSeries(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {s.description && (
                <div style={{ color: "#666", marginTop: 4 }}>
                  {s.description}
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Range: {s.minValue} — {s.maxValue} {s.unit}
              </div>
            </div>
          ))}
        </div>
      )}
      <SeriesForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editing}
        onSaved={onSaved}
        onCreated={async () => {
          await load();
          onChanged?.();
        }}
      />
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
