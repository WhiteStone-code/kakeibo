import { useStore } from '../../store/useStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { LEVELS } from '../../data/levels';
import { useDerivedStats } from '../../hooks/useDerivedStats';
import { useT } from '../../i18n/useT';
import { translateWithFallback } from '../../i18n/translations';

export default function AchievementsView() {
  const unlocked = useStore((s) => s.unlocked);
  const { xp, streak, level, next } = useDerivedStats();
  const { t, lang } = useT();

  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const levelTitle = (lvl: { level: number; title: string }) =>
    translateWithFallback(`level.${lvl.level}`, lang, lvl.title);
  const achTitle = (id: string, fallback: string) => translateWithFallback(`ach.${id}.title`, lang, fallback);
  const achDesc = (id: string, fallback: string) => translateWithFallback(`ach.${id}.desc`, lang, fallback);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl">{t('achievements.title')}</h1>
        <p className="text-soft text-sm">{t('achievements.subtitle')}</p>
      </div>

      <div className="card p-5 flex flex-col sm:flex-row items-center gap-5">
        <div className="text-6xl animate-float">{level.emoji}</div>
        <div className="flex-1 w-full">
          <p className="font-display font-bold text-lg">{levelTitle(level)}</p>
          <p className="text-xs text-soft mb-2">{t('achievements.streak', { streak })} · {xp} XP</p>
          {next ? (
            <>
              <div className="w-full h-2.5 rounded-full bg-app-soft overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${((xp - level.minXp) / (next.minXp - level.minXp)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-soft mt-1.5">
                {t('achievements.xpToNext', { xp: next.minXp - xp, emoji: next.emoji, title: levelTitle(next) })}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-accent">{t('achievements.maxRank')}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <div
            key={l.level}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
              l.level <= level.level ? 'btn-accent' : 'card-soft text-soft'
            }`}
          >
            <span>{l.emoji}</span> {levelTitle(l)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedIds.has(a.id);
          return (
            <div
              key={a.id}
              className={`card p-4 flex flex-col items-center text-center gap-1.5 transition-all ${
                isUnlocked ? 'animate-pop' : 'opacity-45 grayscale'
              }`}
            >
              <span className="text-4xl">{isUnlocked ? a.emoji : '🔒'}</span>
              <p className="font-display font-bold text-sm leading-tight">{achTitle(a.id, a.title)}</p>
              <p className="text-xs text-soft leading-tight">{achDesc(a.id, a.description)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
