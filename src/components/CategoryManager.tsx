import { useState } from 'react';
import { useStore } from '../store/useStore';
import { categoryColor } from '../data/categories';
import { ALL_EMOJIS } from '../data/emojiLibrary';
import { useCategoryLabel } from '../i18n/useCategoryLabel';
import { useT } from '../i18n/useT';
import EmojiPicker from './EmojiPicker';

const randomEmoji = () => ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)];

/** Alta, edición y borrado de categorías propias de movimiento. */
export default function CategoryManager() {
  const customCategories = useStore((s) => s.customCategories);
  const transactions = useStore((s) => s.transactions);
  const addCustomCategory = useStore((s) => s.addCustomCategory);
  const updateCustomCategory = useStore((s) => s.updateCustomCategory);
  const removeCustomCategory = useStore((s) => s.removeCustomCategory);
  const mode = useStore((s) => s.settings.mode);
  const categoryLabel = useCategoryLabel();
  const { t } = useT();

  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<'gasto' | 'ingreso'>('gasto');
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState(randomEmoji);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    addCustomCategory({ label: label.trim(), emoji, group: kind === 'ingreso' ? 'ingreso' : 'extra' });
    setLabel('');
    setEmoji(randomEmoji());
    setKind('gasto');
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

  const handleDelete = (id: string, name: string) => {
    const count = transactions.filter((tx) => tx.category === id).length;
    const msg =
      count > 0
        ? t('category.deleteConfirmWithUse', { name, count })
        : t('category.deleteConfirmNoUse', { name });
    if (confirm(msg)) removeCustomCategory(id);
  };

  return (
    <div className="card p-5 flex flex-col gap-3">
      <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.categoriesTitle')}</label>
      <p className="text-xs text-soft -mt-1">{t('settings.categoriesDesc')}</p>

      {customCategories.length > 0 && (
        <ul className="flex flex-col gap-2">
          {customCategories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2 card-soft px-3 py-2 rounded-xl">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: categoryColor(cat, mode) }}
              />
              <span className="text-lg shrink-0">{cat.emoji}</span>
              <span className="text-[10px] shrink-0" title={cat.group === 'ingreso' ? t('txform.income') : t('txform.expense')}>
                {cat.group === 'ingreso' ? '💰' : '💸'}
              </span>
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
                  title={t('category.editName')}
                >
                  {categoryLabel(cat)}
                </button>
              )}
              <button
                onClick={() => handleDelete(cat.id, cat.label)}
                className="text-soft hover:text-[#e34948] text-sm px-1 shrink-0"
                title={t('category.deleteTitle')}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={submitNew} className="card-soft p-3 rounded-xl flex flex-col gap-3">
          <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit">
            {(['gasto', 'ingreso'] as const).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  kind === k ? 'btn-accent' : 'text-soft'
                }`}
              >
                {k === 'gasto' ? t('txform.expense') : t('txform.income')}
              </button>
            ))}
          </div>
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <div className="flex gap-2">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('settings.categoryNamePlaceholder')}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-surface border border-theme outline-none focus:border-accent text-sm font-semibold"
            />
            <button type="submit" className="btn-accent font-bold px-4 rounded-xl text-sm">
              {t('common.create')}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-soft font-bold px-3 rounded-xl text-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="card-soft text-accent font-bold py-2.5 rounded-xl text-sm"
        >
          {t('settings.createCategory')}
        </button>
      )}
    </div>
  );
}
