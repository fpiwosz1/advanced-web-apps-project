import { useEffect, useMemo, useState } from "react";
import { fetchSeries, fetchMeasurements, deleteMeasurement } from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatLocalInput, localInputToIsoUtc } from "../utils/time";
import MeasurementsChart from "./MeasurementsChart";
import MeasurementForm from "./MeasurementForm";

export default function MeasurementsPanel({ onOpenCreate, reloadKey }) {
  const { token, user } = useAuth();
  const [series, setSeries] = useState([]);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  const [initializedSelection, setInitializedSelection] = useState(false);

  useEffect(() => {
    if (series.length && !initializedSelection) {
      setSelectedSeriesIds(series.map((x) => x.id));
      setInitializedSelection(true);
    }
  }, [series, initializedSelection]);

  const [fromLocal, setFromLocal] = useState(() =>
    formatLocalInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
  );
  const [toLocal, setToLocal] = useState(() => formatLocalInput(new Date()));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const openEdit = (m) => {
    setEditingMeasurement(m);
    setEditOpen(true);
  };
  const onSaved = async () => {
    await load();
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSeries();
        setSeries(s);
      } catch {
        setErr("Unable to fetch measurements.");
      }
    })();
  }, [reloadKey]);

  useEffect(() => {
    if (!series.length) return;
    const validIds = new Set(series.map((s) => s.id));
    setSelectedSeriesIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [series]);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      if (selectedSeriesIds.length === 0) {
        setItems([]);
        setSelectedPoint(null);
        return;
      }
      const data = await fetchMeasurements({
        seriesIds: selectedSeriesIds,
        from: localInputToIsoUtc(fromLocal),
        to: localInputToIsoUtc(toLocal),
      });
      setItems(data);
      setSelectedPoint(null);
    } catch {
      setErr("Unable to fetch measurements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (series.length) {
      load();
    }
  }, [series.length, selectedSeriesIds, fromLocal, toLocal]);

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
      alert("Login required");
      return;
    }
    if (!confirm("Delete this measurement?")) return;
    try {
      await deleteMeasurement(token, id);
      load();
    } catch {
      alert("Unable to delete measurement");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [items, selectedSeriesIds, fromLocal, toLocal]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  const baseCols = 5; // ID, Series, Value, Time, Label
  const totalCols = user ? baseCols + 1 : baseCols;

  return (
    <section style={{ padding: 16, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Chart</h2>
      </div>
      <div className="print-chart">
        <MeasurementsChart
          items={items}
          seriesById={seriesById}
          selectedSeriesIds={selectedSeriesIds}
          selected={selectedPoint}
        />
      </div>

      <div className="filters" style={filters}>
        <div>
          <strong>Filter:</strong>
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
        <div className="pagination" style={{ display: "flex", gap: 12 }}>
          <label>
            From
            <input
              type="datetime-local"
              value={fromLocal}
              onChange={(e) => setFromLocal(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="datetime-local"
              value={toLocal}
              onChange={(e) => setToLocal(e.target.value)}
            />
          </label>
          <button style={btnOutline} onClick={load}>
            Apply
          </button>
          <button
            style={btnOutline}
            onClick={() => setSelectedSeriesIds(series.map((s) => s.id))}
            disabled={!series.length}
          >
            Select all
          </button>
          <button
            style={btnOutline}
            onClick={() => setSelectedSeriesIds([])}
            disabled={selectedSeriesIds.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span>{items.length} records</span>
        <label>
          Per page:
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ marginLeft: 6 }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          style={btnOutline}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button
          style={btnOutline}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
      {loading ? (
        <div>Ładowanie...</div>
      ) : err ? (
        <div style={{ color: "red" }}>{err}</div>
      ) : (
        <table className="print-table" style={table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Series</th>
              <th>Value</th>
              <th>Time</th>
              <th>Label</th>
              {user && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pagedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  style={{ textAlign: "center", color: "#666" }}
                >
                  No measurements.
                </td>
              </tr>
            ) : (
              pagedItems.map((m) => {
                const s = seriesById.get(m.seriesId);
                return (
                  <tr
                    key={m.id}
                    onClick={() =>
                      setSelectedPoint({
                        seriesId: m.seriesId,
                        t: new Date(m.timestamp).getTime(),
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
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
                    {user && (
                      <td>
                        {user && (
                          <>
                            <button
                              style={btnSmallOutline}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(m);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              style={btnSmallOutline}
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(m.id);
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
      <MeasurementForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={editingMeasurement}
        onSaved={onSaved}
      />
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
