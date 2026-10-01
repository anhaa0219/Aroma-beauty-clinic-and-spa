'use client';

import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Users, X } from 'lucide-react';
import { staffList } from '@/lib/data';
import { formatDateMn, formatMoney } from '@/lib/formatters';

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

/**
 * Popup shown when the admin marks a booking as done:
 * pick which team members (staffList, "Our Team") performed the treatments.
 */
export default function CompleteBookingModal({ booking, onClose, onConfirm }) {
  const people = booking.people || 1;
  const [selected, setSelected] = useState(() => booking.workers?.map((w) => w.staffId) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const lines = booking.items?.length
    ? booking.items
    : [{ serviceId: booking.serviceId, serviceName: booking.serviceName, quantity: 1 }];

  const handleSave = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    setError('');
    const result = await onConfirm(selected);
    if (!result?.ok) {
      setError(result?.error || 'Хадгалж чадсангүй');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Захиалга дуусгах">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Захиалга дуусгах</h2>
              <p className="text-xs text-muted-foreground">Аль ажилтнууд үйлчилгээ үзүүлсэн бэ?</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 overflow-y-auto space-y-5">
          {/* Booking summary */}
          <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-foreground">{booking.customerName}</p>
              <p className="text-sm font-bold text-primary tabular-nums">
                {booking.time}
                {booking.endTime && ` – ${booking.endTime}`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{formatDateMn(booking.date)}</p>
            <div className="flex flex-wrap gap-1.5">
              {lines.map((l) => (
                <span key={l.serviceId} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-card border border-border">
                  {l.serviceName}
                  {l.quantity > 1 && <span className="ml-1 opacity-70">×{l.quantity}</span>}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {people} хүн
              </span>
              <span className="font-bold text-foreground">{formatMoney(booking.price)}</span>
            </p>
          </div>

          {/* Staff picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-foreground">Ажилтан сонгох</p>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  selected.length === people
                    ? 'bg-emerald-100 text-emerald-700'
                    : selected.length === 0
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selected.length} / {people} сонгосон
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {staffList.map((s, i) => {
                const isOn = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    aria-pressed={isOn}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                      isOn ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold shrink-0 ${
                        isOn ? 'bg-primary text-primary-foreground' : AVATAR_COLORS[i % AVATAR_COLORS.length]
                      }`}
                    >
                      {isOn ? <Check className="w-5 h-5" strokeWidth={3} /> : s.firstName.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-foreground truncate">{s.firstName}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{s.role}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {selected.length > 0 && selected.length !== people && (
              <p className="text-xs text-amber-700 mt-2">
                Энэ захиалгад {people} хүн үйлчлүүлсэн. Сонгосон ажилтны тоо өөр байна — зөв эсэхийг шалгана уу.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 space-y-2">
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold border border-border text-muted-foreground hover:text-foreground"
            >
              Болих
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={selected.length === 0 || saving}
              className="flex-[2] py-3 rounded-2xl font-extrabold bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Хадгалж байна...' : 'Дууссан гэж хадгалах'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
