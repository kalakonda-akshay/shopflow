import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { errMsg } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('sf_user') || 'null'));
  const [token, setToken]     = useState(() => localStorage.getItem('sf_token') || null);
  const [loading, setLoading] = useState(false);

  const persist = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('sf_user', JSON.stringify(userData));
    localStorage.setItem('sf_token', jwt);
  };

  const clear = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sf_user');
    localStorage.removeItem('sf_token');
  };

  const login = async (creds) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(creds);
      persist(data.user, data.token);
      return { success: true };
    } catch (err) {
      return { error: errMsg(err) };
    } finally {
      setLoading(false);
    }
  };

  const register = async (creds) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(creds);
      persist(data.user, data.token);
      return { success: true };
    } catch (err) {
      return { error: errMsg(err) };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => clear();

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
