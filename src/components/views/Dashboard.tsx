import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { currentMonthKey, formatMoney, monthLabel } from '../../utils/format';
import StatTile from '../StatTile';
import CategoryDonut from '../charts/CategoryDonut';
import TrendChart from '../charts/TrendChart';
import MascotTip from '../MascotTip';
import DailyAllowanceCard from '../DailyAllowanceCard';
import BudgetsOverview from '../BudgetsOverview';
import { getCategory } from '../../data/categories';
import type { View } from '../../App';

export default function Dashboard({ setView }: { setView: (v: View) => void }) {
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const currency = useStore((s) => s.settings.currency);
  const month = currentMonthKey();

  const { ingresos, gastos, balance, recent } = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(month)) continue;
      if (t.type === 'ingreso') ingresos += t.amount;
      else gastos += t.amount;
    }
    const recent = [...transactions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6);
    return { ingresos, gastos, balance: ingresos - gastos, recent };
  }, [transactions, month]);

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const activeGoal = goals.find((g) => !g.achieved);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl capitalize">{monthLabel(month)}</h1>
        <p className="text-soft text-sm">Así va tu dinero este mes</p>
      </div>

      <DailyAllowanceCard />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile emoji="💰" label="Ingresos" value={formatMoney(ingresos, currency)} accent="#0ca30c" />
        <StatTile emoji="💸" label="Gastos" value={formatMoney(gastos, currency)} accent="#eb6834" />
        <StatTile
          emoji={balance >= 0 ? '📈' : '📉'}
          label="Balance"
          value={formatMoney(balance, currency)}
          accent={balance >= 0 ? 'var(--accent)' : '#e34948'}
        />
        <StatTile emoji="🏦" label="Ahorrado en metas" value={formatMoney(totalSaved, currency)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card p-5">
          <h2 className="font-display font-bold text-base mb-3">🍩 Gastos por categoría</h2>
          <CategoryDonut />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <MascotTip />
          {activeGoal ? (
            <button
              onClick={() => setView('objetivos')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-bold text-soft uppercase tracking-wide mb-1">
                Objetivo activo
              </p>
              <p className="font-display font-bold flex items-center gap-1.5">
                <span>{activeGoal.emoji}</span> {activeGoal.name}
              </p>
              <div className="w-full h-2 rounded-full bg-app-soft mt-2 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{
                    width: `${Math.min(100, (activeGoal.savedAmount / activeGoal.targetAmount) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-soft mt-1.5">
                {formatMoney(activeGoal.savedAmount, currency)} de{' '}
                {formatMoney(activeGoal.targetAmount, currency)}
              </p>
            </button>
          ) : (
            <button
              onClick={() => setView('objetivos')}
              className="card p-4 text-center text-sm font-semibold text-accent hover:shadow-md transition-shadow"
            >
              ✨ Crea tu primer objetivo (coche, boda, viaje…)
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-display font-bold text-base mb-1">📊 Tendencia (6 meses)</h2>
          <TrendChart />
        </div>
        <BudgetsOverview setView={setView} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base">🕘 Movimientos recientes</h2>
          <button onClick={() => setView('transacciones')} className="text-xs font-bold text-accent">
            Ver todos →
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-soft py-4 text-center">
            Aún no hay movimientos. ¡Pulsa "Añadir movimiento" para empezar! 🌱
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-theme">
            {recent.map((t) => {
              const cat = getCategory(t.category);
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {t.note || cat.label}
                    </p>
                    <p className="text-xs text-soft">{t.date}</p>
                  </div>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      t.type === 'ingreso' ? 'text-[#0ca30c]' : ''
                    }`}
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
    </div>
  );
}
