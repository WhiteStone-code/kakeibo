import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { View } from '../App';
import { useT } from '../i18n/useT';

export default function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const { t } = useT();
  const [moreOpen, setMoreOpen] = useState(false);

  const PRIMARY_ITEMS: { id: View; label: string; emoji: string }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), emoji: '🏠' },
    { id: 'transacciones', label: t('nav.transactions.short'), emoji: '📒' },
    { id: 'objetivos', label: t('nav.goals.short'), emoji: '🎯' },
    { id: 'logros', label: t('nav.achievements'), emoji: '🎖️' },
  ];

  const MORE_ITEMS: { id: View; label: string; emoji: string }[] = [
    { id: 'lista', label: t('nav.shopping'), emoji: '🛒' },
    { id: 'invertir', label: t('nav.invest'), emoji: '📈' },
    { id: 'reflexion', label: t('nav.reflection'), emoji: '🧘' },
    { id: 'ajustes', label: t('nav.settings'), emoji: '⚙️' },
  ];

  const moreActive = MORE_ITEMS.some((i) => i.id === view);

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="md:hidden fixed bottom-16 left-3 right-3 bg-surface border border-theme rounded-2xl shadow-xl z-40 p-2 grid grid-cols-2 gap-1.5"
            >
              {MORE_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setMoreOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold min-h-[44px] ${
                    item.id === view ? 'btn-accent' : 'hover:bg-app-soft'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-theme flex justify-around px-1 py-1 z-40">
        {PRIMARY_ITEMS.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-semibold min-h-[44px] min-w-[44px] ${
                active ? 'text-accent' : 'text-soft'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-label={t('nav.more')}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-semibold min-h-[44px] min-w-[44px] ${
            moreActive || moreOpen ? 'text-accent' : 'text-soft'
          }`}
        >
          <span className="text-xl">⋯</span>
          {t('nav.more')}
        </button>
      </nav>
    </>
  );
}
