import { createContext, useContext, useState } from 'react';
import { getUsernameFromToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const user = token ? { username: getUsernameFromToken(token) } : null;

  const login = (accessToken) => setToken(accessToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
