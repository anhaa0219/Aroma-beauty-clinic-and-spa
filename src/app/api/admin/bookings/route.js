import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET: Fetch all bookings for the dashboard
export async function GET() {
  try {
    await connectToDatabase();
    // Fetch all bookings, sorted by most recently created
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: bookings }, { status: 200 });
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update the status of a specific booking
export async function PATCH(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Missing orderId or status' }, { status: 400 });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Admin Update Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}