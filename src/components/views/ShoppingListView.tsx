import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';
import { formatMoney } from '../../utils/format';
import { buildShoppingListText } from '../../utils/shareShoppingList';
import StorePicker from '../StorePicker';
import type { ShoppingItem } from '../../types';

export default function ShoppingListView() {
  const shoppingList = useStore((s) => s.shoppingList);
  const shoppingBudget = useStore((s) => s.shoppingBudget);
  const setShoppingBudget = useStore((s) => s.setShoppingBudget);
  const addShoppingItem = useStore((s) => s.addShoppingItem);
  const toggleShoppingItem = useStore((s) => s.toggleShoppingItem);
  const removeShoppingItem = useStore((s) => s.removeShoppingItem);
  const updateShoppingItem = useStore((s) => s.updateShoppingItem);
  const clearCheckedShoppingItems = useStore((s) => s.clearCheckedShoppingItems);
  const addTransaction = useStore((s) => s.addTransaction);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(() => typeof navigator !== 'undefined' && 'share' in navigator);

  const { pending, checked, totalSpent, remaining } = useMemo(() => {
    const pending = shoppingList.filter((i) => !i.checked);
    const checked = shoppingList.filter((i) => i.checked);
    const totalSpent = checked.reduce((sum, i) => sum + (i.estPrice ?? 0), 0);
    return {
      pending,
      checked,
      totalSpent,
      remaining: shoppingBudget > 0 ? shoppingBudget - totalSpent : null,
    };
  }, [shoppingList, shoppingBudget]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p = price.trim() ? parseFloat(price.replace(',', '.')) : null;
    addShoppingItem({ name, estPrice: Number.isFinite(p) ? p : null });
    setName('');
    setPrice('');
  };

  const shareText = () => buildShoppingListText(shoppingList, currency, t('shopping.shareTitle'));

  const handleShare = async () => {
    const text = shareText();
    if (canShare) {
      try {
        await navigator.share({ title: t('shopping.shareTitle'), text });
        return;
      } catch {
        // el usuario canceló el panel de compartir, o el navegador falló — cae al de WhatsApp
        setCanShare(false);
      }
    }
    openWhatsapp();
  };

  const openWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendToMovimientos = () => {
    if (checked.length === 0 || totalSpent <= 0) return;
    const names = checked.map((i) => i.name).join(', ');
    addTransaction({
      type: 'gasto',
      amount: totalSpent,
      category: 'comida',
      note: `Compra: ${names}`.slice(0, 120),
      date: new Date().toISOString().slice(0, 10),
    });
    clearCheckedShoppingItems();
  };

  const renderItem = (item: ShoppingItem, isChecked: boolean) => (
    <li
      key={item.id}
      className={`py-2 border-b border-theme last:border-0 group ${isChecked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleShoppingItem(item.id)}
          className="w-5 h-5 accent-[var(--accent)] shrink-0"
        />
        <span className={`flex-1 font-medium text-sm ${isChecked ? 'line-through' : ''}`}>{item.name}</span>
        {item.estPrice !== null && (
          <span className="text-sm text-soft tabular-nums">{formatMoney(item.estPrice, currency)}</span>
        )}
        <button
          type="button"
          onClick={() => setEditingStoreId(editingStoreId === item.id ? null : item.id)}
          className="text-soft hover:text-accent px-1 text-sm"
          title={t('shopping.whereToBuy')}
        >
          📍
        </button>
        <button
          type="button"
          onClick={() => removeShoppingItem(item.id)}
          className="opacity-0 group-hover:opacity-100 text-soft hover:text-[#e34948] px-1"
        >
          ✕
        </button>
      </div>
      {editingStoreId === item.id ? (
        <div className="mt-2 ml-8">
          <StorePicker
            value={item.store}
            onChange={(store) => {
              updateShoppingItem(item.id, { store });
              if (store) setEditingStoreId(null);
            }}
          />
        </div>
      ) : (
        item.store && (
          <button
            onClick={() => setEditingStoreId(item.id)}
            className="text-xs text-soft mt-0.5 ml-8 text-left hover:text-accent"
          >
            📍 {item.store}
          </button>
        )
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8 max-w-2xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl">{t('shopping.title')}</h1>
          <p className="text-soft text-sm">{t('shopping.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="btn-accent font-bold px-3 py-2 rounded-xl text-xs shadow-md whitespace-nowrap"
          >
            {t('shopping.share')}
          </button>
          <button
            onClick={openWhatsapp}
            className="card-soft font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap"
          >
            {t('shopping.shareWhatsapp')}
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-col gap-2">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">
          {t('shopping.budgetLabel')}
        </label>
        <p className="text-xs text-soft -mt-1">{t('shopping.budgetDesc')}</p>
        <input
          inputMode="decimal"
          defaultValue={shoppingBudget || ''}
          onBlur={(e) => setShoppingBudget(parseFloat(e.target.value.replace(',', '.')) || 0)}
          placeholder="Ej: 40"
          className="w-32 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs font-bold text-soft uppercase tracking-wide">{t('shopping.spent')}</p>
          <p className="font-display font-extrabold text-xl mt-1 text-accent">
            {formatMoney(totalSpent, currency)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-soft uppercase tracking-wide">
            {remaining !== null ? t('shopping.remaining') : t('shopping.budget')}
          </p>
          <p
            className="font-display font-extrabold text-xl mt-1"
            style={{ color: remaining !== null && remaining < 0 ? '#e34948' : undefined }}
          >
            {remaining !== null ? formatMoney(remaining, currency) : t('shopping.undefined')}
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="card p-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('shopping.itemPlaceholder')}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold"
        />
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={currency}
          title={`Precio estimado en ${currency} (opcional)`}
          className="w-20 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
        />
        <button type="submit" className="btn-accent font-bold px-4 rounded-xl text-sm">
          +
        </button>
      </form>

      {shoppingList.length === 0 ? (
        <div className="card p-10 text-center text-soft">
          <p className="text-3xl mb-2">🧺</p>
          {t('shopping.empty')}
        </div>
      ) : (
        <div className="card p-4 flex flex-col gap-1">
          <ul>{pending.map((item) => renderItem(item, false))}</ul>

          {checked.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-soft uppercase tracking-wide pt-3 pb-1">
                {t('shopping.inCart')}
              </p>
              <ul>{checked.map((item) => renderItem(item, true))}</ul>
            </>
          )}
        </div>
      )}

      {checked.length > 0 && totalSpent > 0 && (
        <button
          onClick={sendToMovimientos}
          className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md"
        >
          {t('shopping.registerAndClear', { amount: formatMoney(totalSpent, currency) })}
        </button>
      )}
    </div>
  );
}
