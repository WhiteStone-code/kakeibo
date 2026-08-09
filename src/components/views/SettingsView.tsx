import { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { THEMES } from '../../data/themes';
import { useExpenseCategories } from '../../hooks/useCategories';
import CategoryManager from '../CategoryManager';
import type { ThemeId } from '../../types';

const CURRENCIES = ['€', '$', '£', 'MXN$', 'ARS$', 'COL$'];

export default function SettingsView() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const budgets = useStore((s) => s.budgets);
  const setBudget = useStore((s) => s.setBudget);
  const expenseCategories = useExpenseCategories();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const state = useStore.getState();
    const payload = JSON.stringify(
      {
        transactions: state.transactions,
        goals: state.goals,
        reflections: state.reflections,
        unlocked: state.unlocked,
        budgets: state.budgets,
        customCategories: state.customCategories,
        settings: state.settings,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kakeibo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        useStore.setState((s) => ({ ...s, ...data }));
        alert('¡Datos importados correctamente! 🌸');
      } catch {
        alert('No se pudo leer el archivo. ¿Seguro que es un backup de Kakeibo?');
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (confirm('Esto borrará todos tus movimientos, objetivos y logros. ¿Continuar?')) {
      useStore.setState({
        transactions: [],
        goals: [],
        reflections: [],
        unlocked: [],
        lastCelebratedGoal: null,
        lastUnlockedIds: [],
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8 max-w-2xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl">Ajustes</h1>
        <p className="text-soft text-sm">Haz de Kakeibo tu espacio</p>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">Tu nombre</label>
        <input
          value={settings.userName}
          onChange={(e) => updateSettings({ userName: e.target.value })}
          placeholder="¿Cómo te llamas?"
          className="px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold"
        />
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">Moneda</label>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => updateSettings({ currency: c })}
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                settings.currency === c ? 'btn-accent' : 'card-soft text-soft'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">Modo</label>
        <div className="flex gap-2 p-1 bg-app-soft rounded-2xl w-fit">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => updateSettings({ mode: m })}
              className={`px-5 py-2 rounded-xl font-bold text-sm ${
                settings.mode === m ? 'btn-accent' : 'text-soft'
              }`}
            >
              {m === 'light' ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">Temática</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id as ThemeId })}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                settings.theme === t.id ? 'border-accent shadow-md' : 'border-theme'
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-sm">{t.name}</p>
                <p className="text-xs text-soft leading-tight truncate">{t.tagline}</p>
              </div>
              <div className="flex -space-x-1.5 shrink-0">
                {t.preview.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-surface"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <CategoryManager />

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">
          Presupuestos por categoría
        </label>
        <p className="text-xs text-soft -mt-1">
          Ponle un límite mensual a las categorías que quieras vigilar. Déjalo en blanco para no
          controlar esa categoría.
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {expenseCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 card-soft px-3 py-2 rounded-xl">
              <span className="text-lg shrink-0">{cat.emoji}</span>
              <span className="text-sm font-semibold flex-1 truncate">{cat.label}</span>
              <input
                inputMode="decimal"
                defaultValue={budgets[cat.id] ?? ''}
                onBlur={(e) => setBudget(cat.id, parseFloat(e.target.value.replace(',', '.')) || 0)}
                placeholder="Sin límite"
                className="w-24 px-2 py-1.5 rounded-lg bg-surface border border-theme outline-none focus:border-accent text-sm text-right font-bold"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">Tus datos</label>
        <p className="text-xs text-soft -mt-1">
          Todo se guarda solo en este ordenador (localStorage). Haz copias de seguridad de vez en
          cuando.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn-accent font-bold px-4 py-2 rounded-xl text-sm">
            ⬇️ Exportar backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="card-soft font-bold px-4 py-2 rounded-xl text-sm"
          >
            ⬆️ Importar backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
          <button
            onClick={resetAll}
            className="font-bold px-4 py-2 rounded-xl text-sm text-[#e34948] hover:bg-[#e3494811]"
          >
            🗑️ Borrar todo
          </button>
        </div>
      </div>
    </div>
  );
}
