import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Register a new user
 * POST /api/register
 */
export async function register({ name, email, password, role = 'admin', phone }) {
  const { data } = await authApi.post('/register', {
    name,
    email,
    password,
    role,
    phone: phone || undefined,
  });
  return data;
}

/**
 * Login user
 * POST /api/login
 */
export async function login({ email, password }) {
  const { data } = await authApi.post('/login', { email, password });
  return data;
}

/**
 * Get current user (requires JWT)
 * GET /api/profile
 */
export async function getMe() {
  const { data } = await authApi.get('/profile');
  return data;
}

/**
 * Logout (invalidate session if backend supports it)
 * POST /api/logout
 */
export async function logout() {
  await authApi.post('/logout');
}
