import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAllCategories } from '../../hooks/useCategories';
import { getCategory } from '../../data/categories';
import { formatMoney } from '../../utils/format';
import SpendingCalendar from '../SpendingCalendar';
import type { Transaction } from '../../types';

export default function TransactionsView({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const transactions = useStore((s) => s.transactions);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const [filter, setFilter] = useState<'todos' | 'gasto' | 'ingreso'>('todos');
  const [view, setView] = useState<'lista' | 'calendario'>('lista');

  const sorted = useMemo(() => {
    return [...transactions]
      .filter((t) => filter === 'todos' || t.type === filter)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, filter]);

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
        <h1 className="font-display font-extrabold text-2xl">Movimientos</h1>
        <p className="text-soft text-sm">
          Todo lo que has registrado hasta ahora · toca uno para editarlo
        </p>
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
              {f === 'todos' ? 'Todos' : f === 'gasto' ? '💸 Gastos' : '💰 Ingresos'}
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
              {v === 'lista' ? '📋 Lista' : '📅 Calendario'}
            </button>
          ))}
        </div>
      </div>

      {view === 'calendario' ? (
        <div className="card p-5">
          <SpendingCalendar />
        </div>
      ) : grouped.length === 0 ? (
        <div className="card p-10 text-center text-soft">
          <p className="text-3xl mb-2">🍃</p>
          Todavía no hay movimientos aquí.
        </div>
      ) : (
        grouped.map(([date, items]) => (
          <div key={date} className="card p-4">
            <p className="text-xs font-bold text-soft uppercase tracking-wide mb-2">{date}</p>
            <ul className="flex flex-col divide-y divide-theme">
              {items.map((t) => {
                const cat = getCategory(t.category, allCategories);
                return (
                  <li key={t.id} className="flex items-center gap-3 py-2.5 group">
                    <button
                      onClick={() => onEdit(t)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{t.note || cat.label}</p>
                        <p className="text-xs text-soft">{cat.label}</p>
                      </div>
                    </button>
                    <span
                      className={`font-bold tabular-nums text-sm ${
                        t.type === 'ingreso' ? 'text-[#0ca30c]' : ''
                      }`}
                    >
                      {t.type === 'ingreso' ? '+' : '-'}
                      {formatMoney(t.amount, currency)}
                    </span>
                    <button
                      onClick={() => removeTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-soft hover:text-[#e34948] text-sm px-1.5"
                      title="Eliminar"
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
