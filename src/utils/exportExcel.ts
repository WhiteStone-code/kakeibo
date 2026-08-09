import ExcelJS from 'exceljs';
import type { Category, Goal, Transaction } from '../types';
import { getCategory } from '../data/categories';
import { currentMonthKey, monthLabel } from './format';

interface ExportableState {
  transactions: Transaction[];
  goals: Goal[];
  settings: { currency: string; userName: string };
}

const HEADER_FILL = 'FF7C9473'; // verde zen — independiente del tema activo, es un documento, no la app
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const ZEBRA_FILL = 'FFF6F1E8';

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  row.height = 20;
}

/** Genera y descarga un .xlsx con el histórico completo, organizado en
 * varias hojas y con formato (colores, moneda, congelado, autofiltro) —
 * no solo una tabla plana. */
export async function exportToExcel(state: ExportableState, allCategories: Category[]) {
  const { transactions, goals, settings } = state;
  const currency = settings.currency;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Kakeibo';
  wb.created = new Date();

  const moneyFmt = `#,##0.00 "${currency}"`;

  // ---- Hoja 1: Resumen mensual ----
  const resumen = wb.addWorksheet('Resumen mensual');
  resumen.columns = [
    { header: 'Mes', key: 'mes', width: 16 },
    { header: 'Ingresos', key: 'ingresos', width: 16 },
    { header: 'Gastos', key: 'gastos', width: 16 },
    { header: 'Balance', key: 'balance', width: 16 },
  ];
  styleHeaderRow(resumen.getRow(1));

  const months = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort();
  if (!months.includes(currentMonthKey())) months.push(currentMonthKey());
  for (const m of months) {
    let ingresos = 0;
    let gastos = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(m)) continue;
      if (t.type === 'ingreso') ingresos += t.amount;
      else gastos += t.amount;
    }
    const row = resumen.addRow({
      mes: monthLabel(m),
      ingresos,
      gastos,
      balance: ingresos - gastos,
    });
    ['ingresos', 'gastos', 'balance'].forEach((k) => {
      row.getCell(k).numFmt = moneyFmt;
    });
  }
  resumen.views = [{ state: 'frozen', ySplit: 1 }];

  // ---- Hoja 2: Movimientos ----
  const movs = wb.addWorksheet('Movimientos');
  movs.columns = [
    { header: 'Fecha', key: 'fecha', width: 13 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Nota', key: 'nota', width: 32 },
    { header: 'Importe', key: 'importe', width: 14 },
  ];
  styleHeaderRow(movs.getRow(1));

  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  sorted.forEach((t, i) => {
    const cat = getCategory(t.category, allCategories);
    const row = movs.addRow({
      fecha: t.date,
      tipo: t.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      categoria: `${cat.emoji} ${cat.label}`,
      nota: t.note,
      importe: t.type === 'ingreso' ? t.amount : -t.amount,
    });
    row.getCell('importe').numFmt = moneyFmt;
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } };
      });
    }
  });
  movs.views = [{ state: 'frozen', ySplit: 1 }];
  movs.autoFilter = { from: 'A1', to: 'E1' };

  // ---- Hoja 3: Por categoría (todo el histórico) ----
  const cats = wb.addWorksheet('Por categoría');
  cats.columns = [
    { header: 'Categoría', key: 'categoria', width: 22 },
    { header: 'Nº movimientos', key: 'n', width: 16 },
    { header: 'Total gastado', key: 'total', width: 16 },
  ];
  styleHeaderRow(cats.getRow(1));

  const byCat = new Map<string, { n: number; total: number }>();
  for (const t of transactions) {
    if (t.type !== 'gasto') continue;
    const cur = byCat.get(t.category) ?? { n: 0, total: 0 };
    cur.n += 1;
    cur.total += t.amount;
    byCat.set(t.category, cur);
  }
  Array.from(byCat.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([catId, v]) => {
      const cat = getCategory(catId, allCategories);
      const row = cats.addRow({ categoria: `${cat.emoji} ${cat.label}`, n: v.n, total: v.total });
      row.getCell('total').numFmt = moneyFmt;
      row.getCell('categoria').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: cat.color.replace('#', 'FF').toUpperCase() },
      };
    });

  // ---- Hoja 4: Objetivos ----
  const goalsSheet = wb.addWorksheet('Objetivos');
  goalsSheet.columns = [
    { header: 'Objetivo', key: 'nombre', width: 24 },
    { header: 'Ahorrado', key: 'ahorrado', width: 14 },
    { header: 'Meta', key: 'meta', width: 14 },
    { header: 'Progreso', key: 'pct', width: 12 },
    { header: 'Fecha límite', key: 'fecha', width: 14 },
    { header: 'Estado', key: 'estado', width: 14 },
  ];
  styleHeaderRow(goalsSheet.getRow(1));
  goals.forEach((g) => {
    const row = goalsSheet.addRow({
      nombre: `${g.emoji} ${g.name}`,
      ahorrado: g.savedAmount,
      meta: g.targetAmount,
      pct: g.targetAmount > 0 ? g.savedAmount / g.targetAmount : 0,
      fecha: g.deadline ?? '—',
      estado: g.achieved ? '🏆 Cumplido' : 'En marcha',
    });
    row.getCell('ahorrado').numFmt = moneyFmt;
    row.getCell('meta').numFmt = moneyFmt;
    row.getCell('pct').numFmt = '0%';
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kakeibo-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
