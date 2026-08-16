export interface ZodiacSign {
  id: string;
  emoji: string;
}

// Fechas del zodiaco occidental (tropical) — cálculo real y estándar, cada
// signo cubre el rango exacto de días que le corresponde por convención
// astronómica de toda la vida, no algo inventado por la app.
const RANGES: { id: string; emoji: string; startMonth: number; startDay: number }[] = [
  { id: 'capricornio', emoji: '♑', startMonth: 12, startDay: 22 },
  { id: 'acuario', emoji: '♒', startMonth: 1, startDay: 20 },
  { id: 'piscis', emoji: '♓', startMonth: 2, startDay: 19 },
  { id: 'aries', emoji: '♈', startMonth: 3, startDay: 21 },
  { id: 'tauro', emoji: '♉', startMonth: 4, startDay: 20 },
  { id: 'geminis', emoji: '♊', startMonth: 5, startDay: 21 },
  { id: 'cancer', emoji: '♋', startMonth: 6, startDay: 21 },
  { id: 'leo', emoji: '♌', startMonth: 7, startDay: 23 },
  { id: 'virgo', emoji: '♍', startMonth: 8, startDay: 23 },
  { id: 'libra', emoji: '♎', startMonth: 9, startDay: 23 },
  { id: 'escorpio', emoji: '♏', startMonth: 10, startDay: 23 },
  { id: 'sagitario', emoji: '♐', startMonth: 11, startDay: 22 },
];

/** Signo del zodiaco occidental a partir de una fecha ISO (yyyy-MM-dd) —
 * puro dato curioso/de entretenimiento, no se usa para nada más en la
 * app. */
export function getZodiacSign(isoDate: string): ZodiacSign | null {
  const d = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  // Recorre de atrás hacia delante: el signo vigente es el último cuyo
  // inicio (mes, día) es igual o anterior a la fecha dada.
  for (let i = RANGES.length - 1; i >= 0; i--) {
    const r = RANGES[i];
    if (month > r.startMonth || (month === r.startMonth && day >= r.startDay)) {
      return { id: r.id, emoji: r.emoji };
    }
  }
  return { id: RANGES[0].id, emoji: RANGES[0].emoji }; // enero antes del 20 → Capricornio
}
