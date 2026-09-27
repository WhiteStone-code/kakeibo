import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { currentMonthKey, formatMoney, formatDate, monthLabel } from '../../utils/format';
import { localIsoDate } from '../../utils/localDate';
import StatTile from '../StatTile';
import CategoryDonut from '../charts/CategoryDonut';
import TrendChart from '../charts/TrendChart';
import MascotTip from '../MascotTip';
import DailyAllowanceCard from '../DailyAllowanceCard';
import BudgetsOverview from '../BudgetsOverview';
import PeriodicGoalCard from '../PeriodicGoalCard';
import RecurringDueCard from '../RecurringDueCard';
import ReflectionCard from '../ReflectionCard';
import KakeiboSplit from '../KakeiboSplit';
import HouseholdCostCard from '../HouseholdCostCard';
import WeeklyChallengeCard from '../WeeklyChallengeCard';
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
  const addTransaction = useStore((s) => s.addTransaction);
  const allCategories = useAllCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();
  const month = currentMonthKey();
  // Confirmación breve al repetir un movimiento — sin abrir ningún modal,
  // para que un gasto que se repite mucho (café, transporte...) se pueda
  // apuntar de nuevo en un solo toque. Hallazgo real de auditoría: registrar
  // un movimiento cuesta 3-4 toques hoy; esto lo deja en 1 para lo repetido.
  const [justRepeatedId, setJustRepeatedId] = useState<string | null>(null);

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
          <ReflectionCard setView={setView} />
        </div>
      </div>

      <KakeiboSplit />

      <WeeklyChallengeCard />

      <HouseholdCostCard />

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
              const justRepeated = justRepeatedId === tx.id;
              return (
                <li key={tx.id} className="flex items-center gap-3 py-2.5 group">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {tx.note || categoryLabel(cat)}
                    </p>
                    <p className="text-xs text-soft">{formatDate(tx.date)}</p>
                  </div>
                  <span
                    className={`font-bold tabular-nums text-sm ${
                      tx.type === 'ingreso' ? 'text-[#0ca30c]' : ''
                    }`}
                  >
                    {tx.type === 'ingreso' ? '+' : '-'}
                    {formatMoney(tx.amount, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addTransaction({
                        type: tx.type,
                        amount: tx.amount,
                        category: tx.category,
                        note: tx.note,
                        place: tx.place ?? null,
                        paymentMethod: tx.paymentMethod,
                        date: localIsoDate(),
                      });
                      setJustRepeatedId(tx.id);
                      setTimeout(() => setJustRepeatedId(null), 1600);
                    }}
                    aria-label={t('dashboard.repeatTransaction')}
                    title={t('dashboard.repeatTransaction')}
                    disabled={justRepeated}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all ${
                      justRepeated
                        ? 'text-accent'
                        : 'text-soft opacity-60 hover:opacity-100 hover:bg-app-soft md:opacity-0 md:group-hover:opacity-100'
                    }`}
                  >
                    {justRepeated ? '✓' : '🔁'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
