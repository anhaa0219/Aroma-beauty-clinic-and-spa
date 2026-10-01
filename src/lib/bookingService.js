// Server-only booking logic shared by the public site and the admin dashboard
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import {
  ACTIVE_STATUSES,
  ALL_SLOTS,
  WORKER_COUNT,
  computeSlots,
  describeItems,
  isValidDate,
  normalizeItems,
  parseItems,
  salonNow,
  toMinutes,
  toTime,
} from '@/lib/schedule';
import { normalizePhone } from '@/lib/loyalty';

// Anti-abuse: one phone can hold at most this many upcoming active (unpaid) online bookings
export const MAX_UPCOMING_PER_PHONE = 6;

export const activeBookingsOn = (date) =>
  Booking.find({ date, status: { $in: ACTIVE_STATUSES } })
    .select('orderId serviceId items time durationMinutes createdAt')
    .lean();

// Older versions had a unique {staffId, date, time} index, which would stop two
// clients from starting at the same time. Drop it once per server process.
let legacyIndexDropped = null;
const dropLegacyIndex = () =>
  (legacyIndexDropped ??= Booking.collection.dropIndex('staffId_1_date_1_time_1').catch(() => {}));

const fail = (status, error) => ({ status, body: { success: false, error } });

/**
 * Availability for every 30-min slot of a day.
 * itemsText: "trt-1:2,trt-5:1". Returns { status, body } for NextResponse.json.
 */
export async function getAvailability({ date, itemsText, graceMinutes = 0 }) {
  if (!isValidDate(date)) return fail(400, 'A valid date (YYYY-MM-DD) is required');
  const items = parseItems(itemsText);
  if (!items) return fail(400, `Choose 1–${WORKER_COUNT} treatments`);

  const order = describeItems(items);
  await connectToDatabase();
  const bookings = await activeBookingsOn(date);
  const slots = computeSlots({ date, lines: order.lines, bookings, graceMinutes });

  return {
    status: 200,
    body: {
      success: true,
      date,
      people: order.people,
      durationMinutes: order.durationMinutes,
      totalWorkers: WORKER_COUNT,
      slots,
    },
  };
}

/**
 * Create a group booking if enough workers are free for every treatment.
 * Names, durations and prices always come from our own data, never from the client.
 */
export async function createBooking({
  customerName,
  customerPhone: rawPhone,
  userId,
  items,
  date,
  time,
  source = 'online',
  note,
  requirePhone = true,
  graceMinutes = 0,
}) {
  if (!customerName?.trim() || (requirePhone && !rawPhone?.trim()) || !items || !date || !time) {
    return fail(400, 'Missing required booking fields');
  }
  // Same 8-digit format as customer logins, so the booking counts toward their Loyalty Member progress
  const customerPhone = rawPhone?.trim() ? normalizePhone(rawPhone) : undefined;
  if (rawPhone?.trim() && !customerPhone) {
    return fail(400, 'Утасны дугаар буруу байна (8 оронтой Монгол дугаар)');
  }

  const validItems = normalizeItems(items);
  if (!validItems || !isValidDate(date) || !ALL_SLOTS.includes(time)) {
    return fail(400, `Invalid treatments (max ${WORKER_COUNT} people), date or time`);
  }
  const order = describeItems(validItems);

  await connectToDatabase();
  await dropLegacyIndex();

  // Guest/online checkout has no login gate, so cap how many upcoming bookings one phone can hold
  if (source === 'online' && customerPhone) {
    const today = salonNow().date;
    const upcoming = await Booking.countDocuments({
      customerPhone,
      status: { $in: ACTIVE_STATUSES },
      date: { $gte: today },
    });
    if (upcoming >= MAX_UPCOMING_PER_PHONE) {
      return fail(
        429,
        `Энэ дугаар дээр ${MAX_UPCOMING_PER_PHONE} идэвхтэй захиалга байна. Өмнөх захиалгаа ашигласны дараа дахин захиална уу.`
      );
    }
  }

  const isSlotFree = (bookings) =>
    computeSlots({ date, lines: order.lines, bookings, graceMinutes }).find((s) => s.time === time)?.available;
  const slotTaken = () => fail(409, 'This time slot is no longer available. Please choose another time.');

  if (!isSlotFree(await activeBookingsOn(date))) return slotTaken();

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const newBooking = await Booking.create({
    orderId,
    customerName,
    customerPhone,
    userId,
    source,
    note,
    items: order.lines,
    people: order.people,
    serviceId: order.lines[0].serviceId,
    serviceName: order.summary,
    date,
    time,
    endTime: toTime(toMinutes(time) + order.durationMinutes),
    durationMinutes: order.durationMinutes,
    price: order.totalPrice,
    status: 'Pending', // Admin marks it Completed (with workers) or Cancelled
  });

  // Guard against several clients grabbing the last free workers at the same moment:
  // if bookings saved before ours already fill the slot, roll ours back.
  const savedBefore = (b) => {
    const diff = new Date(b.createdAt) - new Date(newBooking.createdAt);
    return diff < 0 || (diff === 0 && b.orderId < orderId);
  };
  const earlier = (await activeBookingsOn(date)).filter((b) => b.orderId !== orderId && savedBefore(b));
  if (!isSlotFree(earlier)) {
    await Booking.deleteOne({ orderId });
    return slotTaken();
  }

  return { status: 201, body: { success: true, data: newBooking } };
}
