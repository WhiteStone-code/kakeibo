import { useState } from 'react';
import { useStore } from '../../store/useStore';
import GoalCard from '../GoalCard';
import GoalForm from '../GoalForm';

export default function GoalsView() {
  const goals = useStore((s) => s.goals);
  const [formOpen, setFormOpen] = useState(false);

  const active = goals.filter((g) => !g.achieved);
  const achieved = goals.filter((g) => g.achieved);

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl">Objetivos</h1>
          <p className="text-soft text-sm">Tu coche, tu boda, tu viaje soñado… un paso a la vez</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="btn-accent font-bold px-4 py-2.5 rounded-2xl text-sm shadow-md whitespace-nowrap"
        >
          + Objetivo
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-10 text-center text-soft flex flex-col items-center gap-2">
          <p className="text-4xl">🎯</p>
          <p className="font-semibold">Aún no tienes objetivos</p>
          <p className="text-sm">Crea uno y ve tu progreso crecer cada vez que ahorres.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}

      {achieved.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-base mb-3">🏆 Cumplidos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achieved.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      <GoalForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
