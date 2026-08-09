import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAllCategories } from '../hooks/useCategories';
import { getCategory } from '../data/categories';
import { formatMoney, getMonthMatrix, monthLabel, shiftMonthKey, currentMonthKey, WEEKDAY_LABELS } from '../utils/format';

/** Calendario mensual con la intensidad de gasto de cada día (escala
 * secuencial de un solo tono, ver skill de dataviz) — toca un día para ver
 * qué se compró. */
export default function SpendingCalendar() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { weeks, byDay, maxSpent, monthTotal } = useMemo(() => {
    const byDay = new Map<string, { spent: number; income: number; count: number }>();
    let monthTotal = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(monthKey)) continue;
      const entry = byDay.get(t.date) ?? { spent: 0, income: 0, count: 0 };
      if (t.type === 'gasto') {
        entry.spent += t.amount;
        monthTotal += t.amount;
      } else {
        entry.income += t.amount;
      }
      entry.count += 1;
      byDay.set(t.date, entry);
    }
    const maxSpent = Math.max(1, ...Array.from(byDay.values()).map((d) => d.spent));
    return { weeks: getMonthMatrix(monthKey), byDay, maxSpent, monthTotal };
  }, [transactions, monthKey]);

  const dayTransactions = useMemo(
    () => (selectedDay ? transactions.filter((t) => t.date === selectedDay) : []),
    [transactions, selectedDay]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthKey((m) => shiftMonthKey(m, -1))}
          className="card-soft w-9 h-9 rounded-full font-bold text-lg"
        >
          ←
        </button>
        <div className="text-center">
          <p className="font-display font-bold capitalize">{monthLabel(monthKey)}</p>
          <p className="text-xs text-soft">{formatMoney(monthTotal, currency)} gastados</p>
        </div>
        <button
          onClick={() => setMonthKey((m) => shiftMonthKey(m, 1))}
          className="card-soft w-9 h-9 rounded-full font-bold text-lg"
        >
          →
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="text-center text-[11px] font-bold text-soft">
              {w}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((day) => {
                const info = byDay.get(day.date);
                const intensity = info ? Math.min(1, info.spent / maxSpent) : 0;
                const hasIncome = info && info.income > 0;
                const isSelected = selectedDay === day.date;
                return (
                  <button
                    key={day.date}
                    disabled={!day.inMonth}
                    onClick={() => setSelectedDay(day.date === selectedDay ? null : day.date)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      !day.inMonth ? 'opacity-25 pointer-events-none' : ''
                    } ${day.isToday ? 'ring-2 ring-accent' : ''} ${isSelected ? 'scale-95 ring-2 ring-[var(--accent-3)]' : ''}`}
                    style={{
                      background: intensity > 0 ? `color-mix(in srgb, var(--accent) ${20 + intensity * 65}%, var(--surface-2))` : 'var(--surface-2)',
                    }}
                    title={info ? `${formatMoney(info.spent, currency)} en ${info.count} movimiento(s)` : undefined}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: intensity > 0.45 ? 'var(--accent-contrast)' : 'var(--text)' }}
                    >
                      {day.day}
                    </span>
                    {hasIncome && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#0ca30c]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-end mt-3 text-[11px] text-soft">
          <span>Menos</span>
          <div className="flex gap-0.5">
            {[0.15, 0.4, 0.65, 0.9].map((v) => (
              <span
                key={v}
                className="w-4 h-4 rounded"
                style={{ background: `color-mix(in srgb, var(--accent) ${20 + v * 65}%, var(--surface-2))` }}
              />
            ))}
          </div>
          <span>Más</span>
          <span className="flex items-center gap-1 ml-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ca30c]" /> ingreso ese día
          </span>
        </div>
      </div>

      {selectedDay && (
        <div className="card-soft p-4">
          <p className="text-xs font-bold text-soft uppercase tracking-wide mb-2">{selectedDay}</p>
          {dayTransactions.length === 0 ? (
            <p className="text-sm text-soft">Sin movimientos este día.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-theme">
              {dayTransactions.map((t) => {
                const cat = getCategory(t.category, allCategories);
                return (
                  <li key={t.id} className="flex items-center gap-3 py-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="flex-1 text-sm font-medium truncate">{t.note || cat.label}</span>
                    <span
                      className={`font-bold text-sm tabular-nums ${t.type === 'ingreso' ? 'text-[#0ca30c]' : ''}`}
                    >
                      {t.type === 'ingreso' ? '+' : '-'}
                      {formatMoney(t.amount, currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
