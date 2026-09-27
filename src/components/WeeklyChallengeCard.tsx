import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useAllCategories } from '../hooks/useCategories';
import { useCategoryLabel } from '../i18n/useCategoryLabel';
import { getCategory } from '../data/categories';
import { getWeeklyChallenge } from '../utils/weeklyChallenge';
import { formatMoney } from '../utils/format';
import { useT } from '../i18n/useT';

/** Reto de la semana: cada semana propone gastar algo menos en una
 * categoría real (calculado sobre tu propia media reciente, nunca
 * inventado) — le da vida nueva a la sección de Logros, que antes solo se
 * desbloqueaban una vez y ya está. Se recalcula solo, no hay botón de
 * "empezar reto" ni configuración: aparece solo cuando hay datos
 * suficientes para que tenga sentido. */
export default function WeeklyChallengeCard() {
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const allCategories = useAllCategories();
  const categoryLabel = useCategoryLabel();
  const { t } = useT();

  const challenge = useMemo(
    () => getWeeklyChallenge(transactions, allCategories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, allCategories]
  );

  if (!challenge) return null;

  const cat = getCategory(challenge.categoryId, allCategories);
  const pct = Math.min(100, Math.round((challenge.spent / challenge.target) * 100));

  return (
    <div className={`card p-5 ${challenge.achieved ? 'border-2 border-accent' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-bold text-base">{t('weeklyChallenge.title')}</h2>
        {challenge.achieved && <span className="text-xl">🏅</span>}
      </div>
      <p className="text-sm text-soft mb-3">
        {t('weeklyChallenge.desc', {
          category: `${cat.emoji} ${categoryLabel(cat)}`,
          amount: formatMoney(challenge.target, currency),
        })}
      </p>
      <div className="w-full h-3 rounded-full bg-app-soft overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: challenge.spent > challenge.target ? '#e34948' : 'var(--accent)',
          }}
        />
      </div>
      <p className="text-xs text-soft mt-1.5">
        {formatMoney(challenge.spent, currency)} / {formatMoney(challenge.target, currency)}
        {' · '}
        {challenge.achieved ? t('weeklyChallenge.onTrack') : t('weeklyChallenge.overTarget')}
      </p>
    </div>
  );
}
