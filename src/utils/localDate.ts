// Módulo sin dependencias (ni de i18n ni del store) para que tanto
// utils/format.ts como store/useStore.ts puedan importarlo sin crear un
// ciclo de imports entre ambos.

/** yyyy-MM-dd del día LOCAL (no UTC). Usar siempre esto en vez de
 * `date.toISOString().slice(0, 10)` para "la fecha de hoy" — `toISOString`
 * es UTC, así que en cualquier huso con offset negativo respecto a UTC
 * (toda Europa continental incluida: CET/CEST) desplaza la fecha real
 * entre medianoche local y la 1-2 de la madrugada. Bug real encontrado por
 * auditoría: un fijo con día 1 se marcaba como aplicado en el mes anterior
 * si se confirmaba justo pasada la medianoche, y volvía a salir como
 * pendiente horas después al llegar la medianoche UTC real. */
export function localIsoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** yyyy-MM del mes LOCAL — mismo motivo que localIsoDate. */
export function localMonthKey(d: Date = new Date()): string {
  return localIsoDate(d).slice(0, 7);
}
