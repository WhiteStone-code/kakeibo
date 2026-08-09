import { useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORY_EMOJI_CHOICES, categoryColor } from '../data/categories';

/** Alta, edición y borrado de categorías propias de movimiento. */
export default function CategoryManager() {
  const customCategories = useStore((s) => s.customCategories);
  const addCustomCategory = useStore((s) => s.addCustomCategory);
  const updateCustomCategory = useStore((s) => s.updateCustomCategory);
  const removeCustomCategory = useStore((s) => s.removeCustomCategory);
  const mode = useStore((s) => s.settings.mode);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState(CATEGORY_EMOJI_CHOICES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    addCustomCategory({ label: label.trim(), emoji });
    setLabel('');
    setEmoji(CATEGORY_EMOJI_CHOICES[Math.floor(Math.random() * CATEGORY_EMOJI_CHOICES.length)]);
    setAdding(false);
  };

  const startEdit = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditLabel(currentLabel);
  };

  const saveEdit = (id: string) => {
    updateCustomCategory(id, { label: editLabel });
    setEditingId(null);
  };

  return (
    <div className="card p-5 flex flex-col gap-3">
      <label className="text-xs font-bold text-soft uppercase tracking-wide">Tus categorías</label>
      <p className="text-xs text-soft -mt-1">
        Además de las 12 de fábrica, crea las tuyas: mascota, gimnasio, tabaco, lo que gastes de
        verdad.
      </p>

      {customCategories.length > 0 && (
        <ul className="flex flex-col gap-2">
          {customCategories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2 card-soft px-3 py-2 rounded-xl">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: categoryColor(cat, mode) }}
              />
              <span className="text-lg shrink-0">{cat.emoji}</span>
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={() => saveEdit(cat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                  className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-surface border border-theme outline-none focus:border-accent text-sm font-semibold"
                />
              ) : (
                <button
                  onClick={() => startEdit(cat.id, cat.label)}
                  className="flex-1 min-w-0 text-left text-sm font-semibold truncate hover:text-accent"
                  title="Editar nombre"
                >
                  {cat.label}
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm(`¿Borrar la categoría "${cat.label}"? Los movimientos ya guardados con ella se quedan como "Otros".`)) {
                    removeCustomCategory(cat.id);
                  }
                }}
                className="text-soft hover:text-[#e34948] text-sm px-1 shrink-0"
                title="Eliminar categoría"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={submitNew} className="card-soft p-3 rounded-xl flex flex-col gap-3">
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
            {CATEGORY_EMOJI_CHOICES.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className="text-lg py-1.5 rounded-lg border-2 transition-all"
                style={{
                  borderColor: emoji === e ? 'var(--accent)' : 'var(--border)',
                  background: emoji === e ? 'var(--accent)22' : 'var(--surface)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nombre de la categoría (ej: Gimnasio)"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm font-semibold"
            />
            <button type="submit" className="btn-accent font-bold px-4 rounded-xl text-sm">
              Crear
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-soft font-bold px-3 rounded-xl text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="card-soft text-accent font-bold py-2.5 rounded-xl text-sm"
        >
          + Crear categoría
        </button>
      )}
    </div>
  );
}
