import { api } from './apiClient';

/**
 * POST /payment/link — create payment link (Razorpay)
 * @param {Object} payload - { amount, currency, description, customer: { name, email, contact }, lead_id?, send_sms? }
 */
export async function createPaymentLink(payload) {
  const { data } = await api.post('/payment/link', payload);
  return data;
}

/**
 * GET /payment/status — by id or payment_link_id
 * @param {Object} params - { id } or { payment_link_id }
 */
export async function getPaymentStatus(params) {
  const { data } = await api.get('/payment/status', { params });
  return data;
}

/**
 * GET /payments — list with pagination and filters
 * @param {Object} params - { page, limit, status?, lead_id?, from_date?, to_date? }
 */
export async function getPayments(params = {}) {
  const { data } = await api.get('/payments', { params });
  return data;
}
