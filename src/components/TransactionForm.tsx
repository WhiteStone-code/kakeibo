import { useEffect, useState } from 'react';
import Modal from './Modal';
import { categoryColor } from '../data/categories';
import { useExpenseCategories } from '../hooks/useCategories';
import { useStore } from '../store/useStore';
import type { Transaction, TransactionType } from '../types';

export default function TransactionForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  /** Si se pasa, el formulario edita este movimiento en vez de crear uno nuevo. */
  editing?: Transaction | null;
}) {
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const currency = useStore((s) => s.settings.currency);
  const mode = useStore((s) => s.settings.mode);
  const expenseCategories = useExpenseCategories();

  const [type, setType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('comida');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reset = () => {
    setType('gasto');
    setAmount('');
    setCategory('comida');
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  // Al abrir para editar, precarga los datos del movimiento existente.
  useEffect(() => {
    if (open && editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setNote(editing.note);
      setDate(editing.date);
    } else if (open && !editing) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) return;
    const payload = {
      type,
      amount: value,
      category: type === 'ingreso' ? 'ingresos' : category,
      note: note.trim(),
      date,
    };
    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar movimiento' : 'Nuevo movimiento'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-2 p-1 bg-app-soft rounded-2xl">
          {(['gasto', 'ingreso'] as TransactionType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === t ? 'btn-accent shadow' : 'text-soft'
              }`}
            >
              {t === 'gasto' ? '💸 Gasto' : '💰 Ingreso'}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">Cantidad</label>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-display font-bold bg-transparent outline-none border-b-2 border-theme focus:border-accent py-1 transition-colors"
            />
            <span className="text-2xl font-bold text-soft">{currency}</span>
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[2, 5, 10, 20, 50].map((quick) => (
              <button
                type="button"
                key={quick}
                onClick={() => setAmount(String(quick))}
                className="card-soft px-3 py-1 rounded-full text-xs font-bold text-soft hover:text-accent"
              >
                {quick} {currency}
              </button>
            ))}
          </div>
        </div>

        {type === 'gasto' && (
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">Categoría</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {expenseCategories.map((cat) => {
                const c = categoryColor(cat, mode);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all text-xs font-semibold"
                    style={{
                      borderColor: category === cat.id ? c : 'var(--border)',
                      background: category === cat.id ? `${c}22` : 'var(--surface-2)',
                    }}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="leading-tight text-center">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: cena con amigos"
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
        </div>

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          {editing ? 'Guardar cambios' : 'Guardar movimiento'}
        </button>
      </form>
    </Modal>
  );
}
