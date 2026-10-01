import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { computeLoyalty } from '@/lib/loyalty';

const unauthorized = () => NextResponse.json({ success: false, error: 'Not logged in' }, { status: 401 });

// GET → profile, Loyalty Member status and booking history of the logged-in customer
// ?brief=1 skips the history (used by the navbar)
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    await connectToDatabase();
    const user = await User.findById(session.uid).lean();
    if (!user) return unauthorized();

    const bookings = await Booking.find({ customerPhone: user.phone })
      .select('-__v')
      .sort({ date: -1, time: -1 })
      .lean();
    const loyalty = computeLoyalty(bookings);
    const brief = new URL(req.url).searchParams.get('brief');

    return NextResponse.json({
      success: true,
      user: { phone: user.phone, name: user.name || '', memberSince: user.createdAt },
      loyalty,
      ...(brief ? {} : { bookings }),
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH { name } → update display name
export async function PATCH(req) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const name = String((await req.json()).name || '').trim().slice(0, 80);
    if (!name) return NextResponse.json({ success: false, error: 'Нэрээ оруулна уу' }, { status: 400 });

    await connectToDatabase();
    await User.updateOne({ _id: session.uid }, { name });
    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
