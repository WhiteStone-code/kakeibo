import { useStore } from '../store/useStore';
import { getLevelForXp, getNextLevel } from '../data/levels';

export default function TopBar({ onAdd }: { onAdd: () => void }) {
  const unlocked = useStore((s) => s.unlocked);
  const getStreak = useStore((s) => s.getStreak);
  const getXp = useStore((s) => s.getXp);

  const streak = getStreak();
  const xp = getXp();
  const level = getLevelForXp(xp);
  const next = getNextLevel(xp);
  const progressPct = next
    ? Math.round(((xp - level.minXp) / (next.minXp - level.minXp)) * 100)
    : 100;

  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-b border-theme bg-surface/70 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="font-display font-bold text-sm flex items-center gap-1.5">
            <span>{level.emoji}</span> {level.title}
          </span>
          <div className="w-40 h-1.5 rounded-full bg-app-soft mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 card-soft px-3 py-1.5 rounded-full text-sm font-bold">
          <span>🔥</span>
          <span>{streak}</span>
          <span className="text-soft font-medium hidden sm:inline">días</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 card-soft px-3 py-1.5 rounded-full text-sm font-bold">
          <span>🎖️</span>
          <span>{unlocked.length}</span>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="btn-accent flex items-center gap-2 font-bold px-4 py-2.5 rounded-2xl text-sm shadow-md"
      >
        <span className="text-lg leading-none">+</span>
        <span className="hidden sm:inline">Añadir movimiento</span>
      </button>
    </header>
  );
}
