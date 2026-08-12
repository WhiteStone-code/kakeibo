import { useEffect, useState } from 'react';
import Modal from './Modal';
import { categoryColor } from '../data/categories';
import { useExpenseCategories, useIncomeCategories } from '../hooks/useCategories';
import { useCategoryLabel } from '../i18n/useCategoryLabel';
import { useT } from '../i18n/useT';
import { useStore } from '../store/useStore';
import { currencySymbol, formatMoneyRound } from '../utils/format';
import type { PaymentMethod, Transaction, TransactionType } from '../types';

const PAYMENT_METHODS: { id: PaymentMethod; key: string; emoji: string }[] = [
  { id: 'tarjeta', key: 'paymentMethod.tarjeta', emoji: '💳' },
  { id: 'efectivo', key: 'paymentMethod.efectivo', emoji: '💵' },
  { id: 'movil', key: 'paymentMethod.movil', emoji: '📱' },
  { id: 'transferencia', key: 'paymentMethod.transferencia', emoji: '🏦' },
];

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
  const incomeCategories = useIncomeCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();

  const [type, setType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('comida');
  const [note, setNote] = useState('');
  const [place, setPlace] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(false);

  const categories = type === 'gasto' ? expenseCategories : incomeCategories;

  const reset = () => {
    setType('gasto');
    setAmount('');
    setCategory('comida');
    setNote('');
    setPlace('');
    setPaymentMethod('tarjeta');
    setDate(new Date().toISOString().slice(0, 10));
    setShowDetails(false);
    setError(false);
  };

  // Al abrir para editar, precarga los datos del movimiento existente.
  useEffect(() => {
    if (open && editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setNote(editing.note);
      setPlace(editing.place ?? '');
      setPaymentMethod(editing.paymentMethod ?? 'tarjeta');
      setDate(editing.date);
      setShowDetails(Boolean(editing.place));
      setError(false);
    } else if (open && !editing) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  // Al cambiar entre gasto/ingreso, salta a la primera categoría de la lista
  // correspondiente en vez de dejar seleccionada una que no pega (o no existe).
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const list = newType === 'gasto' ? expenseCategories : incomeCategories;
    if (!list.some((c) => c.id === category)) {
      setCategory(list[0]?.id ?? 'otros');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) {
      setError(true);
      return;
    }
    const payload = {
      type,
      amount: value,
      category,
      note: note.trim(),
      place: place.trim() || null,
      paymentMethod,
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
    <Modal open={open} onClose={onClose} title={editing ? t('txform.titleEdit') : t('txform.titleNew')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-2 p-1 bg-app-soft rounded-2xl">
          {(['gasto', 'ingreso'] as TransactionType[]).map((ty) => (
            <button
              type="button"
              key={ty}
              onClick={() => handleTypeChange(ty)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === ty ? 'btn-accent shadow' : 'text-soft'
              }`}
            >
              {ty === 'gasto' ? t('txform.expense') : t('txform.income')}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('txform.amount')}</label>
          <div className="flex items-center gap-2 mt-1.5">
            <input
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full text-3xl font-display font-bold bg-transparent outline-none border-b-2 py-1 transition-colors ${
                error ? 'border-[#e34948]' : 'border-theme focus:border-accent'
              }`}
            />
            <span className="text-2xl font-bold text-soft">{currencySymbol(currency)}</span>
          </div>
          {error && <p className="text-xs font-semibold text-[#e34948] mt-1">{t('txform.amountError')}</p>}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[2, 5, 10, 20, 50].map((quick) => (
              <button
                type="button"
                key={quick}
                onClick={() => {
                  setAmount(String(quick));
                  setError(false);
                }}
                className="card-soft px-3 py-1 rounded-full text-xs font-bold text-soft hover:text-accent"
              >
                {formatMoneyRound(quick, currency)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">
            {type === 'gasto' ? t('txform.category') : t('txform.incomeSource')}
          </label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {categories.map((cat) => {
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
                  <span className="leading-tight text-center">{categoryLabel(cat)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('txform.date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('txform.note')}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('txform.notePlaceholder')}
              className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="text-xs font-bold text-accent -mt-2 text-left"
        >
          {showDetails ? t('txform.hideDetails') : t('txform.showDetails')}
        </button>

        {showDetails && (
          <div className="flex flex-col gap-3 -mt-2">
            <div>
              <label className="text-xs font-bold text-soft uppercase tracking-wide">
                {t('txform.paymentMethod')}
              </label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-[11px] font-semibold transition-all ${
                      paymentMethod === pm.id ? 'border-accent bg-accent/10' : 'border-theme bg-surface-2'
                    }`}
                  >
                    <span className="text-lg">{pm.emoji}</span>
                    {t(pm.key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('txform.place')}</label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={t('txform.placePlaceholder')}
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          {editing ? t('txform.saveEdit') : t('txform.saveNew')}
        </button>
      </form>
    </Modal>
  );
}
