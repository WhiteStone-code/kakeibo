export interface StoreDef {
  id: string;
  name: string;
  emoji: string;
}

// Cadenas habituales en España y Suiza (nombres propios: no se traducen,
// son los mismos en cualquier idioma). El usuario puede añadir además
// cualquier tienda propia (la panadería, la carnicería del barrio...).
export const PRESET_STORES: StoreDef[] = [
  { id: 'mercadona', name: 'Mercadona', emoji: '🛒' },
  { id: 'carrefour', name: 'Carrefour', emoji: '🛒' },
  { id: 'lidl', name: 'Lidl', emoji: '🛒' },
  { id: 'aldi', name: 'Aldi', emoji: '🛒' },
  { id: 'dia', name: 'Dia', emoji: '🛒' },
  { id: 'eroski', name: 'Eroski', emoji: '🛒' },
  { id: 'alcampo', name: 'Alcampo', emoji: '🛒' },
  { id: 'consum', name: 'Consum', emoji: '🛒' },
  { id: 'el-corte-ingles', name: 'El Corte Inglés', emoji: '🏬' },
  { id: 'coop', name: 'Coop', emoji: '🛒' },
  { id: 'migros', name: 'Migros', emoji: '🛒' },
  { id: 'denner', name: 'Denner', emoji: '🛒' },
  { id: 'manor', name: 'Manor', emoji: '🏬' },
  { id: 'amazon', name: 'Amazon', emoji: '📦' },
];
