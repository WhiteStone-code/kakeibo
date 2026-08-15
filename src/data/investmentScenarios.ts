export interface InvestmentScenario {
  id: string;
  label: string;
  emoji: string;
  /** Rentabilidad media anual orientativa (decimal). Son medias históricas
   * de muy largo plazo, no una promesa — se explica en la propia vista. */
  annualReturn: number;
  color: string;
  colorDark: string;
  description: string;
}

export const INVESTMENT_SCENARIOS: InvestmentScenario[] = [
  {
    id: 'efectivo',
    label: 'Efectivo (hucha)',
    emoji: '🐷',
    annualReturn: 0,
    color: '#898781',
    colorDark: '#a3a199',
    description: 'Guardado tal cual. No genera nada, y con el tiempo compra un poco menos por la inflación.',
  },
  {
    id: 'oro',
    label: 'Oro',
    emoji: '🥇',
    annualReturn: 0.05,
    color: '#c98500',
    colorDark: '#e0a530',
    description: 'Refugio clásico a muy largo plazo. Suele proteger más de lo que hace crecer el dinero.',
  },
  {
    id: 'etf',
    label: 'Fondo indexado (ETF)',
    emoji: '📈',
    annualReturn: 0.07,
    color: '#2a78d6',
    colorDark: '#3987e5',
    description: 'Media histórica real de un fondo diversificado (ej. MSCI World) a muy largo plazo.',
  },
  {
    id: 'acciones',
    label: 'Acciones individuales',
    emoji: '🎢',
    annualReturn: 0.09,
    color: '#e34948',
    colorDark: '#e66767',
    description: 'Potencial algo mayor que un fondo diversificado, pero con mucha más volatilidad y riesgo real de pérdida.',
  },
];

export interface RiskProfile {
  id: 'conservador' | 'moderado' | 'agresivo';
  emoji: string;
  /** Qué escenario de INVESTMENT_SCENARIOS se destaca en la gráfica al
   * elegir este perfil — no cambia el cálculo, solo dónde pones el foco. */
  scenarioId: string;
}

// El efectivo (hucha) no es un "perfil de riesgo" — es la línea base de
// comparación que siempre se ve, por eso no tiene entrada aquí.
export const RISK_PROFILES: RiskProfile[] = [
  { id: 'conservador', emoji: '🛡️', scenarioId: 'oro' },
  { id: 'moderado', emoji: '⚖️', scenarioId: 'etf' },
  { id: 'agresivo', emoji: '🚀', scenarioId: 'acciones' },
];

/** Proyecta el valor mes a mes con aportaciones mensuales constantes y
 * interés compuesto — value[0] es el mes 0 (el punto de partida). */
export function projectGrowth(start: number, monthly: number, months: number, annualReturn: number): number[] {
  const r = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const series: number[] = [start];
  let value = start;
  for (let i = 1; i <= months; i++) {
    value = value * (1 + r) + monthly;
    series.push(value);
  }
  return series;
}
