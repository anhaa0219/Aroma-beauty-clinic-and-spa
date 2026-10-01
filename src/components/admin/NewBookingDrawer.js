'use client';

import { useEffect, useState } from 'react';
import { Crown, Footprints, Phone, Search, X, Zap } from 'lucide-react';
import { servicesList, clinicList } from '@/lib/data';
import CalendarPicker from '@/components/booking/CalendarPicker';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import { BOOKING_WINDOW_DAYS, WORKER_COUNT, describeItems, serializeItems } from '@/lib/schedule';
import { formatDateMn, formatMoney } from '@/lib/formatters';
import { normalizePhone } from '@/lib/loyalty';

const ALL_SERVICES = [...servicesList, ...clinicList.map((s) => ({ ...s, category: 'Clinic' }))];
const CATEGORIES = [
  { key: 'all', label: 'Бүгд' },
  { key: 'Body Spa', label: 'Биеийн спа' },
  { key: 'Facial', label: 'Нүүр' },
  { key: 'Hair', label: 'Үс' },
  { key: 'Clinic', label: 'Клиник' },
];
const SOURCES = [
  { key: 'phone', label: 'Утсаар', hint: 'Phone call', Icon: Phone },
  { key: 'walk-in', label: 'Биечлэн', hint: 'Walk-in', Icon: Footprints },
];

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';

