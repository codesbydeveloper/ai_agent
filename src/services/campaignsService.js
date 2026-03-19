import { api } from './apiClient';

/**
 * GET /campaigns — list campaigns
 */
export async function getCampaigns(params = {}) {
  const { data } = await api.get('/campaigns', { params });
  return data;
}

/**
 * GET /campaign/:id
 */
export async function getCampaignById(id) {
  const { data } = await api.get(`/campaign/${id}`);
  return data;
}

/**
 * POST /campaign — create campaign
 */
export async function createCampaign(payload) {
  const { data } = await api.post('/campaign', payload);
  return data;
}

/**
 * PUT /campaign/:id — update campaign
 */
export async function updateCampaign(id, payload) {
  const { data } = await api.put(`/campaign/${id}`, payload);
  return data;
}

/**
 * DELETE /campaign/:id
 */
export async function deleteCampaign(id) {
  const { data } = await api.delete(`/campaign/${id}`);
  return data;
}
