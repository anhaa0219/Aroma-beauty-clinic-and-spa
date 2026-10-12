import { NextResponse } from 'next/server';
import { settlePayment } from '@/lib/paymentService';

// QPay calls this URL when the invoice is paid. Its body is NOT trusted:
// the signed token proves the URL is ours, and the payment itself is re-checked with QPay.
async function handle(req) {
  try {
    const { searchParams } = new URL(req.url);
    const { status } = await settlePayment({
      orderId: searchParams.get('orderId'),
      token: searchParams.get('token'),
    });
    return NextResponse.json({ success: status === 200 }, { status });
  } catch (error) {
    console.error('QPay callback error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
