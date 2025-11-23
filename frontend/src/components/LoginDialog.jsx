import { useState } from "react";
import { login } from "../api";
import { useAuth } from "../auth/AuthContext";
import ModalPortal from "./ModalPortal";

export default function LoginDialog({ open, onClose }) {
  const { login: setAccessToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(username, password);
      setAccessToken(res.accessToken);
      onClose();
    } catch (err) {
      setError("Wrong username or password.");
    }
  };

  return (
    <ModalPortal>
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3>Logowanie</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button style={styles.btn} type="submit">
              Login
            </button>
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
  },
  modal: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    width: 320,
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
};
