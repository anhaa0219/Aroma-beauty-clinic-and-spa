// Server-only fixed-window rate limiting, shared across serverless instances (MongoDB counters)
import crypto from 'node:crypto';
import { headers } from 'next/headers';
import RateLimit from '@/models/RateLimit';

// The visitor's IP as seen by Vercel (first entry of x-forwarded-for), hashed — we never store raw IPs
export async function visitorKey() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  return crypto.createHash('sha256').update(`aroma:${ip}`).digest('base64url').slice(0, 22);
}

/**
 * Count one hit against each rule; returns { ok: true } or { ok: false, retryAfter } (seconds)
 * for the first rule that is over its limit.
 * rules: [{ key, limit, windowSeconds }]
 */
export async function hit(rules) {
  const now = Date.now();
  for (const { key, limit, windowSeconds } of rules) {
    const windowMs = windowSeconds * 1000;
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const doc = await RateLimit.findOneAndUpdate(
      { key: `${key}:${windowStart}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs) } },
      { upsert: true, returnDocument: 'after' }
    ).lean();
    if (doc.count > limit) {
      return { ok: false, retryAfter: Math.ceil((windowStart + windowMs - now) / 1000) };
    }
  }
  return { ok: true };
}
