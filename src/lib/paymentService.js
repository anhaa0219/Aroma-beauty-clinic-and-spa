// Server-only: QPay payment flow for online bookings
//   booking (AwaitingPayment, slot held) → invoice → customer pays → Pending + paid → eBarimt issued
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { cancelInvoice, createEbarimt, createInvoice, findPaidPayment, isQpaySandbox } from '@/lib/qpay';
import { paymentToken, safeEqual } from '@/lib/session';

const fail = (status, error) => ({ status, body: { success: false, error } });

// What the customer's browser may see about its booking (no admin note, no internal ids)
export const publicBooking = (b) => ({
  orderId: b.orderId,
  customerName: b.customerName,
  customerEmail: b.customerEmail,
  items: b.items,
  people: b.people,
  serviceName: b.serviceName,
  date: b.date,
  time: b.time,
  endTime: b.endTime,
  durationMinutes: b.durationMinutes,
  price: b.price,
  status: b.status,
  holdUntil: b.holdUntil,
  payment: b.payment && {
    status: b.payment.status,
    paidAt: b.payment.paidAt,
    simulated: b.payment.simulated,
  },
  ebarimt: b.ebarimt && {
    type: b.ebarimt.type,
    register: b.ebarimt.register,
    companyName: b.ebarimt.companyName,
    status: b.ebarimt.status,
    qrData: b.ebarimt.qrData,
    lottery: b.ebarimt.lottery,
  },
});

const validToken = (orderId, token) =>
  typeof orderId === 'string' && typeof token === 'string' && safeEqual(token, paymentToken(orderId));

// Absolute URL QPay calls when the invoice is paid (must be reachable from the internet)
function callbackUrl(orderId) {
  const site = (process.env.SITE_URL || 'https://aromaspa.mn').replace(/\/$/, '');
  return `${site}/api/payments/qpay/callback?orderId=${encodeURIComponent(orderId)}&token=${paymentToken(orderId)}`;
}

/**
 * The QR/bank links for a booking's invoice (created once, then reused).
 */
export async function getOrCreateInvoice({ orderId, token }) {
  if (!validToken(orderId, token)) return fail(404, 'Захиалга олдсонгүй');
  await connectToDatabase();
  let booking = await Booking.findOne({ orderId }).lean();
  if (!booking?.payment) return fail(404, 'Захиалга олдсонгүй');

  if (booking.payment.status === 'paid') return { status: 200, body: { success: true, paid: true, booking: publicBooking(booking) } };
  if (booking.status !== 'AwaitingPayment' || new Date(booking.holdUntil) <= new Date()) {
    return fail(410, 'Төлбөр төлөх хугацаа дууссан. Дахин захиална уу.');
  }

  if (!booking.payment.invoiceId) {
    const invoice = await createInvoice({
      orderId,
      amount: booking.price,
      description: `Aroma Spa ${orderId}: ${booking.serviceName}`,
      callbackUrl: callbackUrl(orderId),
      lines: (booking.items || []).map((l) => ({ description: l.serviceName, quantity: l.quantity, unitPrice: l.price })),
      taxCustomer: booking.ebarimt?.type === 'COMPANY' ? booking.ebarimt.register : undefined,
    });
    // Only the first request stores its invoice; a parallel duplicate is cancelled
    booking = await Booking.findOneAndUpdate(
      { orderId, 'payment.invoiceId': { $exists: false } },
      {
        $set: {
          'payment.invoiceId': invoice.invoiceId,
          'payment.qrText': invoice.qrText,
          'payment.shortUrl': invoice.shortUrl,
          'payment.urls': invoice.urls,
        },
      },
      { returnDocument: 'after' }
    ).lean();
    if (!booking) {
      cancelInvoice(invoice.invoiceId).catch(() => {});
      booking = await Booking.findOne({ orderId }).lean();
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      paid: false,
      holdUntil: booking.holdUntil,
      amount: booking.price,
      qrText: booking.payment.qrText,
      shortUrl: booking.payment.shortUrl,
      urls: booking.payment.urls || [],
      canSimulate: process.env.NODE_ENV !== 'production' && isQpaySandbox(),
    },
  };
}

// QPay asks merchants to verify payments after their callback, not by constant polling.
// The browser polls OUR server every few seconds (a cheap DB read); QPay itself is asked only
//   - when its callback arrives, or the hold runs out (always),
//   - when the customer presses "Төлбөр шалгах" (at most every 5 s),
//   - as a safety net in case the callback is lost (at most every 30 s).
const FORCED_CHECK_GAP_MS = 5_000;
const SAFETY_CHECK_GAP_MS = 30_000;

// Claims the right to call QPay now (atomic, so parallel requests don't all hit QPay)
async function claimQpayCheck(orderId, gapMs) {
  const now = new Date();
  const claimed = await Booking.updateOne(
    {
      orderId,
      $or: [{ 'payment.checkedAt': { $exists: false } }, { 'payment.checkedAt': { $lte: new Date(now - gapMs) } }],
    },
    { $set: { 'payment.checkedAt': now } }
  );
  return claimed.modifiedCount === 1;
}

/**
 * Is the booking's invoice paid? If so, confirm the booking and issue the eBarimt.
 * source: 'callback' (QPay told us) | 'manual' (customer pressed check) | 'poll' (browser background)
 */
