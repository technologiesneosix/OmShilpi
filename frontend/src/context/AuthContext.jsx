import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else if (res.user) {
        setUser(res.user);
      } else if (res.data) {
        setUser(res.data);
      }
    } catch (err) {
      setUser(null);
      // User is unauthenticated, not a blocking app error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authApi.login(credentials);
      const userData = res.data?.user || res.user || res.data;
      const token = res.data?.accessToken || res.accessToken || res.token;
      
      if (token) {
        localStorage.setItem('omshilpi_token', token);
      }
      setUser(userData);
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const signup = async (data) => {
    setError(null);
    try {
      const res = await authApi.signup(data);
      const userData = res.data?.user || res.user || res.data;
      const token = res.data?.accessToken || res.accessToken || res.token;
      
      if (token) {
        localStorage.setItem('omshilpi_token', token);
      }
      setUser(userData);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('omshilpi_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
