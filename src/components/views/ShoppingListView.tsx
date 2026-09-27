import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';
import { formatMoney, daysUntil, parseDecimal } from '../../utils/format';
import { localIsoDate } from '../../utils/localDate';
import { buildShoppingListText, openEmailShare } from '../../utils/shareShoppingList';
import StorePicker from '../StorePicker';
import DealDatesCard from '../DealDatesCard';
import WhatsappIcon from '../icons/WhatsappIcon';
import type { ShoppingItem } from '../../types';

const NO_STORE_KEY = ' no-store';
const NO_OCCASION_KEY = ' no-occasion';

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
  const customOccasions = useStore((s) => s.customOccasions);
  const frequentItemNames = useStore((s) => s.frequentItemNames);
  const getLastStoreFor = useStore((s) => s.getLastStoreFor);
  const getLastPriceFor = useStore((s) => s.getLastPriceFor);
  const { t } = useT();

  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [pendingStore, setPendingStore] = useState<string | null>(null);
  const [showOccasion, setShowOccasion] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'tienda' | 'ocasion'>('tienda');
  const [canShare, setCanShare] = useState(() => typeof navigator !== 'undefined' && 'share' in navigator);

  // Al marcar un producto sin precio conocido, se pregunta ahí mismo cuánto
  // costó de verdad — en vez de pedir que se adivine antes de ir a comprar.
  const [priceProbeId, setPriceProbeId] = useState<string | null>(null);
  const [priceProbeValue, setPriceProbeValue] = useState('');

  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDate, setMealDate] = useState('');
  const [mealIngredients, setMealIngredients] = useState('');

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

  const storeGroups = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of pending) {
      const key = item.store ?? NO_STORE_KEY;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === NO_STORE_KEY) return 1;
      if (b === NO_STORE_KEY) return -1;
      return a.localeCompare(b);
    });
  }, [pending]);

  const occasionGroups = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of pending) {
      const key = item.occasion ?? NO_OCCASION_KEY;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a, itemsA], [b, itemsB]) => {
      if (a === NO_OCCASION_KEY) return 1;
      if (b === NO_OCCASION_KEY) return -1;
      const dateA = itemsA.find((i) => i.neededBy)?.neededBy;
      const dateB = itemsB.find((i) => i.neededBy)?.neededBy;
      if (dateA && dateB) return dateA < dateB ? -1 : 1;
      if (dateA) return -1;
      if (dateB) return 1;
      return a.localeCompare(b);
    });
  }, [pending]);

  // "¿Dónde lo compraste la última vez?" / "¿cuánto costó?" — se
  // recalculan a cada tecla, son una simple lectura de un mapa en
  // memoria, no hace falta memoizarlo.
  const suggestedStore = name.trim().length > 1 ? getLastStoreFor(name) : null;
  const suggestedPrice = name.trim().length > 1 ? getLastPriceFor(name) : null;
  const showStoreSuggestion = !!suggestedStore && suggestedStore !== pendingStore;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addShoppingItem({
      name,
      estPrice: null,
      store: pendingStore,
      occasion: occasion.trim() || null,
      neededBy: neededBy || null,
    });
    setName('');
    setOccasion('');
    setNeededBy('');
    setPendingStore(null);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredients = mealIngredients
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!mealName.trim() || ingredients.length === 0) return;
    for (const ing of ingredients) {
      addShoppingItem({ name: ing, estPrice: null, occasion: mealName.trim(), neededBy: mealDate || null });
    }
    setMealName('');
    setMealDate('');
    setMealIngredients('');
    setShowMealPlanner(false);
    setGroupBy('ocasion');
  };

  // Se marca primero (feedback inmediato), y solo si no había precio
  // guardado se pregunta ahí mismo cuánto costó — nunca antes de comprar.
  const handleToggle = (item: ShoppingItem) => {
    const wasChecked = item.checked;
    toggleShoppingItem(item.id);
    if (!wasChecked && item.estPrice === null) {
      setPriceProbeId(item.id);
      // Precio real de la última vez, si existe, como VALOR editable — no
      // solo como placeholder. Hallazgo real de auditoría: con solo el
      // placeholder, confirmar sin escribir nada (una lectura razonable de
      // "sí, el mismo de siempre") descartaba el precio en silencio.
      const last = getLastPriceFor(item.name);
      setPriceProbeValue(last !== null ? String(last).replace('.', ',') : '');
    } else if (priceProbeId === item.id) {
      setPriceProbeId(null);
    }
  };

  const submitPriceProbe = (id: string) => {
    const p = parseDecimal(priceProbeValue);
    if (Number.isFinite(p) && p > 0) updateShoppingItem(id, { estPrice: p });
    setPriceProbeId(null);
    setPriceProbeValue('');
  };

  const shareText = () => buildShoppingListText(shoppingList, currency, t('shopping.shareTitle'));

  const handleShare = async () => {
    const text = shareText();
    if (canShare) {
      try {
        await navigator.share({ title: t('shopping.shareTitle'), text });
        return;
      } catch {
        setCanShare(false);
      }
    }
    openWhatsapp();
  };

  const openWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => openEmailShare(shoppingList, currency, t('shopping.shareTitle'));

  const sendToMovimientos = () => {
    if (checked.length === 0 || totalSpent <= 0) return;
    const names = checked.map((i) => i.name).join(', ');
    addTransaction({
      type: 'gasto',
      amount: totalSpent,
      category: 'comida',
      note: t('shopping.registerNote', { names }).slice(0, 120),
      date: localIsoDate(),
    });
    clearCheckedShoppingItems();
  };

  const renderItem = (item: ShoppingItem, isChecked: boolean, showStoreTag: boolean) => (
    <li
      key={item.id}
      className={`py-2 border-b border-theme last:border-0 group ${isChecked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => handleToggle(item)}
          className="w-5 h-5 accent-[var(--accent)] shrink-0"
        />
        <span className={`flex-1 font-medium text-sm ${isChecked ? 'line-through' : ''}`}>{item.name}</span>
        {item.estPrice !== null && (
          <span className="text-sm text-soft tabular-nums">{formatMoney(item.estPrice, currency)}</span>
        )}
        <button
          type="button"
          onClick={() => setEditingStoreId(editingStoreId === item.id ? null : item.id)}
          aria-label={t('shopping.whereToBuy')}
          className="text-soft hover:text-accent px-1 text-sm w-8 h-8 flex items-center justify-center shrink-0"
          title={t('shopping.whereToBuy')}
        >
          📍
        </button>
        <button
          type="button"
          onClick={() => removeShoppingItem(item.id)}
          aria-label={t('common.delete')}
          title={t('common.delete')}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-soft opacity-60 hover:opacity-100 hover:text-[#e34948] hover:bg-[#e3494811] transition-all md:opacity-0 md:group-hover:opacity-100"
        >
          ✕
        </button>
      </div>
      {showStoreTag && item.store && <p className="text-xs text-soft mt-0.5 ml-8">📍 {item.store}</p>}
      {priceProbeId === item.id && (
        <div className="mt-1.5 ml-8 flex items-center gap-1.5">
          <span className="text-xs text-soft whitespace-nowrap">{t('shopping.howMuchDidItCost')}</span>
          <input
            autoFocus
            inputMode="decimal"
            value={priceProbeValue}
            onChange={(e) => setPriceProbeValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submitPriceProbe(item.id))}
            placeholder={currency}
            className="w-20 px-2 py-1 rounded-lg bg-surface-2 border border-theme outline-none focus:border-accent text-xs font-bold"
          />
          <button
            type="button"
            onClick={() => submitPriceProbe(item.id)}
            className="btn-accent w-6 h-6 rounded-full text-xs font-bold shrink-0"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => setPriceProbeId(null)}
            className="text-xs text-soft hover:text-inherit shrink-0"
          >
            {t('recurring.skip')}
          </button>
        </div>
      )}
      {editingStoreId === item.id && (
        <div className="mt-2 ml-8">
          <StorePicker
            value={item.store}
            onChange={(store) => {
              updateShoppingItem(item.id, { store });
              if (store) setEditingStoreId(null);
            }}
          />
        </div>
      )}
    </li>
  );

  const storeLabel = (key: string) => (key === NO_STORE_KEY ? t('shopping.noStore') : key);
  const occasionLabel = (key: string) => (key === NO_OCCASION_KEY ? t('shopping.generalOccasion') : key);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8 max-w-2xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-extrabold text-2xl">{t('shopping.title')}</h1>
          <p className="text-soft text-sm">{t('shopping.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="btn-accent font-bold px-3 py-2 rounded-xl text-xs shadow-md whitespace-nowrap"
          >
            {t('shopping.share')}
          </button>
          <button
            onClick={handleEmail}
            className="card-soft font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5"
          >
            ✉️ {t('shopping.shareEmail')}
          </button>
          <button
            onClick={openWhatsapp}
            className="font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 border-2"
            style={{ borderColor: '#25D36655', color: '#128C4A' }}
          >
            <WhatsappIcon className="w-4 h-4" /> {t('shopping.shareWhatsapp')}
          </button>
        </div>
      </div>

      <DealDatesCard />

      <div className="card-soft p-4">
        <button
          type="button"
          onClick={() => setShowMealPlanner((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-bold text-accent"
        >
          <span>🍽️ {t('shopping.mealPlanner.toggle')}</span>
          <span>{showMealPlanner ? '−' : '+'}</span>
        </button>
        {showMealPlanner && (
          <form onSubmit={handleAddMeal} className="flex flex-col gap-2 mt-3">
            <p className="text-xs text-soft -mt-1">{t('shopping.mealPlanner.desc')}</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder={t('shopping.mealPlanner.namePlaceholder')}
                className="px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm font-semibold"
              />
              <input
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm"
              />
            </div>
            <textarea
              value={mealIngredients}
              onChange={(e) => setMealIngredients(e.target.value)}
              rows={3}
              placeholder={t('shopping.mealPlanner.ingredientsPlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm resize-none"
            />
            <button type="submit" className="btn-accent font-bold py-2 rounded-xl text-sm">
              {t('shopping.mealPlanner.add')}
            </button>
          </form>
        )}
      </div>

      <div className="card p-4 flex flex-col gap-2">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">
          {t('shopping.budgetLabel')}
        </label>
        <p className="text-xs text-soft -mt-1">{t('shopping.budgetDesc')}</p>
        <input
          inputMode="decimal"
          defaultValue={shoppingBudget || ''}
          onBlur={(e) => setShoppingBudget(parseDecimal(e.target.value) || 0)}
          placeholder={t('shopping.budgetPlaceholder')}
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

      <form onSubmit={handleAdd} className="card p-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            list="frequent-items-list"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('shopping.itemPlaceholder')}
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold"
          />
          <datalist id="frequent-items-list">
            {frequentItemNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <button type="submit" className="btn-accent font-bold px-4 rounded-xl text-sm">
            +
          </button>
        </div>

        {/* Memoria por producto: si ya compraste "Leche" antes en Coop por
            2,50€, lo recordamos aquí en vez de obligarte a repetir la
            búsqueda o a adivinar un precio antes de ir a comprar. */}
        {showStoreSuggestion && (
          <button
            type="button"
            onClick={() => setPendingStore(suggestedStore)}
            className="flex items-center gap-1.5 text-xs font-semibold text-soft bg-app-soft rounded-xl px-3 py-2 text-left w-fit"
          >
            📍 {t('shopping.lastBoughtAt', { store: suggestedStore! })}
            <span className="text-accent font-bold">{t('shopping.useStore')}</span>
          </button>
        )}
        {suggestedPrice !== null && (
          <p className="text-xs text-soft px-1">
            💰 {t('shopping.lastCost', { amount: formatMoney(suggestedPrice, currency) })}
          </p>
        )}
        {pendingStore && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-accent bg-app-soft rounded-xl px-3 py-1.5 w-fit">
            📍 {pendingStore}
            <button
              type="button"
              onClick={() => setPendingStore(null)}
              aria-label={t('common.delete')}
              className="text-soft hover:text-[#e34948]"
            >
              ✕
            </button>
          </span>
        )}

        <button
          type="button"
          onClick={() => setShowOccasion((v) => !v)}
          className="text-xs font-bold text-accent text-left"
        >
          {showOccasion ? t('txform.hideDetails') : t('shopping.addOccasion')}
        </button>
        {showOccasion && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                list="occasion-list"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder={t('shopping.occasionPlaceholder')}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm"
              />
              <datalist id="occasion-list">
                {customOccasions.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </div>
            <input
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm"
            />
          </div>
        )}
      </form>

      {shoppingList.length === 0 ? (
        <div className="card p-10 text-center text-soft">
          <p className="text-3xl mb-2">🧺</p>
          {t('shopping.empty')}
        </div>
      ) : (
        <>
          <div className="flex gap-1 p-1 bg-app-soft rounded-2xl w-fit">
            {(['tienda', 'ocasion'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  groupBy === g ? 'btn-accent' : 'text-soft'
                }`}
              >
                {g === 'tienda' ? t('shopping.groupByStore') : t('shopping.groupByOccasion')}
              </button>
            ))}
          </div>

          <div className="card p-4 flex flex-col gap-1">
            {groupBy === 'tienda'
              ? storeGroups.map(([key, items]) => (
                  <div key={key} className="mb-2 last:mb-0">
                    <p className="text-[11px] font-bold text-accent uppercase tracking-wide pt-2 pb-1 flex items-center gap-1">
                      📍 {storeLabel(key)}
                    </p>
                    <ul>{items.map((item) => renderItem(item, false, false))}</ul>
                  </div>
                ))
              : occasionGroups.map(([key, items]) => {
                  const groupDate = items.find((i) => i.neededBy)?.neededBy;
                  const days = groupDate ? daysUntil(groupDate) : null;
                  return (
                    <div key={key} className="mb-2 last:mb-0">
                      <p className="text-[11px] font-bold text-accent uppercase tracking-wide pt-2 pb-1 flex items-center gap-1.5">
                        <span>{key === NO_OCCASION_KEY ? '🛒' : '🎯'}</span>
                        {occasionLabel(key)}
                        {days !== null && (
                          <span className="text-soft normal-case font-semibold">
                            · {days >= 0 ? t('goals.daysLeft', { days }) : t('goals.overdue', { days: -days })}
                          </span>
                        )}
                      </p>
                      <ul>{items.map((item) => renderItem(item, false, true))}</ul>
                    </div>
                  );
                })}

            {checked.length > 0 && (
              <>
                <p className="text-[11px] font-bold text-soft uppercase tracking-wide pt-3 pb-1">
                  {t('shopping.inCart')}
                </p>
                <ul>{checked.map((item) => renderItem(item, true, true))}</ul>
              </>
            )}
          </div>
        </>
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
