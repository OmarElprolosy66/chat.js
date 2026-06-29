import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions to manage the auth token securely in memory/storage
export const getStoredToken = (): string | null => {
  return localStorage.getItem('chat_auth_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('chat_auth_token', token);
  } else {
    localStorage.removeItem('chat_auth_token');
  }
};

export const getStoredUser = (): any | null => {
  const userJson = localStorage.getItem('chat_auth_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any | null): void => {
  if (user) {
    localStorage.setItem('chat_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('chat_auth_user');
  }
};

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiry / unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage on authentication failure
      setStoredToken(null);
      setStoredUser(null);
      // Optional: redirect to login if page is not public
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
