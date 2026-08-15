import { useDerivedStats } from '../hooks/useDerivedStats';
import { useT } from '../i18n/useT';
import { translateWithFallback } from '../i18n/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar({
  onAdd,
  onShowNotifications,
  hasUnreadNotifications,
}: {
  onAdd: () => void;
  onShowNotifications: () => void;
  hasUnreadNotifications: boolean;
}) {
  const { streak, xp, level, next, unlockedCount } = useDerivedStats();
  const { t, lang } = useT();
  const levelTitle = translateWithFallback(`level.${level.level}`, lang, level.title);

  const progressPct = next
    ? Math.round(((xp - level.minXp) / (next.minXp - level.minXp)) * 100)
    : 100;

  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-b border-theme bg-surface/70 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="font-display font-bold text-sm flex items-center gap-1.5">
            <span>{level.emoji}</span> {levelTitle}
          </span>
          <div className="w-40 h-1.5 rounded-full bg-app-soft mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 card-soft px-3 py-1.5 rounded-full text-sm font-bold">
          <span>🔥</span>
          <span>{streak}</span>
          <span className="text-soft font-medium hidden sm:inline">{t('topbar.days')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 card-soft px-3 py-1.5 rounded-full text-sm font-bold">
          <span>🎖️</span>
          <span>{unlockedCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onShowNotifications}
          aria-label={t('topbar.notifications')}
          title={t('topbar.notifications')}
          className="relative card-soft w-10 h-10 rounded-full flex items-center justify-center text-lg"
        >
          🔔
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#e34948] border-2 border-surface" />
          )}
        </button>
        <LanguageSwitcher />
        <button
          onClick={onAdd}
          aria-label={t('topbar.addTransaction')}
          className="btn-accent flex items-center gap-2 font-bold px-4 py-2.5 rounded-2xl text-sm shadow-md whitespace-nowrap"
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline">{t('topbar.addTransaction')}</span>
        </button>
      </div>
    </header>
  );
}
