import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpCode from '@/models/OtpCode';
import { hashCode } from '@/lib/session';
import { sendSms } from '@/lib/sms';
import { normalizePhone } from '@/lib/loyalty';

const CODE_TTL_MS = 5 * 60 * 1000; // Code valid for 5 minutes
const RESEND_AFTER_MS = 60 * 1000; // One SMS per minute per number

// POST { phone } → texts a 6-digit login code
export async function POST(req) {
  try {
    const { phone: rawPhone } = await req.json();
    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Утасны дугаар буруу байна (8 оронтой дугаар оруулна уу)' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await OtpCode.findOne({ phone }).lean();
    const waitMs = existing ? RESEND_AFTER_MS - (Date.now() - new Date(existing.updatedAt).getTime()) : 0;
    if (waitMs > 0) {
      return NextResponse.json(
        { success: false, error: `${Math.ceil(waitMs / 1000)} секундын дараа дахин оролдоно уу`, retryAfter: Math.ceil(waitMs / 1000) },
        { status: 429 }
      );
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await OtpCode.findOneAndUpdate(
      { phone },
      { codeHash: hashCode(phone, code), attempts: 0, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
      { upsert: true }
    );
    await sendSms(phone, `Aroma Spa: Таны нэвтрэх код ${code}. 5 минутын турш хүчинтэй.`);

    return NextResponse.json({
      success: true,
      resendAfter: RESEND_AFTER_MS / 1000,
      // Without an SMS provider in development, show the code so login can be tested
      ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_API_URL ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ success: false, error: 'SMS илгээж чадсангүй. Дахин оролдоно уу.' }, { status: 500 });
  }
}
