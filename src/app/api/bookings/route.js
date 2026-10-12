import { NextResponse } from 'next/server';
import { createBooking, getAvailability } from '@/lib/bookingService';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession, paymentToken } from '@/lib/session';
import { publicBooking } from '@/lib/paymentService';
import { isValidCompanyRegister, lookupCompany } from '@/lib/qpay';
import User from '@/models/User';

// eBarimt receiver: an individual (default) or a company, whose name comes from the tax registry
async function ebarimtChoice(input) {
  if (input?.type !== 'COMPANY') return { ok: true, value: { type: 'CITIZEN' } };
  const register = typeof input.register === 'string' ? input.register.trim() : '';
  if (!isValidCompanyRegister(register)) return { ok: false, error: 'Байгууллагын регистр 7 оронтой байна' };
  const company = await lookupCompany(register).catch(() => undefined);
  if (company === undefined) return { ok: false, error: 'Татварын системээс шалгаж чадсангүй. Дахин оролдоно уу.' };
  if (!company) return { ok: false, error: 'Ийм регистртэй байгууллага олдсонгүй' };
  return { ok: true, value: { type: 'COMPANY', register, companyName: company.name } };
}

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

// POST: Create an online group booking.
// Logged-in customers: email comes from their verified session; phone from their profile
// (or the form, if they haven't saved one yet).
// Guests: they type name, phone and email. The email links the booking to their account
// when they later log in with it (email login is verified), so history/Loyalty follow it.
// The booking holds its slot (AwaitingPayment) while the customer pays with QPay.
// body: { customerName, customerPhone, customerEmail?, date, time, items: [{ serviceId, quantity }],
//         ebarimt?: { type: 'CITIZEN' | 'COMPANY', register? } }
// → { data: booking, payToken } — payToken lets this browser create/check the payment
export async function POST(req) {
  try {
    const session = await getSession();
    const body = await req.json();

    const ebarimt = await ebarimtChoice(body.ebarimt);
    if (!ebarimt.ok) return NextResponse.json({ success: false, error: ebarimt.error }, { status: 400 });

    let user = null;
    if (session) {
      await connectToDatabase();
      user = await User.findById(session.uid).lean();
    }

    const { status, body: result } = await createBooking({
      customerName: body.customerName,
      customerPhone: user?.phone || body.customerPhone,
      customerEmail: user ? user.email : body.customerEmail, // session email is trusted
      userId: user?._id,
      items: body.items ?? (body.serviceId ? [{ serviceId: body.serviceId, quantity: 1 }] : null),
      date: body.date,
      time: body.time,
      source: 'online',
      requireEmail: true,
      awaitPayment: true,
      ebarimt: ebarimt.value,
    });

    // Remember the name on the logged-in customer's profile for next time
    if (result.success && user && !user.name) {
      await User.updateOne({ _id: user._id }, { name: result.data.customerName });
    }
    if (!result.success) return NextResponse.json(result, { status });
    return NextResponse.json(
      { success: true, data: publicBooking(result.data), payToken: paymentToken(result.data.orderId) },
      { status }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
