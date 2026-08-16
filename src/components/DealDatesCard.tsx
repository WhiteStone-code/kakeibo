import { useMemo, useState } from 'react';
import { getNextDealDate } from '../utils/dealDates';
import { useT } from '../i18n/useT';

const BIG_PURCHASE_TIPS = ['car', 'house', 'electronics'] as const;

/** Recordatorio de la próxima fecha de ofertas conocida (Black Friday,
 * rebajas...) + consejos generales de "cuándo suele salir mejor" comprar
 * cosas grandes. Importante ser honesto con lo que es: fechas de
 * calendario y patrones generales conocidos, no precios en vivo ni datos
 * concretos de tu zona — eso necesitaría scraping o una API de pago que
 * esta app (100% local y gratuita) no tiene. */
export default function DealDatesCard() {
  const { t } = useT();
  const next = useMemo(() => getNextDealDate(), []);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="card-soft p-4 flex flex-col gap-3">
      {next && (
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{next.deal.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-soft uppercase tracking-wide">{t('deals.title')}</p>
            <p className="text-sm font-semibold">
              {t(next.deal.labelKey)} —{' '}
              <span className="text-accent font-bold">
                {next.daysUntil === 0 ? t('deals.today') : t('deals.daysAway', { days: next.daysUntil })}
              </span>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowTips((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-bold text-accent"
      >
        <span>💡 {t('deals.bigPurchaseTips.toggle')}</span>
        <span>{showTips ? '−' : '+'}</span>
      </button>
      {showTips && (
        <div className="flex flex-col gap-2.5">
          {BIG_PURCHASE_TIPS.map((k) => (
            <div key={k} className="flex gap-2">
              <span className="text-lg shrink-0">{t(`deals.bigPurchaseTips.${k}.emoji`)}</span>
              <div>
                <p className="text-xs font-bold">{t(`deals.bigPurchaseTips.${k}.title`)}</p>
                <p className="text-xs text-soft leading-snug">{t(`deals.bigPurchaseTips.${k}.desc`)}</p>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-soft italic border-t border-theme pt-2">
            {t('deals.bigPurchaseTips.disclaimer')}
          </p>
        </div>
      )}
    </div>
  );
}
