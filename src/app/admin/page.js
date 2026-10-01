'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Check,
  Crown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Footprints,
  Globe,
  LogOut,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  StickyNote,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import CapacityChart from '@/components/admin/CapacityChart';
import NewBookingDrawer from '@/components/admin/NewBookingDrawer';
import CompleteBookingModal from '@/components/admin/CompleteBookingModal';
import DayTimetable from '@/components/admin/DayTimetable';
import CalendarPicker from '@/components/booking/CalendarPicker';
import { ACTIVE_STATUSES, WORKER_COUNT, busyAt, dayTimeline, salonNow, toMinutes, toTime } from '@/lib/schedule';
import { addDays, formatDateMn, formatMoney } from '@/lib/formatters';
import { computeLoyalty } from '@/lib/loyalty';

const REFRESH_MS = 30_000;

// Three states: Pending (incl. older Confirmed/Paid) → Completed or Cancelled
const TABS = [
  { key: 'active', label: 'Хүлээгдэж буй', match: (b) => ACTIVE_STATUSES.includes(b.status) },
  { key: 'Completed', label: 'Дууссан', match: (b) => b.status === 'Completed' },
  { key: 'Cancelled', label: 'Цуцалсан', match: (b) => b.status === 'Cancelled' },
  { key: 'all', label: 'Бүгд', match: () => true },
];

const endMinutesOf = (b) =>
  b.endTime ? toMinutes(b.endTime) : toMinutes(b.time) + (b.durationMinutes || 60);

// Pending bookings whose time has already passed: the admin still has to complete (or cancel) them
const isOverdue = (b, now) =>
  ACTIVE_STATUSES.includes(b.status) &&
  (b.date < now.date || (b.date === now.date && endMinutesOf(b) <= now.minutes));

const SOURCES = {
  online: { label: 'Онлайн', Icon: Globe, cls: 'bg-sky-100 text-sky-700' },
  phone: { label: 'Утсаар', Icon: Phone, cls: 'bg-violet-100 text-violet-700' },
  'walk-in': { label: 'Биечлэн', Icon: Footprints, cls: 'bg-amber-100 text-amber-800' },
};

