import { useState } from 'react';
import { UNIQUE_CURRENCIES } from '../data/currencies';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useT } from '../i18n/useT';
import { LOCALE_MAP } from '../i18n/translations';

/** Conversor rápido de divisas. Es la única función de la app que necesita
 * internet (tasas del BCE vía frankfurter.dev, gratis y sin clave) — el
 * resto de Kakeibo sigue funcionando 100% sin conexión. Si no hay red, usa
 * la última tasa guardada. */
export default function CurrencyConverter({ defaultCurrency }: { defaultCurrency: string }) {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState(defaultCurrency);
  const [to, setTo] = useState(defaultCurrency === 'CHF' ? 'EUR' : 'CHF');
  const { rate, status, fetchedAt } = useExchangeRate(from, to);
  const { t, lang } = useT();
  const locale = LOCALE_MAP[lang];

  const amountNum = parseFloat(amount.replace(',', '.')) || 0;
  const converted = rate !== null ? amountNum * rate : null;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <h2 className="font-display font-bold text-base">{t('invest.converterTitle')}</h2>
      <p className="text-xs text-soft -mt-1">{t('invest.converterDesc')}</p>
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

      {status === 'loading' && <p className="text-sm text-soft">{t('invest.consultingRate')}</p>}
      {status === 'error' && (
        <p className="text-sm text-[#e34948]">{t('invest.rateError', { from, to })}</p>
      )}
      {converted !== null && status !== 'loading' && (
        <div>
          <p className="font-display font-extrabold text-2xl text-accent">
            {converted.toLocaleString(locale, { maximumFractionDigits: 2 })} {to}
          </p>
          <p className="text-xs text-soft">
            1 {from} = {rate?.toLocaleString(locale, { maximumFractionDigits: 4 })} {to}{' '}
            {status === 'cached' && fetchedAt && (
              <>{t('invest.cachedNote', { mins: Math.round((Date.now() - fetchedAt) / 60000) })}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
