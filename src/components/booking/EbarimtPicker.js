'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Loader2, Receipt, User } from 'lucide-react';

/**
 * eBarimt receiver choice: individual (Хувь хүн) or company (Байгууллага).
 * For a company the 7-digit register is checked against the tax registry and its name shown.
 * onChange({ type: 'CITIZEN' }) | ({ type: 'COMPANY', register, companyName }) | null while incomplete
 */
export default function EbarimtPicker({ onChange }) {
  const [type, setType] = useState('CITIZEN');
  const [register, setRegister] = useState('');
  // { register, name } | { register, error } for the last looked-up number
  const [lookup, setLookup] = useState(null);

  const clean = register.replace(/\D/g, '').slice(0, 7);
  const ready = clean.length === 7;
  const result = ready && lookup?.register === clean ? lookup : null;
  const checking = type === 'COMPANY' && ready && !result;

  // Look the company up as soon as 7 digits are typed
  useEffect(() => {
    if (type !== 'COMPANY' || !ready) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ebarimt/company?register=${clean}`, { signal: controller.signal });
        const data = await res.json();
        setLookup(data.success ? { register: clean, name: data.name } : { register: clean, error: data.error });
      } catch (err) {
        if (err.name !== 'AbortError') setLookup({ register: clean, error: 'Сүлжээний алдаа' });
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [type, ready, clean]);

  // Report the current choice to the parent
  const value =
    type === 'CITIZEN'
      ? 'CITIZEN'
      : result?.name
        ? `COMPANY:${clean}:${result.name}`
        : '';
  useEffect(() => {
    if (!value) onChange(null);
    else if (value === 'CITIZEN') onChange({ type: 'CITIZEN' });
    else {
      const [, reg, ...name] = value.split(':');
      onChange({ type: 'COMPANY', register: reg, companyName: name.join(':') });
    }
  }, [value, onChange]);

  const option = (key, Icon, label) => (
    <button
      type="button"
      onClick={() => setType(key)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
        type === key
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/40'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
      <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
        <Receipt className="w-5 h-5 text-primary" /> И-баримт
      </h3>
      <div className="flex gap-3">
        {option('CITIZEN', User, 'Хувь хүн')}
        {option('COMPANY', Building2, 'Байгууллага')}
      </div>

      {type === 'COMPANY' ? (
        <div className="mt-4">
          <label className="block text-sm font-bold mb-2 text-foreground">Байгууллагын регистр</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={7}
            placeholder="1234567"
            value={register}
            onChange={(e) => setRegister(e.target.value.replace(/\D/g, '').slice(0, 7))}
            className="w-full border border-border rounded-md p-3 bg-background text-foreground tracking-widest focus:ring-2 focus:ring-primary outline-none"
          />
          <div className="min-h-6 mt-2 text-sm">
            {checking && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Шалгаж байна...
              </span>
            )}
            {result?.name && (
              <span className="flex items-center gap-2 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> {result.name}
              </span>
            )}
            {result?.error && <span className="text-rose-600 font-medium">{result.error}</span>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-3">
          Төлбөр төлөгдмөгц и-баримт таны утасны дугаар дээр бүртгэгдэж, сугалааны дугаар гарна.
        </p>
      )}
    </div>
  );
}
