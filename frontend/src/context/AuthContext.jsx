import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('contractiq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('contractiq_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('contractiq_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session validation error:', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('contractiq_token');
          localStorage.removeItem('contractiq_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
