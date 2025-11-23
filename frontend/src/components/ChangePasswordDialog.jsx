import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { changePassword } from "../api";
import ModalPortal from "./ModalPortal";

export default function ChangePasswordDialog({ open, onClose }) {
  const { token } = useAuth();
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!token) {
      setErr("You must be logged in.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setErr("Fill both fields.");
      return;
    }
    try {
      await changePassword(token, oldPassword, newPassword);
      setOk("Password changed.");
      setTimeout(() => onClose(), 800);
    } catch {
      setErr("Failed to change password.");
    }
  };

  return (
    <ModalPortal>
      <div className="backdrop" style={backdrop} onClick={onClose}>
        <div
          className="modal"
          style={modal}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Change password</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
            <label>
              Current password
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOld(e.target.value)}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNew(e.target.value)}
                required
              />
            </label>
            {err && <div style={{ color: "red" }}>{err}</div>}
            {ok && <div style={{ color: "green" }}>{ok}</div>}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button type="button" onClick={onClose} style={btnOutline}>
                Cancel
              </button>
              <button type="submit" style={btn}>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};
const modal = {
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  width: 360,
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
};
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
