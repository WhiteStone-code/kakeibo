export const APP_VERSION = '0.11.1';

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
    version: '0.11.1',
    date: '15 ago 2026',
    title: 'Revisión de móvil',
    items: [
      'Arreglado: la etiqueta "Ahorrado en metas" del Panel se cortaba con puntos suspensivos en pantallas de móvil — ahora se parte en dos líneas en vez de cortarse',
      'Revisado a fondo el formato en móvil (iPhone y Android, varios tamaños): formulario de movimiento, listas, inversión, ajustes y temas — sin más problemas encontrados',
    ],
  },
  {
    version: '0.11.0',
    date: '13 ago 2026',
    title: 'Campana de notificaciones, tu enfoque financiero y compartir el Excel',
    items: [
      'Nuevo: campana de notificaciones arriba a la derecha — accede a las Novedades cuando quieras, con un punto rojo si hay algo nuevo desde tu última visita',
      'Onboarding ampliado: elige tu enfoque (ahorro, compras diarias, inversión, control de deudas, metas grandes) — editable luego en Ajustes en cualquier momento',
      'Nuevo botón "Compartir Excel" en Ajustes: genera el mismo informe y lo manda directo a WhatsApp, Telegram o donde elijas desde el móvil, sin pasar por ningún servidor',
    ],
  },
  {
    version: '0.10.0',
    date: '12 ago 2026',
    title: 'La compra recuerda dónde compras, inversión con perfil de riesgo y más conexión entre secciones',
    items: [
      'Nuevo: la lista de la compra recuerda dónde compraste cada producto la última vez ("La última vez lo compraste en Coop") y te lo sugiere al escribirlo otra vez',
      '"¿Y si invierto?" ahora es "Planificación financiera": elige tu perfil (conservador/moderado/dinámico) para destacarlo en la gráfica, y hay una comparativa neutral de tipos de plataforma (neobroker, banco, gestor automatizado) — sin recomendar ninguna marca concreta',
      'Nuevo en el Panel: "¿En qué se fue tu dinero?" — el desglose real en las 4 categorías del método kakeibo (supervivencia, ocio, cultura, extra), también dentro de la Reflexión mensual',
      'La Reflexión mensual ahora tiene su propia tarjeta en el Panel, para no tener que acordarte de entrar por tu cuenta',
      'Aviso anticipado de gastos/ingresos fijos: además del aviso el día que toca, ahora también ves los que llegan en los próximos 3 días',
      'Onboarding ampliado: un tercer paso con un repaso rápido de cada sección de la app, y la opción de activar ya la meta periódica',
      'Nueva tarjeta en Ajustes explicando en claro por qué tus datos nunca salen de este navegador',
    ],
  },
  {
    version: '0.9.0',
    date: '12 ago 2026',
    title: 'Repaso de pulido: más fácil de usar cada día',
    items: [
      'Arreglado: en Movimientos y en la Lista de la compra, el botón de borrar (✕) solo aparecía al pasar el ratón por encima — en el móvil, donde no hay ratón, no había forma de verlo. Ahora se ve siempre',
      'Arreglado: la frase motivadora del panel ("Consejo para...") se quedaba en español aunque cambiaras de idioma. Ahora tiene sus 6 traducciones como el resto de la app',
      'Arreglado: en Añadir movimiento y en Objetivos, las cantidades rápidas (2, 5, 10...) mostraban el código de la divisa en crudo ("2 EUR") en vez del símbolo ("2 €") como en el resto de la app',
      'Nuevo: en Movimientos, filtro rápido por período (este mes / últimos 3 meses / todo el histórico) para no tener que hacer scroll infinito según pase el tiempo',
      'Mejor accesibilidad: se ve con claridad qué elemento tiene el foco al navegar con teclado (tabulador), y varios botones de solo icono ahora llevan su etiqueta para lectores de pantalla',
    ],
  },
  {
    version: '0.8.1',
    date: '10 ago 2026',
    title: 'Ronda de repaso: idiomas, gráficas y sitio para los avisos',
    items: [
      'Arreglado: la leyenda del gráfico de tendencia, los nombres de las 5 temáticas visuales y varios textos de la lista de la compra se quedaban en español aunque cambiaras de idioma',
      'Arreglado: fechas y meses ahora salen en el formato de cada idioma (antes siempre en español, aunque estuvieras en inglés o alemán)',
      'Arreglado: el eje del gráfico "¿Y si invierto?" mostraba decimales raros (0.3, 0.6…) en vez de años enteros',
      'Arreglado: "家計簿" (el nombre japonés de Kakeibo) podía verse como un cuadradito en algunos móviles',
      'Arreglado: el aviso de logro conseguido podía tapar el título o el botón de compartir en pantallas pequeñas',
    ],
  },
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
