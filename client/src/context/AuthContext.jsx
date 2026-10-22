import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('skybook_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skybook_token'));
  const [loading, setLoading] = useState(true);

  // Synchronize authentication status on startup
  useEffect(() => {
    const verifyUserSession = async () => {
      const savedToken = localStorage.getItem('skybook_token');
      if (savedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('skybook_user', JSON.stringify(userData));
        } catch (error) {
          console.warn('[AuthContext] Session expired or invalid');
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
