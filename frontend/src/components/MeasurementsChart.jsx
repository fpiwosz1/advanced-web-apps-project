import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Dot,
} from "recharts";

function buildChartData(items, selectedSeriesIds) {
  const map = new Map();
  for (const m of items) {
    if (selectedSeriesIds.length && !selectedSeriesIds.includes(m.seriesId))
      continue;
    const t = new Date(m.timestamp).getTime();
    let row = map.get(t);
    if (!row) {
      row = { t, time: new Date(t) };
      map.set(t, row);
    }
    row[`s_${m.seriesId}`] = Number(m.value);
  }
  return Array.from(map.values()).sort((a, b) => a.t - b.t);
}

export default function MeasurementsChart({
  items,
  seriesById,
  selectedSeriesIds,
  selected,
}) {
  const data = buildChartData(items, selectedSeriesIds);

  const formatTick = (t) => new Date(t).toLocaleString();

  return (
    <div
      style={{
        height: 360,
        width: "100%",
        border: "1px solid #eee",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={formatTick}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(t) => new Date(t).toLocaleString()}
            formatter={(value, name, props) => {
              const dk = props?.dataKey;
              const id =
                dk && String(dk).startsWith("s_")
                  ? Number(String(dk).slice(2))
                  : null;
              const unit = id != null ? seriesById.get(id)?.unit ?? "" : "";
              return [`${value} ${unit}`, name];
            }}
          />
          <Legend />
          {selectedSeriesIds.map((id) => {
            const s = seriesById.get(id);
            const color = s?.color || "#8884d8";
            const name = s?.name || `Series ${id}`;
            const unit = s?.unit || "";
            const dot = (props) => {
              const isActive =
                selected &&
                selected.seriesId === id &&
                props.payload?.t === selected.t;
              return (
                <Dot
                  {...props}
                  r={isActive ? 5 : 2}
                  stroke={isActive ? "#000" : color}
                  strokeWidth={isActive ? 2 : 1}
                />
              );
            };
            return (
              <Line
                key={id}
                type="monotone"
                dataKey={`s_${id}`}
                name={`${name} (${unit})`}
                stroke={color}
                dot={dot}
                connectNulls
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
