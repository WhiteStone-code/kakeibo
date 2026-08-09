import { useState } from 'react';
import Modal from './Modal';
import EmojiPicker from './EmojiPicker';
import { useStore } from '../store/useStore';

// Los más habituales para un objetivo de ahorro, a mano sin tener que buscar.
const QUICK_EMOJIS = ['🚗', '💍', '✈️', '🏡', '🎓', '💻', '🐶', '🏝️', '🎸', '👶', '🎁', '🎉'];

export default function GoalForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addGoal = useStore((s) => s.addGoal);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🚗');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showMoreIcons, setShowMoreIcons] = useState(false);

  const reset = () => {
    setName('');
    setEmoji('🚗');
    setTarget('');
    setDeadline('');
    setShowMoreIcons(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(target.replace(',', '.'));
    if (!name.trim() || !targetAmount || targetAmount <= 0) return;
    addGoal({
      name: name.trim(),
      emoji,
      targetAmount,
      deadline: deadline || null,
      color: 'var(--accent)',
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo objetivo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">Elige un icono</label>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {QUICK_EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className="text-2xl py-2 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: emoji === e ? 'var(--accent)' : 'var(--border)',
                  background: emoji === e ? 'var(--accent)22' : 'var(--surface-2)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMoreIcons((v) => !v)}
            className="text-xs font-bold text-accent mt-2"
          >
            {showMoreIcons ? '↑ Ocultar iconos' : '↓ Ver más iconos'}
          </button>
          {showMoreIcons && (
            <div className="mt-2">
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">
            ¿Cuál es tu meta?
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Coche nuevo, Boda, Viaje a Japón…"
            className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">
              Cantidad objetivo
            </label>
            <input
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="5000"
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">
              Fecha límite (opcional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
        </div>

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          Crear objetivo 🎯
        </button>
      </form>
    </Modal>
  );
}
