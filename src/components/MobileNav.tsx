import type { View } from '../App';

const NAV_ITEMS: { id: View; label: string; emoji: string }[] = [
  { id: 'dashboard', label: 'Panel', emoji: '🏠' },
  { id: 'transacciones', label: 'Movs', emoji: '📒' },
  { id: 'objetivos', label: 'Metas', emoji: '🎯' },
  { id: 'logros', label: 'Logros', emoji: '🎖️' },
  { id: 'ajustes', label: 'Ajustes', emoji: '⚙️' },
];

export default function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-theme flex justify-around px-1 py-2 z-40">
      {NAV_ITEMS.map((item) => {
        const active = item.id === view;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[11px] font-semibold ${
              active ? 'text-accent' : 'text-soft'
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
