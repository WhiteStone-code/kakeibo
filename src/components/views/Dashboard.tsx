import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { currentMonthKey, formatMoney, monthLabel } from '../../utils/format';
import StatTile from '../StatTile';
import CategoryDonut from '../charts/CategoryDonut';
import TrendChart from '../charts/TrendChart';
import MascotTip from '../MascotTip';
import DailyAllowanceCard from '../DailyAllowanceCard';
import BudgetsOverview from '../BudgetsOverview';
import PeriodicGoalCard from '../PeriodicGoalCard';
import RecurringDueCard from '../RecurringDueCard';
import { getCategory } from '../../data/categories';
import { useAllCategories } from '../../hooks/useCategories';
import { useCategoryLabel } from '../../i18n/useCategoryLabel';
import { useT } from '../../i18n/useT';
import type { View } from '../../App';

export default function Dashboard({
  setView,
  onAddTransaction,
}: {
  setView: (v: View) => void;
  onAddTransaction?: () => void;
}) {
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();
  const month = currentMonthKey();

  const { ingresos, gastos, balance, recent } = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;
    for (const tx of transactions) {
      if (!tx.date.startsWith(month)) continue;
      if (tx.type === 'ingreso') ingresos += tx.amount;
      else gastos += tx.amount;
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
        <p className="text-soft text-sm">{t('dashboard.subtitle')}</p>
      </div>

      <RecurringDueCard />
      <DailyAllowanceCard onAddTransaction={onAddTransaction} />
      <PeriodicGoalCard />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile emoji="💰" label={t('dashboard.income')} value={formatMoney(ingresos, currency)} accent="#0ca30c" />
        <StatTile emoji="💸" label={t('dashboard.expenses')} value={formatMoney(gastos, currency)} accent="#eb6834" />
        <StatTile
          emoji={balance >= 0 ? '📈' : '📉'}
          label={t('dashboard.balance')}
          value={formatMoney(balance, currency)}
          accent={balance >= 0 ? 'var(--accent)' : '#e34948'}
        />
        <StatTile emoji="🏦" label={t('dashboard.savedInGoals')} value={formatMoney(totalSaved, currency)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card p-5">
          <h2 className="font-display font-bold text-base mb-3">{t('dashboard.expensesByCategory')}</h2>
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
                {t('dashboard.activeGoal')}
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
                {formatMoney(activeGoal.savedAmount, currency)} / {formatMoney(activeGoal.targetAmount, currency)}
              </p>
            </button>
          ) : (
            <button
              onClick={() => setView('objetivos')}
              className="card p-4 text-center text-sm font-semibold text-accent hover:shadow-md transition-shadow"
            >
              {t('dashboard.createFirstGoal')}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-display font-bold text-base mb-1">{t('dashboard.trend')}</h2>
          <TrendChart />
        </div>
        <BudgetsOverview setView={setView} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base">{t('dashboard.recentTransactions')}</h2>
          <button onClick={() => setView('transacciones')} className="text-xs font-bold text-accent">
            {t('dashboard.viewAll')}
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-soft py-4 text-center">{t('dashboard.noTransactionsYet')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-theme">
            {recent.map((tx) => {
              const cat = getCategory(tx.category, allCategories);
              return (
                <li key={tx.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {tx.note || categoryLabel(cat)}
                    </p>
                    <p className="text-xs text-soft">{tx.date}</p>
                  </div>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      tx.type === 'ingreso' ? 'text-[#0ca30c]' : ''
                    }`}
                  >
                    {tx.type === 'ingreso' ? '+' : '-'}
                    {formatMoney(tx.amount, currency)}
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
