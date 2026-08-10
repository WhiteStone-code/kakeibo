import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { useT } from '../../i18n/useT';
import { lastNMonths, monthLabel, formatMoney } from '../../utils/format';

const INGRESO_COLOR = { light: '#0ca30c', dark: '#3fc93f' };
const GASTO_COLOR = { light: '#eb6834', dark: '#d95926' };

export default function TrendChart() {
  const transactions = useStore((s) => s.transactions);
  const mode = useStore((s) => s.settings.mode);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();

  const data = useMemo(() => {
    const months = lastNMonths(6);
    return months.map((m) => {
      let ingresos = 0;
      let gastos = 0;
      for (const t of transactions) {
        if (!t.date.startsWith(m)) continue;
        if (t.type === 'ingreso') ingresos += t.amount;
        else gastos += t.amount;
      }
      return {
        month: m,
        label: monthLabel(m).slice(0, 3).replace(/^./, (c) => c.toUpperCase()),
        Ingresos: Math.round(ingresos * 100) / 100,
        Gastos: Math.round(gastos * 100) / 100,
      };
    });
  }, [transactions]);

  const ingresoColor = mode === 'dark' ? INGRESO_COLOR.dark : INGRESO_COLOR.light;
  const gastoColor = mode === 'dark' ? GASTO_COLOR.dark : GASTO_COLOR.light;
  const gridColor = 'var(--border)';
  const textColor = 'var(--text-soft)';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 4" />
        <XAxis
          dataKey="label"
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          tick={{ fill: textColor, fontSize: 12, fontFamily: 'Nunito' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={44}
          tick={{ fill: textColor, fontSize: 11, fontFamily: 'Nunito' }}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`)}
        />
        <Tooltip
          cursor={{ fill: 'var(--bg-soft)' }}
          formatter={(value) => formatMoney(Number(value) || 0, currency)}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: 13,
            fontFamily: 'Nunito, sans-serif',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, fontFamily: 'Nunito', color: textColor }}
        />
        <Bar dataKey="Ingresos" name={t('dashboard.income')} fill={ingresoColor} radius={[6, 6, 0, 0]} maxBarSize={22} />
        <Bar dataKey="Gastos" name={t('dashboard.expenses')} fill={gastoColor} radius={[6, 6, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
