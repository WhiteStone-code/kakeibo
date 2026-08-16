import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';
import {
  INVESTMENT_SCENARIOS,
  RISK_PROFILES,
  DEFAULT_INFLATION,
  projectGrowth,
  realValue,
} from '../../data/investmentScenarios';
import { formatMoney } from '../../utils/format';
import { useT } from '../../i18n/useT';
import { translateWithFallback } from '../../i18n/translations';
import CurrencyConverter from '../CurrencyConverter';

const ETF_STEPS = ['1', '2', '3', '4', '5'] as const;

export default function InvestView() {
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const currency = useStore((s) => s.settings.currency);
  const mode = useStore((s) => s.settings.mode);
  const { t, lang } = useT();
  const scenarioLabel = (id: string, fallback: string) => translateWithFallback(`invscenario.${id}.label`, lang, fallback);
  const scenarioDesc = (id: string, fallback: string) => translateWithFallback(`invscenario.${id}.desc`, lang, fallback);

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
  const [inflationPct, setInflationPct] = useState(String(DEFAULT_INFLATION * 100));
  const [showEtfGuide, setShowEtfGuide] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const highlightedScenarioId = RISK_PROFILES.find((p) => p.id === profileId)?.scenarioId ?? null;

  const startNum = parseFloat(start.replace(',', '.')) || 0;
  const monthlyNum = parseFloat(monthly.replace(',', '.')) || 0;
  const inflationNum = (parseFloat(inflationPct.replace(',', '.')) || 0) / 100;
  const months = years * 12;

  const { chartData, finals } = useMemo(() => {
    const seriesByScenario = INVESTMENT_SCENARIOS.map((sc) => ({
      sc,
      series: projectGrowth(startNum, monthlyNum, months, sc.annualReturn),
    }));
    const chartData = [];
    for (let m = 0; m <= months; m += 1) {
      if (m % 3 !== 0 && m !== months) continue; // un punto por trimestre, más el final
      const point: Record<string, number | string> = { mes: m };
      for (const { sc, series } of seriesByScenario) point[sc.id] = Math.round(series[m]);
      chartData.push(point);
    }
    const finals = seriesByScenario.map(({ sc, series }) => ({
      sc,
      final: series[series.length - 1],
      contributed: startNum + monthlyNum * months,
    }));
    return { chartData, finals };
  }, [startNum, monthlyNum, months]);

  // Solo una etiqueta por año en el eje X (evita el amasijo de decimales
  // de trimestre en trimestre: 0.0, 0.3, 0.6…).
  const yearTicks = useMemo(
    () => Array.from({ length: years + 1 }, (_, i) => i * 12),
    [years]
  );

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl">{t('invest.title')}</h1>
        <p className="text-soft text-sm">{t('invest.subtitle')}</p>
      </div>

      <div className="card p-5 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('invest.initialAmount')}</label>
            <input
              inputMode="decimal"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('invest.monthlyContribution')}</label>
            <input
              inputMode="decimal"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">
              {t('invest.horizon', { years, unit: years === 1 ? t('invest.year') : t('invest.years') })}
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
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('invest.inflation')}</label>
            <div className="relative mt-1.5">
              <input
                inputMode="decimal"
                value={inflationPct}
                onChange={(e) => setInflationPct(e.target.value)}
                title={t('invest.inflationHint')}
                className="w-full px-3 py-2.5 pr-8 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-soft font-bold text-sm">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('invest.riskProfile.title')}</label>
          <p className="text-xs text-soft -mt-0.5 mb-2">{t('invest.riskProfile.subtitle')}</p>
          <div className="flex flex-wrap gap-2">
            {RISK_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfileId(profileId === p.id ? null : p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profileId === p.id ? 'btn-accent' : 'card-soft text-soft'
                }`}
              >
                <span>{p.emoji}</span> {t(`invest.riskProfile.${p.id}`)}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ left: -10 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="mes"
              type="number"
              domain={[0, months]}
              ticks={yearTicks}
              tickFormatter={(m) => `${Math.round(Number(m) / 12)}`}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tick={{ fill: 'var(--text-soft)', fontSize: 11, fontFamily: 'Nunito' }}
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
              labelFormatter={(m) => t('invest.chartYearLabel', { years: Math.round(Number(m) / 12) })}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 13,
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Nunito' }} iconType="plainline" />
            {INVESTMENT_SCENARIOS.map((sc) => {
              const dimmed = highlightedScenarioId !== null && sc.id !== highlightedScenarioId;
              return (
                <Line
                  key={sc.id}
                  type="monotone"
                  dataKey={sc.id}
                  name={scenarioLabel(sc.id, sc.label)}
                  stroke={mode === 'dark' ? sc.colorDark : sc.color}
                  strokeWidth={sc.id === highlightedScenarioId ? 3 : 2}
                  strokeOpacity={dimmed ? 0.3 : 1}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {finals.map(({ sc, final, contributed }) => (
            <div
              key={sc.id}
              className={`card-soft p-4 ${sc.id === highlightedScenarioId ? 'ring-2 ring-accent' : ''}`}
            >
              <p className="text-sm font-bold flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <span>{sc.emoji}</span> {scenarioLabel(sc.id, sc.label)}
                </span>
                {sc.id === highlightedScenarioId && (
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wide">
                    {t('invest.riskProfile.yourProfile')}
                  </span>
                )}
              </p>
              <p
                className="font-display font-extrabold text-lg mt-1"
                style={{ color: mode === 'dark' ? sc.colorDark : sc.color }}
              >
                {formatMoney(final, currency)}
              </p>
              <p className="text-xs text-soft mt-0.5">
                {sc.annualReturn === 0
                  ? t('invest.yieldNone')
                  : t('invest.yieldAmount', { amount: formatMoney(Math.max(0, final - contributed), currency) })}
              </p>
              {inflationNum > 0 && (
                <p className="text-[11px] text-soft mt-1">
                  {t('invest.realValue', { amount: formatMoney(realValue(final, inflationNum, years), currency) })}
                </p>
              )}
              <p className="text-[11px] text-soft mt-1.5 leading-snug">{scenarioDesc(sc.id, sc.description)}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-soft italic border-t border-theme pt-3">{t('invest.disclaimer')}</p>
      </div>

      <div className="card p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-display font-bold text-base">{t('invest.platforms.title')}</h2>
          <p className="text-xs text-soft mt-0.5">{t('invest.platforms.subtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['neobroker', 'bank', 'robo'] as const).map((k) => (
            <div key={k} className="card-soft p-4">
              <p className="text-sm font-bold">{t(`invest.platforms.${k}.title`)}</p>
              <p className="text-xs text-soft mt-1.5 leading-snug">{t(`invest.platforms.${k}.desc`)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-soft italic border-t border-theme pt-3">{t('invest.platforms.disclaimer')}</p>
      </div>

      <div className="card-soft p-4">
        <button
          type="button"
          onClick={() => setShowEtfGuide((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-bold text-accent"
        >
          <span>{t('invest.etfGuide.toggle')}</span>
          <span>{showEtfGuide ? '−' : '+'}</span>
        </button>
        {showEtfGuide && (
          <ol className="flex flex-col gap-3 mt-3">
            {ETF_STEPS.map((n) => (
              <li key={n} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full btn-accent flex items-center justify-center text-xs font-bold">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-bold">{t(`invest.etfGuide.step${n}Title`)}</p>
                  <p className="text-xs text-soft leading-snug">{t(`invest.etfGuide.step${n}Desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <CurrencyConverter defaultCurrency={currency} />
    </div>
  );
}
