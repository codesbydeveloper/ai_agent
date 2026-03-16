/**
 * Hash password on the frontend before sending to API.
 * Uses Web Crypto API (SHA-256). Backend must store and compare this hash.
 * @param {string} plainPassword - Raw password from user
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function hashPassword(plainPassword) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
