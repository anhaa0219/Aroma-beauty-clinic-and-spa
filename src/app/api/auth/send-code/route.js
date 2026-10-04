import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureAuthIndexes } from '@/lib/authIndexes';
import OtpCode from '@/models/OtpCode';
import { hashCode } from '@/lib/session';
import { isMailConfigured, loginCodeEmail, sendEmail } from '@/lib/mailer';
import { normalizeEmail } from '@/lib/loyalty';

const CODE_TTL_MS = 5 * 60 * 1000; // Code valid for 5 minutes
const RESEND_AFTER_MS = 60 * 1000; // One email per minute per address

// POST { email } → emails a 6-digit login code
export async function POST(req) {
  try {
    const { email: rawEmail } = await req.json();
    const email = normalizeEmail(rawEmail);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Имэйл хаяг буруу байна' }, { status: 400 });
    }

    await connectToDatabase();
    await ensureAuthIndexes();
    const existing = await OtpCode.findOne({ email }).lean();
    const waitMs = existing ? RESEND_AFTER_MS - (Date.now() - new Date(existing.updatedAt).getTime()) : 0;
    if (waitMs > 0) {
      return NextResponse.json(
        { success: false, error: `${Math.ceil(waitMs / 1000)} секундын дараа дахин оролдоно уу`, retryAfter: Math.ceil(waitMs / 1000) },
        { status: 429 }
      );
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await OtpCode.findOneAndUpdate(
      { email },
      { codeHash: hashCode(email, code), attempts: 0, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
      { upsert: true }
    );
    await sendEmail({ to: email, ...loginCodeEmail(code) });

    return NextResponse.json({
      success: true,
      resendAfter: RESEND_AFTER_MS / 1000,
      // Without an email provider in development, show the code so login can be tested
      ...(process.env.NODE_ENV !== 'production' && !isMailConfigured() ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ success: false, error: 'Имэйл илгээж чадсангүй. Дахин оролдоно уу.' }, { status: 500 });
  }
}
