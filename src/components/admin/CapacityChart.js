'use client';

import { SLOT_MINUTES, WORKER_COUNT, dayTimeline, toMinutes } from '@/lib/schedule';

// Cell colour by how full the slot is
const levelClass = (busy) =>
  busy >= WORKER_COUNT ? 'bg-rose-500' : busy >= WORKER_COUNT - 1 ? 'bg-amber-400' : 'bg-primary';

/**
 * nowMinutes: minutes since midnight that count as "already passed"
 * (Infinity for past days, -Infinity for future days).
 * One column per 30-min slot, one cell per worker (filled = busy).
 * Clicking a column with free workers starts a new booking at that time.
 */
export default function CapacityChart({ bookings, isToday, nowMinutes, onPickTime }) {
  const timeline = dayTimeline(bookings);

  return (
    <div className="overflow-x-auto -mx-2 px-2 pb-1">
      <div className="flex gap-1 min-w-[640px]">
        {timeline.map(({ time, busy }) => {
          const start = toMinutes(time);
          const isPast = start + SLOT_MINUTES <= nowMinutes;
          const isNow = isToday && start <= nowMinutes && nowMinutes < start + SLOT_MINUTES;
          const free = Math.max(0, WORKER_COUNT - busy);
          const canBook = !isPast && free > 0;

          return (
            <button
              key={time}
              type="button"
              disabled={!canBook}
              onClick={() => onPickTime(time)}
              title={`${time} · ${busy}/${WORKER_COUNT} завгүй · ${free} сул`}
              className={`group flex-1 flex flex-col items-center gap-1 rounded-lg pt-2 pb-1 transition-colors ${
                isNow ? 'bg-primary/10 ring-1 ring-primary/40' : canBook ? 'hover:bg-muted' : ''
              } ${isPast ? 'opacity-40' : ''} ${canBook ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`text-[10px] font-bold ${free === 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                {free === 0 ? 'Дүүрсэн' : `${free} сул`}
              </span>
              <div className="flex flex-col-reverse gap-0.5 w-full max-w-[22px]">
                {Array.from({ length: WORKER_COUNT }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 rounded-[3px] transition-colors ${
                      i < busy ? levelClass(busy) : 'bg-muted group-hover:bg-primary/15'
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-[10px] tabular-nums ${
                  isNow ? 'font-bold text-primary' : time.endsWith(':00') ? 'text-foreground' : 'text-muted-foreground/60'
                }`}
              >
                {time.endsWith(':00') || isNow ? time : '·'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
