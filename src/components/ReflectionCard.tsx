import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { currentMonthKey } from '../utils/format';
import { useT } from '../i18n/useT';
import type { View } from '../App';

/** Tarjeta del Panel que conecta la Reflexión Kakeibo mensual con el
 * Dashboard — antes había que acordarse de entrar en "Reflexión" por tu
 * cuenta; ahora el Panel te recuerda si ya la hiciste este mes y qué salió,
 * o te invita a hacerla si aún no. */
export default function ReflectionCard({ setView }: { setView: (v: View) => void }) {
  const reflections = useStore((s) => s.reflections);
  const { t } = useT();
  const month = currentMonthKey();

  const existing = useMemo(() => reflections.find((r) => r.id === month), [reflections, month]);
  const onTrack = existing ? existing.disponible - existing.gastoReal >= existing.deseoAhorrar : null;

  return (
    <button
      onClick={() => setView('reflexion')}
      className="card p-4 text-left hover:shadow-md transition-shadow w-full"
    >
      <p className="text-xs font-bold text-soft uppercase tracking-wide mb-1">{t('reflection.dashCard.title')}</p>
      {existing ? (
        <>
          <p className="font-display font-bold flex items-center gap-1.5">
            <span>{onTrack ? '🌿' : '🍂'}</span>
            {onTrack ? t('reflection.dashCard.doneOnTrack') : t('reflection.dashCard.doneOffTrack')}
          </p>
          <p className="text-xs text-accent font-bold mt-1.5">{t('reflection.dashCard.view')}</p>
        </>
      ) : (
        <>
          <p className="text-sm text-soft">{t('reflection.dashCard.pending')}</p>
          <p className="text-xs text-accent font-bold mt-1.5">{t('reflection.dashCard.cta')}</p>
        </>
      )}
    </button>
  );
}
