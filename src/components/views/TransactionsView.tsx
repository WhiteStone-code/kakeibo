import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAllCategories } from '../../hooks/useCategories';
import { getCategory } from '../../data/categories';
import { useCategoryLabel } from '../../i18n/useCategoryLabel';
import { useT } from '../../i18n/useT';
import { formatMoney, formatDate, currentMonthKey, shiftMonthKey } from '../../utils/format';
import SpendingCalendar from '../SpendingCalendar';
import type { Transaction } from '../../types';

type Period = 'mes' | '3m' | 'todo';

export default function TransactionsView({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const transactions = useStore((s) => s.transactions);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();
  const [filter, setFilter] = useState<'todos' | 'gasto' | 'ingreso'>('todos');
  const [view, setView] = useState<'lista' | 'calendario'>('lista');
  // Por defecto "todo el histórico" para no ocultar nada de golpe a quien ya
  // usaba la app — el filtro de período es solo una ayuda opcional para no
  // tener que hacer scroll infinito cuando ya llevas meses registrando.
  const [period, setPeriod] = useState<Period>('todo');

  const periodStart = useMemo(() => {
    if (period === 'todo') return null;
    const nBack = period === 'mes' ? 0 : 2;
    return shiftMonthKey(currentMonthKey(), -nBack);
  }, [period]);

  const sorted = useMemo(() => {
    return [...transactions]
      .filter((t) => filter === 'todos' || t.type === filter)
      .filter((t) => !periodStart || t.date.slice(0, 7) >= periodStart)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, filter, periodStart]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sorted>();
    for (const t of sorted) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [sorted]);

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl">{t('transactions.title')}</h1>
        <p className="text-soft text-sm">{t('transactions.subtitle')}</p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          {(['todos', 'gasto', 'ingreso'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                filter === f ? 'btn-accent' : 'card-soft text-soft'
              }`}
            >
              {f === 'todos' ? t('transactions.all') : f === 'gasto' ? t('transactions.expenses') : t('transactions.income')}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-app-soft rounded-2xl">
          {(['lista', 'calendario'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                view === v ? 'btn-accent' : 'text-soft'
              }`}
            >
              {v === 'lista' ? t('transactions.list') : t('transactions.calendar')}
            </button>
          ))}
        </div>
      </div>

      {view === 'lista' && (
        <div className="flex gap-1 p-1 bg-app-soft rounded-2xl w-fit">
          {(['mes', '3m', 'todo'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                period === p ? 'btn-accent' : 'text-soft'
              }`}
            >
              {p === 'mes'
                ? t('transactions.periodThisMonth')
                : p === '3m'
                  ? t('transactions.periodLast3')
                  : t('transactions.periodAll')}
            </button>
          ))}
        </div>
      )}

      {view === 'calendario' ? (
        <div className="card p-5">
          <SpendingCalendar />
        </div>
      ) : grouped.length === 0 ? (
        <div className="card p-10 text-center text-soft">
          <p className="text-3xl mb-2">🍃</p>
          {transactions.length === 0 ? t('transactions.empty') : t('transactions.emptyPeriod')}
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} className="card p-4">
            <p className="text-xs font-bold text-soft uppercase tracking-wide mb-2">{formatDate(date)}</p>
            <ul className="flex flex-col divide-y divide-theme">
              {items.map((tx) => {
                const cat = getCategory(tx.category, allCategories);
                const label = categoryLabel(cat);
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-2.5 group">
                    <button
                      onClick={() => onEdit(tx)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{tx.note || label}</p>
                        <p className="text-xs text-soft">
                          {label}
                          {tx.place ? ` · ${tx.place}` : ''}
                        </p>
                      </div>
                    </button>
                    <span
                      className={`font-bold tabular-nums text-sm ${
                        tx.type === 'ingreso' ? 'text-[#0ca30c]' : ''
                      }`}
                    >
                      {tx.type === 'ingreso' ? '+' : '-'}
                      {formatMoney(tx.amount, currency)}
                    </span>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      aria-label={t('common.delete')}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-soft opacity-60 hover:opacity-100 hover:text-[#e34948] hover:bg-[#e3494811] transition-all md:opacity-0 md:group-hover:opacity-100"
                      title={t('common.delete')}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
