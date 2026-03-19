/**
 * API origin (no `/api` suffix). Services use `${API_BASE_URL}/api`.
 * Axios is configured with `withCredentials: true` so httpOnly session cookies work cross-origin.
 * Backend must respond with `Access-Control-Allow-Credentials: true` and a specific
 * `Access-Control-Allow-Origin` (not `*`) for your Vite origin, e.g. http://localhost:5173.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
