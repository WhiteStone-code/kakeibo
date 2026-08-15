import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { THEMES } from '../../data/themes';
import { useExpenseCategories, useAllCategories } from '../../hooks/useCategories';
import { useCategoryLabel } from '../../i18n/useCategoryLabel';
import { useT } from '../../i18n/useT';
import { translateWithFallback } from '../../i18n/translations';
import CategoryManager from '../CategoryManager';
import RecurringManager from '../RecurringManager';
import CurrencyPicker from '../CurrencyPicker';
import LiveRateTicker from '../LiveRateTicker';
import type { ThemeId } from '../../types';

export default function SettingsView() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const budgets = useStore((s) => s.budgets);
  const setBudget = useStore((s) => s.setBudget);
  const expenseCategories = useExpenseCategories();
  const allCategories = useAllCategories();
  const categoryLabel = useCategoryLabel();
  const { t, lang } = useT();
  const themeName = (id: string, fallback: string) => translateWithFallback(`theme.${id}.name`, lang, fallback);
  const themeTagline = (id: string, fallback: string) => translateWithFallback(`theme.${id}.tagline`, lang, fallback);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

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
        shoppingList: state.shoppingList,
        shoppingBudget: state.shoppingBudget,
        customStores: state.customStores,
        customOccasions: state.customOccasions,
        frequentItemNames: state.frequentItemNames,
        recurringItems: state.recurringItems,
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
        alert(t('settings.importSuccess'));
      } catch {
        alert(t('settings.importError'));
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    if (confirm(t('settings.resetConfirm'))) {
      useStore.setState({
        transactions: [],
        goals: [],
        reflections: [],
        unlocked: [],
        budgets: {},
        shoppingList: [],
        lastCelebratedGoal: null,
        lastUnlockedIds: [],
      });
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      // Carga bajo demanda: exceljs pesa bastante y solo hace falta cuando
      // se pulsa este botón, no en cada arranque de la app.
      const { exportToExcel } = await import('../../utils/exportExcel');
      const state = useStore.getState();
      await exportToExcel(state, allCategories);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8 max-w-2xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl">{t('settings.title')}</h1>
        <p className="text-soft text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="card p-5 flex flex-col gap-2 border-2 border-accent/30">
        <p className="font-display font-bold text-sm">{t('settings.privacyTitle')}</p>
        <p className="text-sm text-soft leading-relaxed">{t('settings.privacyBody')}</p>
        <p className="text-xs text-soft italic border-t border-theme pt-2 mt-1">{t('settings.privacyNote')}</p>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.name')}</label>
        <input
          value={settings.userName}
          onChange={(e) => updateSettings({ userName: e.target.value })}
          placeholder={t('settings.namePlaceholder')}
          className="px-3 py-2.5 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-semibold"
        />
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.currency')}</label>
        <CurrencyPicker value={settings.currency} onChange={(currency) => updateSettings({ currency })} />
        <div className="border-t border-theme pt-3">
          <p className="text-[11px] font-bold text-soft uppercase tracking-wide mb-1.5">{t('settings.liveRate')}</p>
          <LiveRateTicker base={settings.currency} />
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.mode')}</label>
        <div className="flex gap-2 p-1 bg-app-soft rounded-2xl w-fit">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => updateSettings({ mode: m })}
              className={`px-5 py-2 rounded-xl font-bold text-sm ${
                settings.mode === m ? 'btn-accent' : 'text-soft'
              }`}
            >
              {m === 'light' ? t('settings.light') : t('settings.dark')}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.theme')}</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => updateSettings({ theme: th.id as ThemeId })}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${
                settings.theme === th.id ? 'border-accent shadow-md' : 'border-theme'
              }`}
            >
              <span className="text-2xl">{th.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-sm">{themeName(th.id, th.name)}</p>
                <p className="text-xs text-soft leading-tight truncate">{themeTagline(th.id, th.tagline)}</p>
              </div>
              <div className="flex -space-x-1.5 shrink-0">
                {th.preview.map((c, i) => (
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

      <div className="card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-soft uppercase tracking-wide">
            {t('settings.periodicGoal')}
          </label>
          <button
            onClick={() => updateSettings({ periodicGoalEnabled: !settings.periodicGoalEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.periodicGoalEnabled ? 'bg-accent' : 'bg-app-soft'
            }`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-all"
              style={{ left: settings.periodicGoalEnabled ? '22px' : '2px' }}
            />
          </button>
        </div>
        <p className="text-xs text-soft -mt-1">{t('settings.periodicGoalDesc')}</p>
        {settings.periodicGoalEnabled && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 p-1 bg-app-soft rounded-2xl w-fit">
              {(['ahorro', 'gasto_max'] as const).map((pg) => (
                <button
                  key={pg}
                  onClick={() => updateSettings({ periodicGoalType: pg })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    settings.periodicGoalType === pg ? 'btn-accent' : 'text-soft'
                  }`}
                >
                  {pg === 'ahorro' ? t('settings.saveAtLeast') : t('settings.spendAtMost')}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                inputMode="decimal"
                defaultValue={settings.periodicGoalAmount || ''}
                onBlur={(e) =>
                  updateSettings({ periodicGoalAmount: parseFloat(e.target.value.replace(',', '.')) || 0 })
                }
                placeholder="0.00"
                className="w-32 px-3 py-2 rounded-xl bg-surface-2 border border-theme outline-none focus:border-accent font-bold"
              />
              <div className="flex gap-1 p-1 bg-app-soft rounded-xl">
                {(['semanal', 'mensual'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSettings({ periodicGoalFrequency: f })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      settings.periodicGoalFrequency === f ? 'btn-accent' : 'text-soft'
                    }`}
                  >
                    {f === 'semanal' ? t('settings.weekly') : t('settings.monthly')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <RecurringManager />

      <CategoryManager />

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.budgetsTitle')}</label>
        <p className="text-xs text-soft -mt-1">{t('settings.budgetsDesc')}</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {expenseCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 card-soft px-3 py-2 rounded-xl">
              <span className="text-lg shrink-0">{cat.emoji}</span>
              <span className="text-sm font-semibold flex-1 truncate">{categoryLabel(cat)}</span>
              <input
                inputMode="decimal"
                defaultValue={budgets[cat.id] ?? ''}
                onBlur={(e) => setBudget(cat.id, parseFloat(e.target.value.replace(',', '.')) || 0)}
                placeholder={t('common.unlimited')}
                className="w-24 px-2 py-1.5 rounded-lg bg-surface border border-theme outline-none focus:border-accent text-sm text-right font-bold"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 flex flex-col gap-3">
        <label className="text-xs font-bold text-soft uppercase tracking-wide">{t('settings.dataTitle')}</label>
        <p className="text-xs text-soft -mt-1">{t('settings.dataDesc')}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn-accent font-bold px-4 py-2 rounded-xl text-sm">
            {t('settings.exportJson')}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="card-soft font-bold px-4 py-2 rounded-xl text-sm text-accent disabled:opacity-60"
          >
            {exporting ? t('settings.exporting') : t('settings.exportExcel')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="card-soft font-bold px-4 py-2 rounded-xl text-sm"
          >
            {t('settings.importBackup')}
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
            {t('settings.deleteAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
