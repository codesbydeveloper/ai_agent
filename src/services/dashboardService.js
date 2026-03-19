import { api } from './apiClient';

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
