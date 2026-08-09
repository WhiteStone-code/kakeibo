export interface DealDate {
  id: string;
  emoji: string;
  labelKey: string; // clave de i18n
  date: Date;
}

const nthWeekdayOfMonth = (year: number, month: number, weekday: number, n: number): Date => {
  const d = new Date(year, month, 1);
  let count = 0;
  while (d.getMonth() === month) {
    if (d.getDay() === weekday) {
      count += 1;
      if (count === n) return new Date(d);
    }
    d.setDate(d.getDate() + 1);
  }
  return d;
};

/** Fechas clave de compras del año — no son precios en tiempo real (eso
 * necesitaría scraping o una API de pago que no tenemos), pero sí ayudan a
 * no pillarte por sorpresa un Black Friday o el inicio de las rebajas. */
export function getDealDates(year: number): DealDate[] {
  const blackFriday = nthWeekdayOfMonth(year, 10, 4, 4); // 4º jueves de noviembre + 1 día
  blackFriday.setDate(blackFriday.getDate() + 1);
  const cyberMonday = new Date(blackFriday);
  cyberMonday.setDate(cyberMonday.getDate() + 3);

  return [
    { id: 'rebajas-invierno', emoji: '❄️', labelKey: 'deals.winterSales', date: new Date(year, 0, 7) },
    { id: 'prime-day', emoji: '📦', labelKey: 'deals.primeDay', date: new Date(year, 6, 15) },
    { id: 'rebajas-verano', emoji: '☀️', labelKey: 'deals.summerSales', date: new Date(year, 5, 30) },
    { id: 'black-friday', emoji: '🏷️', labelKey: 'deals.blackFriday', date: blackFriday },
    { id: 'cyber-monday', emoji: '💻', labelKey: 'deals.cyberMonday', date: cyberMonday },
    { id: 'navidad', emoji: '🎄', labelKey: 'deals.christmas', date: new Date(year, 11, 24) },
  ];
}

/** La próxima fecha de ofertas desde hoy (mira también al año siguiente si
 * ya han pasado todas las de este año). */
export function getNextDealDate(from: Date = new Date()): { deal: DealDate; daysUntil: number } | null {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const candidates = [...getDealDates(today.getFullYear()), ...getDealDates(today.getFullYear() + 1)];
  const upcoming = candidates
    .map((d) => ({ deal: d, daysUntil: Math.round((d.date.getTime() - today.getTime()) / 86_400_000) }))
    .filter((d) => d.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return upcoming[0] ?? null;
}
