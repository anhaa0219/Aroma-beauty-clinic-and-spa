'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Check, Info, LogOut, Pencil, Phone, Plus, Users } from 'lucide-react';
import useCustomer from '@/hooks/useCustomer';
import LoyaltyCard from '@/components/account/LoyaltyCard';
import { COUNTED_STATUSES, LOYALTY_RULES, formatPhone } from '@/lib/loyalty';
import { formatDateMn, formatMoney } from '@/lib/formatters';
import { ACTIVE_STATUSES, salonNow } from '@/lib/schedule';

const STATUS = {
  Confirmed: { label: 'Баталгаажсан', cls: 'bg-emerald-100 text-emerald-700' },
  Paid: { label: 'Төлсөн', cls: 'bg-emerald-100 text-emerald-700' },
  Pending: { label: 'Хүлээгдэж буй', cls: 'bg-yellow-100 text-yellow-800' },
  Completed: { label: 'Үйлчилгээ авсан', cls: 'bg-slate-200 text-slate-700' },
  Cancelled: { label: 'Цуцалсан', cls: 'bg-rose-100 text-rose-700' },
};

function BookingItem({ booking }) {
  const status = STATUS[booking.status] || STATUS.Pending;
  const counts = COUNTED_STATUSES.includes(booking.status);
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
      <div className="w-14 text-center shrink-0">
        <p className="text-xs text-muted-foreground">{booking.date.slice(5).replace('-', '/')}</p>
        <p className="text-lg font-extrabold text-primary tabular-nums">{booking.time}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{booking.serviceName}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          {formatDateMn(booking.date)}
          <span className="inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> {booking.people || 1}
          </span>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-bold tabular-nums ${counts ? 'text-foreground' : 'text-muted-foreground'}`}>
          {formatMoney(booking.price)}
        </p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { status, user, loyalty, bookings, refresh, logout } = useCustomer({ withBookings: true });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    if (status === 'guest') router.replace('/login?next=/account');
  }, [status, router]);

  if (status !== 'customer') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <div className="h-24 rounded-3xl bg-muted animate-pulse" />
        <div className="h-56 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  const today = salonNow().date;
  const upcoming = bookings
    .filter((b) => ACTIVE_STATUSES.includes(b.status) && b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const completed = bookings
    .filter((b) => b.status === 'Completed')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const all = [...bookings].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const TABS = [
    { key: 'upcoming', label: 'Удахгүй болох', list: upcoming, empty: 'Удахгүй болох захиалга алга.' },
    { key: 'completed', label: 'Дууссан', list: completed, empty: 'Дууссан үйлчилгээ одоогоор алга.' },
    { key: 'all', label: 'Бүх түүх', list: all, empty: 'Захиалгын түүх алга.' },
  ];
  const activeTab = TABS.find((t) => t.key === tab);

  const saveName = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if ((await res.json()).success) {
      setEditing(false);
      refresh();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-8">
      {/* Profile */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-primary/20">
          {(user.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={saveName} className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Таны нэр"
                className="px-3 py-2 rounded-xl border border-border bg-background focus:border-primary outline-none"
              />
              <button type="submit" aria-label="Save" className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setName(user.name);
                setEditing(true);
              }}
              className="group flex items-center gap-2 text-2xl font-extrabold text-foreground"
            >
              {user.name || 'Нэрээ оруулах'}
              <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> +976 {formatPhone(user.phone)}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Гарах
        </button>
      </div>

      {/* Loyalty Member */}
      <LoyaltyCard loyalty={loyalty} />

      {/* Rules */}
      <div className="rounded-2xl bg-muted/50 border border-border p-5 text-sm text-muted-foreground flex gap-3">
        <Info className="w-5 h-5 text-primary shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Loyalty Member хэрхэн болох вэ?</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {LOYALTY_RULES.map((r) => (
              <li key={r.minSpend}>
                {formatMoney(r.minSpend)}-өөс дээш → <b className="text-foreground">{r.months} сар</b> Loyalty Member
              </li>
            ))}
            <li>Цуцлагдаагүй бүх захиалга (хүлээгдэж буй, дууссан) шууд тооцогдоно. Цуцалбал хасагдана.</li>
            <li>Loyalty Member хугацаа дуусахад тоолуур 0-ээс дахин эхэлнэ.</li>
          </ul>
        </div>
      </div>

      {/* Bookings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" /> Миний захиалгууд
          </h2>
          <button
            onClick={() => router.push('/booking')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Цаг захиалах
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/60 border border-border rounded-2xl p-1 w-full sm:w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs ${tab === t.key ? 'opacity-80' : 'opacity-60'}`}>{t.list.length}</span>
            </button>
          ))}
        </div>

        {activeTab.list.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center rounded-2xl border border-dashed border-border">
            {activeTab.empty}
          </p>
        ) : (
          <div className="space-y-3">
            {activeTab.list.map((b) => (
              <BookingItem key={b._id} booking={b} />
            ))}
          </div>
        )}

        {tab === 'completed' && completed.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Нийт үйлчилгээ авсан дүн: <b className="text-foreground">{formatMoney(loyalty.totalSpend)}</b>
          </p>
        )}
      </section>
    </div>
  );
}
