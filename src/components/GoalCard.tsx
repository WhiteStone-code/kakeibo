import { useState } from 'react';
import type { Goal } from '../types';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { formatMoney, formatMoneyRound, daysUntil } from '../utils/format';

export default function GoalCard({ goal }: { goal: Goal }) {
  const contributeToGoal = useStore((s) => s.contributeToGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();
  const [addAmount, setAddAmount] = useState('');

  const pct = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const days = daysUntil(goal.deadline);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(addAmount.replace(',', '.'));
    if (!v) return;
    contributeToGoal(goal.id, v);
    setAddAmount('');
  };

  return (
    <div className={`card p-5 flex flex-col gap-3 ${goal.achieved ? 'opacity-90' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-3xl">{goal.emoji}</span>
          <div className="min-w-0">
            <p className="font-display font-bold truncate">{goal.name}</p>
            {goal.achieved ? (
              <p className="text-xs font-bold text-accent">{t('goals.achievedBadge')}</p>
            ) : days !== null ? (
              <p className="text-xs text-soft">
                {days >= 0 ? t('goals.daysLeft', { days }) : t('goals.overdue', { days: -days })}
              </p>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => removeGoal(goal.id)}
          aria-label={t('goals.deleteConfirm')}
          className="text-soft hover:text-[#e34948] text-sm px-1"
          title={t('goals.deleteConfirm')}
        >
          ✕
        </button>
      </div>

      <div>
        <div className="w-full h-3 rounded-full bg-app-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="font-bold">{formatMoney(goal.savedAmount, currency)}</span>
          <span className="text-soft">{formatMoney(goal.targetAmount, currency)}</span>
        </div>
      </div>

      {!goal.achieved && (
        <>
          <p className="text-xs text-soft">
            {t('goals.remainingPrefix')}{' '}
            <span className="font-bold text-accent">{formatMoney(remaining, currency)}</span>
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {[5, 10, 20, 50].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => contributeToGoal(goal.id, quick)}
                className="card-soft px-2.5 py-1 rounded-full text-xs font-bold text-soft hover:text-accent"
              >
                +{formatMoneyRound(quick, currency)}
              </button>
            ))}
          </div>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              inputMode="decimal"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder={t('goals.addAmountPlaceholder', { currency })}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm"
            />
            <button type="submit" className="btn-accent font-bold px-4 rounded-xl text-sm">
              +
            </button>
          </form>
        </>
      )}
    </div>
  );
}
