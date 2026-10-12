import { NextResponse } from 'next/server';
import { getOrCreateInvoice } from '@/lib/paymentService';

// POST { orderId, token } → QPay QR + bank-app links for this booking's invoice.
// The amount is the booking's own price; nothing about money is taken from the browser.
export async function POST(req) {
  try {
    const { orderId, token } = await req.json();
    const { status, body } = await getOrCreateInvoice({ orderId, token });
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error('QPay invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Төлбөрийн QR үүсгэж чадсангүй. Дахин оролдоно уу.' },
      { status: 502 }
    );
  }
}
