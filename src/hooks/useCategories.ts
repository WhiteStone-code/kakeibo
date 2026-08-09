import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';

/** Todas las categorías: las de fábrica + las que haya creado el usuario. */
export function useAllCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(() => [...CATEGORIES, ...custom], [custom]);
}

/** Categorías de gasto — las de fábrica + las personalizadas de tipo gasto.
 * Se usa al elegir categoría de un gasto o al configurar presupuestos. */
export function useExpenseCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(
    () => [...EXPENSE_CATEGORIES, ...custom.filter((c) => c.group !== 'ingreso')],
    [custom]
  );
}

/** Categorías de ingreso — las de fábrica + las personalizadas de tipo ingreso. */
export function useIncomeCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(
    () => [...INCOME_CATEGORIES, ...custom.filter((c) => c.group === 'ingreso')],
    [custom]
  );
}
