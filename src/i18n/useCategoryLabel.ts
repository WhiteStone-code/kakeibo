import { useT } from './useT';
import { translateWithFallback } from './translations';
import type { Category } from '../types';

/** Etiqueta de categoría en el idioma activo — cae al nombre guardado
 * (siempre en español) si es una categoría personalizada del usuario, ya
 * que esas no se traducen automáticamente (es su propio texto). */
export function useCategoryLabel() {
  const { lang } = useT();
  return (cat: Category) => translateWithFallback(`category.${cat.id}`, lang, cat.label);
}
