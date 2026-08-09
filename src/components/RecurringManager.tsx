import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useExpenseCategories, useIncomeCategories } from '../hooks/useCategories';
import { useCategoryLabel } from '../i18n/useCategoryLabel';
import { useT } from '../i18n/useT';
import { formatMoney } from '../utils/format';
import type { TransactionType } from '../types';

/** Alta, edición y borrado de gastos/ingresos fijos (alquiler, nómina,
 * aportación automática a inversión...) — el día que toca, aparecen como
 * recordatorio en el Panel para confirmarlos con un toque. */
export default function RecurringManager() {
  const recurringItems = useStore((s) => s.recurringItems);
  const addRecurringItem = useStore((s) => s.addRecurringItem);
  const updateRecurringItem = useStore((s) => s.updateRecurringItem);
  const removeRecurringItem = useStore((s) => s.removeRecurringItem);
  const currency = useStore((s) => s.settings.currency);
  const expenseCategories = useExpenseCategories();
  const incomeCategories = useIncomeCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<TransactionType>('gasto');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');
  const [category, setCategory] = useState('vivienda');

  const categories = type === 'gasto' ? expenseCategories : incomeCategories;

  const reset = () => {
    setType('gasto');
    setLabel('');
    setAmount('');
    setDay('1');
    setCategory('vivienda');
    setAdding(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(',', '.'));
    if (!label.trim() || !amountNum || amountNum <= 0) return;
    const cat = categories.find((c) => c.id === category) ?? categories[0];
    addRecurringItem({
      type,
      label: label.trim(),
      emoji: cat.emoji,
      amount: amountNum,
      category: cat.id,
      dayOfMonth: parseInt(day, 10) || 1,
      active: true,
    });
    reset();
  };

  return (
    <div className="card p-5 flex flex-col gap-3">
      <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('recurring.title')}</label>
      <p className="text-xs text-soft -mt-1">{t('recurring.desc')}</p>

      {recurringItems.length > 0 && (
        <ul className="flex flex-col gap-2">
          {recurringItems.map((r) => (
            <li key={r.id} className="flex items-center gap-2 card-soft px-3 py-2 rounded-xl">
              <span className="text-lg shrink-0">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.label}</p>
                <p className="text-xs text-soft">
                  {t('recurring.dayLabel', { day: r.dayOfMonth })} ·{' '}
                  <span className={r.type === 'ingreso' ? 'text-[#0ca30c]' : ''}>
                    {formatMoney(r.amount, currency)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => updateRecurringItem(r.id, { active: !r.active })}
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  r.active ? 'bg-accent' : 'bg-app-soft'
                }`}
                title={r.active ? t('recurring.active') : t('recurring.paused')}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow transition-all"
                  style={{ left: r.active ? '18px' : '2px' }}
                />
              </button>
              <button
                onClick={() => removeRecurringItem(r.id)}
                className="text-soft hover:text-[#e34948] text-sm px-1 shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={submit} className="card-soft p-3 rounded-xl flex flex-col gap-3">
          <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit">
            {(['gasto', 'ingreso'] as const).map((ty) => (
              <button
                type="button"
                key={ty}
                onClick={() => {
                  setType(ty);
                  setCategory(ty === 'gasto' ? 'vivienda' : 'salario');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === ty ? 'btn-accent' : 'text-soft'
                }`}
              >
                {ty === 'gasto' ? t('txform.expense') : t('txform.income')}
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('recurring.namePlaceholder')}
            className="px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm font-semibold"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency}
              className="px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm font-bold"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-soft whitespace-nowrap">{t('recurring.dayOfMonth')}</span>
              <input
                type="number"
                min={1}
                max={28}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-16 px-2 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-[10px] font-semibold ${
                  category === cat.id ? 'border-accent bg-accent/10' : 'border-theme bg-surface'
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="leading-tight text-center truncate w-full">{categoryLabel(cat)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-accent font-bold px-4 py-2 rounded-xl text-sm flex-1">
              {t('common.create')}
            </button>
            <button type="button" onClick={reset} className="text-soft font-bold px-3 rounded-xl text-sm">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="card-soft text-accent font-bold py-2.5 rounded-xl text-sm"
        >
          {t('recurring.add')}
        </button>
      )}
    </div>
  );
}
