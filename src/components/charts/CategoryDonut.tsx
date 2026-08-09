import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';
import { getCategory, categoryColor } from '../../data/categories';
import { formatMoney } from '../../utils/format';
import { currentMonthKey } from '../../utils/format';

interface Slice {
  id: string;
  label: string;
  emoji: string;
  value: number;
  color: string;
  pct: number;
}

export default function CategoryDonut({ monthKey }: { monthKey?: string }) {
  const transactions = useStore((s) => s.transactions);
  const mode = useStore((s) => s.settings.mode);
  const currency = useStore((s) => s.settings.currency);
  const month = monthKey ?? currentMonthKey();

  const { slices, total } = useMemo(() => {
    const byCat = new Map<string, number>();
    let total = 0;
    for (const t of transactions) {
      if (t.type !== 'gasto' || !t.date.startsWith(month)) continue;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
      total += t.amount;
    }
    const slices: Slice[] = Array.from(byCat.entries())
      .map(([id, value]) => {
        const cat = getCategory(id);
        return {
          id,
          label: cat.label,
          emoji: cat.emoji,
          value,
          color: categoryColor(cat, mode),
          pct: total > 0 ? (value / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
    return { slices, total };
  }, [transactions, month, mode]);

  if (slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-soft text-sm">
        <span className="text-3xl">🍃</span>
        Aún no hay gastos este mes. ¡Añade tu primer movimiento!
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {slices.map((s) => (
                <Cell key={s.id} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                formatMoney(Number(value) || 0, currency),
                `${item.payload.emoji} ${item.payload.label}`,
              ]}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'Nunito, sans-serif',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] text-soft font-semibold uppercase tracking-wide">Total</span>
          <span className="font-display font-bold text-lg">{formatMoney(total, currency)}</span>
        </div>
      </div>

      <ul className="flex-1 w-full flex flex-col gap-1.5 min-w-0">
        {slices.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
              aria-hidden
            />
            <span className="shrink-0">{s.emoji}</span>
            <span className="truncate flex-1 font-medium">{s.label}</span>
            <span className="text-soft text-xs shrink-0">{s.pct.toFixed(0)}%</span>
            <span className="font-bold shrink-0 tabular-nums">{formatMoney(s.value, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
