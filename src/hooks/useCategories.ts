import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories';

/** Todas las categorías: las 13 de fábrica + las que haya creado el usuario. */
export function useAllCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(() => [...CATEGORIES, ...custom], [custom]);
}

/** Igual que arriba pero sin "Ingresos" — la lista que se usa al elegir
 * categoría de un gasto o al configurar presupuestos. */
export function useExpenseCategories() {
  const custom = useStore((s) => s.customCategories);
  return useMemo(() => [...EXPENSE_CATEGORIES, ...custom], [custom]);
}
