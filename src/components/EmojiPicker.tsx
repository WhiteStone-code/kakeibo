import { useMemo, useState } from 'react';
import { EMOJI_LIBRARY } from '../data/emojiLibrary';

/** Selector de emoji con buscador, agrupado por temas — usado al crear
 * categorías y objetivos. */
export default function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_LIBRARY;
    return EMOJI_LIBRARY.map((g) => ({
      ...g,
      options: g.options.filter(
        (o) => o.keywords.includes(q) || g.label.toLowerCase().includes(q)
      ),
    })).filter((g) => g.options.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-2.5">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Buscar icono (ej: perro, gimnasio, viaje…)"
        className="px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm"
      />
      <div className="max-h-52 overflow-y-auto flex flex-col gap-3 pr-1">
        {groups.length === 0 && (
          <p className="text-xs text-soft text-center py-3">Sin resultados para "{query}"</p>
        )}
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-1.5">
              {g.label}
            </p>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {g.options.map((o) => (
                <button
                  type="button"
                  key={o.emoji}
                  onClick={() => onChange(o.emoji)}
                  title={o.keywords}
                  className="text-lg py-1.5 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: value === o.emoji ? 'var(--accent)' : 'var(--border)',
                    background: value === o.emoji ? 'var(--accent)22' : 'var(--surface-2)',
                  }}
                >
                  {o.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
