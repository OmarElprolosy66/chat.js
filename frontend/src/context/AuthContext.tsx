import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (username: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/v1/auth/login', { email, password });
    const { user: userData, token: jwtToken } = response.data;
    
    setToken(jwtToken);
    setUser(userData);
    setStoredToken(jwtToken);
    setStoredUser(userData);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/v1/auth/register', { username, email, password });
    const { user: userData, token: jwtToken } = response.data;

    setToken(jwtToken);
    setUser(userData);
    setStoredToken(jwtToken);
    setStoredUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStoredToken(null);
    setStoredUser(null);
  };

  const updateProfile = async (username: string, email: string) => {
    if (!user) return;
    const response = await api.post(`/v1/users/${user.id}`, { username, email });
    const updatedUser = response.data;
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
