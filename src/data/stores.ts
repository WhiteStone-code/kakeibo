export interface StoreDef {
  id: string;
  name: string;
  emoji: string;
  /** En qué países es habitual encontrar esta cadena — para no sugerir
   * "Carrefour" a alguien que compra en Suiza, donde no existe. Una lista
   * vacía significa "universal" (ej. Amazon), se muestra siempre primero. */
  countries: string[];
}

// Cadenas reales, agrupadas por dónde operan de verdad — nunca se afirma
// cuál es "mejor" o "más barata" (eso no lo sabemos y sería inventarlo),
// solo se ordenan las que tienen sentido según el país elegido en Ajustes.
// El usuario siempre puede añadir además cualquier tienda propia (la
// panadería, la carnicería del barrio...).
export const PRESET_STORES: StoreDef[] = [
  // España
  { id: 'mercadona', name: 'Mercadona', emoji: '🛒', countries: ['ES'] },
  { id: 'carrefour', name: 'Carrefour', emoji: '🛒', countries: ['ES', 'FR'] },
  { id: 'dia', name: 'Dia', emoji: '🛒', countries: ['ES', 'PT'] },
  { id: 'eroski', name: 'Eroski', emoji: '🛒', countries: ['ES'] },
  { id: 'alcampo', name: 'Alcampo', emoji: '🛒', countries: ['ES'] },
  { id: 'consum', name: 'Consum', emoji: '🛒', countries: ['ES'] },
  { id: 'el-corte-ingles', name: 'El Corte Inglés', emoji: '🏬', countries: ['ES'] },
  // Suiza
  { id: 'coop', name: 'Coop', emoji: '🛒', countries: ['CH', 'IT'] },
  { id: 'migros', name: 'Migros', emoji: '🛒', countries: ['CH'] },
  { id: 'denner', name: 'Denner', emoji: '🛒', countries: ['CH'] },
  { id: 'manor', name: 'Manor', emoji: '🏬', countries: ['CH'] },
  // Portugal
  { id: 'continente', name: 'Continente', emoji: '🛒', countries: ['PT'] },
  { id: 'pingo-doce', name: 'Pingo Doce', emoji: '🛒', countries: ['PT'] },
  // Francia
  { id: 'auchan', name: 'Auchan', emoji: '🛒', countries: ['FR'] },
  { id: 'monoprix', name: 'Monoprix', emoji: '🛒', countries: ['FR'] },
  // Alemania
  { id: 'edeka', name: 'Edeka', emoji: '🛒', countries: ['DE'] },
  { id: 'rewe', name: 'Rewe', emoji: '🛒', countries: ['DE'] },
  // Italia
  { id: 'esselunga', name: 'Esselunga', emoji: '🛒', countries: ['IT'] },
  { id: 'conad', name: 'Conad', emoji: '🛒', countries: ['IT'] },
  // Reino Unido
  { id: 'tesco', name: 'Tesco', emoji: '🛒', countries: ['UK'] },
  { id: 'sainsburys', name: "Sainsbury's", emoji: '🛒', countries: ['UK'] },
  // Estados Unidos
  { id: 'walmart', name: 'Walmart', emoji: '🛒', countries: ['US'] },
  { id: 'target', name: 'Target', emoji: '🎯', countries: ['US'] },
  { id: 'trader-joes', name: "Trader Joe's", emoji: '🛒', countries: ['US'] },
  // Presentes en varios países / online
  { id: 'lidl', name: 'Lidl', emoji: '🛒', countries: ['ES', 'DE', 'FR', 'IT', 'PT', 'UK'] },
  { id: 'aldi', name: 'Aldi', emoji: '🛒', countries: ['DE', 'UK', 'ES'] },
  { id: 'amazon', name: 'Amazon', emoji: '📦', countries: [] },
];

/** Tiendas ordenadas para el país elegido: primero las que operan ahí (y
 * las universales como Amazon), luego el resto — nunca se ocultan del
 * todo, por si alguien compra puntualmente algo de otro país. */
export function storesForCountry(country: string | null): StoreDef[] {
  if (!country) return PRESET_STORES;
  const relevant = PRESET_STORES.filter((s) => s.countries.length === 0 || s.countries.includes(country));
  const rest = PRESET_STORES.filter((s) => s.countries.length > 0 && !s.countries.includes(country));
  return [...relevant, ...rest];
}
