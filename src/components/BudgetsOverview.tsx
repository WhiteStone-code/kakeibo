import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getCategory } from '../data/categories';
import { useAllCategories } from '../hooks/useCategories';
import { formatMoney, currentMonthKey } from '../utils/format';
import type { View } from '../App';

// Paleta de estado fija — nunca se usa para identificar categorías, solo
// para decir "vas bien / vas justo / te has pasado" (ver skill de dataviz).
const STATUS = {
  good: '#0ca30c',
  warning: '#c98500',
  critical: '#d03b3b',
};

export default function BudgetsOverview({ setView }: { setView: (v: View) => void }) {
  const transactions = useStore((s) => s.transactions);
  const budgets = useStore((s) => s.budgets);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const month = currentMonthKey();

  const rows = useMemo(() => {
    const spentByCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'gasto' || !t.date.startsWith(month)) continue;
      spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) + t.amount);
    }
    return Object.entries(budgets)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] > 0)
      .map(([catId, budget]) => {
        const spent = spentByCategory.get(catId) ?? 0;
        const pct = Math.min(100, (spent / budget) * 100);
        const status: keyof typeof STATUS = spent >= budget ? 'critical' : pct >= 80 ? 'warning' : 'good';
        return { cat: getCategory(catId, allCategories), spent, budget, pct, status };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [transactions, budgets, month, allCategories]);

  if (rows.length === 0) {
    return (
      <div className="card p-5">
        <h2 className="font-display font-bold text-base mb-1">🎯 Presupuestos</h2>
        <p className="text-sm text-soft mb-3">
          Ponle un límite mensual a tus categorías y te avisamos con colores cuando te acerques.
        </p>
        <button
          onClick={() => setView('ajustes')}
          className="text-sm font-bold text-accent hover:underline"
        >
          Configurar presupuestos →
        </button>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-base">🎯 Presupuestos del mes</h2>
        <button onClick={() => setView('ajustes')} className="text-xs font-bold text-accent">
          Editar →
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.cat.id}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <span>{r.cat.emoji}</span> {r.cat.label}
              </span>
              <span className="text-xs">
                <span className="font-bold" style={{ color: STATUS[r.status] }}>
                  {formatMoney(r.spent, currency)}
                </span>
                <span className="text-soft"> / {formatMoney(r.budget, currency)}</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-app-soft overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${r.pct}%`, background: STATUS[r.status] }}
              />
            </div>
            {r.status === 'critical' && (
              <p className="text-xs mt-1" style={{ color: STATUS.critical }}>
                ⚠️ Te has pasado del presupuesto de {r.cat.label.toLowerCase()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
