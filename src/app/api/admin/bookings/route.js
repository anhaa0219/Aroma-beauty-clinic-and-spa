import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createBooking } from '@/lib/bookingService';
import { SLOT_MINUTES } from '@/lib/schedule';
import { staffList } from '@/lib/data';

// The three states the admin works with
const ADMIN_STATUSES = ['Pending', 'Completed', 'Cancelled'];

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

// POST: Admin creates a booking for a phone-call or walk-in client.
// The slot that has already started stays bookable so walk-ins can begin right away.
export async function POST(req) {
  try {
    const body = await req.json();
    const { status, body: result } = await createBooking({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items,
      date: body.date,
      time: body.time,
      note: body.note,
      source: body.source === 'walk-in' ? 'walk-in' : 'phone',
      requirePhone: body.source !== 'walk-in',
      graceMinutes: SLOT_MINUTES,
    });
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error('Admin Booking Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Change a booking's status.
// body: { orderId, status: 'Pending' | 'Completed' | 'Cancelled', workerIds?: ['staff-1', ...] }
// Completed requires at least one worker from the team; other statuses clear the workers.
export async function PATCH(req) {
  try {
    await connectToDatabase();
    const { orderId, status, workerIds } = await req.json();

    if (!orderId || !ADMIN_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Missing orderId or invalid status' }, { status: 400 });
    }

    let update;
    if (status === 'Completed') {
      const ids = [...new Set(Array.isArray(workerIds) ? workerIds : [])];
      const workers = ids.map((id) => staffList.find((s) => s.id === id)).filter(Boolean);
      if (workers.length === 0 || workers.length !== ids.length) {
        return NextResponse.json({ success: false, error: 'Ажилласан ажилтнаа сонгоно уу' }, { status: 400 });
      }
      update = {
        $set: {
          status,
          completedAt: new Date(),
          workers: workers.map((s) => ({ staffId: s.id, staffName: `${s.firstName} ${s.lastName}` })),
        },
      };
    } else {
      update = { $set: { status }, $unset: { workers: 1, completedAt: 1 } };
    }

    const updatedBooking = await Booking.findOneAndUpdate({ orderId }, update, { returnDocument: 'after' }).lean();

    if (!updatedBooking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Admin Update Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
