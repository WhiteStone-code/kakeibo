import { useMemo } from 'react';
import { useStore, computeStreak, computeXp } from '../store/useStore';
import { getLevelForXp, getNextLevel } from '../data/levels';

/**
 * Racha, XP y nivel recalculados de forma reactiva. Antes se llamaba a
 * getStreak()/getXp() del store como funciones sueltas dentro del render:
 * como esas funciones no eran "selectors", el componente no se
 * re-renderizaba al añadir un movimiento y la racha/XP se quedaban
 * desactualizadas hasta el siguiente cambio de vista. Al suscribirnos aquí
 * directamente a `transactions` y `unlocked`, React vuelve a renderizar en
 * cuanto cualquiera de los dos cambia.
 */
export function useDerivedStats() {
  const transactions = useStore((s) => s.transactions);
  const unlocked = useStore((s) => s.unlocked);

  return useMemo(() => {
    const streak = computeStreak(transactions);
    const xp = computeXp(transactions, unlocked);
    const level = getLevelForXp(xp);
    const next = getNextLevel(xp);
    return { streak, xp, level, next, unlockedCount: unlocked.length };
  }, [transactions, unlocked]);
}
