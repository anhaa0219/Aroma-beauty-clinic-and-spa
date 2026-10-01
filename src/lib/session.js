// Customer login session: a signed cookie holding the user's id and phone.
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'aroma_user';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set');
  return 'dev-only-insecure-session-secret';
}

const hmac = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

// Hash of an SMS code, so codes are never stored in plain text
export const hashCode = (phone, code) => hmac(`otp:${phone}:${code}`);

export function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function setSession(user) {
  const payload = Buffer.from(
    JSON.stringify({ uid: String(user._id), phone: user.phone, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  ).toString('base64url');
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${payload}.${hmac(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// { uid, phone } of the logged-in customer, or null
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, hmac(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? { uid: data.uid, phone: data.phone } : null;
  } catch {
    return null;
  }
}
