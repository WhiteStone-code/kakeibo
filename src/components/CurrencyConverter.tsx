import { useEffect, useState } from 'react';
import { UNIQUE_CURRENCIES } from '../data/currencies';

interface CachedRate {
  from: string;
  to: string;
  rate: number;
  fetchedAt: number;
}

const CACHE_KEY = 'kakeibo-fx-cache';

function loadCache(): Record<string, CachedRate> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CachedRate>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

/** Conversor rápido de divisas. Es la única función de la app que necesita
 * internet (tasas del BCE vía frankfurter.app, gratis y sin clave) — el
 * resto de Kakeibo sigue funcionando 100% sin conexión. Si no hay red, usa
 * la última tasa guardada. */
export default function CurrencyConverter({ defaultCurrency }: { defaultCurrency: string }) {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState(defaultCurrency);
  const [to, setTo] = useState(defaultCurrency === 'CHF' ? 'EUR' : 'CHF');
  const [rate, setRate] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'cached'>('idle');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    if (from === to) {
      setRate(1);
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    const key = `${from}_${to}`;
    fetch(`https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const r = data?.rates?.[to];
        if (typeof r === 'number') {
          setRate(r);
          setFetchedAt(Date.now());
          setStatus('idle');
          const cache = loadCache();
          cache[key] = { from, to, rate: r, fetchedAt: Date.now() };
          saveCache(cache);
        } else {
          throw new Error('sin tasa');
        }
      })
      .catch(() => {
        if (cancelled) return;
        const cached = loadCache()[key];
        if (cached) {
          setRate(cached.rate);
          setFetchedAt(cached.fetchedAt);
          setStatus('cached');
        } else {
          setStatus('error');
          setRate(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const converted = rate !== null ? amountNum * rate : null;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <h2 className="font-display font-bold text-base">💱 Conversor rápido de divisas</h2>
      <p className="text-xs text-soft -mt-1">
        Esta parte sí necesita internet (tasas del Banco Central Europeo). El resto de Kakeibo
        sigue funcionando sin conexión.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold text-right"
        />
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm font-bold"
        >
          {UNIQUE_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
        <span className="text-soft">→</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent text-sm font-bold"
        >
          {UNIQUE_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="text-sm text-soft">Consultando tasa…</p>}
      {status === 'error' && (
        <p className="text-sm text-[#e34948]">
          Sin conexión y sin una tasa guardada todavía para {from}→{to}.
        </p>
      )}
      {converted !== null && status !== 'loading' && (
        <div>
          <p className="font-display font-extrabold text-2xl text-accent">
            {converted.toLocaleString('es-ES', { maximumFractionDigits: 2 })} {to}
          </p>
          <p className="text-xs text-soft">
            1 {from} = {rate?.toLocaleString('es-ES', { maximumFractionDigits: 4 })} {to}
            {status === 'cached' && fetchedAt && (
              <> · tasa guardada de hace {Math.round((Date.now() - fetchedAt) / 60000)} min (sin conexión)</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
