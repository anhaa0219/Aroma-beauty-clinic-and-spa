import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureAuthIndexes } from '@/lib/authIndexes';
import OtpCode from '@/models/OtpCode';
import User from '@/models/User';
import { hashCode, safeEqual, setSession } from '@/lib/session';
import { normalizeEmail } from '@/lib/loyalty';

const MAX_ATTEMPTS = 5;

// POST { email, code } → logs the customer in (creates the account on first login)
export async function POST(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const code = String(body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: 'Код буруу байна' }, { status: 400 });
    }

    await connectToDatabase();
    await ensureAuthIndexes();
    const otp = await OtpCode.findOne({ email });
    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Кодын хугацаа дууссан. Шинэ код авна уу.' }, { status: 400 });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await otp.deleteOne();
      return NextResponse.json({ success: false, error: 'Хэт олон удаа буруу оруулсан. Шинэ код авна уу.' }, { status: 429 });
    }
    if (!safeEqual(otp.codeHash, hashCode(email, code))) {
      otp.attempts += 1;
      await otp.save();
      return NextResponse.json(
        { success: false, error: `Код буруу байна (${MAX_ATTEMPTS - otp.attempts} оролдлого үлдсэн)` },
        { status: 400 }
      );
    }

    await otp.deleteOne();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { lastLoginAt: new Date() }, $setOnInsert: { email } },
      { upsert: true, returnDocument: 'after' }
    );
    await setSession(user);

    return NextResponse.json({
      success: true,
      // The client sends new customers to their profile to add name + phone once
      user: { email: user.email, name: user.name || '', phone: user.phone || '' },
      needsProfile: !user.name || !user.phone,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
