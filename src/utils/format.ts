import { useStore } from '../store/useStore';
import { LOCALE_MAP } from '../i18n/translations';

/** Lee el idioma activo directamente del store (sin ser un hook) para que
 * fechas/números se formateen en el idioma correcto sin tener que pasar el
 * locale a mano por cada llamada — antes todo esto estaba fijado a 'es-ES'
 * pase lo que pase, hallazgo real del QA en alemán/inglés/etc. */
const getLocale = (): string => LOCALE_MAP[useStore.getState().settings.language] ?? 'es-ES';

/** Formatea con Intl usando el código ISO de la divisa — así cada una respeta
 * sus propias reglas (JPY sin decimales, posición del símbolo, etc.) sin
 * tener que mantenerlas a mano. Si el código no es válido (dato antiguo),
 * cae a un formato simple en vez de romper. */
export const formatMoney = (amount: number, currency = 'EUR'): string => {
  const locale = getLocale();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  }
};

/** Igual que formatMoney pero sin decimales — pensado para botones de
 * cantidad rápida (+5, +10...) donde mostrar "5,00 €" es ruido innecesario. */
export const formatMoneyRound = (amount: number, currency = 'EUR'): string => {
  const locale = getLocale();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString(locale)} ${currency}`;
  }
};

/** Solo el símbolo/código de la divisa (ej. "€", "$", "CHF"), para pintarlo
 * junto a un input en vez del código ISO en crudo ("EUR"). */
export const currencySymbol = (currency = 'EUR'): string => {
  const locale = getLocale();
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
};

export const currentMonthKey = (date: Date = new Date()): string => date.toISOString().slice(0, 10).slice(0, 7);

export const monthLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat(getLocale(), { month: 'long', year: 'numeric' }).format(d);
};

export const lastNMonths = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    out.unshift(currentMonthKey(d));
    d.setMonth(d.getMonth() - 1);
  }
  return out;
};

/** Fecha corta legible en el idioma activo (ej. "9 ago 2026"), en vez del
 * ISO en crudo. */
export const formatDate = (isoDate: string): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

export const daysUntil = (isoDate: string | null): number | null => {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/** Matriz de semanas (lunes-domingo) para pintar un calendario mensual.
 * Los días fuera del mes (relleno de la primera/última semana) llevan
 * `inMonth: false` para pintarlos atenuados. */
export interface CalendarDay {
  date: string; // ISO yyyy-MM-dd
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

export const getMonthMatrix = (monthKey: string): CalendarDay[][] => {
  const [y, m] = monthKey.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(y, m, 0).getDate();
  const todayIso = new Date().toISOString().slice(0, 10);

  const cells: CalendarDay[] = [];
  // relleno antes del día 1
  for (let i = startOffset; i > 0; i--) {
    const d = new Date(y, m - 1, 1 - i);
    cells.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), inMonth: false, isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date: iso, day, inMonth: true, isToday: iso === todayIso });
  }
  while (cells.length % 7 !== 0) {
    const last = new Date(cells[cells.length - 1].date);
    last.setDate(last.getDate() + 1);
    cells.push({ date: last.toISOString().slice(0, 10), day: last.getDate(), inMonth: false, isToday: false });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

/** Iniciales de lunes a domingo en el idioma activo (ej. L M X J V S D en
 * español, M T W T F S S en inglés) — antes estaban fijas en español. */
export const getWeekdayLabels = (): string[] => {
  const locale = getLocale();
  const monday = new Date(2024, 0, 1); // un lunes cualquiera, de referencia
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const label = new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d);
    return label.toUpperCase();
  });
};

export const shiftMonthKey = (monthKey: string, delta: number): string => {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonthKey(d);
};

/** Lunes de la semana actual, en ISO yyyy-MM-dd. */
export const currentWeekStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};
