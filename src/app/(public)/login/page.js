'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Crown, Mail, MailOpen } from 'lucide-react';
import { notifyAuthChanged } from '@/hooks/useCustomer';
import { normalizeEmail } from '@/lib/loyalty';

// Only allow redirects back into this site (no "//host" or "/\host" tricks)
const safeNext = (next) =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/account';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));

  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [emailInput, setEmailInput] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const email = normalizeEmail(emailInput);

  // Countdown for "send again"
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    if (!email || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
        setCode('');
        setDevCode(data.devCode || '');
        setCooldown(data.resendAfter || 60);
      } else {
        setError(data.error);
        if (data.retryAfter) {
          setStep('code');
          setCooldown(data.retryAfter);
        }
      }
    } catch {
      setError('Сүлжээний алдаа. Дахин оролдоно уу.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: value }),
      });
      const data = await res.json();
      if (data.success) {
        notifyAuthChanged();
        // New customers add their name + phone once, then continue where they were going
        router.replace(data.needsProfile ? `/account?next=${encodeURIComponent(next)}` : next);
      } else {
        setError(data.error);
        setCode('');
      }
    } catch {
      setError('Сүлжээний алдаа. Дахин оролдоно уу.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            {step === 'email' ? <Mail className="w-8 h-8" /> : <MailOpen className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {step === 'email' ? 'Нэвтрэх' : 'Код оруулах'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === 'email' ? (
              'Имэйл хаяг руу тань нэг удаагийн код очно'
            ) : (
              <>
                <b className="text-foreground">{email}</b> хаяг руу илгээсэн 6 оронтой кодыг оруулна уу
              </>
            )}
          </p>
        </div>

        {step === 'email' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
            className="space-y-5"
          >
            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-2 ml-1">Имэйл хаяг</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="name@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg transition-all"
              />
            </label>
            {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={!email || busy}
              className="w-full py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              {busy ? 'Илгээж байна...' : 'Код авах'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
            className="space-y-5"
          >
            {devCode && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                Туршилтын горим (имэйл тохируулаагүй): код <b className="tracking-widest">{devCode}</b>
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                if (value.length === 6) verify(value);
              }}
              className="w-full text-center text-3xl font-bold tracking-[0.6em] pl-[0.6em] py-4 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {error && <p className="text-sm text-rose-600 font-medium text-center">{error}</p>}
            <button
              type="submit"
              disabled={code.length !== 6 || busy}
              className="w-full py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              {busy ? 'Шалгаж байна...' : 'Нэвтрэх'}
            </button>
            <p className="text-xs text-muted-foreground text-center">Имэйл ирэхгүй бол Spam хавтсаа шалгана уу.</p>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Имэйл солих
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || busy}
                className="font-semibold text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Дахин илгээх (${cooldown})` : 'Дахин илгээх'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border flex items-start gap-3 text-xs text-muted-foreground">
          <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>3 сая ₮-өөс дээш үйлчилгээ авбал 6 сар, 10 сая ₮ бол 12 сарын Loyalty Member эрх автоматаар нээгдэнэ.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-primary">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
