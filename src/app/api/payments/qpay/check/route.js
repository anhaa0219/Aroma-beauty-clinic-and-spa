import { NextResponse } from 'next/server';
import { settlePayment } from '@/lib/paymentService';

// POST { orderId, token, manual?, simulate? } → has the customer paid? (the browser polls this)
// manual: the customer pressed "Төлбөр шалгах" — asks QPay now (otherwise QPay is asked sparingly)
// simulate: development + QPay sandbox only — marks the booking paid without a bank app.
export async function POST(req) {
  try {
    const { orderId, token, simulate, manual } = await req.json();
    const { status, body } = await settlePayment({
      orderId,
      token,
      simulate: simulate === true,
      source: manual === true ? 'manual' : 'poll',
    });
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error('QPay check error:', error);
    return NextResponse.json({ success: false, error: 'Төлбөр шалгаж чадсангүй' }, { status: 502 });
  }
}
