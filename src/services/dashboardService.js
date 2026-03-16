import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Dashboard stats
 * GET /api/dashboard/stats
 */
export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}

/**
 * Recent calls
 * GET /api/calls/recent
 */
export async function getRecentCalls() {
  const { data } = await api.get('/calls/recent');
  return data;
}

/**
 * Revenue data (for charts)
 * GET /api/revenue
 */
export async function getRevenue() {
  const { data } = await api.get('/revenue');
  return data;
}
