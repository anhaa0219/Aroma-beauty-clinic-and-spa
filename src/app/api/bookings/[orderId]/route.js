import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/session';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/adminAuth';

// GET: A booking is shown only to the customer who owns it, or to the admin.
// Everyone else gets 404, so order IDs can't be enumerated to harvest customer data.
export async function GET(req, { params }) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const session = await getSession();
    const isAdmin = verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
    if (!session && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await connectToDatabase();
    const booking = await Booking.findOne({ orderId }).lean();

    // Same 404 whether the booking is missing or just not the viewer's own
    if (!booking || (!isAdmin && booking.customerPhone !== session?.phone)) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
