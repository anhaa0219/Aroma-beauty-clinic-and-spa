import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(req, { params }) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Extract the dynamic orderId from the URL path (e.g., ORD-123456-789)
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Look up the specific booking in the database
    const booking = await Booking.findOne({ orderId }).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Return the booking data to the frontend receipt page
    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}