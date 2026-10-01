'use client';

import { Check, Moon, Sun, Sunrise } from 'lucide-react';
import { ALL_SLOTS, WORKER_COUNT } from '@/lib/schedule';

const PERIODS = [
  { key: 'morning', label: 'Өглөө', Icon: Sunrise, from: '00:00', to: '12:00' },
  { key: 'day', label: 'Өдөр', Icon: Sun, from: '12:00', to: '17:00' },
  { key: 'evening', label: 'Орой', Icon: Moon, from: '17:00', to: '24:00' },
];

const LEGEND = [
  { label: 'Сул', cls: 'bg-background border-primary/30' },
  { label: 'Цөөн үлдсэн', cls: 'bg-amber-50 border-amber-300' },
  { label: 'Дүүрсэн', cls: 'bg-muted border-transparent' },
];

const REASON_LABEL = { past: 'Өнгөрсөн', closing: 'Хаахаас өмнө дуусахгүй', full: 'Дүүрсэн' };

// One dot per worker: filled = free
function WorkerDots({ free, tone }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: WORKER_COUNT }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < free
              ? tone === 'selected'
                ? 'bg-primary-foreground'
                : tone === 'few'
                  ? 'bg-amber-500'
                  : 'bg-primary'
              : tone === 'selected'
                ? 'bg-primary-foreground/30'
                : 'bg-muted-foreground/20'
          }`}
        />
      ))}
    </span>
  );
}

/**
 * Fixed grid of 30-min start times that always stays on screen.
 * `slots` is the availability array from the API (null until a date is picked).
 * `people` = workers this order needs (used to flag times with few spots left).
 */
export default function TimeSlotPicker({ slots, selectedTime, onSelect, loading, hasDate, people = 1 }) {
  const byTime = Object.fromEntries((slots || []).map((s) => [s.time, s]));
  const ready = hasDate && !loading && !!slots;
  const availableCount = ready ? slots.filter((s) => s.available).length : 0;

  return (
    <div className="space-y-5">
      {/* Status line + legend */}
      <div className="space-y-3">
        <p className="text-sm">
          {!hasDate ? (
            <span className="text-muted-foreground">👈 Эхлээд өдрөө сонгоно уу</span>
          ) : loading || !slots ? (
            <span className="text-primary animate-pulse">Сул цаг шалгаж байна...</span>
          ) : availableCount === 0 ? (
            <span className="text-rose-600 font-semibold">Энэ өдөр сул цаг алга. Өөр өдөр сонгоно уу.</span>
          ) : (
            <span className="text-foreground">
              <b className="text-primary">{availableCount}</b> сул цаг байна
              {people > 1 && <span className="text-muted-foreground"> · {people} ажилтан зэрэг хэрэгтэй</span>}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded border ${l.cls}`} />
              {l.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <WorkerDots free={3} /> = сул ажилтан
          </span>
        </div>
      </div>

      {PERIODS.map(({ key, label, Icon, from, to }) => {
        const times = ALL_SLOTS.filter((t) => t >= from && t < to);
        if (times.length === 0) return null;
        return (
          <div key={key}>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <Icon className="w-3.5 h-3.5" /> {label}
            </p>
            <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 transition-opacity ${loading ? 'opacity-50' : ''}`}>
              {times.map((time) => {
                const slot = byTime[time];
                const isSelected = selectedTime === time && !!slot?.available;
                const isAvailable = ready && !!slot?.available;
                const isFew = isAvailable && slot.freeCount - people <= 1 && slot.freeCount < WORKER_COUNT;
                const tone = isSelected ? 'selected' : isFew ? 'few' : 'normal';

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onSelect(time)}
                    title={
                      isAvailable
                        ? `${time} – ${slot.endTime} · ${slot.freeCount} ажилтан сул`
                        : ready && slot
                          ? REASON_LABEL[slot.reason]
                          : undefined
                    }
                    className={`relative py-2.5 px-1 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 -translate-y-0.5'
                        : isFew
                          ? 'bg-amber-50 border-amber-300 text-amber-900 hover:border-amber-500'
                          : isAvailable
                            ? 'bg-background border-primary/20 text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5'
                            : 'bg-muted/60 border-transparent text-muted-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                    <span className={`text-sm font-extrabold tabular-nums ${ready && slot && !isAvailable ? 'line-through' : ''}`}>
                      {time}
                    </span>
                    {isAvailable ? (
                      <WorkerDots free={slot.freeCount} tone={tone} />
                    ) : (
                      <span className="text-[9px] font-semibold leading-none h-1.5 flex items-center">
                        {ready && slot?.reason === 'full' ? 'Дүүрсэн' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
