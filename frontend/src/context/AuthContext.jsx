import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUserAndStore = useCallback((userData) => {
    setUser(userData);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    else { localStorage.removeItem('user'); localStorage.removeItem('token'); }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUserAndStore(data.user);
    return data.user;
  };

  const signup = async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('token', data.token);
    setUserAndStore(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    setUserAndStore(null);
  }, [setUserAndStore]);

  const updateUser = useCallback((updatedUser) => {
    setUserAndStore(updatedUser);
  }, [setUserAndStore]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
