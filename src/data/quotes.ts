// Frases diarias — mezcla de sabiduría japonesa (kaizen, kakeibo) y motivación práctica de dinero.
export const DAILY_QUOTES: string[] = [
  'Kaizen: mejora un 1% cada día. El ahorro no es un salto, es una costumbre.',
  'Una gota no hace un océano, pero muchas gotas sí. Cada € cuenta.',
  'El bambú se dobla con el viento pero nunca se rompe. Flexible con el plan, firme con la meta.',
  'Antes de comprar, pregúntate: ¿esto me acerca o me aleja de mi objetivo?',
  '"Mottainai" — no desperdicies. Reutiliza, repara, reflexiona antes de gastar.',
  'Apunta cada gasto de hoy: lo que se mide, se mejora.',
  'El camino de los mil ryos empieza con una sola moneda ahorrada.',
  'No ahorres lo que sobra al gastar, gasta lo que sobra al ahorrar.',
  'Un pequeño hábito diario vence a una gran intención ocasional.',
  'La calma del Zen también se aplica a tus finanzas: respira antes de comprar por impulso.',
  'Revisa tu mes como un maestro revisa su técnica: sin juicio, con curiosidad.',
  'Tu objetivo no está lejos: está a un registro diario de distancia.',
  'El ahorro constante es la forma más silenciosa de disciplina.',
  'Hoy es un buen día para acercarte un poco más a tu sueño.',
  'La paciencia financiera de hoy es la libertad de mañana.',
];

export const getQuoteForDay = (date: Date = new Date()): string => {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return DAILY_QUOTES[dayIndex % DAILY_QUOTES.length];
};
