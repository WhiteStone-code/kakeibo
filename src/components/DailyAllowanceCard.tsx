import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { currentMonthKey, formatMoney } from '../utils/format';

/**
 * La joya del panel: cuánto puede gastar hoy el usuario sin descuadrar el
 * mes, y qué debería reservar hoy para su objetivo activo. Inspirado en el
 * "In My Pocket" de PocketGuard / "Ahora mismo" de Fintonic — la métrica
 * que de verdad ayuda a decidir en el momento de comprar, no solo a mirar
 * hacia atrás como un típico gráfico de gastos.
 */
export default function DailyAllowanceCard() {
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const currency = useStore((s) => s.settings.currency);

  const { dailyAllowance, monthBalance, daysLeft, goalHint } = useMemo(() => {
    const month = currentMonthKey();
    let ingresos = 0;
    let gastos = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(month)) continue;
      if (t.type === 'ingreso') ingresos += t.amount;
      else gastos += t.amount;
    }
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate() + 1;
    const monthBalance = ingresos - gastos;
    const dailyAllowance = monthBalance > 0 ? monthBalance / daysLeft : 0;

    const activeGoal = goals
      .filter((g) => !g.achieved && g.deadline)
      .map((g) => {
        const deadline = new Date(g.deadline as string);
        deadline.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntil = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
        return { goal: g, daysUntil };
      })
      .filter((x) => x.daysUntil > 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)[0];

    const goalHint = activeGoal
      ? {
          name: activeGoal.goal.name,
          emoji: activeGoal.goal.emoji,
          perDay: (activeGoal.goal.targetAmount - activeGoal.goal.savedAmount) / activeGoal.daysUntil,
        }
      : null;

    return { dailyAllowance, monthBalance, daysLeft, goalHint };
  }, [transactions, goals]);

  const overBudget = monthBalance < 0;

  return (
    <div
      className="card p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--surface)), var(--surface))',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-soft uppercase tracking-wide">
            {overBudget ? 'Este mes' : 'Hoy puedes gastar'}
          </p>
          {overBudget ? (
            <>
              <p className="font-display font-extrabold text-2xl text-[#e34948] mt-1">
                {formatMoney(Math.abs(monthBalance), currency)} por encima de tus ingresos
              </p>
              <p className="text-sm text-soft mt-1">
                🍵 Sin culpa — es solo información. Hoy puede ser un buen día para frenar un
                poco y volver a tu ritmo.
              </p>
            </>
          ) : (
            <>
              <p className="font-display font-extrabold text-4xl text-accent mt-1">
                ≈ {formatMoney(dailyAllowance, currency)}
              </p>
              <p className="text-sm text-soft mt-1">
                cada día, durante los {daysLeft} días que quedan de mes, para llegar sin pasarte
              </p>
            </>
          )}
        </div>
        <span className="text-4xl animate-float shrink-0">{overBudget ? '🌧️' : '☀️'}</span>
      </div>

      {goalHint && (
        <div className="border-t border-theme pt-3 flex items-center gap-2.5 text-sm">
          <span className="text-xl">{goalHint.emoji}</span>
          <p>
            Para llegar a <span className="font-bold">{goalHint.name}</span> a tiempo, intenta
            ahorrar <span className="font-bold text-accent">{formatMoney(Math.max(0, goalHint.perDay), currency)}/día</span>
          </p>
        </div>
      )}
    </div>
  );
}
