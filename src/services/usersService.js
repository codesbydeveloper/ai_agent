import { api } from './apiClient';

/**
 * @param {*} raw - response body from GET /users
 * @returns {{ users: object[], total: number }}
 */
export function normalizeUsersList(raw) {
  const body = raw?.data !== undefined && !Array.isArray(raw) ? raw.data : raw;
  if (Array.isArray(body)) {
    return { users: body, total: body.length };
  }
  if (Array.isArray(body?.users)) {
    return {
      users: body.users,
      total: body.total ?? body.count ?? body.users.length,
    };
  }
  if (Array.isArray(body?.data)) {
    return {
      users: body.data,
      total: body.total ?? body.count ?? body.data.length,
    };
  }
  return { users: [], total: 0 };
}

/**
 * GET /api/users — list users (admin)
 */
export async function getUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data;
}

/**
 * POST /api/users — create user (admin).
 * Body matches public register: { name, email, password, role?, phone? }.
 * Password should be hashed the same way as /api/register if your API expects a client hash.
 */
export async function createUser(payload) {
  const { data } = await api.post('/users', payload);
  return data;
}
