import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { currentMonthKey, formatMoney, monthLabel } from '../../utils/format';
import { useT } from '../../i18n/useT';
import KakeiboSplit from '../KakeiboSplit';

export default function ReflectionView() {
  const transactions = useStore((s) => s.transactions);
  const reflections = useStore((s) => s.reflections);
  const saveReflection = useStore((s) => s.saveReflection);
  const currency = useStore((s) => s.settings.currency);
  const { t } = useT();

  const month = currentMonthKey();
  const existing = reflections.find((r) => r.id === month);

  const gastoReal = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'gasto' && t.date.startsWith(month))
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, month]
  );

  const [disponible, setDisponible] = useState(existing?.disponible?.toString() ?? '');
  const [deseoAhorrar, setDeseoAhorrar] = useState(existing?.deseoAhorrar?.toString() ?? '');
  const [comoMejorar, setComoMejorar] = useState(existing?.comoMejorar ?? '');
  const [saved, setSaved] = useState(false);
  const [showWhy, setShowWhy] = useState(!existing);

  const disponibleNum = parseFloat(disponible.replace(',', '.')) || 0;
  const deseoAhorrarNum = parseFloat(deseoAhorrar.replace(',', '.')) || 0;
  const ahorroReal = disponibleNum - gastoReal;
  const diferencia = ahorroReal - deseoAhorrarNum;
  const hasEnoughData = disponibleNum > 0 || deseoAhorrarNum > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveReflection({
      month,
      disponible: disponibleNum,
      deseoAhorrar: deseoAhorrarNum,
      gastoReal,
      comoMejorar: comoMejorar.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl">{t('reflection.title')}</h1>
        <p className="text-soft text-sm">{t('reflection.subtitle')}</p>
      </div>

      <div className="card-soft p-4">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-bold text-accent"
        >
          <span>{t('reflection.whyToggle')}</span>
          <span>{showWhy ? '−' : '+'}</span>
        </button>
        {showWhy && <p className="text-sm text-soft mt-2 leading-relaxed">{t('reflection.whyText')}</p>}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <p className="font-display font-bold capitalize">{monthLabel(month)}</p>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">{t('reflection.q1')}</label>
          <p className="text-xs text-soft mt-0.5 mb-2">{t('reflection.q1sub')}</p>
          <input
            inputMode="decimal"
            value={disponible}
            onChange={(e) => setDisponible(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
          />
        </div>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">{t('reflection.q2')}</label>
          <p className="text-xs text-soft mt-0.5 mb-2">{t('reflection.q2sub')}</p>
          <input
            inputMode="decimal"
            value={deseoAhorrar}
            onChange={(e) => setDeseoAhorrar(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
          />
        </div>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">{t('reflection.q3')}</label>
          <div className="mt-2 px-3 py-2.5 rounded-xl bg-app-soft font-bold text-accent">
            {formatMoney(gastoReal, currency)}{' '}
            <span className="text-soft font-normal text-xs">{t('reflection.q3sub')}</span>
          </div>
          <div className="mt-2">
            <KakeiboSplit monthKey={month} mode="inline" />
          </div>
        </div>

        {hasEnoughData && (
          <div
            className="rounded-2xl p-4 border-2"
            style={{
              borderColor: diferencia >= 0 ? 'var(--accent)' : '#e34948',
              background: diferencia >= 0 ? 'var(--accent)15' : '#e3494815',
            }}
          >
            <p className="text-sm font-bold mb-1">
              {diferencia >= 0 ? t('reflection.onTrack') : t('reflection.offTrack')}
            </p>
            <p className="text-sm">
              {t('reflection.verdict', {
                saved: formatMoney(Math.max(0, ahorroReal), currency),
                diff: formatMoney(Math.abs(diferencia), currency),
                direction: diferencia >= 0 ? t('reflection.more') : t('reflection.less'),
              })}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-bold flex items-center gap-2">{t('reflection.q4')}</label>
          <p className="text-xs text-soft mt-0.5 mb-2">{t('reflection.q4sub')}</p>
          <textarea
            value={comoMejorar}
            onChange={(e) => setComoMejorar(e.target.value)}
            rows={3}
            placeholder={t('reflection.q4placeholder')}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent resize-none"
          />
        </div>

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          {saved ? t('reflection.saved') : t('reflection.save')}
        </button>
      </form>

      {reflections.filter((r) => r.id !== month).length > 0 && (
        <div>
          <h2 className="font-display font-bold text-base mb-3">{t('reflection.history')}</h2>
          <div className="flex flex-col gap-3">
            {reflections
              .filter((r) => r.id !== month)
              .map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="font-display font-bold capitalize mb-2">{monthLabel(r.id)}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-soft">{t('reflection.available')}</p>
                      <p className="font-bold">{formatMoney(r.disponible, currency)}</p>
                    </div>
                    <div>
                      <p className="text-soft">{t('reflection.savingsGoal')}</p>
                      <p className="font-bold">{formatMoney(r.deseoAhorrar, currency)}</p>
                    </div>
                    <div>
                      <p className="text-soft">{t('reflection.realExpense')}</p>
                      <p className="font-bold">{formatMoney(r.gastoReal, currency)}</p>
                    </div>
                  </div>
                  {r.comoMejorar && <p className="text-sm italic text-soft">"{r.comoMejorar}"</p>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
