import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { LANGUAGES } from '../i18n/translations';
import { useT } from '../i18n/useT';

/** Selector de idioma, pensado para ir arriba a la derecha de la barra
 * superior — cambiar aquí cambia toda la interfaz al instante. */
export default function LanguageSwitcher() {
  const language = useStore((s) => s.settings.language);
  const updateSettings = useStore((s) => s.updateSettings);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const { t } = useT();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="card-soft w-10 h-10 rounded-full flex items-center justify-center text-lg"
        aria-label={t('language.switcherLabel')}
        title={t('language.switcherLabel')}
      >
        {current.flag}
      </button>
      {open && (
        <div className="absolute right-0 top-12 bg-surface border border-theme rounded-2xl shadow-xl p-1.5 z-[61] min-w-[160px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                updateSettings({ language: l.code });
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-left ${
                l.code === language ? 'btn-accent' : 'hover:bg-app-soft'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
