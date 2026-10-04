import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { normalizeEmail, normalizePhone } from '@/lib/loyalty';

// GET /api/admin/customers?phone=99112233  or  ?email=a@b.mn
// Finds a registered customer so the admin can link a phone/walk-in booking to their account
// (history + Loyalty Member). Protected by the proxy like every /api/admin route.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = normalizePhone(searchParams.get('phone'));
    const email = normalizeEmail(searchParams.get('email'));
    if (!phone && !email) return NextResponse.json({ success: true, customer: null });

    await connectToDatabase();
    const user = await User.findOne(email ? { email } : { phone }).select('name email phone').lean();
    return NextResponse.json({
      success: true,
      customer: user ? { name: user.name || '', email: user.email, phone: user.phone || '' } : null,
    });
  } catch (error) {
    console.error('Customer lookup error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
