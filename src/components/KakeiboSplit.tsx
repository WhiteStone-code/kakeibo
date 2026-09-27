import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useAllCategories } from '../hooks/useCategories';
import { getCategory, EXPENSE_KAKEIBO_GROUP_IDS, KAKEIBO_GROUPS } from '../data/categories';
import { useT } from '../i18n/useT';
import { translateWithFallback } from '../i18n/translations';
import { currentMonthKey } from '../utils/format';

/** El desglose real de los 4 grupos del método Kakeibo (supervivencia /
 * ocio / cultura / extra) — el dato ya existía en cada categoría
 * (`Category.group`) pero no se mostraba en ningún sitio. Barra segmentada
 * en orden fijo con etiqueta directa en cada tramo (nunca solo color, ver
 * skill dataviz) — mode="dashboard" muestra la tarjeta completa,
 * mode="inline" solo la frase para insertar en la Reflexión. */
export default function KakeiboSplit({ monthKey, mode = 'dashboard' }: { monthKey?: string; mode?: 'dashboard' | 'inline' }) {
  const transactions = useStore((s) => s.transactions);
  const mkMode = useStore((s) => s.settings.mode);
  const allCategories = useAllCategories();
  const { t, lang } = useT();
  const month = monthKey ?? currentMonthKey();
  const groupLabel = (id: string) => translateWithFallback(`kakeiboGroup.${id}.label`, lang, KAKEIBO_GROUPS[id].label);

  const { byGroup, total } = useMemo(() => {
    const byGroup: Record<string, number> = {};
    for (const id of EXPENSE_KAKEIBO_GROUP_IDS) byGroup[id] = 0;
    let total = 0;
    for (const tx of transactions) {
      if (tx.type !== 'gasto' || !tx.date.startsWith(month)) continue;
      const cat = getCategory(tx.category, allCategories);
      const group = EXPENSE_KAKEIBO_GROUP_IDS.includes(cat.group as (typeof EXPENSE_KAKEIBO_GROUP_IDS)[number])
        ? cat.group
        : 'extra';
      byGroup[group] = (byGroup[group] ?? 0) + tx.amount;
      total += tx.amount;
    }
    return { byGroup, total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, month, allCategories]);

  // Redondeo por "mayor resto": si cada grupo se redondea por separado
  // (Math.round de cada % suelto), los 4 números pueden sumar 102% o 98%
  // en vez de 100% — hallazgo real de auditoría (ej. reparto 1/1/3/3 de 8
  // da 13+13+38+38=102). Aquí se reparten los puntos exactos y solo el
  // resto sobrante (100 - suma de los redondeos hacia abajo) se asigna a
  // los grupos con mayor parte decimal, así los 4 números siempre suman
  // exactamente 100.
  const pcts = useMemo(() => {
    const result: Record<string, number> = {};
    if (total <= 0) {
      for (const id of EXPENSE_KAKEIBO_GROUP_IDS) result[id] = 0;
      return result;
    }
    const exact = EXPENSE_KAKEIBO_GROUP_IDS.map((id) => ({ id, value: (byGroup[id] / total) * 100 }));
    const floors = exact.map((e) => ({ id: e.id, floor: Math.floor(e.value), remainder: e.value - Math.floor(e.value) }));
    let assigned = floors.reduce((sum, f) => sum + f.floor, 0);
    let leftover = 100 - assigned;
    const byRemainder = [...floors].sort((a, b) => b.remainder - a.remainder);
    for (const id of EXPENSE_KAKEIBO_GROUP_IDS) result[id] = floors.find((f) => f.id === id)!.floor;
    for (let i = 0; i < byRemainder.length && leftover > 0; i++, leftover--) {
      result[byRemainder[i].id] += 1;
    }
    return result;
  }, [byGroup, total]);

  const pct = (id: string) => pcts[id] ?? 0;

  if (mode === 'inline') {
    if (total <= 0) return null;
    return (
      <p className="text-sm text-soft">
        {t('reflection.groupBreakdown', {
          survivalPct: pct('supervivencia'),
          leisurePct: pct('ocio'),
          culturePct: pct('cultura'),
          extraPct: pct('extra'),
        })}
      </p>
    );
  }

  return (
    <div className="card p-5">
      <h2 className="font-display font-bold text-base">{t('kakeiboSplit.title')}</h2>
      <p className="text-xs text-soft mt-0.5 mb-4">{t('kakeiboSplit.subtitle')}</p>

      {total <= 0 ? (
        <p className="text-sm text-soft py-2">{t('kakeiboSplit.empty')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-app-soft">
            {EXPENSE_KAKEIBO_GROUP_IDS.map((id) => {
              const p = pct(id);
              if (p <= 0) return null;
              const group = KAKEIBO_GROUPS[id];
              return (
                <div
                  key={id}
                  style={{
                    width: `${p}%`,
                    background: mkMode === 'dark' ? group.colorDark : group.color,
                  }}
                  title={`${groupLabel(id)} · ${p}%`}
                />
              );
            })}
          </div>
          <ul className="grid grid-cols-2 gap-2.5">
            {EXPENSE_KAKEIBO_GROUP_IDS.map((id) => {
              const group = KAKEIBO_GROUPS[id];
              return (
                <li key={id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: mkMode === 'dark' ? group.colorDark : group.color }}
                    aria-hidden
                  />
                  <span className="shrink-0">{group.emoji}</span>
                  <span className="truncate flex-1 font-medium">{groupLabel(id)}</span>
                  <span className="font-bold tabular-nums shrink-0">{pct(id)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
