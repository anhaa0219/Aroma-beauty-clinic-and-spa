import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(req) {
  try {
    // 1. Connect to MongoDB securely
    await connectToDatabase();
    
    // 2. Read the frontend data
    const body = await req.json();

    // 3. Generate a random Order ID (e.g., ORD-48291)
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // 4. Save to database
    const newBooking = await Booking.create({
      ...body,
      orderId,
      status: 'Pending'
    });

    // 5. Send success back to the frontend
    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}