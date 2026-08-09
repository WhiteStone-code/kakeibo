import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';
import { INVESTMENT_SCENARIOS, projectGrowth } from '../../data/investmentScenarios';
import { formatMoney } from '../../utils/format';
import CurrencyConverter from '../CurrencyConverter';

export default function InvestView() {
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const currency = useStore((s) => s.settings.currency);
  const mode = useStore((s) => s.settings.mode);

  const suggestedMonthly = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const t of transactions) {
      const m = t.date.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + (t.type === 'ingreso' ? t.amount : -t.amount));
    }
    const balances = Array.from(byMonth.values());
    if (balances.length === 0) return 100;
    const positive = balances.filter((b) => b > 0);
    if (positive.length === 0) return 50;
    return Math.round(positive.reduce((a, b) => a + b, 0) / positive.length);
  }, [transactions]);

  const suggestedStart = useMemo(
    () => Math.round(goals.reduce((sum, g) => sum + g.savedAmount, 0)),
    [goals]
  );

  const [start, setStart] = useState(String(suggestedStart || 0));
  const [monthly, setMonthly] = useState(String(suggestedMonthly));
  const [years, setYears] = useState(10);

  const startNum = parseFloat(start.replace(',', '.')) || 0;
  const monthlyNum = parseFloat(monthly.replace(',', '.')) || 0;
  const months = years * 12;

  const { chartData, finals } = useMemo(() => {
    const seriesByScenario = INVESTMENT_SCENARIOS.map((sc) => ({
      sc,
      series: projectGrowth(startNum, monthlyNum, months, sc.annualReturn),
    }));
    const chartData = [];
    for (let m = 0; m <= months; m += 1) {
      if (m % 3 !== 0 && m !== months) continue; // un punto por trimestre, más el final
      const point: Record<string, number | string> = { mes: m, label: `Año ${(m / 12).toFixed(1)}` };
      for (const { sc, series } of seriesByScenario) point[sc.label] = Math.round(series[m]);
      chartData.push(point);
    }
    const finals = seriesByScenario.map(({ sc, series }) => ({
      sc,
      final: series[series.length - 1],
      contributed: startNum + monthlyNum * months,
    }));
    return { chartData, finals };
  }, [startNum, monthlyNum, months]);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl">📈 ¿Y si lo invierto?</h1>
        <p className="text-soft text-sm">
          Compara qué pasaría con tu dinero guardado sin más, frente a distintas formas de
          invertirlo a largo plazo.
        </p>
      </div>

      <div className="card p-5 flex flex-col gap-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">Cantidad inicial</label>
            <input
              inputMode="decimal"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">Aportación mensual</label>
            <input
              inputMode="decimal"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">
              Horizonte: {years} {years === 1 ? 'año' : 'años'}
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full mt-3.5 accent-[var(--accent)]"
            />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ left: -10 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tick={{ fill: 'var(--text-soft)', fontSize: 11, fontFamily: 'Nunito' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={54}
              tick={{ fill: 'var(--text-soft)', fontSize: 11, fontFamily: 'Nunito' }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`)}
            />
            <Tooltip
              formatter={(value) => formatMoney(Number(value) || 0, currency)}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Nunito' }} iconType="plainline" />
            {INVESTMENT_SCENARIOS.map((sc) => (
              <Line
                key={sc.id}
                type="monotone"
                dataKey={sc.label}
                stroke={mode === 'dark' ? sc.colorDark : sc.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {finals.map(({ sc, final, contributed }) => (
            <div key={sc.id} className="card-soft p-4">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <span>{sc.emoji}</span> {sc.label}
              </p>
              <p
                className="font-display font-extrabold text-lg mt-1"
                style={{ color: mode === 'dark' ? sc.colorDark : sc.color }}
              >
                {formatMoney(final, currency)}
              </p>
              <p className="text-xs text-soft mt-0.5">
                {sc.annualReturn === 0
                  ? 'sin crecimiento'
                  : `+${formatMoney(Math.max(0, final - contributed), currency)} de rendimiento`}
              </p>
              <p className="text-[11px] text-soft mt-1.5 leading-snug">{sc.description}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-soft italic border-t border-theme pt-3">
          ⚠️ Esto es una simulación educativa con rentabilidades medias históricas orientativas —
          no es una recomendación de inversión ni una promesa de resultados. Rentabilidades
          pasadas no garantizan rentabilidades futuras; invertir en oro, ETFs o acciones implica
          riesgo real de perder parte del dinero, sobre todo a corto plazo.
        </p>
      </div>

      <CurrencyConverter defaultCurrency={currency} />
    </div>
  );
}
