'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Building2, Receipt, Ticket } from 'lucide-react';

// The paid booking's tax receipt: lottery number + QR to scan in the eBarimt app
export default function EbarimtReceipt({ ebarimt, payment }) {
  const [qrImage, setQrImage] = useState('');
  const qrData = ebarimt?.status === 'issued' ? ebarimt.qrData : '';

  useEffect(() => {
    if (!qrData) return;
    let cancelled = false;
    QRCode.toDataURL(qrData, { width: 220, margin: 1 })
      .then((url) => !cancelled && setQrImage(url))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [qrData]);

  if (!ebarimt || payment?.status !== 'paid') return null;

  return (
    <div className="rounded-2xl border border-border p-4 text-sm">
      <p className="flex items-center gap-2 font-bold text-foreground mb-3">
        <Receipt className="w-4 h-4 text-primary" /> И-баримт
        {ebarimt.type === 'COMPANY' && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Building2 className="w-3.5 h-3.5" /> {ebarimt.companyName} ({ebarimt.register})
          </span>
        )}
      </p>

      {payment.simulated ? (
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
          Туршилтын (sandbox) төлбөр тул и-баримт үүсгээгүй.
        </p>
      ) : ebarimt.status === 'issued' ? (
        <div className="flex items-center gap-4">
          {qrImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrImage} alt="И-баримт QR" className="w-28 h-28 rounded-xl border border-border bg-white p-1" />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-muted animate-pulse" />
          )}
          <div>
            {ebarimt.lottery && (
              <>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ticket className="w-3.5 h-3.5" /> Сугалааны дугаар
                </p>
                <p className="font-mono text-lg font-extrabold tracking-wider text-foreground">{ebarimt.lottery}</p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-1">QR кодыг e-barimt аппаар уншуулж бүртгүүлнэ үү.</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          И-баримт бэлтгэгдэж байна. Асуудал гарвал салонд хандахад бид гаргаж өгнө.
        </p>
      )}
    </div>
  );
}
