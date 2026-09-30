import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('snosio-user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('snosio-token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('snosio-token', token);
    } else {
      localStorage.removeItem('snosio-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('snosio-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('snosio-user');
    }
  }, [user]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: !!token }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
