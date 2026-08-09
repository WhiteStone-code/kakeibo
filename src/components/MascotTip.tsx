import { useStore } from '../store/useStore';
import { getQuoteForDay } from '../data/quotes';

const MASCOTS: Record<string, string> = {
  zen: '🐢',
  sakura: '🐱',
  neon: '🦊',
  oceano: '🐬',
  bosque: '🦉',
};

export default function MascotTip() {
  const theme = useStore((s) => s.settings.theme);
  const userName = useStore((s) => s.settings.userName);
  const quote = getQuoteForDay();
  const mascot = MASCOTS[theme] ?? '🐢';

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="text-4xl animate-float shrink-0">{mascot}</div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-accent uppercase tracking-wide mb-0.5">
          {userName ? `Consejo para ${userName}` : 'Consejo del día'}
        </p>
        <p className="text-sm leading-snug">{quote}</p>
      </div>
    </div>
  );
}
