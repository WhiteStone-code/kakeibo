import type { Category, Transaction } from '../types';
import { currentWeekStart } from './format';

export interface WeeklyChallenge {
  categoryId: string;
  /** Objetivo de gasto para esta semana en esa categoría — la media de las
   * últimas semanas con datos, con un margen de mejora del 15% (o la media
   * tal cual si no hay suficiente margen). Nunca un número inventado. */
  target: number;
  spent: number;
  achieved: boolean;
  weekStart: string;
}

/** Reto semanal: cada semana natural (lunes-domingo) se elige UNA categoría
 * de gasto real (con historial en las últimas semanas, para que el reto
 * tenga sentido) y se propone gastar algo menos que la media reciente. La
 * categoría elegida rota de forma determinista según la semana, así no
 * cambia si abres la app varias veces la misma semana ni depende de nada
 * aleatorio. Devuelve null si no hay categorías con historial suficiente
 * (usuario muy nuevo). */
export function getWeeklyChallenge(
  transactions: Transaction[],
  expenseCategories: Category[],
  now: Date = new Date()
): WeeklyChallenge | null {
  const weekStart = currentWeekStart(now);
  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  // Últimas 4 semanas completas ANTES de esta (nunca incluye la semana en
  // curso, para no calcular el objetivo con datos de la propia semana que
  // se está retando).
  const priorWeekStarts: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() - i * 7);
    priorWeekStarts.push(currentWeekStart(d));
  }

  const spendByCategoryByWeek = new Map<string, Map<string, number>>();
  for (const tx of transactions) {
    if (tx.type !== 'gasto') continue;
    const txWeek = currentWeekStart(new Date(`${tx.date}T00:00:00`));
    if (!priorWeekStarts.includes(txWeek)) continue;
    const byWeek = spendByCategoryByWeek.get(tx.category) ?? new Map<string, number>();
    byWeek.set(txWeek, (byWeek.get(txWeek) ?? 0) + tx.amount);
    spendByCategoryByWeek.set(tx.category, byWeek);
  }

  // Solo categorías con gasto en al menos 2 de las 4 semanas previas — así
  // el reto es sobre un hábito real, no sobre un gasto puntual que pasó una
  // vez.
  const eligible = expenseCategories.filter((c) => {
    const byWeek = spendByCategoryByWeek.get(c.id);
    return byWeek && byWeek.size >= 2;
  });
  if (eligible.length === 0) return null;

  // Rotación determinista por semana: hash simple de weekStart + id de
  // categoría, para que la elegida cambie de semana en semana sin ser
  // aleatoria de verdad (misma semana → mismo resultado siempre).
  const weekSeed = Array.from(weekStart).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const category = eligible[weekSeed % eligible.length];

  const weeks = spendByCategoryByWeek.get(category.id)!;
  const avg = Array.from(weeks.values()).reduce((a, b) => a + b, 0) / weeks.size;
  const target = Math.round(avg * 0.85 * 100) / 100; // -15% de margen de mejora

  const spent = transactions
    .filter((tx) => {
      if (tx.type !== 'gasto' || tx.category !== category.id) return false;
      const d = new Date(`${tx.date}T00:00:00`);
      return d >= weekStartDate && d < weekEndDate;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  return { categoryId: category.id, target, spent, achieved: spent <= target, weekStart };
}
