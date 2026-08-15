import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { THEMES } from '../data/themes';
import { APP_VERSION } from '../data/changelog';
import { useT } from '../i18n/useT';
import { translateWithFallback } from '../i18n/translations';
import type { ThemeId } from '../types';

export default function Onboarding() {
  const updateSettings = useStore((s) => s.updateSettings);
  const { t, lang } = useT();
  const themeName = (id: string, fallback: string) => translateWithFallback(`theme.${id}.name`, lang, fallback);
  const themeTagline = (id: string, fallback: string) => translateWithFallback(`theme.${id}.tagline`, lang, fallback);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<ThemeId>('zen');
  const [periodicGoal, setPeriodicGoal] = useState(false);

  const finish = () => {
    // lastSeenVersion se marca ya aquí: quien acaba de conocer la app no
    // necesita ver el historial de "novedades" de versiones anteriores.
    updateSettings({
      userName: name.trim(),
      theme,
      onboarded: true,
      lastSeenVersion: APP_VERSION,
      periodicGoalEnabled: periodicGoal,
    });
  };

  const TOUR_ITEMS: { key: string; emoji: string; nameKey: string; descKey: string }[] = [
    { key: 'dashboard', emoji: '🏠', nameKey: 'nav.dashboard', descKey: 'onboarding.tour.dashboard' },
    { key: 'transactions', emoji: '📒', nameKey: 'nav.transactions', descKey: 'onboarding.tour.transactions' },
    { key: 'goals', emoji: '🎯', nameKey: 'nav.goals', descKey: 'onboarding.tour.goals' },
    { key: 'shopping', emoji: '🛒', nameKey: 'nav.shopping', descKey: 'onboarding.tour.shopping' },
    { key: 'invest', emoji: '📈', nameKey: 'nav.invest', descKey: 'onboarding.tour.invest' },
    { key: 'reflection', emoji: '🧘', nameKey: 'nav.reflection', descKey: 'onboarding.tour.reflection' },
    { key: 'achievements', emoji: '🏆', nameKey: 'nav.achievements', descKey: 'onboarding.tour.achievements' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-app flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-md p-8 flex flex-col gap-6"
      >
        {step === 0 && (
          <>
            <div className="text-center">
              <div className="text-6xl mb-3">⛩️</div>
              <h1 className="font-display font-extrabold text-2xl">{t('onboarding.welcome')}</h1>
              <p className="text-soft text-sm mt-2">{t('onboarding.subtitle')}</p>
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('onboarding.namePlaceholder')}
              className="px-4 py-3 rounded-2xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold text-center"
              onKeyDown={(e) => e.key === 'Enter' && setStep(1)}
            />
            <button
              onClick={() => setStep(1)}
              className="btn-accent font-bold py-3 rounded-2xl shadow-md"
            >
              {t('onboarding.continue')}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="font-display font-extrabold text-xl">{t('onboarding.chooseTheme')}</h2>
              <p className="text-soft text-sm mt-1">{t('onboarding.chooseThemeSub')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setTheme(th.id as ThemeId);
                    updateSettings({ theme: th.id as ThemeId });
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                    theme === th.id ? 'border-accent shadow-md' : 'border-theme'
                  }`}
                >
                  <span className="text-2xl">{th.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm">{themeName(th.id, th.name)}</p>
                    <p className="text-xs text-soft leading-tight">{themeTagline(th.id, th.tagline)}</p>
                  </div>
                  <div className="flex -space-x-1.5 shrink-0">
                    {th.preview.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border-2 border-surface"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-accent font-bold py-3 rounded-2xl shadow-md">
              {t('onboarding.continue')}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center">
              <h2 className="font-display font-extrabold text-xl">{t('onboarding.tourTitle')}</h2>
              <p className="text-soft text-sm mt-1">{t('onboarding.tourSub')}</p>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {TOUR_ITEMS.map((item) => (
                <div key={item.key} className="flex items-start gap-3 p-2.5 rounded-2xl bg-app-soft">
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm">{t(item.nameKey)}</p>
                    <p className="text-xs text-soft leading-snug">{t(item.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-theme cursor-pointer">
              <input
                type="checkbox"
                checked={periodicGoal}
                onChange={(e) => setPeriodicGoal(e.target.checked)}
                className="w-5 h-5 accent-[var(--accent)] mt-0.5 shrink-0"
              />
              <span className="text-xs text-soft leading-snug">{t('onboarding.periodicGoalOffer')}</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="card-soft font-bold py-3 px-4 rounded-2xl text-sm text-soft"
              >
                {t('onboarding.back')}
              </button>
              <button onClick={finish} className="btn-accent font-bold py-3 rounded-2xl shadow-md flex-1">
                {t('onboarding.start')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
