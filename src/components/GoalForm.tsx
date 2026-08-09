import { useState } from 'react';
import Modal from './Modal';
import EmojiPicker from './EmojiPicker';
import { useStore } from '../store/useStore';
import { useT } from '../i18n/useT';

// Los más habituales para un objetivo de ahorro, a mano sin tener que buscar.
const QUICK_EMOJIS = ['🚗', '💍', '✈️', '🏡', '🎓', '💻', '🐶', '🏝️', '🎸', '👶', '🎁', '🎉'];

export default function GoalForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addGoal = useStore((s) => s.addGoal);
  const { t } = useT();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🚗');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showMoreIcons, setShowMoreIcons] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; target?: boolean }>({});

  const reset = () => {
    setName('');
    setEmoji('🚗');
    setTarget('');
    setDeadline('');
    setShowMoreIcons(false);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(target.replace(',', '.'));
    const nameError = !name.trim();
    const targetError = !targetAmount || targetAmount <= 0;
    if (nameError || targetError) {
      setErrors({ name: nameError, target: targetError });
      return;
    }
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
    <Modal open={open} onClose={onClose} title={t('goals.newTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('goals.chooseIcon')}</label>
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
            {showMoreIcons ? t('goals.fewerIcons') : t('goals.moreIcons')}
          </button>
          {showMoreIcons && (
            <div className="mt-2">
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('goals.whatGoal')}</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((er) => ({ ...er, name: false }));
            }}
            placeholder={t('goals.goalPlaceholder')}
            className={`w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border outline-none font-semibold ${
              errors.name ? 'border-[#e34948]' : 'border-theme focus:border-accent'
            }`}
          />
          {errors.name && <p className="text-xs font-semibold text-[#e34948] mt-1">{t('goals.nameError')}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('goals.targetAmount')}</label>
            <input
              inputMode="decimal"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                if (errors.target) setErrors((er) => ({ ...er, target: false }));
              }}
              placeholder="5000"
              className={`w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border outline-none font-bold ${
                errors.target ? 'border-[#e34948]' : 'border-theme focus:border-accent'
              }`}
            />
            {errors.target && <p className="text-xs font-semibold text-[#e34948] mt-1">{t('goals.amountError')}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('goals.deadline')}</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent"
            />
          </div>
        </div>

        <button type="submit" className="btn-accent font-bold py-3 rounded-2xl text-sm shadow-md">
          {t('goals.create')}
        </button>
      </form>
    </Modal>
  );
}
