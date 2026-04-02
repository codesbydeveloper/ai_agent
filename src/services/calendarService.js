import { api } from './apiClient';

/**
 * GET /calender/all
 */
export async function getCalendarEvents() {
  const { data } = await api.get('/calender/all');
  return data;
}
