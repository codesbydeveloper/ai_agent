import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

/** localStorage key when backend also returns a JWT in JSON (optional; httpOnly cookie is primary). */
export const AUTH_TOKEN_KEY = 'token';

/**
 * Single API client: `${VITE_API_URL}/api` + cookies on every request (cross-origin session).
 * Adds Bearer token when present in localStorage (optional dual mode with cookie).
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
