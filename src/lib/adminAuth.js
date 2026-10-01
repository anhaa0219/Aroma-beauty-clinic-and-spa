// Signed admin session — self-contained (no next/headers) so the proxy can verify it.
import crypto from 'node:crypto';

export const ADMIN_COOKIE = 'aroma_vip_pass';
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set');
  return 'dev-only-insecure-session-secret';
}

const hmac = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Signed token proving the holder passed the admin password. Cannot be forged without SESSION_SECRET.
export function createAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + ADMIN_MAX_AGE_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, hmac(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.role === 'admin' && data.exp > Date.now();
  } catch {
    return false;
  }
}
