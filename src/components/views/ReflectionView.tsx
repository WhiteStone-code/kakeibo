import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { currentMonthKey, formatMoney, monthLabel } from '../../utils/format';

export default function ReflectionView() {
  const transactions = useStore((s) => s.transactions);
  const reflections = useStore((s) => s.reflections);
  const saveReflection = useStore((s) => s.saveReflection);
  const currency = useStore((s) => s.settings.currency);

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
        <h1 className="font-display font-extrabold text-2xl">🧘 Reflexión Kakeibo</h1>
        <p className="text-soft text-sm">
          Dos minutos una vez al mes para saber si vas hacia donde querías ir.
        </p>
      </div>

      <div className="card-soft p-4">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-bold text-accent"
        >
          <span>💡 ¿Para qué sirve exactamente esto?</span>
          <span>{showWhy ? '−' : '+'}</span>
        </button>
        {showWhy && (
          <p className="text-sm text-soft mt-2 leading-relaxed">
            Es el corazón del método kakeibo original de 1904: antes de gastar sin pensar y
            arrepentirte después, respondes 4 preguntas cortas. No es para sentirte mal por lo que
            has gastado — es para ver con datos, no con sensaciones, si el mes va como querías, y
            decidir <b>una sola cosa concreta</b> a mejorar el mes que viene. La app hace las
            cuentas por ti; tú solo decides.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <p className="font-display font-bold capitalize">{monthLabel(month)}</p>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">
            1️⃣ ¿Cuánto dinero tienes disponible este mes?
          </label>
          <p className="text-xs text-soft mt-0.5 mb-2">Lo que ingresas, sin contar gastos fijos que no puedes evitar.</p>
          <input
            inputMode="decimal"
            value={disponible}
            onChange={(e) => setDisponible(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
          />
        </div>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">
            2️⃣ ¿Cuánto te gustaría ahorrar?
          </label>
          <p className="text-xs text-soft mt-0.5 mb-2">Tu objetivo del mes, el que tú decidas.</p>
          <input
            inputMode="decimal"
            value={deseoAhorrar}
            onChange={(e) => setDeseoAhorrar(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
          />
        </div>

        <div>
          <label className="text-sm font-bold flex items-center gap-2">
            3️⃣ ¿Cuánto estás gastando realmente?
          </label>
          <div className="mt-2 px-3 py-2.5 rounded-xl bg-app-soft font-bold text-accent">
            {formatMoney(gastoReal, currency)}{' '}
            <span className="text-soft font-normal text-xs">
              (sumado solo de tus movimientos — no hace falta que lo calcules tú)
            </span>
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
              {diferencia >= 0 ? '✅ Vas bien' : '⚠️ Te estás desviando un poco'}
            </p>
            <p className="text-sm">
              A este ritmo, este mes ahorrarás{' '}
              <b>{formatMoney(Math.max(0, ahorroReal), currency)}</b> — eso es{' '}
              <b style={{ color: diferencia >= 0 ? 'var(--accent)' : '#e34948' }}>
                {formatMoney(Math.abs(diferencia), currency)}
              </b>{' '}
              {diferencia >= 0 ? 'más' : 'menos'} de lo que querías ahorrar este mes.
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-bold flex items-center gap-2">
            4️⃣ ¿Cómo puedes mejorar el mes que viene?
          </label>
          <p className="text-xs text-soft mt-0.5 mb-2">Una sola idea concreta basta — no hace falta una lista.</p>
          <textarea
            value={comoMejorar}
            onChange={(e) => setComoMejorar(e.target.value)}
            rows={3}
            placeholder="Ej: Cocinar más en casa, cancelar una suscripción que no uso…"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent resize-none"
          />
        </div>

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          {saved ? '¡Guardado! 🌸' : 'Guardar reflexión del mes'}
        </button>
      </form>

      {reflections.filter((r) => r.id !== month).length > 0 && (
        <div>
          <h2 className="font-display font-bold text-base mb-3">📜 Historial</h2>
          <div className="flex flex-col gap-3">
            {reflections
              .filter((r) => r.id !== month)
              .map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="font-display font-bold capitalize mb-2">{monthLabel(r.id)}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-soft">Disponible</p>
                      <p className="font-bold">{formatMoney(r.disponible, currency)}</p>
                    </div>
                    <div>
                      <p className="text-soft">Meta ahorro</p>
                      <p className="font-bold">{formatMoney(r.deseoAhorrar, currency)}</p>
                    </div>
                    <div>
                      <p className="text-soft">Gasto real</p>
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
