'use client';

import { ACTIVE_STATUSES, CLOSE_TIME, OPEN_TIME, WORKER_COUNT, toMinutes } from '@/lib/schedule';

const OPEN = toMinutes(OPEN_TIME);
const CLOSE = toMinutes(CLOSE_TIME);
const SPAN = CLOSE - OPEN;
const HOURS = Array.from({ length: SPAN / 60 + 1 }, (_, i) => OPEN + i * 60);
const pct = (minutes) => `${((Math.min(Math.max(minutes, OPEN), CLOSE) - OPEN) / SPAN) * 100}%`;

// One bar per person (each needs its own worker), packed into rows so bars never overlap
function buildLanes(bookings) {
  const units = [];
  for (const b of bookings) {
    const start = toMinutes(b.time);
    const lines = b.items?.length
      ? b.items
      : [{ serviceName: b.serviceName, durationMinutes: b.durationMinutes || 60, quantity: 1 }];
    const total = lines.reduce((sum, l) => sum + l.quantity, 0);
    let n = 0;
    for (const l of lines) {
      for (let q = 0; q < l.quantity; q++) {
        n += 1;
        units.push({ booking: b, serviceName: l.serviceName, start, end: start + (l.durationMinutes || 60), n, total });
      }
    }
  }
  units.sort((a, b) => a.start - b.start || b.end - a.end);

  const lanes = [];
  for (const u of units) {
    const lane = lanes.find((l) => l.at(-1).end <= u.start);
    if (lane) lane.push(u);
    else lanes.push([u]);
  }
  while (lanes.length < WORKER_COUNT) lanes.push([]);
  return lanes;
}

const barClass = (booking, overdue) =>
  booking.status === 'Completed'
    ? 'bg-slate-200 text-slate-700 border-slate-300'
    : overdue
      ? 'bg-amber-100 text-amber-900 border-amber-400 border-dashed'
      : 'bg-primary text-primary-foreground border-primary';

/**
 * Gantt-style timetable of a day's bookings (cancelled ones excluded).
 * nowMinutes: current time when viewing today, otherwise null.
 */
export default function DayTimetable({ bookings, nowMinutes, isPastDay, onSelect }) {
  const lanes = buildLanes(bookings.filter((b) => b.status !== 'Cancelled'));
  const showNow = nowMinutes != null && nowMinutes >= OPEN && nowMinutes <= CLOSE;

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="min-w-[720px]">
        {/* Hour ruler */}
        <div className="relative h-6 ml-8 mb-1">
          {HOURS.map((m) => (
            <span
              key={m}
              className="absolute -translate-x-1/2 text-[10px] font-semibold text-muted-foreground tabular-nums"
              style={{ left: pct(m) }}
            >
              {String(m / 60).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        <div className="relative">
          {/* Grid lines */}
          <div className="absolute inset-0 ml-8 pointer-events-none">
            {HOURS.map((m) => (
              <span key={m} className="absolute top-0 bottom-0 w-px bg-border/70" style={{ left: pct(m) }} />
            ))}
            {showNow && (
              <span className="absolute -top-2 bottom-0 w-0.5 bg-rose-500 z-10" style={{ left: pct(nowMinutes) }}>
                <span className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-rose-500" />
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {lanes.map((lane, i) => (
              <div key={i} className="flex items-center">
                <span className="w-8 shrink-0 text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                <div className={`relative flex-1 h-11 rounded-lg ${i < WORKER_COUNT ? 'bg-muted/40' : 'bg-rose-50'}`}>
                  {lane.map((u) => {
                    const overdue =
                      ACTIVE_STATUSES.includes(u.booking.status) &&
                      (isPastDay || (nowMinutes != null && u.end <= nowMinutes));
                    return (
                      <button
                        key={`${u.booking.orderId}-${u.n}`}
                        type="button"
                        onClick={() => onSelect(u.booking)}
                        title={`${u.booking.customerName} · ${u.serviceName} · ${u.booking.time}`}
                        className={`absolute top-1 bottom-1 rounded-md border px-2 text-left overflow-hidden hover:brightness-95 hover:z-20 hover:shadow-lg transition-all ${barClass(u.booking, overdue)}`}
                        style={{ left: pct(u.start), width: `calc(${pct(u.end)} - ${pct(u.start)})` }}
                      >
                        <span className="block text-[11px] font-bold truncate leading-tight mt-0.5">
                          {u.booking.customerName}
                          {u.total > 1 && <span className="opacity-70 font-medium"> {u.n}/{u.total}</span>}
                        </span>
                        <span className="block text-[10px] opacity-80 truncate leading-tight">{u.serviceName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
