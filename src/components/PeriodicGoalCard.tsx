import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney, currentMonthKey, currentWeekStart } from '../utils/format';
import { useT } from '../i18n/useT';

export default function PeriodicGoalCard() {
  const settings = useStore((s) => s.settings);
  const transactions = useStore((s) => s.transactions);
  const { t } = useT();
  const { periodicGoalEnabled, periodicGoalAmount, periodicGoalFrequency, periodicGoalType, currency } = settings;

  const actual = useMemo(() => {
    const since = periodicGoalFrequency === 'semanal' ? currentWeekStart() : currentMonthKey();
    let ingresos = 0;
    let gastos = 0;
    for (const t of transactions) {
      if (t.date < since) continue;
      if (t.type === 'ingreso') ingresos += t.amount;
      else gastos += t.amount;
    }
    return periodicGoalType === 'ahorro' ? ingresos - gastos : gastos;
  }, [transactions, periodicGoalFrequency, periodicGoalType]);

  if (!periodicGoalEnabled || periodicGoalAmount <= 0) return null;

  const isSavings = periodicGoalType === 'ahorro';
  const label = periodicGoalFrequency === 'semanal' ? t('periodicgoal.thisWeek') : t('periodicgoal.thisMonth');
  const pct = Math.min(100, Math.max(0, (actual / periodicGoalAmount) * 100));
  const onTrack = isSavings ? actual >= periodicGoalAmount * 0.9 : actual <= periodicGoalAmount;
  const barColor = onTrack ? 'var(--accent)' : isSavings ? '#c98500' : '#e34948';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold text-soft uppercase tracking-wide">
          {isSavings ? t('periodicgoal.savings') : t('periodicgoal.spendLimit')} · {label}
        </p>
        <p className="text-xs font-bold" style={{ color: barColor }}>
          {formatMoney(actual, currency)} / {formatMoney(periodicGoalAmount, currency)}
        </p>
      </div>
      <div className="w-full h-2.5 rounded-full bg-app-soft overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${isSavings ? pct : Math.min(100, (actual / periodicGoalAmount) * 100)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