export async function settlePayment({ orderId, token, simulate = false, source = 'callback' }) {
  if (!validToken(orderId, token)) return fail(404, 'Захиалга олдсонгүй');
  await connectToDatabase();
  let booking = await Booking.findOne({ orderId }).lean();
  if (!booking?.payment) return fail(404, 'Захиалга олдсонгүй');

  if (booking.payment.status !== 'paid' && booking.payment.invoiceId) {
    let paid = null;
    if (simulate) {
      if (process.env.NODE_ENV === 'production' || !isQpaySandbox()) return fail(403, 'Not allowed');
      paid = { paymentId: `SANDBOX-${Date.now()}`, amount: booking.price, paidAt: new Date(), simulated: true };
    } else {
      const holdOver = new Date(booking.holdUntil) <= new Date();
      const askQpay =
        source === 'callback' ||
        holdOver ||
        (await claimQpayCheck(orderId, source === 'manual' ? FORCED_CHECK_GAP_MS : SAFETY_CHECK_GAP_MS));
      if (askQpay) paid = await findPaidPayment(booking.payment.invoiceId);
    }

    if (paid && paid.amount >= booking.price) {
      const late = new Date(booking.holdUntil) <= new Date();
      // Atomic: only one of (polling, callback) flips it to paid
      const updated = await Booking.findOneAndUpdate(
        { orderId, 'payment.status': 'unpaid' },
        {
          $set: {
            // The customer paid, so the booking stands even if the hold ran out (flagged for the admin)
            ...(['AwaitingPayment', 'Expired'].includes(booking.status) && { status: 'Pending' }),
            'payment.status': 'paid',
            'payment.paymentId': paid.paymentId,
            'payment.paidAmount': paid.amount,
            'payment.paidAt': paid.paidAt ? new Date(paid.paidAt) : new Date(),
            ...(late && { 'payment.paidLate': true }),
            ...(paid.simulated && { 'payment.simulated': true }),
          },
          $unset: { holdUntil: 1 },
        },
        { returnDocument: 'after' }
      ).lean();
      if (updated) booking = updated;
      else booking = await Booking.findOne({ orderId }).lean();
    }
  }

  if (booking.payment.status === 'paid') {
    booking = await issueEbarimt(booking);
    return { status: 200, body: { success: true, paid: true, booking: publicBooking(booking) } };
  }

  // Unpaid and the hold ran out → release the slot
  if (booking.status === 'AwaitingPayment' && new Date(booking.holdUntil) <= new Date()) {
    booking = await expireBooking(booking);
  }
  return {
    status: 200,
    body: { success: true, paid: false, expired: booking.status === 'Expired', booking: publicBooking(booking) },
  };
}

// Issue the tax receipt once per paid booking (retried on the next check if QPay failed)
async function issueEbarimt(booking) {
  const e = booking.ebarimt;
  if (!e || e.status === 'issued' || e.status === 'issuing') return booking;
  if (booking.payment.simulated) return booking; // sandbox test payments have no real transaction

  const claimed = await Booking.findOneAndUpdate(
    { orderId: booking.orderId, 'ebarimt.status': { $in: ['pending', 'failed'] } },
    { $set: { 'ebarimt.status': 'issuing' } },
    { returnDocument: 'after' }
  ).lean();
  if (!claimed) return booking;

  try {
    const receipt = await createEbarimt({
      paymentId: booking.payment.paymentId,
      receiverType: e.type,
      receiver: e.type === 'COMPANY' ? e.register : booking.customerPhone,
    });
    return await Booking.findOneAndUpdate(
      { orderId: booking.orderId },
      {
        $set: {
          'ebarimt.status': 'issued',
          'ebarimt.receiptId': receipt.id,
          'ebarimt.qrData': receipt.qrData,
          'ebarimt.lottery': receipt.lottery,
          'ebarimt.issuedAt': new Date(),
        },
        $unset: { 'ebarimt.error': 1 },
      },
      { returnDocument: 'after' }
    ).lean();
  } catch (error) {
    console.error('eBarimt error:', error);
    return await Booking.findOneAndUpdate(
      { orderId: booking.orderId },
      { $set: { 'ebarimt.status': 'failed', 'ebarimt.error': String(error.message).slice(0, 300) } },
      { returnDocument: 'after' }
    ).lean();
  }
}

async function expireBooking(booking) {
  const expired = await Booking.findOneAndUpdate(
    { orderId: booking.orderId, status: 'AwaitingPayment', 'payment.status': 'unpaid' },
    { $set: { status: 'Expired' } },
    { returnDocument: 'after' }
  ).lean();
  if (expired?.payment?.invoiceId) cancelInvoice(expired.payment.invoiceId).catch(() => {});
  return expired || booking;
}

// Tidy up holds whose time ran out (they already stopped occupying workers at holdUntil)
export async function expireStaleHolds() {
  await connectToDatabase();
  const stale = await Booking.find({ status: 'AwaitingPayment', holdUntil: { $lte: new Date() } })
    .select('orderId payment holdUntil status')
    .limit(50)
    .lean();
  for (const b of stale) {
    // Last look at QPay first: a payment may have arrived without its callback
    try {
      const paid = b.payment?.invoiceId && (await findPaidPayment(b.payment.invoiceId));
      if (paid) {
        await settlePayment({ orderId: b.orderId, token: paymentToken(b.orderId) });
        continue;
      }
    } catch {
      /* QPay unreachable — expire now; a late payment still settles via callback */
    }
    await expireBooking(b);
  }
}
