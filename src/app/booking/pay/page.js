'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import QpayPayment from '@/components/booking/QpayPayment';
import { formatDateMn } from '@/lib/formatters';

// Read what the checkout step stored for this order (token + booking summary)
function readStored(orderId) {
  try {
    return {
      token: sessionStorage.getItem(`aroma:pay:${orderId}`) || '',
      booking: JSON.parse(sessionStorage.getItem(`aroma:booking:${orderId}`) || 'null'),
    };
  } catch {
    return { token: '', booking: null };
  }
}

function PayContent() {
  const router = useRouter();
  const orderId = useSearchParams().get('orderId') || '';
  const [stored] = useState(() => (typeof window === 'undefined' ? { token: '', booking: null } : readStored(orderId)));
  const { token, booking } = stored;

  const onPaid = useCallback(
    (paidBooking) => {
      try {
        sessionStorage.setItem(`aroma:booking:${orderId}`, JSON.stringify(paidBooking));
        sessionStorage.removeItem(`aroma:pay:${orderId}`);
      } catch {
        /* private mode */
      }
      router.replace(`/booking/success?orderId=${encodeURIComponent(orderId)}`);
    },
    [orderId, router]
  );

  if (!orderId || !token) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Төлбөрийн мэдээлэл олдсонгүй</h2>
        <p className="text-muted-foreground mb-6">Захиалгаа шинээр эхлүүлнэ үү.</p>
        <button
          onClick={() => router.push('/booking')}
          className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90"
        >
          Цаг захиалах
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 md:py-14 px-4 text-foreground">
      {booking && (
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
          <p className="flex items-center justify-center gap-4 mt-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> {formatDateMn(booking.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> {booking.time}
            </span>
          </p>
          {booking.ebarimt?.type === 'COMPANY' && (
            <p className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              <Building2 className="w-3.5 h-3.5" /> И-баримт: {booking.ebarimt.companyName || `Байгууллага ${booking.ebarimt.register}`}
            </p>
          )}
        </div>
      )}
      <QpayPayment orderId={orderId} token={token} onPaid={onPaid} onRestart={() => router.push('/booking')} />
      <p className="text-center text-xs text-muted-foreground mt-6">
        Захиалгын дугаар: <span className="font-mono font-semibold text-foreground">{orderId}</span>
      </p>
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Suspense fallback={<div className="max-w-lg mx-auto py-20 px-4"><div className="h-96 rounded-3xl bg-muted animate-pulse" /></div>}>
          <PayContent />
        </Suspense>
      </main>
    </div>
  );
}
