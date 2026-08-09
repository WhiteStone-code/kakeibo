export const APP_VERSION = '0.4.1';

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

// Se añade una entrada nueva arriba cada vez que sacamos versión. El
// WhatsNewModal se abre solo cuando settings.lastSeenVersion !== APP_VERSION,
// así siempre ves qué ha cambiado sin tener que preguntar.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.4.1',
    date: '9 ago 2026',
    title: 'Muchos más iconos',
    items: [
      '82 iconos organizados por temas (comida, mascotas, deporte, hogar, viajes...) para tus categorías y objetivos',
      'Buscador de iconos por palabra clave (ej: "perro", "gimnasio")',
    ],
  },
  {
    version: '0.4.0',
    date: '9 ago 2026',
    title: 'Llévatela al móvil',
    items: [
      'Ya se puede abrir desde el móvil en la misma red Wi-Fi que el ordenador',
      'Se puede "Añadir a pantalla de inicio" y usarla como una app instalada, con su propio icono',
    ],
  },
  {
    version: '0.3.0',
    date: '9 ago 2026',
    title: 'Categorías a tu gusto + Novedades',
    items: [
      'Ya puedes crear tus propias categorías de movimiento (además de las 12 de fábrica), con tu emoji y editarlas o borrarlas cuando quieras',
      'Los movimientos ya se pueden editar, no solo borrar',
      'Este panel de "Novedades" — para que veamos juntos cómo evoluciona la app en cada versión',
    ],
  },
  {
    version: '0.2.0',
    date: '9 ago 2026',
    title: 'Presupuestos y gasto diario recomendado',
    items: [
      'Nueva tarjeta "Hoy puedes gastar" con el ritmo diario recomendado hasta fin de mes',
      'Aviso de cuánto ahorrar al día para llegar a tiempo a un objetivo con fecha límite',
      'Presupuestos mensuales por categoría con aviso de color (verde/ámbar/rojo)',
      'Chips de importe rápido al añadir un gasto',
      'Corregido: la racha y el nivel no se refrescaban al momento; los avisos de logro tapaban la barra superior; los modales no se cerraban con Esc',
    ],
  },
  {
    version: '0.1.0',
    date: '9 ago 2026',
    title: 'Primer prototipo',
    items: [
      'Panel con resumen del mes, gastos por categoría y tendencia de 6 meses',
      'Movimientos con categorías, objetivos de ahorro con confeti al cumplirlos',
      'Niveles, racha diaria y logros coleccionables',
      'Reflexión mensual estilo Kakeibo',
      '5 temáticas visuales (Zen, Sakura, Neón, Océano, Bosque) × modo claro/oscuro',
    ],
  },
];
