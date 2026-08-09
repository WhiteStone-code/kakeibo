/** Formatea con Intl usando el código ISO de la divisa — así cada una respeta
 * sus propias reglas (JPY sin decimales, posición del símbolo, etc.) sin
 * tener que mantenerlas a mano. Si el código no es válido (dato antiguo),
 * cae a un formato simple en vez de romper. */
export const formatMoney = (amount: number, currency = 'EUR'): string => {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  }
};

export const currentMonthKey = (date: Date = new Date()): string => date.toISOString().slice(0, 10).slice(0, 7);

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const WEEKDAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const monthLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
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

export const WEEKDAY_LABELS = WEEKDAY_NAMES;

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
