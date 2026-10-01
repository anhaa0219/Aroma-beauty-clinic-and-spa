import { NextResponse } from 'next/server';
import { getAvailability } from '@/lib/bookingService';
import { SLOT_MINUTES } from '@/lib/schedule';

// GET: Same as the public availability, but the slot in progress is still bookable (walk-ins)
// /api/admin/availability?date=YYYY-MM-DD&items=trt-1:2,trt-5:1
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const { status, body } = await getAvailability({
      date: searchParams.get('date'),
      itemsText: searchParams.get('items'),
      graceMinutes: SLOT_MINUTES,
    });
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error('Admin availability error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
