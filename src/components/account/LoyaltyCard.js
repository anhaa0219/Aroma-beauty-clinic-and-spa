import { Crown } from 'lucide-react';
import { LOYALTY_RULES } from '@/lib/loyalty';
import { formatMoney } from '@/lib/formatters';

const TOP = Math.max(...LOYALTY_RULES.map((r) => r.minSpend));
const DAY_MS = 86_400_000;

const formatDay = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const shortMoney = (amount) => `${amount / 1_000_000} сая ₮`;

// Spending bar from 0 to the top threshold, with a marker for every rule
function SpendBar({ spend, dark }) {
  const pct = Math.min(100, (spend / TOP) * 100);
  return (
    <div className="pt-6 pb-10">
      <div className={`relative h-3 rounded-full ${dark ? 'bg-white/15' : 'bg-muted'}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        {LOYALTY_RULES.map((r) => {
          const left = (r.minSpend / TOP) * 100;
          const reached = spend >= r.minSpend;
          return (
            <div key={r.minSpend} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${left}%` }}>
              <span
                className={`block w-4 h-4 rounded-full border-2 ${
                  reached ? 'bg-amber-400 border-amber-200' : dark ? 'bg-primary border-white/40' : 'bg-card border-border'
                }`}
              />
              <span
                className={`absolute top-6 whitespace-nowrap text-[10px] leading-tight font-bold text-center ${
                  dark ? 'text-white/80' : 'text-muted-foreground'
                }`}
                // Keep the last label inside the card
                style={left === 100 ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' }}
              >
                <span className="block">{shortMoney(r.minSpend)}</span>
                <span className="block font-medium opacity-75">{r.months} сар</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LoyaltyCard({ loyalty }) {
  if (!loyalty) return null;

  if (loyalty.isMember) {
    const totalDays = Math.round((loyalty.until - loyalty.since) / DAY_MS);
    const timePct = Math.max(2, Math.min(100, (loyalty.daysLeft / totalDays) * 100));
    return (
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white bg-gradient-to-br from-[#0b3d47] via-primary to-[#0b3d47] shadow-2xl">
        <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                <Crown className="w-4 h-4" /> Loyalty Member
              </p>
              <p className="text-5xl font-extrabold mt-2 tabular-nums">
                {loyalty.daysLeft}
                <span className="text-lg font-semibold opacity-80"> хоног үлдсэн</span>
              </p>
              <p className="text-sm opacity-80 mt-1">
                {formatDay(loyalty.since)} – {formatDay(loyalty.until)} ({loyalty.months} сар)
              </p>
            </div>
            <Crown className="w-14 h-14 text-amber-300 drop-shadow-lg shrink-0" />
          </div>

          <div className="h-2 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full rounded-full bg-amber-300" style={{ width: `${timePct}%` }} />
          </div>

          {loyalty.nextGoal ? (
            <div className="rounded-2xl bg-white/10 px-4">
              <SpendBar spend={loyalty.cycleSpend} dark />
            </div>
          ) : (
            <p className="text-sm opacity-90">Та хамгийн дээд түвшний Loyalty Member эрхтэй байна. Баярлалаа! ✨</p>
          )}
        </div>
      </div>
    );
  }

  const goal = loyalty.nextGoal;
  return (
    <div className="rounded-3xl p-6 md:p-8 bg-card border border-border shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Crown className="w-4 h-4 text-amber-500" /> Loyalty Member болох хүртэл
          </p>
          <p className="text-3xl md:text-4xl font-extrabold mt-2 text-foreground tabular-nums">
            {formatMoney(goal?.remaining)}
            <span className="text-base font-semibold text-muted-foreground"> дутуу</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Одоогоор {formatMoney(loyalty.cycleSpend)}-ийн үйлчилгээ захиалсан байна.
          </p>
        </div>
        <span className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Crown className="w-7 h-7" />
        </span>
      </div>
      <SpendBar spend={loyalty.cycleSpend} />
    </div>
  );
}
