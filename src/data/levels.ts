export interface LevelDef {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
}

// Rangos temáticos inspirados en la disciplina japonesa. XP = 10 por día con
// registro + 5 por transacción + 50 por logro desbloqueado.
export const LEVELS: LevelDef[] = [
  { level: 1, title: 'Aprendiz de Ahorro', emoji: '🌱', minXp: 0 },
  { level: 2, title: 'Discípulo Kakeibo', emoji: '📿', minXp: 100 },
  { level: 3, title: 'Guardián del Presupuesto', emoji: '🛡️', minXp: 300 },
  { level: 4, title: 'Samurái del Ahorro', emoji: '🗡️', minXp: 700 },
  { level: 5, title: 'Sabio de las Finanzas', emoji: '🧘', minXp: 1500 },
  { level: 6, title: 'Maestro Kakeibo', emoji: '⛩️', minXp: 3000 },
  { level: 7, title: 'Leyenda del Ahorro', emoji: '🐉', minXp: 6000 },
];

export const getLevelForXp = (xp: number): LevelDef => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  return current;
};

export const getNextLevel = (xp: number): LevelDef | null => {
  const current = getLevelForXp(xp);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return LEVELS[idx + 1] ?? null;
};
