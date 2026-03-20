import axios from 'axios';
import { API_BASE_URL } from '../config';

/** Key used with `localStorage` for the admin JWT (must match the auth store). */
export const ADMIN_TOKEN_KEY = 'admin_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
      (error as { response: { status: number } }).response.status === 401
    ) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);
