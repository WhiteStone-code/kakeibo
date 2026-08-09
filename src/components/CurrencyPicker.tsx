import { useMemo, useState } from 'react';
import { UNIQUE_CURRENCIES } from '../data/currencies';

export default function CurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return UNIQUE_CURRENCIES;
    return UNIQUE_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [query]);

  const current = UNIQUE_CURRENCIES.find((c) => c.code === value);

  return (
    <div className="flex flex-col gap-2.5">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`🔍 Buscar divisa (actual: ${current?.name ?? value})`}
        className="px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm"
      />
      <div className="max-h-48 overflow-y-auto flex flex-col divide-y divide-theme border border-theme rounded-xl">
        {filtered.length === 0 && (
          <p className="text-xs text-soft text-center py-4">Sin resultados para "{query}"</p>
        )}
        {filtered.map((c) => (
          <button
            type="button"
            key={c.code}
            onClick={() => onChange(c.code)}
            className={`flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
              value === c.code ? 'btn-accent font-bold' : 'hover:bg-app-soft'
            }`}
          >
            <span>{c.name}</span>
            <span className={value === c.code ? 'opacity-90' : 'text-soft'}>{c.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
