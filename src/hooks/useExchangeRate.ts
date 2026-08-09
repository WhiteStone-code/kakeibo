import { useEffect, useState } from 'react';

interface CachedRate {
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

export type FxStatus = 'idle' | 'loading' | 'error' | 'cached';

/** Tasa de cambio from→to vía frankfurter.dev (API pública del BCE, sin
 * clave). Es la única llamada de red de toda la app — si falla o no hay
 * conexión, cae a la última tasa guardada en localStorage. */
export function useExchangeRate(from: string, to: string) {
  const [rate, setRate] = useState<number | null>(null);
  const [status, setStatus] = useState<FxStatus>('idle');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!from || !to || from === to) {
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
          cache[key] = { rate: r, fetchedAt: Date.now() };
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

  return { rate, status, fetchedAt };
}
