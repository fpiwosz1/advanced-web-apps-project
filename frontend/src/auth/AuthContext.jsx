import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getUsernameFromToken,
  refresh,
  getJwtExpMs,
  logout as apiLogout,
} from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const refreshTimerRef = useRef(null);

  const user = accessToken
    ? { username: getUsernameFromToken(accessToken) }
    : null;

  const scheduleAutoRefresh = (token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const expMs = getJwtExpMs(token);
    if (!expMs) return;
    const leadTimeMs = 60_000; // 60s
    const delay = Math.max(expMs - Date.now() - leadTimeMs, 0);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await refresh();
        setAccessToken(res.accessToken);
        scheduleAutoRefresh(res.accessToken);
      } catch {
        doLogout();
      }
    }, delay);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await refresh();
        setAccessToken(res.accessToken);
        scheduleAutoRefresh(res.accessToken);
      } catch {
        setAccessToken(null);
      }
    })();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const doLogin = (newAccessToken) => {
    setAccessToken(newAccessToken);
    scheduleAutoRefresh(newAccessToken);
  };

  const doLogout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  return (
    <AuthContext.Provider
      value={{ token: accessToken, user, login: doLogin, logout: doLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
