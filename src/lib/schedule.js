import { servicesList, clinicList } from '@/lib/data';

// Salon working hours (see salonInfo.details.workingHours) and slot grid size
export const OPEN_TIME = '09:00';
export const CLOSE_TIME = '20:00'; // Salon closes; no treatment may run past this
export const LAST_SLOT_TIME = '19:00'; // Latest a booking may start (last order)
export const SLOT_MINUTES = 30;
export const WORKER_COUNT = 5; // How many clients can be served at the same time
// Bookings that occupy workers (Completed frees the worker, e.g. when a treatment ends early)
export const ACTIVE_STATUSES = ['Confirmed', 'Paid', 'Pending'];
export const BOOKING_WINDOW_DAYS = 60; // How far ahead customers may book
export const SALON_TIMEZONE = 'Asia/Ulaanbaatar';
export const DEFAULT_DURATION = 60; // Fallback for old bookings / unknown services

export const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const toTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// Every slot start on the grid: 09:00, 09:30, 10:00 ... 19:00 (last order)
export const ALL_SLOTS = (() => {
  const slots = [];
  for (let m = toMinutes(OPEN_TIME); m <= toMinutes(LAST_SLOT_TIME); m += SLOT_MINUTES) {
    slots.push(toTime(m));
  }
  return slots;
})();

export const findService = (serviceId) =>
  servicesList.find((s) => s.id === serviceId) || clinicList.find((s) => s.id === serviceId);

// Duration rounded up to the slot grid, so a 70 min treatment blocks 90 min
export const blockedMinutes = (durationMinutes) =>
  Math.ceil((durationMinutes || DEFAULT_DURATION) / SLOT_MINUTES) * SLOT_MINUTES;

/**
 * A booking is a group order: one or more treatments that all start together.
 * Every treatment needs its own worker, so `quantity` = number of people/workers.
 * items: [{ serviceId, quantity }]  →  null when invalid or more than WORKER_COUNT people
 */
export function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const merged = {};
  for (const { serviceId, quantity } of items) {
    const qty = Number(quantity);
    if (!findService(serviceId) || !Number.isInteger(qty) || qty < 1) return null;
    merged[serviceId] = (merged[serviceId] || 0) + qty;
  }
  const result = Object.entries(merged).map(([serviceId, quantity]) => ({ serviceId, quantity }));
  return countPeople(result) <= WORKER_COUNT ? result : null;
}

export const countPeople = (items) => items.reduce((sum, i) => sum + i.quantity, 0);

// URL format: "trt-1:2,trt-5:1"
export const serializeItems = (items) => items.map((i) => `${i.serviceId}:${i.quantity}`).join(',');
export const parseItems = (text) =>
  normalizeItems(
    (text || '').split(',').filter(Boolean).map((part) => {
      const [serviceId, quantity = '1'] = part.split(':');
      return { serviceId, quantity: Number(quantity) };
    })
  );

// Attach name/duration/price from our own data and summarise the whole order
export function describeItems(items) {
  const lines = items.map(({ serviceId, quantity }) => {
    const service = findService(serviceId);
    return {
      serviceId,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price || 0,
      quantity,
    };
  });
  return {
    lines,
    people: countPeople(lines),
    durationMinutes: Math.max(...lines.map((l) => l.durationMinutes)), // Longest treatment
    totalPrice: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    summary: lines.map((l) => (l.quantity > 1 ? `${l.serviceName} ×${l.quantity}` : l.serviceName)).join(', '),
  };
}

// Workers needed at minute `t` by treatments starting at `start`
const itemsLoadAt = (t, start, items) =>
  items.reduce((sum, i) => {
    const end = start + blockedMinutes(i.durationMinutes);
    return start <= t && t < end ? sum + i.quantity : sum;
  }, 0);

// Workers a stored booking keeps busy at minute `t` (bookings saved before group orders count as 1 person)
const bookingLoadAt = (t, booking) => {
  const start = toMinutes(booking.time);
  if (booking.items?.length) return itemsLoadAt(t, start, booking.items);
  const duration = booking.durationMinutes || findService(booking.serviceId)?.durationMinutes;
  return itemsLoadAt(t, start, [{ durationMinutes: duration, quantity: 1 }]);
};

// Current date (YYYY-MM-DD) and minutes-since-midnight in the salon's timezone
export const salonNow = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: SALON_TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

// Workers busy at minute `t` across all stored bookings
export const busyAt = (t, bookings) => bookings.reduce((sum, b) => sum + bookingLoadAt(t, b), 0);

/**
 * Availability of every slot for one day for a group order.
 * A start time works when, at every 30-min step, the workers already busy plus
 * the workers this order needs at that moment stay within WORKER_COUNT,
 * and every treatment ends before closing.
 * `lines` comes from describeItems() (needs durationMinutes + quantity).
 */
// graceMinutes lets the admin book a slot that has already started (walk-in clients).
// A booking may start up to LAST_SLOT_TIME (the last slot) and run past closing — the
// worker simply stays to finish, so no "ends before closing" check here.
export function computeSlots({ date, lines, bookings, graceMinutes = 0 }) {
  const longest = Math.max(...lines.map((l) => l.durationMinutes));
  const length = blockedMinutes(longest);
  const now = salonNow();

  return ALL_SLOTS.map((time) => {
    const start = toMinutes(time);
    const end = start + length;
    const isPast = date < now.date || (date === now.date && start + graceMinutes <= now.minutes);

    let freeCount = 0; // Workers free during the whole visit
    let fits = false;
    if (!isPast) {
      freeCount = WORKER_COUNT;
      fits = true;
      for (let t = start; t < end; t += SLOT_MINUTES) {
        const busy = busyAt(t, bookings);
        freeCount = Math.min(freeCount, Math.max(0, WORKER_COUNT - busy));
        if (busy + itemsLoadAt(t, start, lines) > WORKER_COUNT) fits = false;
      }
    }

    return {
      time,
      endTime: toTime(start + longest),
      available: fits,
      freeCount,
      reason: isPast ? 'past' : !fits ? 'full' : null,
    };
  });
}

export const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date || '') && !isNaN(new Date(date));

// Workers busy in every 30-min slot of a day (for the admin capacity chart)
export const dayTimeline = (bookings) =>
  ALL_SLOTS.map((time) => ({ time, busy: busyAt(toMinutes(time), bookings) }));
