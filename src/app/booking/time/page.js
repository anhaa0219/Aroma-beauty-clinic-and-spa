'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import CalendarPicker from '@/components/booking/CalendarPicker';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import { BOOKING_WINDOW_DAYS, describeItems, parseItems, salonNow, serializeItems } from '@/lib/schedule';
import { addDays, formatDateMn, formatMoney } from '@/lib/formatters';

const STEPS = ['Үйлчилгээ', 'Өдөр, цаг', 'Баталгаажуулах'];
const WEEKDAY_SHORT = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

function Steps({ current }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  state === 'current'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : state === 'done'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              <span className={`hidden sm:inline text-sm font-semibold ${state === 'current' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </span>
            {i < STEPS.length - 1 && <span className="w-6 sm:w-12 h-px bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function BookingTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "trt-1:2,trt-5:1" (or a single ?serviceId= from older links)
  const items = parseItems(searchParams.get('items') || searchParams.get('serviceId'));
  const itemsParam = items ? serializeItems(items) : '';
  const order = items ? describeItems(items) : null;

  const [today] = useState(() => salonNow().date);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Re-read availability from MongoDB whenever the date changes
  useEffect(() => {
    if (!selectedDate || !itemsParam) return;

    const controller = new AbortController();
    async function fetchAvailability() {
      setLoadingSlots(true);
      setError('');
      try {
        const query = new URLSearchParams({ date: selectedDate, items: itemsParam });
        const res = await fetch(`/api/bookings?${query}`, { signal: controller.signal });
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots);
        } else {
          setSlots(null);
          setError(data.error || 'Could not load availability.');
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching availability:', err);
        setError('Network error. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoadingSlots(false);
      }
    }

    fetchAvailability();
    return () => controller.abort();
  }, [selectedDate, itemsParam]);

  const selectedSlot = slots?.find((s) => s.time === selectedTime);
  const canContinue = !!selectedSlot?.available && !loadingSlots;

  const pickDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleContinue = () => {
    if (canContinue) {
      const query = new URLSearchParams({ items: itemsParam, date: selectedDate, time: selectedTime });
      router.push(`/booking/payment?${query}`);
    }
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-xl text-primary mb-4">Missing booking details.</p>
        <button onClick={() => router.push('/booking')} className="text-primary underline">Start Over</button>
      </div>
    );
  }

  // Quick picks for the next two weeks
  const quickDays = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  return (
    <div className="w-full flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 text-foreground w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 text-primary font-medium hover:opacity-70 inline-flex items-center gap-1 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Буцах
        </button>

        <Steps current={1} />

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-primary text-center">
          Өдөр, цагаа сонгоно уу
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Цэг бүр нэг сул ажилтныг илэрхийлнэ. Таны захиалгад <b className="text-foreground">{order.people}</b> ажилтан
          зэрэг хэрэгтэй.
        </p>

        {/* Quick date strip */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 snap-x">
          {quickDays.map((date, i) => {
            const d = new Date(`${date}T00:00:00Z`);
            const isSelected = date === selectedDate;
            const isWeekend = [0, 6].includes(d.getUTCDay());
            return (
              <button
                key={date}
                onClick={() => pickDate(date)}
                className={`snap-start shrink-0 w-16 py-3 rounded-2xl border-2 flex flex-col items-center transition-all ${
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'opacity-80' : isWeekend ? 'text-rose-500' : 'text-muted-foreground'}`}>
                  {i === 0 ? 'Өнөөдөр' : i === 1 ? 'Маргааш' : WEEKDAY_SHORT[d.getUTCDay()]}
                </span>
                <span className="text-xl font-extrabold tabular-nums">{d.getUTCDate()}</span>
                <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                  {d.getUTCMonth() + 1}-р сар
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-6 items-start">
          {/* --- 1. DATE --- */}
          <section className="bg-card border border-border p-5 rounded-3xl shadow-sm">
            <h2 className="flex items-center gap-2 font-bold mb-4 text-foreground">
              <CalendarDays className="w-5 h-5 text-primary" /> Өдөр
            </h2>
            <CalendarPicker
              value={selectedDate}
              minDate={today}
              maxDays={BOOKING_WINDOW_DAYS}
              onChange={pickDate}
            />
          </section>

          {/* --- 2. TIME --- */}
          <section className="bg-card border border-border p-5 rounded-3xl shadow-sm">
            <h2 className="flex items-center gap-2 font-bold mb-4 text-foreground">
              <Clock className="w-5 h-5 text-primary" /> Цаг
              {selectedDate && <span className="text-sm font-medium text-muted-foreground">· {formatDateMn(selectedDate)}</span>}
            </h2>
            <TimeSlotPicker
              slots={slots}
              hasDate={!!selectedDate}
              loading={loadingSlots}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              people={order.people}
            />
            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          </section>

          {/* --- SUMMARY --- */}
          <aside className="lg:sticky lg:top-24 bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl shadow-primary/20 space-y-5">
            <h2 className="font-extrabold text-lg">Таны захиалга</h2>
            <ul className="space-y-2 text-sm">
              {order.lines.map((l) => (
                <li key={l.serviceId} className="flex justify-between gap-3">
                  <span className="opacity-90">
                    {l.serviceName}
                    {l.quantity > 1 && <b> ×{l.quantity}</b>}
                  </span>
                  <span className="whitespace-nowrap opacity-80">{l.durationMinutes}м</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-white/10 p-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 opacity-70" />
                {selectedDate ? formatDateMn(selectedDate) : <span className="opacity-60">Өдөр сонгоогүй</span>}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 opacity-70" />
                {selectedSlot?.available ? (
                  <b>
                    {selectedSlot.time} – {selectedSlot.endTime}
                  </b>
                ) : (
                  <span className="opacity-60">Цаг сонгоогүй</span>
                )}
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-4 h-4 opacity-70" /> {order.people} хүн · {order.durationMinutes} мин
              </p>
            </div>
            <div className="flex items-end justify-between border-t border-white/20 pt-4">
              <span className="text-sm opacity-80">Нийт</span>
              <span className="text-2xl font-extrabold">{formatMoney(order.totalPrice)}</span>
            </div>
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full py-3.5 rounded-2xl font-extrabold bg-white text-primary inline-flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              Үргэлжлүүлэх <ArrowRight className="w-4 h-4" />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function BookingTimePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Loading calendar...</div>}>
      <BookingTimeContent />
    </Suspense>
  );
}
