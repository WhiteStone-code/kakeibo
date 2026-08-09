import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { formatMoney } from '../utils/format';

/** Recordatorio de gastos/ingresos fijos que ya tocan este mes y aún no se
 * han confirmado — un toque para registrarlos, otro para saltarlos este mes
 * (por si esta vez ya lo apuntaste a mano, o no ha tocado). */
export default function RecurringDueCard() {
  const recurringItems = useStore((s) => s.recurringItems);
  const applyRecurringItem = useStore((s) => s.applyRecurringItem);
  const skipRecurringItem = useStore((s) => s.skipRecurringItem);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();

  const due = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const monthKey = today.toISOString().slice(0, 7);
    return recurringItems.filter(
      (r) => r.active && r.dayOfMonth <= day && r.lastAppliedMonth !== monthKey
    );
  }, [recurringItems]);

  if (due.length === 0) return null;

  return (
    <div className="card p-4 border-2 border-accent/40">
      <p className="text-xs font-bold text-accent uppercase tracking-wide mb-2">{t('recurring.dueTitle')}</p>
      <ul className="flex flex-col gap-2">
        {due.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <span className="text-xl shrink-0">{r.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{r.label}</p>
              <p className={`text-xs font-bold ${r.type === 'ingreso' ? 'text-[#0ca30c]' : 'text-soft'}`}>
                {formatMoney(r.amount, currency)}
              </p>
            </div>
            <button
              onClick={() => skipRecurringItem(r.id)}
              className="text-xs font-bold text-soft hover:text-inherit px-2 py-1.5"
            >
              {t('recurring.skip')}
            </button>
            <button
              onClick={() => applyRecurringItem(r.id)}
              className="btn-accent text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap"
            >
              {t('recurring.register')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
