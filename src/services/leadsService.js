import { api } from './apiClient';

/**
 * GET /leads — list with search, filters, pagination
 * @param {Object} params - { page, limit, search, status, ... }
 */
export async function getLeads(params = {}) {
  const { data } = await api.get('/leads', { params });
  return data;
}

/**
 * GET /leads/all — list all leads (admin view)
 */
export async function getAllLeads() {
  const { data } = await api.get('/leads/all');
  return data;
}

/**
 * GET /leads/:id
 */
export async function getLeadById(id) {
  const { data } = await api.get(`/leads/${id}`);
  return data;
}

/**
 * POST /leads — create lead
 */
export async function createLead(payload) {
  const { data } = await api.post('/leads', payload);
  return data;
}

/**
 * PUT /leads/:id — update lead
 */
export async function updateLead(id, payload) {
  const { data } = await api.put(`/leads/${id}`, payload);
  return data;
}

/**
 * PUT /leads/:id/assign-agent — assign lead to an agent (admin)
 * Body: { agent_id: number|string }
 */
export async function assignAgentToLead(id, agentId) {
  const { data } = await api.put(`/leads/${id}/assign-agent`, { agent_id: agentId });
  return data;
}

/**
 * DELETE /leads/:id
 */
export async function deleteLead(id) {
  const { data } = await api.delete(`/leads/${id}`);
  return data;
}

/**
 * POST /voice/bulk-call/upload — bulk upload CSV/Excel for voice campaign
 * FormData fields:
 * - file
 * - name
 * - is_scheduled
 * - phone_number_id
 */
export async function importLeads(formData) {
  const { data } = await api.post('/voice/bulk-call/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
