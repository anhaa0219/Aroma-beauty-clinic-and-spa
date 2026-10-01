'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { describeItems, parseItems, toMinutes, toTime } from '@/lib/schedule';
import Navbar from '@/components/layout/Navbar';
import useCustomer from '@/hooks/useCustomer';
import { formatPhone, normalizePhone } from '@/lib/loyalty';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve all data passed from previous steps
  const items = parseItems(searchParams.get('items') || searchParams.get('serviceId'));
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const order = items ? describeItems(items) : null;
  const endTime = order && time ? toTime(toMinutes(time) + order.durationMinutes) : '';

  // Guest checkout: no login required. If logged in, name/phone come from the account.
  const customer = useCustomer();
  const loggedIn = customer.status === 'customer';

  const [nameInput, setNameInput] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const customerName = nameInput ?? customer.user?.name ?? '';
  const customerPhone = loggedIn ? customer.user?.phone || '' : normalizePhone(phoneInput);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!customerName.trim() && !!customerPhone && !isSubmitting;

  const handleSimulatePayment = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Service names, prices and durations are resolved on the server.
    // Logged-in users: the server uses their verified phone and ignores this one.
    const bookingData = { customerName, customerPhone, items, date, time };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();

      if (data.success && data.data?.orderId) {
        // Keep the booking so guests (not logged in) can view their receipt without a lookup
        try {
          sessionStorage.setItem(`aroma:booking:${data.data.orderId}`, JSON.stringify(data.data));
        } catch {
          /* private mode — success page will fall back to the API for logged-in users */
        }
        router.push(`/booking/success?orderId=${data.data.orderId}`);
      } else {
        alert(data.error || 'Something went wrong with the booking.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If someone navigates here without selecting a service first
  if (!order || !date || !time) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-xl text-primary mb-4">Missing booking details.</p>
        <button onClick={() => router.push('/booking')} className="text-primary underline">Start Over</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 text-foreground">
        <button
          onClick={() => router.back()}
          className="mb-6 text-primary font-medium hover:opacity-70 flex items-center transition-opacity"
        >
          &larr; Буцах
        </button>

        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary text-center">Төлбөр төлөх</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* --- 1. CUSTOMER DETAILS --- */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">Таны мэдээлэл</h2>
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">Нэр</label>
                <input
                  type="text"
                  placeholder="Жишээ нь: Анхбаяр"
                  className="w-full border border-border rounded-md p-3 bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                  value={customerName}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground">Утасны дугаар</label>
                {loggedIn ? (
                  <div className="w-full border border-border rounded-md p-3 bg-muted text-foreground flex items-center justify-between">
                    <span>+976 {formatPhone(customerPhone)}</span>
                    <span className="text-xs font-semibold text-emerald-700">✓ Баталгаажсан</span>
                  </div>
                ) : (
                  <>
                    <div className="w-full flex items-center rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-primary">
                      <span className="pl-3 pr-2 text-muted-foreground font-semibold border-r border-border">+976</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="9911 2233"
                        className="flex-1 min-w-0 p-3 bg-transparent outline-none tracking-wider"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Энэ дугаараараа дараа нэвтэрч захиалга, Loyalty эрхээ хянах боломжтой.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- 2. ORDER SUMMARY --- */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">Захиалгын мэдээлэл</h2>
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl shadow-sm mb-6">
              <div className="space-y-3 mb-6 pb-6 border-b border-primary/10">
                {order.lines.map((l) => (
                  <div key={l.serviceId} className="flex justify-between gap-4">
                    <span className="font-medium">
                      {l.serviceName} {l.quantity > 1 && `×${l.quantity}`}
                    </span>
                    <span className="font-medium whitespace-nowrap">₮{(l.price * l.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Хүний тоо:</span>
                  <span className="font-medium">{order.people} хүн</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Огноо:</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Цаг:</span>
                  <span className="font-medium">{time} – {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Үргэлжлэх:</span>
                  <span className="font-medium">{order.durationMinutes} мин</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-extrabold text-primary">
                <span>Нийт дүн:</span>
                <span>₮{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-md text-lg font-bold transition-all shadow-md ${
                canSubmit
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
              }`}
            >
              {isSubmitting ? 'Түр хүлээнэ үү...' : 'Захиалга баталгаажуулах'}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Нэвтрэхгүйгээр захиалах боломжтой
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
