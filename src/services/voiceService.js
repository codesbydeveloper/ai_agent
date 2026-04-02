import { api } from './apiClient';

export async function getVoiceCalls(params = {}) {
  const { data } = await api.get('/voice/calls', { params });
  return data;
}

export async function getVoiceCallById(id) {
  const { data } = await api.get(`/voice/calls/${id}`);
  return data;
}
