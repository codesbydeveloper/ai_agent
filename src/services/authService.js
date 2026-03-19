import { api } from './apiClient';

/**
 * Register a new user
 * POST /api/register
 */
export async function register({ name, email, password, role = 'admin', phone }) {
  const { data } = await api.post('/register', {
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
  const { data } = await api.post('/login', { email, password });
  return data;
}

/**
 * Get current user (session cookie and/or Bearer)
 * GET /api/profile
 */
export async function getMe() {
  const { data } = await api.get('/profile');
  return data;
}

/**
 * Logout — send cookies so the server can clear the httpOnly session cookie
 * POST /api/logout
 */
export async function logout() {
  await api.post('/logout');
}
