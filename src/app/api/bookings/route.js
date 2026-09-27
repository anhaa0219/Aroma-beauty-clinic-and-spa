import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET: Fetch occupied time slots for a given date and staff member
export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date query parameter is required' },
        { status: 400 }
      );
    }

    const query = { date, status: { $ne: 'Cancelled' } };
    if (staffId) {
      query.staffId = staffId;
    }

    // Retrieve only the booked times for that date
    const bookings = await Booking.find(query).select('time -_id');
    const occupiedTimes = bookings.map((b) => b.time);

    return NextResponse.json({ success: true, occupiedTimes }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new booking
export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { customerName, customerPhone, serviceId, serviceName, staffId, staffName, date, time, price } = body;

    if (!customerName || !customerPhone || !serviceId || !staffId || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Check if slot is already taken
    const existing = await Booking.findOne({
      staffId,
      date,
      time,
      status: { $ne: 'Cancelled' },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked for this specialist.' },
        { status: 409 }
      );
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = await Booking.create({
      orderId,
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      staffId,
      staffName,
      date,
      time,
      price,
      status: 'Confirmed',
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}