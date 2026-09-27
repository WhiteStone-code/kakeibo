import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import { formatMoney } from '../utils/format';

/** "Vista Casa": cuánto cuesta mantener la casa cada mes, calculado con
 * datos 100% reales — la suma de los gastos e ingresos fijos que el
 * usuario ya ha dado de alta en RecurringManager (alquiler, hipoteca,
 * suministros, seguros...). No mezcla esto con el gasto discrecional del
 * mes (comida puntual, ocio...), que ya se ve en el resto del Panel — la
 * idea es separar "lo que cuesta la casa" de "lo que decides cada día". */
export default function HouseholdCostCard() {
  const recurringItems = useStore((s) => s.recurringItems);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();

  const { fixedExpenses, fixedIncome, items } = useMemo(() => {
    const active = recurringItems.filter((r) => r.active);
    const fixedExpenses = active.filter((r) => r.type === 'gasto').reduce((sum, r) => sum + r.amount, 0);
    const fixedIncome = active.filter((r) => r.type === 'ingreso').reduce((sum, r) => sum + r.amount, 0);
    return { fixedExpenses, fixedIncome, items: active };
  }, [recurringItems]);

  if (items.length === 0) return null;

  return (
    <div className="card p-5">
      <h2 className="font-display font-bold text-base">{t('household.title')}</h2>
      <p className="text-xs text-soft mt-0.5 mb-4">{t('household.subtitle')}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-soft p-3">
          <p className="text-[11px] font-bold text-soft uppercase tracking-wide">{t('household.fixedExpenses')}</p>
          <p className="font-display font-extrabold text-lg mt-0.5 text-[#eb6834]">
            {formatMoney(fixedExpenses, currency)}
          </p>
        </div>
        <div className="card-soft p-3">
          <p className="text-[11px] font-bold text-soft uppercase tracking-wide">{t('household.fixedIncome')}</p>
          <p className="font-display font-extrabold text-lg mt-0.5 text-[#0ca30c]">
            {formatMoney(fixedIncome, currency)}
          </p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-theme">
        {items.map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 py-1.5 text-sm">
            <span className="shrink-0">{r.emoji}</span>
            <span className="flex-1 truncate font-medium">{r.label}</span>
            <span className={`font-bold tabular-nums ${r.type === 'ingreso' ? 'text-[#0ca30c]' : 'text-soft'}`}>
              {r.type === 'ingreso' ? '+' : '-'}
              {formatMoney(r.amount, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
