export const APP_VERSION = '0.8.0';

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
    version: '0.8.0',
    date: '9 ago 2026',
    title: 'La lista de la compra se organiza sola',
    items: [
      'Nuevo: "Por tienda" agrupa la lista — todo lo de Lidl junto, todo lo de Coop junto, etc. — para no andar buscando producto a producto',
      'Nuevo: "Por ocasión" agrupa por qué es cada cosa (cumpleaños, semana que viene...) con la cuenta atrás de días, para planificar con antelación',
      'Recordatorio de la próxima fecha de ofertas (Black Friday, rebajas...) en la lista de la compra',
      '2 logros nuevos ligados a la lista de la compra',
    ],
  },
  {
    version: '0.7.0',
    date: '9 ago 2026',
    title: 'Lista de la compra con tiendas, compartir por WhatsApp y gastos fijos',
    items: [
      'En la lista de la compra ya puedes elegir dónde comprar cada cosa: Mercadona, Carrefour, Lidl, Aldi, Coop, Migros... o tu propia tienda (la panadería, la carnicería del barrio)',
      'Botón para compartir la lista por WhatsApp (o cualquier app) — se abre el chat con el texto ya listo, tú eliges a quién mandarlo',
      'Nuevo: gastos e ingresos fijos (nómina, alquiler, aportación automática a inversión...). El día que toca, aparece un aviso en el Panel para registrarlo con un toque o saltarlo ese mes',
    ],
  },
  {
    version: '0.6.0',
    date: '9 ago 2026',
    title: '6 idiomas, ingresos con categoría y más control',
    items: [
      'Toda la app en 6 idiomas (español, inglés, portugués, italiano, francés, alemán) — el selector está arriba a la derecha y cambia todo al instante',
      'Arreglado: ya se puede elegir categoría también en los ingresos (salario, freelance, rendimientos, regalo, reembolso, otros), no solo en los gastos',
      'Movimientos más detallados: método de pago y lugar (opcional) — para saber, por ejemplo, dónde compras más barato',
      'Meta periódica opcional en Ajustes: ahorra al menos X o gasta como máximo X cada semana o cada mes',
      'Tipo de cambio en vivo junto al selector de moneda',
      'Lista de la compra: ahora puedes poner solo el dinero que quieres llevar (sin precio por producto) y añadir notas tipo "el pan aquí es mejor y más barato"',
      'Los formularios avisan si falta algo en vez de no hacer nada al pulsar Guardar',
      'Divisas más usadas (euro, dólar, franco suizo...) ya no se entierran entre el resto al buscar',
    ],
  },
  {
    version: '0.5.0',
    date: '9 ago 2026',
    title: 'Divisas, calendario, inversión, Excel y lista de la compra',
    items: [
      'Más de 90 divisas del mundo, con buscador (incluido el franco suizo)',
      'Calendario mensual de gastos: de un vistazo ves qué días gastaste más',
      'Nueva sección "¿Y si invierto?": compara guardar el dinero vs invertirlo en oro, un fondo indexado o acciones, con gráfica y aviso claro de que es orientativo',
      'Conversor rápido de divisas (la única parte que necesita internet)',
      'Exportación a Excel de verdad: varias hojas, con colores y formato, no solo una tabla',
      'Lista de la compra con presupuesto y total gastado, que puede convertirse en un movimiento con un toque',
      'La Reflexión Kakeibo ahora explica para qué sirve y te da un veredicto (vas bien / te desvías) en vez de solo guardar datos',
    ],
  },
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
