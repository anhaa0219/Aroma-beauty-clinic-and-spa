import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OtpCode from '@/models/OtpCode';
import User from '@/models/User';
import { hashCode, safeEqual, setSession } from '@/lib/session';
import { normalizePhone } from '@/lib/loyalty';

const MAX_ATTEMPTS = 5;

// POST { phone, code } → logs the customer in (creates the account on first login)
export async function POST(req) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone);
    const code = String(body.code || '').trim();
    if (!phone || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: 'Код буруу байна' }, { status: 400 });
    }

    await connectToDatabase();
    const otp = await OtpCode.findOne({ phone });
    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Кодын хугацаа дууссан. Шинэ код авна уу.' }, { status: 400 });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await otp.deleteOne();
      return NextResponse.json({ success: false, error: 'Хэт олон удаа буруу оруулсан. Шинэ код авна уу.' }, { status: 429 });
    }
    if (!safeEqual(otp.codeHash, hashCode(phone, code))) {
      otp.attempts += 1;
      await otp.save();
      return NextResponse.json(
        { success: false, error: `Код буруу байна (${MAX_ATTEMPTS - otp.attempts} оролдлого үлдсэн)` },
        { status: 400 }
      );
    }

    await otp.deleteOne();
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { lastLoginAt: new Date() }, $setOnInsert: { phone } },
      { upsert: true, returnDocument: 'after' }
    );
    await setSession(user);

    return NextResponse.json({ success: true, user: { phone: user.phone, name: user.name || '' } });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
