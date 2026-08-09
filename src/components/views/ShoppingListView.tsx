import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatMoney } from '../../utils/format';

export default function ShoppingListView() {
  const shoppingList = useStore((s) => s.shoppingList);
  const addShoppingItem = useStore((s) => s.addShoppingItem);
  const toggleShoppingItem = useStore((s) => s.toggleShoppingItem);
  const removeShoppingItem = useStore((s) => s.removeShoppingItem);
  const clearCheckedShoppingItems = useStore((s) => s.clearCheckedShoppingItems);
  const addTransaction = useStore((s) => s.addTransaction);
  const currency = useStore((s) => s.settings.currency);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const { pending, checked, totalEst, totalSpent } = useMemo(() => {
    const pending = shoppingList.filter((i) => !i.checked);
    const checked = shoppingList.filter((i) => i.checked);
    const totalEst = shoppingList.reduce((sum, i) => sum + (i.estPrice ?? 0), 0);
    const totalSpent = checked.reduce((sum, i) => sum + (i.estPrice ?? 0), 0);
    return { pending, checked, totalEst, totalSpent };
  }, [shoppingList]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p = price.trim() ? parseFloat(price.replace(',', '.')) : null;
    addShoppingItem({ name, estPrice: Number.isFinite(p) ? p : null });
    setName('');
    setPrice('');
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

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8 max-w-2xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl">🛒 Lista de la compra</h1>
        <p className="text-soft text-sm">Apunta lo que necesitas y cuánto crees que te va a costar</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs font-bold text-soft uppercase tracking-wide">Presupuesto de la lista</p>
          <p className="font-display font-extrabold text-xl mt-1">{formatMoney(totalEst, currency)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-soft uppercase tracking-wide">Ya llevas gastado</p>
          <p className="font-display font-extrabold text-xl mt-1 text-accent">
            {formatMoney(totalSpent, currency)}
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="card p-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Qué necesitas? (ej: Leche)"
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
          Tu lista está vacía. ¡Añade el primer producto!
        </div>
      ) : (
        <div className="card p-4 flex flex-col gap-1">
          {pending.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-theme last:border-0 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleShoppingItem(item.id)}
                className="w-5 h-5 accent-[var(--accent)] shrink-0"
              />
              <span className="flex-1 font-medium text-sm">{item.name}</span>
              {item.estPrice !== null && (
                <span className="text-sm text-soft tabular-nums">{formatMoney(item.estPrice, currency)}</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeShoppingItem(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-soft hover:text-[#e34948] px-1"
              >
                ✕
              </button>
            </label>
          ))}

          {checked.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-soft uppercase tracking-wide pt-3 pb-1">
                Ya en el carro
              </p>
              {checked.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b border-theme last:border-0 cursor-pointer group opacity-60"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleShoppingItem(item.id)}
                    className="w-5 h-5 accent-[var(--accent)] shrink-0"
                  />
                  <span className="flex-1 font-medium text-sm line-through">{item.name}</span>
                  {item.estPrice !== null && (
                    <span className="text-sm text-soft tabular-nums">{formatMoney(item.estPrice, currency)}</span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeShoppingItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-soft hover:text-[#e34948] px-1"
                  >
                    ✕
                  </button>
                </label>
              ))}
            </>
          )}
        </div>
      )}

      {checked.length > 0 && (
        <button
          onClick={sendToMovimientos}
          className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md"
        >
          ✅ Registrar {formatMoney(totalSpent, currency)} como gasto y vaciar el carro
        </button>
      )}
    </div>
  );
}
