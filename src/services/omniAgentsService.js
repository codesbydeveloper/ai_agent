import { api } from './apiClient';

/**
 * POST /omni/agents
 * Creates an omni agent with:
 * - name
 * - welcome_message
 * - context_breakdown: [{ title, body, is_enabled }]
 */
export async function createOmniAgent(payload) {
  const { data } = await api.post('/omni/agents', payload);
  return data;
}

/**
 * GET /omni/agents
 * Returns a paginated list of omni agents.
 */
export async function getOmniAgents({ page = 1, page_size = 10 } = {}) {
  const { data } = await api.get('/omni/agents', { params: { page, page_size } });
  return data;
}

/**
 * PUT /omni/agents/:id
 * Updates the agent. Your backend example sends `context_breakdown`.
 */
export async function updateOmniAgent(id, payload) {
  const { data } = await api.put(`/omni/agents/${id}`, payload);
  return data;
}

/**
 * DELETE /omni/agents/:id
 */
export async function deleteOmniAgent(id) {
  const { data } = await api.delete(`/omni/agents/${id}`);
  return data;
}

