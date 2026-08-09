import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { translate } from './translations';

/** Hook de traducción: t('clave', { var: valor }) — cambia al instante en
 * toda la app en cuanto se cambia el idioma en Ajustes/barra superior,
 * porque lee `settings.language` del store reactivamente. Si una clave no
 * existe en el idioma elegido, cae automáticamente al español. */
export function useT() {
  const lang = useStore((s) => s.settings.language);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang]
  );
  return { t, lang };
}
