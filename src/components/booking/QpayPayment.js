'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck, Smartphone, Timer } from 'lucide-react';
import { formatMoney } from '@/lib/formatters';

const POLL_MS = 4000;

const mmss = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * QPay checkout for one booking: QR to scan, bank-app buttons (phones), countdown for the slot hold,
 * and automatic payment detection. Calls onPaid(booking) / shows "expired" when the hold runs out.
 */
export default function QpayPayment({ orderId, token, onPaid, onRestart }) {
  const [invoice, setInvoice] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const paidRef = useRef(false);

  // 1. Get (or create) the invoice
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/payments/qpay/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.paid) {
          paidRef.current = true;
          onPaid(data.booking);
        } else if (data.success) {
          setInvoice(data);
          setQrImage(await QRCode.toDataURL(data.qrText, { width: 320, margin: 1, errorCorrectionLevel: 'M' }));
        } else if (res.status === 410) {
          setExpired(true);
        } else {
          setError(data.error || 'Алдаа гарлаа');
        }
      } catch {
        if (!cancelled) setError('Сүлжээний алдаа. Хуудсаа дахин ачаална уу.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, token, onPaid]);

  // 2. Ask the server whether it's paid
  const check = useCallback(
    async ({ simulate = false, manual = false } = {}) => {
      if (paidRef.current) return;
      if (manual || simulate) setChecking(true);
      try {
        const res = await fetch('/api/payments/qpay/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, token, simulate, manual }),
        });
        const data = await res.json();
        if (data.paid) {
          paidRef.current = true;
          onPaid(data.booking);
        } else if (data.expired) {
          setExpired(true);
        } else if (manual) {
          setError('Төлбөр хараахан орж ирээгүй байна. Төлсөн бол хэдэн секунд хүлээгээд дахин шалгана уу.');
        }
      } catch {
        if (manual) setError('Сүлжээний алдаа');
      } finally {
        setChecking(false);
      }
    },
    [orderId, token, onPaid]
  );

  // Poll while the invoice is open; tick the countdown every second
  useEffect(() => {
    if (!invoice || expired) return;
    const deadline = new Date(invoice.holdUntil).getTime();
    let finalCheckDone = false;
    const poll = setInterval(() => check(), POLL_MS);
    const tick = setInterval(() => {
      const t = Date.now();
      setNow(t);
      // When the countdown hits zero, one last check settles it (paid → success, else expired)
      if (t >= deadline && !finalCheckDone) {
        finalCheckDone = true;
        check();
      }
    }, 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [invoice, expired, check]);

  const left = invoice ? new Date(invoice.holdUntil).getTime() - now : 0;

  if (expired) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <Timer className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Төлбөрийн хугацаа дууссан</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          15 минутын дотор төлбөр орж ирээгүй тул цагийг чөлөөллөө. Дахин цаг сонгоно уу.
        </p>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90"
        >
          Дахин захиалах
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-xl">
        {error ? (
          <>
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-600 font-medium">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">QPay нэхэмжлэх үүсгэж байна...</p>
          </>
        )}
      </div>
    );
  }

  const banks = invoice.urls.filter((u) => u.link);

  return (
    <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
      {/* Amount + countdown */}
      <div className="bg-linear-to-br from-[#0b3d47] via-primary to-[#0b3d47] text-white p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">QPay-ээр төлөх</p>
        <p className="text-4xl font-extrabold tabular-nums mt-2">{formatMoney(invoice.amount)}</p>
        <p
          className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm font-bold tabular-nums ${
            left < 120_000 ? 'bg-rose-500/90' : 'bg-white/15'
          }`}
        >
          <Timer className="w-4 h-4" /> {mmss(left)}
        </p>
        <p className="text-xs text-white/70 mt-2">Энэ хугацаанд таны цагийг барьж байна</p>
      </div>

      <div className="p-6 md:p-8">
        {/* Bank apps first on phones: tap → opens the app with the invoice */}
        {banks.length > 0 && (
          <div className="md:hidden mb-6">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
              <Smartphone className="w-4 h-4 text-primary" /> Банкны аппаа сонгоно уу
            </p>
            <BankGrid banks={banks} />
          </div>
        )}

        {/* QR — scan with any bank app */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold text-foreground mb-3">
            <span className="md:hidden">Эсвэл өөр утаснаас </span>QR кодыг банкны аппаар уншуулна уу
          </p>
          {qrImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrImage}
              alt="QPay QR код"
              className="w-60 h-60 md:w-72 md:h-72 rounded-2xl border border-border bg-white p-2"
            />
          ) : (
            <div className="w-60 h-60 rounded-2xl bg-muted animate-pulse" />
          )}
          <p className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Төлбөр хүлээж байна...
          </p>
        </div>

        {banks.length > 0 && (
          <div className="hidden md:block mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
              Дэмжигдэх банкууд
            </p>
            <BankGrid banks={banks} />
          </div>
        )}

        {error && <p className="text-sm text-rose-600 font-medium text-center mt-4">{error}</p>}

        <button
          onClick={() => {
            setError('');
            check({ manual: true });
          }}
          disabled={checking}
          className="w-full mt-6 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> Төлбөр шалгах
        </button>

        {invoice.canSimulate && (
          <button
            onClick={() => check({ simulate: true })}
            disabled={checking}
            className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-amber-400 text-amber-800 bg-amber-50 font-bold text-sm hover:bg-amber-100"
          >
            🧪 Туршилт: төлсөн болгох (sandbox)
          </button>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Төлбөр QPay-ээр аюулгүй дамжина
        </p>
      </div>
    </div>
  );
}

function BankGrid({ banks }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
      {banks.map((b) => (
        <a
          key={b.name + b.link}
          href={b.link}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.logo} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-border bg-white" />
          <span className="text-[10px] leading-tight text-center text-muted-foreground line-clamp-2">
            {b.description || b.name}
          </span>
        </a>
      ))}
    </div>
  );
}
