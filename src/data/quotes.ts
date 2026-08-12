// Frases diarias — mezcla de sabiduría japonesa (kaizen, kakeibo) y motivación
// práctica de dinero. El texto de cada frase vive en i18n/translations.ts
// (claves 'quote.0'..'quote.N') para que cambien de idioma con el resto de la
// app — aquí solo se decide CUÁNTAS hay y CUÁL toca hoy.
export const DAILY_QUOTE_COUNT = 15;

/** Índice (0-based) de la frase del día — estable durante el día, rota cada
 * medianoche. Úsalo como `t(\`quote.${getQuoteIndexForDay()}\`)`. */
export const getQuoteIndexForDay = (date: Date = new Date()): number => {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return dayIndex % DAILY_QUOTE_COUNT;
};
