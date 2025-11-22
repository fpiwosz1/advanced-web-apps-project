import { useAuth } from "../auth/AuthContext";

export default function Header({
  onOpenLogin,
  onOpenCreateSeries,
  onOpenCreateMeasurement,
}) {
  const { user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.brand}>Temperature Monitoring</div>
      <div style={styles.actions}>
        {user ? (
          <>
            <span style={styles.user}>Logged: {user.username}</span>
            <button style={styles.btn} onClick={onOpenCreateSeries}>
              Add series
            </button>
            <button style={styles.btn} onClick={onOpenCreateMeasurement}>
              Add measurement
            </button>
            <button style={styles.btnOutline} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button style={styles.btn} onClick={onOpenLogin}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
  },
  brand: { fontWeight: 600, fontSize: 18 },
  actions: { display: "flex", gap: 8, alignItems: "center" },
  user: { marginRight: 8, color: "#555" },
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
