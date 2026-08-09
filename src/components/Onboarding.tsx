import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { THEMES } from '../data/themes';
import { APP_VERSION } from '../data/changelog';
import type { ThemeId } from '../types';

export default function Onboarding() {
  const updateSettings = useStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<ThemeId>('zen');

  const finish = () => {
    // lastSeenVersion se marca ya aquí: quien acaba de conocer la app no
    // necesita ver el historial de "novedades" de versiones anteriores.
    updateSettings({ userName: name.trim(), theme, onboarded: true, lastSeenVersion: APP_VERSION });
  };

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
              <h1 className="font-display font-extrabold text-2xl">Bienvenido a Kakeibo</h1>
              <p className="text-soft text-sm mt-2">
                家計簿 · El arte japonés de llevar las cuentas con calma, sin culpa, con propósito.
                Vamos a ayudarte a llegar a tus metas, un día a la vez.
              </p>
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="px-4 py-3 rounded-2xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold text-center"
              onKeyDown={(e) => e.key === 'Enter' && setStep(1)}
            />
            <button
              onClick={() => setStep(1)}
              className="btn-accent font-bold py-3 rounded-2xl shadow-md"
            >
              Continuar →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="font-display font-extrabold text-xl">Elige tu ambiente</h2>
              <p className="text-soft text-sm mt-1">Podrás cambiarlo cuando quieras en Ajustes</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as ThemeId);
                    updateSettings({ theme: t.id as ThemeId });
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                    theme === t.id ? 'border-accent shadow-md' : 'border-theme'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-soft leading-tight">{t.tagline}</p>
                  </div>
                  <div className="flex -space-x-1.5 shrink-0">
                    {t.preview.map((c, i) => (
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
            <button onClick={finish} className="btn-accent font-bold py-3 rounded-2xl shadow-md">
              ¡Empezar! 🌱
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
