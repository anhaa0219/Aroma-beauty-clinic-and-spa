import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureAuthIndexes } from '@/lib/authIndexes';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { computeLoyalty, normalizePhone } from '@/lib/loyalty';

const unauthorized = () => NextResponse.json({ success: false, error: 'Not logged in' }, { status: 401 });

// A customer's bookings: made while logged in (userId), or as a guest with their verified email.
// The phone is NOT used here — it isn't verified, so matching on it would leak other people's history.
const bookingsOfUser = (user) =>
  Booking.find({ $or: [{ userId: user._id }, { customerEmail: user.email }] })
    .select('-__v -note') // the admin's internal note stays internal
    .sort({ date: -1, time: -1 })
    .lean();

// GET → profile, Loyalty Member status and booking history of the logged-in customer
// ?brief=1 skips the history (used by the navbar)
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    await connectToDatabase();
    const user = await User.findById(session.uid).lean();
    if (!user) return unauthorized();

    const bookings = await bookingsOfUser(user);
    const loyalty = computeLoyalty(bookings);
    const brief = new URL(req.url).searchParams.get('brief');

    return NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name || '', phone: user.phone || '', memberSince: user.createdAt },
      loyalty,
      ...(brief ? {} : { bookings }),
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH { name?, phone? }
// - name can be changed any time
// - phone can be saved ONCE (then locked); one account per phone
export async function PATCH(req) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await req.json();

    await connectToDatabase();
    await ensureAuthIndexes();
    const user = await User.findById(session.uid);
    if (!user) return unauthorized();

    if (body.name !== undefined) {
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) return NextResponse.json({ success: false, error: 'Нэрээ оруулна уу' }, { status: 400 });
      user.name = name;
    }

    if (body.phone !== undefined) {
      if (user.phone) {
        return NextResponse.json(
          { success: false, error: 'Утасны дугаар аль хэдийн хадгалагдсан. Өөрчлөх бол салонтой холбогдоно уу.' },
          { status: 409 }
        );
      }
      const phone = normalizePhone(body.phone);
      if (!phone) {
        return NextResponse.json({ success: false, error: 'Утасны дугаар буруу байна (8 оронтой)' }, { status: 400 });
      }
      if (await User.exists({ phone, _id: { $ne: user._id } })) {
        return NextResponse.json(
          { success: false, error: 'Энэ дугаар өөр бүртгэлд холбогдсон байна. Салонтой холбогдоно уу.' },
          { status: 409 }
        );
      }
      user.phone = phone;
    }

    await user.save();
    return NextResponse.json({ success: true, user: { email: user.email, name: user.name || '', phone: user.phone || '' } });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Энэ дугаар өөр бүртгэлд холбогдсон байна.' }, { status: 409 });
    }
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
