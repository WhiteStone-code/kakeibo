import type { AchievementContext, AchievementDef } from '../types';

// "Viñetas" / pegatinas coleccionables que el usuario va desbloqueando.
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primer-registro',
    emoji: '🌱',
    title: 'Primer paso',
    description: 'Registraste tu primer movimiento.',
    check: (ctx) => ctx.transactions.length >= 1,
  },
  {
    id: 'diez-registros',
    emoji: '📝',
    title: 'Cronista',
    description: 'Registraste 10 movimientos.',
    check: (ctx) => ctx.transactions.length >= 10,
  },
  {
    id: 'cincuenta-registros',
    emoji: '📖',
    title: 'Escriba del Kakeibo',
    description: 'Registraste 50 movimientos.',
    check: (ctx) => ctx.transactions.length >= 50,
  },
  {
    id: 'racha-3',
    emoji: '🔥',
    title: 'Constancia inicial',
    description: '3 días seguidos registrando.',
    check: (ctx) => ctx.streak >= 3,
  },
  {
    id: 'racha-7',
    emoji: '🐉',
    title: 'Semana disciplinada',
    description: '7 días seguidos registrando.',
    check: (ctx) => ctx.streak >= 7,
  },
  {
    id: 'racha-30',
    emoji: '🏯',
    title: 'Maestro de la rutina',
    description: '30 días seguidos registrando.',
    check: (ctx) => ctx.streak >= 30,
  },
  {
    id: 'primer-objetivo',
    emoji: '🎯',
    title: 'Meta trazada',
    description: 'Creaste tu primer objetivo de ahorro.',
    check: (ctx) => ctx.goals.length >= 1,
  },
  {
    id: 'objetivo-cumplido',
    emoji: '🏆',
    title: 'Sueño cumplido',
    description: 'Completaste un objetivo de ahorro.',
    check: (ctx) => ctx.goals.some((g) => g.achieved),
  },
  {
    id: 'ahorro-100',
    emoji: '💴',
    title: 'Primeras 100 monedas',
    description: 'Ahorraste 100 en tus objetivos.',
    check: (ctx) => ctx.totalSaved >= 100,
  },
  {
    id: 'ahorro-1000',
    emoji: '💎',
    title: 'Cofre del tesoro',
    description: 'Ahorraste 1000 en tus objetivos.',
    check: (ctx) => ctx.totalSaved >= 1000,
  },
  {
    id: 'dos-meses',
    emoji: '🌸',
    title: 'Florece la constancia',
    description: 'Llevas 2 meses distintos registrados.',
    check: (ctx) => ctx.monthsTracked >= 2,
  },
  {
    id: 'seis-meses',
    emoji: '⛩️',
    title: 'Camino del Torii',
    description: 'Llevas 6 meses distintos registrados.',
    check: (ctx) => ctx.monthsTracked >= 6,
  },
];

export const evaluateAchievements = (ctx: AchievementContext): string[] =>
  ACHIEVEMENTS.filter((a) => a.check(ctx)).map((a) => a.id);
