import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';
import Modal from './Modal';

interface DataCategory {
  id: string;
  labelKey: string;
  /** Aplica el borrado de esta categoría sobre el estado actual — se
   * combinan todas las categorías marcadas en una sola llamada a setState. */
  clear: (s: ReturnType<typeof useStore.getState>) => Partial<ReturnType<typeof useStore.getState>>;
}

const CATEGORIES: DataCategory[] = [
  { id: 'transactions', labelKey: 'nav.transactions', clear: () => ({ transactions: [] }) },
  { id: 'goals', labelKey: 'nav.goals', clear: () => ({ goals: [], lastCelebratedGoal: null }) },
  { id: 'shoppingList', labelKey: 'nav.shopping', clear: () => ({ shoppingList: [] }) },
  { id: 'reflections', labelKey: 'nav.reflection', clear: () => ({ reflections: [] }) },
  {
    id: 'achievements',
    labelKey: 'nav.achievements',
    clear: () => ({ unlocked: [], lastUnlockedIds: [], shoppingCheckedCount: 0, shoppingListsCompleted: 0 }),
  },
  { id: 'budgets', labelKey: 'settings.budgetsTitle', clear: () => ({ budgets: {} }) },
  { id: 'recurring', labelKey: 'recurring.title', clear: () => ({ recurringItems: [] }) },
  { id: 'customCategories', labelKey: 'settings.categoriesTitle', clear: () => ({ customCategories: [] }) },
];

/** Reemplaza el "borrar todo con un solo confirm()" por un borrado
 * consciente: eliges qué categorías de datos quitar (nunca todo por
 * defecto) y tienes que escribir la palabra de confirmación — así no se
 * pierde nada por un toque de más. */
export default function DeleteDataModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmText, setConfirmText] = useState('');

  const confirmWord = t('settings.deleteConfirmWord');
  const canDelete = selected.size > 0 && confirmText.trim().toUpperCase() === confirmWord.toUpperCase();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES.map((c) => c.id))));
  };

  const handleDelete = () => {
    if (!canDelete) return;
    const state = useStore.getState();
    let patch: Record<string, unknown> = {};
    for (const cat of CATEGORIES) {
      if (selected.has(cat.id)) patch = { ...patch, ...cat.clear(state) };
    }
    useStore.setState(patch);
    setSelected(new Set());
    setConfirmText('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('settings.deleteModalTitle')}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-soft">{t('settings.deleteModalDesc')}</p>

        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-bold text-accent text-left w-fit"
        >
          {selected.size === CATEGORIES.length ? t('settings.deselectAll') : t('settings.selectAll')}
        </button>

        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-app-soft cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(cat.id)}
                onChange={() => toggle(cat.id)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="text-sm font-semibold">{t(cat.labelKey)}</span>
            </label>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="border-t border-theme pt-3 flex flex-col gap-2">
            <p className="text-xs text-soft">{t('settings.deleteConfirmHint', { word: confirmWord })}</p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmWord}
              className="px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-[#e34948] font-bold text-center tracking-widest"
            />
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={!canDelete}
          className="font-bold py-3 rounded-2xl text-sm bg-[#e34948] text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('settings.deleteModalConfirm', { count: selected.size })}
        </button>
      </div>
    </Modal>
  );
}
