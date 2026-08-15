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

  const { due, upcoming } = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const monthKey = today.toISOString().slice(0, 7);
    const notAppliedYet = recurringItems.filter((r) => r.active && r.lastAppliedMonth !== monthKey);
    return {
      due: notAppliedYet.filter((r) => r.dayOfMonth <= day),
      // Aviso previo (patrón de Goodbudget: recordar 2-3 días antes de que
      // toque un pago, no solo el mismo día) — cuanto antes se sepa que hay
      // un fijo cerca, más margen hay para tenerlo en cuenta.
      upcoming: notAppliedYet.filter((r) => r.dayOfMonth > day && r.dayOfMonth <= day + 3),
    };
  }, [recurringItems]);

  if (due.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="card p-4 border-2 border-accent/40 flex flex-col gap-3">
      {due.length > 0 && (
        <div>
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
      )}

      {upcoming.length > 0 && (
        <div className={due.length > 0 ? 'border-t border-theme pt-3' : ''}>
          <p className="text-xs font-bold text-soft uppercase tracking-wide mb-2">{t('recurring.upcomingTitle')}</p>
          <ul className="flex flex-col gap-1.5">
            {upcoming.map((r) => {
              const daysAway = r.dayOfMonth - new Date().getDate();
              return (
                <li key={r.id} className="flex items-center gap-3 text-sm">
                  <span className="text-base shrink-0 opacity-70">{r.emoji}</span>
                  <span className="flex-1 min-w-0 truncate text-soft">{r.label}</span>
                  <span className="text-soft font-medium shrink-0">
                    {formatMoney(r.amount, currency)} ·{' '}
                    {daysAway === 1 ? t('recurring.inOneDay') : t('recurring.inDays', { days: daysAway })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