function Section({ step, title, children, aside }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {step}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * Slide-over form for booking phone-call and walk-in clients.
 * Mounted fresh each time it opens, so presets only seed the initial state.
 */
export default function NewBookingDrawer({ today, presetDate, presetTime, loyaltyByPhone = {}, onClose, onCreated }) {
  const [source, setSource] = useState(presetDate === today && !presetTime ? 'walk-in' : 'phone');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [date, setDate] = useState(presetDate || today);
  const [time, setTime] = useState(presetTime || null);
  const [slots, setSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const items = Object.entries(quantities).map(([serviceId, quantity]) => ({ serviceId, quantity }));
  const itemsParam = items.length ? serializeItems(items) : '';
  const order = items.length ? describeItems(items) : null;
  const people = order?.people || 0;
  const selectedSlot = slots?.find((s) => s.time === time);
  const normalizedPhone = normalizePhone(customerPhone);
  const phoneInvalid = !!customerPhone.trim() && !normalizedPhone;
  const knownMember = normalizedPhone ? loyaltyByPhone[normalizedPhone] : null;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Re-read availability whenever the date or the treatments change
  useEffect(() => {
    if (!itemsParam) return;
    const controller = new AbortController();
    (async () => {
      setLoadingSlots(true);
      try {
        const query = new URLSearchParams({ date, items: itemsParam });
        const res = await fetch(`/api/admin/availability?${query}`, { signal: controller.signal });
        const data = await res.json();
        setSlots(data.success ? data.slots : null);
        if (!data.success) setError(data.error);
      } catch (err) {
        if (err.name !== 'AbortError') setError('Network error. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoadingSlots(false);
      }
    })();
    return () => controller.abort();
  }, [date, itemsParam, refreshKey]);

  const changeQuantity = (serviceId, delta) =>
    setQuantities((prev) => {
      const total = Object.values(prev).reduce((sum, q) => sum + q, 0);
      if (delta > 0 && total >= WORKER_COUNT) return prev;
      const next = { ...prev, [serviceId]: Math.max(0, (prev[serviceId] || 0) + delta) };
      if (next[serviceId] === 0) delete next[serviceId];
      return next;
    });

  const pickNearest = () => {
    const first = slots?.find((s) => s.available);
    if (first) setTime(first.time);
  };

  const visibleServices = ALL_SERVICES.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      s.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const phoneRequired = source === 'phone';
  const canSubmit =
    !!customerName.trim() &&
    (!phoneRequired || !!normalizedPhone) &&
    !phoneInvalid &&
    people > 0 &&
    !!selectedSlot?.available &&
    !loadingSlots &&
    !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerPhone, note, source, items, date, time }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.data);
      } else {
        setError(data.error || 'Could not create the booking.');
        // Someone else may have taken the slot: refresh the grid
        if (res.status === 409) setRefreshKey((k) => k + 1);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Шинэ захиалга">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-extrabold text-primary">Шинэ захиалга</h2>
            <p className="text-xs text-muted-foreground">New booking · phone call or walk-in</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* 1. Client */}
          <Section step={1} title="Үйлчлүүлэгч">
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map(({ key, label, hint, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSource(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    source === key
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      source === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block font-bold text-sm">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Нэр (Name) *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoFocus
              />
              <input
                className={inputClass}
                type="tel"
                placeholder={phoneRequired ? 'Утас (Phone) *' : 'Утас (заавал биш)'}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            {phoneInvalid && (
              <p className="text-xs text-rose-600 -mt-1">8 оронтой Монгол дугаар оруулна уу (жишээ нь 9911 2233)</p>
            )}
            {knownMember?.isMember && (
              <p className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                <Crown className="w-3.5 h-3.5" /> Loyalty Member · {knownMember.daysLeft} хоног үлдсэн
              </p>
            )}
            <input
              className={inputClass}
              placeholder="Тэмдэглэл (Note) — жишээ нь: харшилтай, байнгын үйлчлүүлэгч..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Section>

          {/* 2. Treatments */}
          <Section
            step={2}
            title="Эмчилгээ"
            aside={
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  people >= WORKER_COUNT ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'
                }`}
              >
                {people} / {WORKER_COUNT} хүн
              </span>
            }
          >
            {order && (
              <div className="flex flex-wrap gap-2">
                {order.lines.map((l) => (
                  <span
                    key={l.serviceId}
                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    {l.serviceName}
                    {l.quantity > 1 && <span className="opacity-80">×{l.quantity}</span>}
                    <button
                      type="button"
                      onClick={() => changeQuantity(l.serviceId, -l.quantity)}
                      aria-label={`Remove ${l.serviceName}`}
                      className="w-5 h-5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Эмчилгээ хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                    category === c.key
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="border border-border rounded-xl divide-y divide-border max-h-72 overflow-y-auto bg-card">
              {visibleServices.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground text-center">Олдсонгүй</p>
              )}
              {visibleServices.map((s) => {
                const qty = quantities[s.id] || 0;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-2.5 ${qty > 0 ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.durationMinutes} мин · {s.price ? formatMoney(s.price) : 'Үнэ лавлах'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => changeQuantity(s.id, -1)}
                            aria-label="Remove one"
                            className="w-7 h-7 rounded-full border border-primary text-primary font-bold hover:bg-primary/10"
                          >
                            −
                          </button>
                          <span className="w-4 text-center text-sm font-bold text-primary">{qty}</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => changeQuantity(s.id, 1)}
                        disabled={people >= WORKER_COUNT}
                        aria-label="Add one"
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* 3. Date & time */}
          <Section
            step={3}
            title="Өдөр, цаг"
            aside={
              <button
                type="button"
                onClick={pickNearest}
                disabled={!slots?.some((s) => s.available) || loadingSlots}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Хамгийн ойр сул цаг
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <CalendarPicker
                  value={date}
                  minDate={today}
                  maxDays={BOOKING_WINDOW_DAYS}
                  onChange={(d) => {
                    setDate(d);
                    setTime(null);
                  }}
                />
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                {people === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    Эхлээд эмчилгээгээ сонгоно уу
                    <br />
                    <span className="text-xs">Pick treatments to see free times</span>
                  </p>
                ) : (
                  <TimeSlotPicker
                    slots={slots}
                    hasDate
                    loading={loadingSlots}
                    selectedTime={time}
                    onSelect={setTime}
                    people={people}
                  />
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-4 space-y-3">
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-bold text-foreground">
                {formatDateMn(date)}
                {selectedSlot?.available && (
                  <span className="text-primary"> · {selectedSlot.time} – {selectedSlot.endTime}</span>
                )}
              </p>
              <p className="text-muted-foreground">
                {people} хүн · Нийт <span className="font-bold text-foreground">{formatMoney(order?.totalPrice)}</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Хадгалж байна...' : 'Захиалга үүсгэх'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
