'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays } from '@/lib/formatters';

const WEEKDAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']; // Mon → Sun

const pad = (n) => String(n).padStart(2, '0');
const toDateString = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const monthIndex = (dateString) => {
  const [y, m] = dateString.split('-').map(Number);
  return y * 12 + (m - 1);
};

/**
 * Month-grid calendar that always stays on screen.
 * - minDate / maxDays limit the selectable range (omit for no limit, e.g. admin history)
 * - today gets a ring
 * - marks: { 'YYYY-MM-DD': count } shows a small booking count under the day
 */
export default function CalendarPicker({ value, onChange, minDate, maxDays, today = minDate, marks }) {
  const maxDate = minDate && maxDays != null ? addDays(minDate, maxDays) : null;

  const [view, setView] = useState(() => monthIndex(value || today || minDate));
  // Follow the selected date when it changes from outside (e.g. "Today" button)
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value) setView(monthIndex(value));
  }

  const year = Math.floor(view / 12);
  const month = view % 12;
  const canGoPrev = !minDate || view > monthIndex(minDate);
  const canGoNext = !maxDate || view < monthIndex(maxDate);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setView((v) => v - 1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center leading-tight">
          <p className="font-extrabold text-lg text-foreground">{month + 1}-р сар</p>
          <p className="text-xs text-muted-foreground">{year} он</p>
        </div>
        <button
          type="button"
          onClick={() => setView((v) => v + 1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[11px] font-bold py-1 ${i >= 5 ? 'text-rose-400' : 'text-muted-foreground'}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateString = toDateString(year, month, day);
          const isDisabled = (minDate && dateString < minDate) || (maxDate && dateString > maxDate);
          const isSelected = dateString === value;
          const isToday = dateString === today;
          const isWeekend = (leadingBlanks + i) % 7 >= 5;
          const count = marks?.[dateString] || 0;

          return (
            <button
              key={dateString}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(dateString)}
              aria-label={dateString}
              aria-pressed={isSelected}
              className={`relative aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
                  : isDisabled
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : `${isWeekend ? 'text-rose-500' : 'text-foreground'} hover:bg-primary/10 hover:text-primary ${
                        isToday ? 'ring-2 ring-primary/40' : ''
                      }`
              }`}
            >
              {day}
              {isToday && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
              {count > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                    isSelected ? 'bg-white text-primary' : 'bg-amber-400 text-white'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
