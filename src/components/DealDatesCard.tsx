import { useMemo } from 'react';
import { getNextDealDate } from '../utils/dealDates';
import { useT } from '../i18n/useT';

/** Recordatorio de la próxima fecha de ofertas conocida (Black Friday,
 * rebajas...). Importante ser honesto con lo que es: fechas de calendario,
 * no precios en vivo — eso necesitaría scraping o una API de pago que esta
 * app (100% local y gratuita) no tiene. */
export default function DealDatesCard() {
  const { t } = useT();
  const next = useMemo(() => getNextDealDate(), []);

  if (!next) return null;

  return (
    <div className="card-soft p-4 flex items-center gap-3">
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
  );
}
