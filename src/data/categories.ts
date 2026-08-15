import type { Category, ColorMode } from '../types';

export const categoryColor = (cat: Category, mode: ColorMode): string =>
  mode === 'dark' ? cat.colorDark : cat.color;

// Paleta categórica validada (contraste + distinguibilidad para daltonismo,
// ver skill dataviz) — orden fijo, nunca se reasigna dinámicamente. El emoji
// de cada categoría es la identidad primaria; el color es refuerzo secundario.
export const CATEGORIES: Category[] = [
  { id: 'vivienda', label: 'Vivienda', emoji: '🏠', color: '#2a78d6', colorDark: '#3987e5', group: 'supervivencia' },
  { id: 'comida', label: 'Comida', emoji: '🍜', color: '#eb6834', colorDark: '#d95926', group: 'supervivencia' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗', color: '#1baf7a', colorDark: '#199e70', group: 'supervivencia' },
  { id: 'social', label: 'Social', emoji: '🎉', color: '#eda100', colorDark: '#c98500', group: 'ocio' },
  { id: 'compras', label: 'Compras', emoji: '🛍️', color: '#e87ba4', colorDark: '#d55181', group: 'ocio' },
  { id: 'salud', label: 'Salud', emoji: '💊', color: '#008300', colorDark: '#1f9d1f', group: 'supervivencia' },
  { id: 'ropa', label: 'Ropa', emoji: '👗', color: '#4a3aa7', colorDark: '#9085e9', group: 'ocio' },
  { id: 'ocio', label: 'Ocio y diversión', emoji: '🎮', color: '#e34948', colorDark: '#e66767', group: 'ocio' },
  { id: 'educacion', label: 'Educación', emoji: '📚', color: '#8a5a2e', colorDark: '#c68a52', group: 'cultura' },
  { id: 'suscripciones', label: 'Suscripciones', emoji: '📱', color: '#5b6b8c', colorDark: '#8fa1c4', group: 'extra' },
  { id: 'ahorro', label: 'Ahorro / Objetivo', emoji: '💴', color: '#a67c1e', colorDark: '#d4a53d', group: 'extra' },
  { id: 'otros', label: 'Otros', emoji: '🎁', color: '#898781', colorDark: '#a3a199', group: 'extra' },

  // Categorías de ingreso — antes solo existía "Ingresos" como cajón único;
  // ahora se pueden distinguir igual que los gastos.
  { id: 'salario', label: 'Salario', emoji: '💼', color: '#0ca30c', colorDark: '#3fc93f', group: 'ingreso' },
  { id: 'freelance', label: 'Freelance / Autónomo', emoji: '🧑‍💻', color: '#7c3aed', colorDark: '#a78bfa', group: 'ingreso' },
  { id: 'inversion-ingreso', label: 'Rendimientos / Inversiones', emoji: '📈', color: '#c98500', colorDark: '#e0a530', group: 'ingreso' },
  { id: 'regalo-recibido', label: 'Regalo recibido', emoji: '🎀', color: '#d55181', colorDark: '#e8927c', group: 'ingreso' },
  { id: 'reembolso', label: 'Reembolso / Devolución', emoji: '↩️', color: '#2a78d6', colorDark: '#3987e5', group: 'ingreso' },
  { id: 'ingresos', label: 'Otros ingresos', emoji: '💰', color: '#199e70', colorDark: '#3fc93f', group: 'ingreso' },
];

const FALLBACK_CATEGORY = CATEGORIES.find((c) => c.id === 'otros')!;

/** Busca una categoría por id entre las de fábrica y, si se pasan, las
 * personalizadas del usuario. Si no la encuentra (p. ej. se borró una
 * categoría personalizada que aún tiene movimientos antiguos), cae en
 * "Otros" en vez de desaparecer. */
export const getCategory = (id: string, custom: Category[] = []): Category =>
  CATEGORIES.find((c) => c.id === id) ?? custom.find((c) => c.id === id) ?? FALLBACK_CATEGORY;

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.group !== 'ingreso');
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.group === 'ingreso');

// Colores de reserva para categorías personalizadas — distintos de los 13 de
// fábrica para que no se confundan al verse juntos en el mismo gráfico.
export const CUSTOM_CATEGORY_COLORS = [
  '#c2410c', '#0891b2', '#7c3aed', '#be185d', '#65a30d',
  '#0d9488', '#b45309', '#4338ca', '#dc2626', '#059669',
];

// Colores de los 4 grupos Kakeibo — reutilizan los slots 1-4 (azul, naranja,
// aqua, amarillo) de la paleta categórica ya validada (skill dataviz):
// pasan CVD/contraste en la lista de pares *adyacentes*, que es la que
// aplica aquí porque siempre se muestran en el mismo orden fijo, en una
// barra segmentada con etiqueta directa en cada tramo (nunca solo color).
export const KAKEIBO_GROUPS: Record<string, { label: string; emoji: string; desc: string; color: string; colorDark: string }> = {
  supervivencia: {
    label: 'Supervivencia',
    emoji: '🍚',
    desc: 'Lo esencial: comida, casa, transporte, salud.',
    color: '#2a78d6',
    colorDark: '#3987e5',
  },
  ocio: {
    label: 'Ocio y deseos',
    emoji: '🎈',
    desc: 'Lo que te apetece: compras, ropa, salidas.',
    color: '#eb6834',
    colorDark: '#d95926',
  },
  cultura: {
    label: 'Cultura',
    emoji: '🎓',
    desc: 'Crecimiento personal: libros, cursos, aprendizaje.',
    color: '#1baf7a',
    colorDark: '#199e70',
  },
  extra: {
    label: 'Extra',
    emoji: '✨',
    desc: 'Imprevistos, suscripciones y ahorro.',
    color: '#eda100',
    colorDark: '#c98500',
  },
  ingreso: {
    label: 'Ingresos',
    emoji: '💰',
    desc: 'Todo lo que entra.',
    color: '#0ca30c',
    colorDark: '#3fc93f',
  },
};

/** Los 4 grupos de gasto reales del método Kakeibo, en orden fijo (excluye
 * "ingreso", que no es un grupo de gasto). */
export const EXPENSE_KAKEIBO_GROUP_IDS = ['supervivencia', 'ocio', 'cultura', 'extra'] as const;
