'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Calendar, CheckCircle2, Clock, Home, MapPin, Phone, Sparkles, User, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { salonInfo } from '@/lib/data';
import { formatDateMn, formatMoney } from '@/lib/formatters';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4 text-primary/70" /> {label}
      </span>
      <span className="font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;

    async function loadBooking() {
      // Guests aren't logged in, so the receipt route won't return their booking.
      // The payment step stashed it here right after creating it.
      try {
        const saved = sessionStorage.getItem(`aroma:booking:${orderId}`);
        if (saved) {
          setBooking(JSON.parse(saved));
          return;
        }
      } catch {
        /* ignore — fall back to the API below */
      }

      try {
        const res = await fetch(`/api/bookings/${orderId}`);
        const data = await res.json();
        if (data.success) setBooking(data.data);
      } catch (err) {
        console.error('Failed to fetch booking', err);
      }
    }

    loadBooking().finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <div className="h-96 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <p className="text-5xl mb-4">🌿</p>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Захиалга олдсонгүй</h2>
        <p className="text-muted-foreground mb-6">Энэ захиалгын мэдээлэл олдсонгүй.</p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90"
        >
          <Home className="w-4 h-4" /> Нүүр хуудас
        </button>
      </div>
    );
  }

  const lines = booking.items?.length
    ? booking.items
    : [{ serviceId: booking.serviceId, serviceName: booking.serviceName, quantity: 1 }];

  return (
    <div className="max-w-xl mx-auto py-12 md:py-16 px-4 text-foreground">
      {/* Celebration */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-5">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <span className="relative w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-11 h-11" strokeWidth={2.2} />
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">Захиалга баталгаажлаа!</h1>
        <p className="text-muted-foreground mt-2">Aroma Beauty Clinic & Spa-г сонгосон танд баярлалаа ✨</p>
      </div>

      {/* Ticket */}
      <div className="relative bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-[#0b3d47] via-primary to-[#0b3d47] text-white p-6 text-center overflow-hidden">
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-amber-300/20 blur-2xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-amber-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Цахим тасалбар
          </p>
          <p className="relative text-2xl font-extrabold tracking-tight mt-2">{formatDateMn(booking.date)}</p>
          <p className="relative text-4xl font-extrabold tabular-nums mt-1">
            {booking.time}
            {booking.endTime && <span className="text-lg font-semibold opacity-80"> – {booking.endTime}</span>}
          </p>
        </div>

        {/* Perforation */}
        <div className="relative h-6">
          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border" />
          <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border border-border" />
          <span className="absolute left-5 right-5 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" />
        </div>

        {/* Details */}
        <div className="p-6 md:p-8 pt-2 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Үйлчилгээ</p>
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.serviceId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-foreground">
                    {l.serviceName}
                    {l.quantity > 1 && <span className="text-muted-foreground"> ×{l.quantity}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-5 text-sm">
            <Row icon={User} label="Үйлчлүүлэгч" value={booking.customerName} />
            {booking.people > 1 && <Row icon={Users} label="Хүний тоо" value={`${booking.people} хүн`} />}
            {booking.staffName && <Row icon={User} label="Мэргэжилтэн" value={booking.staffName} />}
            <Row icon={Clock} label="Үргэлжлэх хугацаа" value={`${booking.durationMinutes || ''} мин`} />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <span className="text-muted-foreground">Нийт дүн</span>
            <span className="text-2xl font-extrabold text-primary">{formatMoney(booking.price)}</span>
          </div>

          {/* Location */}
          <div className="rounded-2xl bg-muted/50 border border-border p-4 space-y-2 text-sm">
            <p className="flex items-start gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {salonInfo?.details?.location || 'Улаанбаатар'}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              {salonInfo?.details?.bookingPhone || ''}
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Захиалгын дугаар: <span className="font-mono font-semibold text-foreground">{booking.orderId}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          onClick={() => router.push('/account')}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-extrabold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
        >
          Миний захиалгууд <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-foreground font-bold hover:bg-muted transition-colors"
        >
          <Home className="w-4 h-4" /> Нүүр хуудас
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Suspense fallback={<div className="max-w-xl mx-auto py-20 px-4"><div className="h-96 rounded-3xl bg-muted animate-pulse" /></div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
