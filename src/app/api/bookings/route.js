import { NextResponse } from 'next/server';
import { createBooking, getAvailability } from '@/lib/bookingService';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import User from '@/models/User';

// GET: Availability for every 30-min slot of a day for a group order
// /api/bookings?date=YYYY-MM-DD&items=trt-1:2,trt-5:1   (or &serviceId=trt-1 for a single treatment)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const { status, body } = await getAvailability({
      date: searchParams.get('date'),
      itemsText: searchParams.get('items') || searchParams.get('serviceId'),
    });
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create an online group booking for the logged-in customer
// body: { customerName, date, time, items: [{ serviceId, quantity }] }
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Захиалга өгөхийн тулд нэвтэрнэ үү', needLogin: true },
        { status: 401 }
      );
    }

    const body = await req.json();
    const customerName = String(body.customerName || '').trim();
    const { status, body: result } = await createBooking({
      customerName,
      customerPhone: session.phone, // Always the verified login number
      userId: session.uid,
      items: body.items ?? (body.serviceId ? [{ serviceId: body.serviceId, quantity: 1 }] : null),
      date: body.date,
      time: body.time,
      source: 'online',
    });

    // Remember the name for next time
    if (result.success) {
      await connectToDatabase();
      await User.updateOne({ _id: session.uid, $or: [{ name: null }, { name: '' }] }, { name: customerName });
    }
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
