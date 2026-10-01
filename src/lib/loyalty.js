// Phone numbers and Loyalty Member rules — pure functions, safe on both server and client

// --- Mongolian phone numbers ---
// Local mobile numbers are 8 digits starting with 6–9 (e.g. 99112233, 88xxxxxx, 69xxxxxx).
// Accepts "9911 2233", "+976 99112233", "976-99112233".
export function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('976')) digits = digits.slice(3);
  return /^[6-9]\d{7}$/.test(digits) ? digits : null;
}

export const formatPhone = (phone) => (phone ? `${phone.slice(0, 4)} ${phone.slice(4)}` : '');

// --- Loyalty Member rules ---
// Spending since the last reset (₮) → months of Loyalty Member status. Edit these to change the programme.
export const LOYALTY_RULES = [
  { minSpend: 3_000_000, months: 6 },
  { minSpend: 5_000_000, months: 6 },
  { minSpend: 10_000_000, months: 12 },
];
// Every booking that isn't cancelled counts — Pending as soon as it's booked, and Completed.
// Cancelling a booking removes its money from the progress again.
export const COUNTED_STATUSES = ['Pending', 'Confirmed', 'Paid', 'Completed'];
const SALON_UTC_OFFSET = '+08:00'; // Asia/Ulaanbaatar

const monthsFor = (spend) => Math.max(0, ...LOYALTY_RULES.filter((r) => spend >= r.minSpend).map((r) => r.months));

const addMonths = (ms, months) => {
  const dt = new Date(ms);
  dt.setMonth(dt.getMonth() + months);
  return dt.getTime();
};

// When a booking counts: the moment it was made (older records without a timestamp: the appointment end)
const spentAt = (b) =>
  b.createdAt
    ? new Date(b.createdAt).getTime()
    : new Date(`${b.date}T${b.endTime || b.time}:00${SALON_UTC_OFFSET}`).getTime();

/**
 * Loyalty Member status from a customer's booking history.
 *
 * A cycle starts at zero. Spending adds up; reaching 3M (or 5M) starts 6 months
 * of Loyalty Member status, reaching 10M in the same cycle makes it 12 months from the same start.
 * When the membership runs out the counter resets to zero and a new cycle begins.
 */
export function computeLoyalty(bookings, now = Date.now()) {
  const purchases = bookings
    .filter((b) => COUNTED_STATUSES.includes(b.status) && b.price > 0)
    .map((b) => ({ amount: b.price, at: spentAt(b) }))
    .filter((p) => p.at <= now)
    .sort((a, b) => a.at - b.at);

  let cycleSpend = 0;
  let since = null;
  let until = null;
  let months = 0;
  const resetCycle = () => {
    cycleSpend = 0;
    since = until = null;
    months = 0;
  };

  for (const p of purchases) {
    if (until && p.at >= until) resetCycle(); // Membership ran out before this purchase
    cycleSpend += p.amount;
    const earned = monthsFor(cycleSpend);
    if (earned > months) {
      since ??= p.at;
      months = earned;
      until = addMonths(since, months);
    }
  }
  if (until && now >= until) resetCycle();

  const isMember = !!until;
  // Next rule that would give more months than the customer has now
  const next = LOYALTY_RULES.filter((r) => r.months > months && r.minSpend > cycleSpend).sort(
    (a, b) => a.minSpend - b.minSpend
  )[0];

  return {
    isMember,
    months,
    since,
    until,
    daysLeft: isMember ? Math.ceil((until - now) / 86_400_000) : 0,
    cycleSpend,
    totalSpend: purchases.reduce((sum, p) => sum + p.amount, 0),
    nextGoal: next ? { ...next, remaining: next.minSpend - cycleSpend } : null,
  };
}