const STATUS = {
  Pending: { label: 'Хүлээгдэж буй', cls: 'bg-sky-100 text-sky-700' },
  Confirmed: { label: 'Хүлээгдэж буй', cls: 'bg-sky-100 text-sky-700' },
  Paid: { label: 'Хүлээгдэж буй', cls: 'bg-sky-100 text-sky-700' },
  Completed: { label: 'Дууссан', cls: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Цуцалсан', cls: 'bg-rose-100 text-rose-700' },
};

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-foreground tabular-nums truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BookingRow({ booking, loyalty, now, showDate, onStatus, onComplete }) {
  const start = toMinutes(booking.time);
  const end = endMinutesOf(booking);
  const isActive = ACTIVE_STATUSES.includes(booking.status);
  const overdue = isOverdue(booking, now);
  const inProgress = isActive && booking.date === now.date && start <= now.minutes && now.minutes < end;
  const source = SOURCES[booking.source] || SOURCES.online;
  const status = STATUS[booking.status] || STATUS.Pending;
  const lines = booking.items?.length
    ? booking.items
    : [{ serviceId: booking.serviceId, serviceName: booking.serviceName, quantity: 1 }];

  return (
    <div
      className={`relative flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 rounded-2xl border bg-card transition-all ${
        inProgress
          ? 'border-primary/50 shadow-md shadow-primary/10'
          : overdue
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-border hover:border-primary/30'
      } ${booking.status === 'Cancelled' ? 'opacity-60' : ''}`}
    >
      {(inProgress || overdue) && (
        <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${inProgress ? 'bg-primary' : 'bg-amber-400'}`} />
      )}

      {/* Time */}
      <div className="flex md:flex-col items-baseline md:items-start gap-2 md:gap-0 md:w-24 shrink-0">
        <p className="text-2xl font-extrabold text-primary tabular-nums leading-none">{booking.time}</p>
        <p className="text-xs text-muted-foreground tabular-nums">– {booking.endTime || toTime(end)}</p>
        {showDate && <p className="text-xs font-semibold text-foreground md:mt-1">{booking.date}</p>}
      </div>

      {/* Client */}
      <div className="md:w-52 shrink-0 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-foreground truncate">{booking.customerName}</p>
          {loyalty?.isMember && (
            <span
              title={`Loyalty Member · ${loyalty.daysLeft} хоног үлдсэн`}
              className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300"
            >
              <Crown className="w-3 h-3" /> Loyalty
            </span>
          )}
          {overdue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
              <AlertTriangle className="w-3 h-3" /> Дуусгаагүй
            </span>
          )}
          {inProgress && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Явагдаж байна
            </span>
          )}
        </div>
        {booking.customerPhone && (
          <a href={`tel:${booking.customerPhone}`} className="text-sm text-muted-foreground hover:text-primary">
            {booking.customerPhone}
          </a>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${source.cls}`}>
            <source.Icon className="w-3 h-3" />
            {source.label}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{booking.orderId}</span>
        </div>
      </div>

      {/* Treatments */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap gap-1.5">
          {lines.map((l) => (
            <span key={l.serviceId} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground">
              {l.serviceName}
              {l.quantity > 1 && <span className="ml-1 opacity-70">×{l.quantity}</span>}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {booking.people || 1} хүн
          </span>
          <span>{booking.durationMinutes ? `${booking.durationMinutes} мин` : ''}</span>
          <span className="font-bold text-foreground">{formatMoney(booking.price)}</span>
        </p>
        {booking.note && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" /> {booking.note}
          </p>
        )}
        {booking.status === 'Completed' && booking.workers?.length > 0 && (
          <p className="text-xs text-emerald-800 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">Ажилласан:</span>
            {booking.workers.map((w) => (
              <span key={w.staffId} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-semibold">
                {w.staffName.split(' ')[0]}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Status & actions */}
      <div className="flex items-center gap-2 md:justify-end shrink-0">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
        {isActive && (
          <>
            <button
              onClick={() => onComplete(booking)}
              className={`h-9 px-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-bold transition-colors ${
                overdue
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-4 h-4" /> Дуусгах
            </button>
            <button
              onClick={() => onStatus(booking.orderId, 'Cancelled')}
              title="Цуцлах"
              aria-label="Cancel booking"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
        {!isActive && (
          <button
            onClick={() => onStatus(booking.orderId, 'Pending')}
            title="Хүлээгдэж буй руу буцаах"
            aria-label="Restore booking"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [now, setNow] = useState(() => salonNow());
  const [selectedDate, setSelectedDate] = useState(() => salonNow().date);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null); // { date, time } while the new-booking panel is open
  const [completing, setCompleting] = useState(null); // Booking whose workers are being chosen
  const [toast, setToast] = useState(null);

  const today = now.date;
  const isToday = selectedDate === today;

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBookings = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' });
      if (res.redirected) {
        router.replace('/admin/login'); // Session expired
        return;
      }
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
      setNow(salonNow());
    }
  }, [router]);

  // Initial load + auto-refresh so online bookings show up while the admin works
  useEffect(() => {
    const first = setTimeout(loadBookings, 0);
    const timer = setInterval(loadBookings, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [loadBookings]);

  // Pending / Completed (with workerIds) / Cancelled. Returns { ok, error } for the modal.
  const updateStatus = async (orderId, status, workerIds) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, workerIds }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setBookings((list) => list.map((b) => (b.orderId === orderId ? data.data : b)));
      showToast(
        status === 'Cancelled'
          ? 'Захиалга цуцлагдлаа'
          : status === 'Completed'
            ? 'Дууссан гэж хадгаллаа ✓'
            : 'Хүлээгдэж буй руу буцаалаа'
      );
      return { ok: true };
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
      return { ok: false, error: error.message };
    }
  };

  const completeBooking = async (workerIds) => {
    const result = await updateStatus(completing.orderId, 'Completed', workerIds);
    if (result.ok) setCompleting(null);
    return result;
  };
  const closeCompleting = useCallback(() => setCompleting(null), []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    router.replace('/admin/login');
  };

  const handleCreated = (booking) => {
    setDrawer(null);
    setBookings((list) => [booking, ...list]);
    setSelectedDate(booking.date);
    setTab('active');
    setSearch('');
    showToast(`${booking.customerName} · ${booking.time} захиалга үүслээ`);
  };

  const closeDrawer = useCallback(() => setDrawer(null), []);

  // Loyalty Member status per customer phone, from their whole booking history
  const bookingsByPhone = {};
  for (const b of bookings) {
    if (b.customerPhone) (bookingsByPhone[b.customerPhone] ||= []).push(b);
  }
  const loyaltyByPhone = Object.fromEntries(
    Object.entries(bookingsByPhone).map(([phone, list]) => [phone, computeLoyalty(list)])
  );

  // --- Derived data for the selected day ---
  const dayBookings = bookings.filter((b) => b.date === selectedDate);
  const capacityBookings = dayBookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const people = capacityBookings.reduce((sum, b) => sum + (b.people || 1), 0);
  const revenue = dayBookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const busyNow = isToday ? busyAt(now.minutes, capacityBookings) : 0;
  const peakBusy = Math.max(0, ...dayTimeline(capacityBookings).map((s) => s.busy));

  const overdueBookings = bookings
    .filter((b) => isOverdue(b, now))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Booking count per day for the calendar
  const marks = {};
  for (const b of bookings) {
    if (b.status !== 'Cancelled') marks[b.date] = (marks[b.date] || 0) + 1;
  }

  const query = search.trim().toLowerCase();
  const visible = query
    ? bookings
        .filter((b) =>
          [b.customerName, b.customerPhone, b.orderId].some((v) => v?.toLowerCase().includes(query))
        )
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    : tab === 'overdue'
      ? overdueBookings
      : dayBookings
          .filter(TABS.find((t) => t.key === tab).match)
          .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Image src="/logo-removebg-preview.png" alt="Aroma" width={40} height={40} className="rounded-full" />
          <div className="leading-tight">
            <p className="font-extrabold text-primary">Aroma Admin</p>
            <p className="text-xs text-muted-foreground">Захиалгын удирдлага</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-foreground tabular-nums px-3 py-1.5 rounded-full bg-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {toTime(now.minutes)}
            </span>
            <button
              onClick={loadBookings}
              title="Шинэчлэх"
              aria-label="Refresh"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              title="Гарах"
              aria-label="Log out"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 md:p-8">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm opacity-80">Сайн байна уу 👋</p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">{formatDateMn(today)}</h1>
              <p className="text-sm opacity-80 mt-2">
                Утсаар болон биечлэн ирсэн үйлчлүүлэгчийг эндээс шууд бүртгэнэ.
              </p>
            </div>
            <button
              onClick={() => setDrawer({ date: selectedDate >= today ? selectedDate : today })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-primary font-extrabold shadow-xl hover:-translate-y-0.5 transition-transform"
            >
              <Plus className="w-5 h-5" />
              Шинэ захиалга
            </button>
          </div>
        </div>

        {/* Bookings still waiting to be completed */}
        {overdueBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <span className="w-11 h-11 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <p className="font-extrabold text-amber-900">{overdueBookings.length} захиалга дуусгаагүй байна</p>
              <p className="text-sm text-amber-800">
                Цаг нь өнгөрсөн захиалгуудыг ажилласан ажилтныг сонгож &ldquo;Дууссан&rdquo; болгоно уу.
              </p>
            </div>
            <button
              onClick={() => {
                setTab('overdue');
                setSearch('');
                document.getElementById('booking-list')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
            >
              Харах
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ClipboardList}
            label="Захиалга"
            value={capacityBookings.length}
            sub={`${dayBookings.filter((b) => b.status === 'Completed').length} дууссан`}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Users}
            label="Үйлчлүүлэгч"
            value={`${people} хүн`}
            sub="Идэвхтэй захиалгаар"
            accent="bg-violet-100 text-violet-700"
          />
          <StatCard
            icon={Activity}
            label={isToday ? 'Яг одоо завгүй' : 'Оргил ачаалал'}
            value={`${isToday ? busyNow : peakBusy} / ${WORKER_COUNT}`}
            sub={isToday ? `${WORKER_COUNT - busyNow} ажилтан сул байна` : 'Хамгийн их давхцал'}
            accent="bg-amber-100 text-amber-700"
          />
          <StatCard
            icon={Wallet}
            label="Орлого"
            value={formatMoney(revenue)}
            sub="Цуцлагдаагүй захиалга"
            accent="bg-emerald-100 text-emerald-700"
          />
        </div>

        {/* Date + timetable */}
        <section className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <CalendarPicker value={selectedDate} today={today} marks={marks} onChange={setSelectedDate} />
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Өчигдөр', date: addDays(today, -1) },
                { label: 'Өнөөдөр', date: today },
                { label: 'Маргааш', date: addDays(today, 1) },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => setSelectedDate(d.date)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedDate === d.date
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, -1))}
                  aria-label="Previous day"
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="font-extrabold text-foreground flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-primary" /> {formatDateMn(selectedDate)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Цагийн хуваарь · {capacityBookings.length} хүлээгдэж буй ·{' '}
                    {dayBookings.filter((b) => b.status === 'Completed').length} дууссан
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                  aria-label="Next day"
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-[3px] bg-primary" /> Хүлээгдэж буй
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-[3px] bg-amber-100 border border-dashed border-amber-400" /> Дуусгаагүй
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-[3px] bg-slate-200" /> Дууссан
                </span>
              </div>
            </div>
            <DayTimetable
              bookings={dayBookings}
              nowMinutes={isToday ? now.minutes : null}
              isPastDay={selectedDate < today}
              onSelect={(b) => ACTIVE_STATUSES.includes(b.status) && setCompleting(b)}
            />
            <p className="text-[11px] text-muted-foreground mt-3">
              Мөр бүр нэг ажилтан. Хүлээгдэж буй захиалга дээр дарж дуусгана.
            </p>
          </div>
        </section>

        {/* Capacity */}
        <section className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-extrabold text-foreground">Ажилтны ачаалал</h2>
              <p className="text-xs text-muted-foreground">
                {WORKER_COUNT} ажилтан · 30 минут тутам · баганан дээр дарж тухайн цагт захиалга нэмнэ
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-[3px] bg-primary" /> Завгүй</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-[3px] bg-amber-400" /> Бараг дүүрсэн</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-[3px] bg-rose-500" /> Дүүрсэн</span>
            </div>
          </div>
          <CapacityChart
            bookings={capacityBookings}
            isToday={isToday}
            nowMinutes={selectedDate < today ? Infinity : isToday ? now.minutes : -Infinity}
            onPickTime={(time) => setDrawer({ date: selectedDate, time })}
          />
        </section>

        {/* Bookings list */}
        <section id="booking-list" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex gap-1 bg-card border border-border rounded-2xl p-1 shadow-sm overflow-x-auto">
              {TABS.map((t) => {
                const count = dayBookings.filter(t.match).length;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTab(t.key);
                      setSearch('');
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                      tab === t.key && !query ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.label}
                    <span className={`ml-1.5 text-xs ${tab === t.key && !query ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setTab('overdue');
                  setSearch('');
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                  tab === 'overdue' && !query ? 'bg-amber-500 text-white shadow' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Дуусгаагүй
                <span className="text-xs opacity-80">{overdueBookings.length}</span>
              </button>
            </div>
            <div className="relative md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр, утас, захиалгын дугаар..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
              />
            </div>
          </div>

          {tab === 'overdue' && !query && (
            <p className="text-sm text-muted-foreground">Бүх өдрийн цаг нь өнгөрсөн, дуусгаагүй захиалгууд</p>
          )}
          {query && (
            <p className="text-sm text-muted-foreground">
              Бүх өдрөөс хайлаа: <span className="font-bold text-foreground">{visible.length}</span> илэрц
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
              <p className="text-4xl mb-3">🌿</p>
              <p className="font-bold text-foreground">Захиалга алга</p>
              <p className="text-sm text-muted-foreground mb-5">Энэ өдөр харуулах захиалга байхгүй байна.</p>
              {!query && selectedDate >= today && (
                <button
                  onClick={() => setDrawer({ date: selectedDate })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold"
                >
                  <Plus className="w-4 h-4" /> Захиалга нэмэх
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((b) => (
                <BookingRow
                  key={b._id}
                  booking={b}
                  loyalty={loyaltyByPhone[b.customerPhone]}
                  now={now}
                  showDate={!!query || tab === 'overdue'}
                  onStatus={updateStatus}
                  onComplete={setCompleting}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {drawer && (
        <NewBookingDrawer
          today={today}
          presetDate={drawer.date}
          presetTime={drawer.time}
          loyaltyByPhone={loyaltyByPhone}
          onClose={closeDrawer}
          onCreated={handleCreated}
        />
      )}

      {completing && (
        <CompleteBookingModal booking={completing} onClose={closeCompleting} onConfirm={completeBooking} />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm animate-in fade-in slide-in-from-bottom-4 ${
            toast.tone === 'error' ? 'bg-rose-600 text-white' : 'bg-foreground text-background'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
