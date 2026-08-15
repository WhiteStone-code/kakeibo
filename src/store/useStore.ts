import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Budgets,
  Category,
  Goal,
  MonthlyReflection,
  RecurringItem,
  ShoppingItem,
  Transaction,
  UnlockedAchievement,
  UserSettings,
} from '../types';
import { evaluateAchievements } from '../data/achievements';
import { CUSTOM_CATEGORY_COLORS } from '../data/categories';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Redondea a céntimos para que sumas repetidas no acumulen errores de coma flotante. */
const round2 = (n: number) => Math.round(n * 100) / 100;

interface StoreState {
  transactions: Transaction[];
  goals: Goal[];
  reflections: MonthlyReflection[];
  unlocked: UnlockedAchievement[];
  budgets: Budgets;
  customCategories: Category[];
  shoppingList: ShoppingItem[];
  shoppingBudget: number;
  customStores: string[];
  customOccasions: string[];
  frequentItemNames: string[];
  /** Memoria de "la última vez lo compraste en X" por producto (clave en
   * minúsculas) — sobrevive a vaciar la lista, así la próxima vez que
   * apuntes "Leche" te lo recuerda aunque ya hayas comprado y borrado esa
   * lista hace semanas. */
  productStoreHistory: Record<string, string>;
  shoppingCheckedCount: number;
  recurringItems: RecurringItem[];
  settings: UserSettings;
  lastCelebratedGoal: string | null;
  lastUnlockedIds: string[];

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;

  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'savedAmount' | 'achieved'>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;

  saveReflection: (r: Omit<MonthlyReflection, 'id' | 'createdAt'>) => void;

  setBudget: (category: string, amount: number) => void;

  addCustomCategory: (c: { label: string; emoji: string; group?: Category['group'] }) => void;
  updateCustomCategory: (id: string, patch: { label?: string; emoji?: string }) => void;
  removeCustomCategory: (id: string) => void;

  addShoppingItem: (item: {
    name: string;
    estPrice: number | null;
    store?: string | null;
    occasion?: string | null;
    neededBy?: string | null;
  }) => void;
  toggleShoppingItem: (id: string) => void;
  getLastStoreFor: (name: string) => string | null;
  removeShoppingItem: (id: string) => void;
  updateShoppingItem: (
    id: string,
    patch: { name?: string; estPrice?: number | null; store?: string | null; occasion?: string | null; neededBy?: string | null }
  ) => void;
  clearCheckedShoppingItems: () => void;
  clearShoppingList: () => void;
  setShoppingBudget: (amount: number) => void;

  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'createdAt' | 'lastAppliedMonth'>) => void;
  updateRecurringItem: (id: string, patch: Partial<Omit<RecurringItem, 'id' | 'createdAt'>>) => void;
  removeRecurringItem: (id: string) => void;
  applyRecurringItem: (id: string) => void;
  skipRecurringItem: (id: string) => void;

  updateSettings: (s: Partial<UserSettings>) => void;
  clearLastUnlocked: () => void;
  clearCelebratedGoal: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'zen',
  mode: 'light',
  currency: 'EUR',
  userName: '',
  monthlyIncomeTarget: 0,
  onboarded: false,
  lastSeenVersion: '',
  language: 'es',
  periodicGoalEnabled: false,
  periodicGoalAmount: 0,
  periodicGoalFrequency: 'mensual',
  periodicGoalType: 'ahorro',
};

// Símbolos usados antes de pasar a códigos ISO (v1 → v2) — se migran solos.
const LEGACY_CURRENCY_MAP: Record<string, string> = {
  '€': 'EUR', '$': 'USD', '£': 'GBP', 'MXN$': 'MXN', 'ARS$': 'ARS', 'COL$': 'COP',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      reflections: [],
      unlocked: [],
      budgets: {},
      customCategories: [],
      shoppingList: [],
      shoppingBudget: 0,
      customStores: [],
      customOccasions: [],
      frequentItemNames: [],
      productStoreHistory: {},
      shoppingCheckedCount: 0,
      recurringItems: [],
      settings: defaultSettings,
      lastCelebratedGoal: null,
      lastUnlockedIds: [],

      addTransaction: (t) => {
        const tx: Transaction = {
          ...t,
          amount: round2(Math.abs(t.amount)),
          note: t.note.trim(),
          id: uid(),
          createdAt: Date.now(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        recomputeAchievements(set, get);
      },

      removeTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },

      updateTransaction: (id, patch) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  amount: patch.amount !== undefined ? round2(Math.abs(patch.amount)) : t.amount,
                  note: patch.note !== undefined ? patch.note.trim() : t.note,
                }
              : t
          ),
        }));
      },

      addGoal: (g) => {
        const goal: Goal = {
          ...g,
          name: g.name.trim(),
          targetAmount: round2(Math.abs(g.targetAmount)),
          id: uid(),
          createdAt: Date.now(),
          savedAmount: 0,
          achieved: false,
        };
        set((state) => ({ goals: [goal, ...state.goals] }));
        recomputeAchievements(set, get);
      },

      removeGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },

      contributeToGoal: (goalId, amount) => {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const newAmount = round2(Math.max(0, g.savedAmount + amount));
            const achieved = newAmount >= g.targetAmount;
            if (achieved && !g.achieved) {
              setTimeout(() => set({ lastCelebratedGoal: g.id }), 0);
            }
            return { ...g, savedAmount: newAmount, achieved };
          }),
        }));
        recomputeAchievements(set, get);
      },

      saveReflection: (r) => {
        const id = r.month;
        set((state) => ({
          reflections: [
            { ...r, id, createdAt: Date.now() },
            ...state.reflections.filter((x) => x.id !== id),
          ],
        }));
      },

      setBudget: (category, amount) => {
        set((state) => {
          const next = { ...state.budgets };
          if (!amount || amount <= 0) {
            delete next[category];
          } else {
            next[category] = round2(amount);
          }
          return { budgets: next };
        });
      },

      addCustomCategory: (c) => {
        set((state) => {
          const color = CUSTOM_CATEGORY_COLORS[state.customCategories.length % CUSTOM_CATEGORY_COLORS.length];
          const category: Category = {
            id: `custom-${uid()}`,
            label: c.label.trim() || 'Sin nombre',
            emoji: c.emoji || '🏷️',
            color,
            colorDark: color,
            group: c.group ?? 'extra',
            custom: true,
          };
          return { customCategories: [...state.customCategories, category] };
        });
      },

      updateCustomCategory: (id, patch) => {
        set((state) => ({
          customCategories: state.customCategories.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...(patch.label !== undefined ? { label: patch.label.trim() || c.label } : {}),
                  ...(patch.emoji !== undefined ? { emoji: patch.emoji || c.emoji } : {}),
                }
              : c
          ),
        }));
      },

      removeCustomCategory: (id) => {
        set((state) => ({ customCategories: state.customCategories.filter((c) => c.id !== id) }));
      },

      addShoppingItem: (item) => {
        if (!item.name.trim()) return;
        const store = item.store?.trim() || null;
        const occasion = item.occasion?.trim() || null;
        const newItem: ShoppingItem = {
          id: uid(),
          name: item.name.trim(),
          estPrice: item.estPrice !== null ? round2(Math.abs(item.estPrice)) : null,
          store,
          occasion,
          neededBy: item.neededBy || null,
          checked: false,
          createdAt: Date.now(),
        };
        set((state) => {
          // Autocompletado de productos frecuentes (tipo Bring!/AnyList): el
          // más reciente sube arriba, tope de 40 para que no crezca sin fin.
          const nameLower = newItem.name.toLowerCase();
          const frequentItemNames = [
            newItem.name,
            ...state.frequentItemNames.filter((n) => n.toLowerCase() !== nameLower),
          ].slice(0, 40);
          return {
            shoppingList: [...state.shoppingList, newItem],
            customStores:
              store && !state.customStores.includes(store) ? [...state.customStores, store] : state.customStores,
            customOccasions:
              occasion && !state.customOccasions.includes(occasion)
                ? [...state.customOccasions, occasion]
                : state.customOccasions,
            frequentItemNames,
            productStoreHistory: store
              ? { ...state.productStoreHistory, [nameLower]: store }
              : state.productStoreHistory,
          };
        });
      },

      /** "¿Dónde lo compraste la última vez?" — null si nunca se ha
       * comprado ese producto en una tienda concreta. */
      getLastStoreFor: (name) => {
        return get().productStoreHistory[name.trim().toLowerCase()] ?? null;
      },

      toggleShoppingItem: (id) => {
        set((state) => {
          const item = state.shoppingList.find((i) => i.id === id);
          const nowChecking = item && !item.checked;
          return {
            shoppingList: state.shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
            shoppingCheckedCount: nowChecking ? state.shoppingCheckedCount + 1 : state.shoppingCheckedCount,
          };
        });
        recomputeAchievements(set, get);
      },

      removeShoppingItem: (id) => {
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => i.id !== id) }));
      },

      updateShoppingItem: (id, patch) => {
        const store = patch.store !== undefined ? patch.store?.trim() || null : undefined;
        const occasion = patch.occasion !== undefined ? patch.occasion?.trim() || null : undefined;
        set((state) => ({
          shoppingList: state.shoppingList.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...(patch.name !== undefined ? { name: patch.name.trim() || i.name } : {}),
                  ...(patch.estPrice !== undefined
                    ? { estPrice: patch.estPrice !== null ? round2(Math.abs(patch.estPrice)) : null }
                    : {}),
                  ...(store !== undefined ? { store } : {}),
                  ...(occasion !== undefined ? { occasion } : {}),
                  ...(patch.neededBy !== undefined ? { neededBy: patch.neededBy } : {}),
                }
              : i
          ),
          customStores:
            store && !state.customStores.includes(store) ? [...state.customStores, store] : state.customStores,
          customOccasions:
            occasion && !state.customOccasions.includes(occasion)
              ? [...state.customOccasions, occasion]
              : state.customOccasions,
          productStoreHistory: (() => {
            const item = state.shoppingList.find((i) => i.id === id);
            const name = (patch.name ?? item?.name)?.trim().toLowerCase();
            return store && name
              ? { ...state.productStoreHistory, [name]: store }
              : state.productStoreHistory;
          })(),
        }));
      },

      clearCheckedShoppingItems: () => {
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => !i.checked) }));
      },

      clearShoppingList: () => set({ shoppingList: [] }),

      setShoppingBudget: (amount) => set({ shoppingBudget: round2(Math.max(0, amount)) }),

      addRecurringItem: (item) => {
        const newItem: RecurringItem = {
          ...item,
          label: item.label.trim() || 'Sin nombre',
          amount: round2(Math.abs(item.amount)),
          dayOfMonth: Math.min(28, Math.max(1, Math.round(item.dayOfMonth))),
          id: uid(),
          lastAppliedMonth: null,
          createdAt: Date.now(),
        };
        set((state) => ({ recurringItems: [...state.recurringItems, newItem] }));
      },

      updateRecurringItem: (id, patch) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...patch,
                  ...(patch.label !== undefined ? { label: patch.label.trim() || r.label } : {}),
                  ...(patch.amount !== undefined ? { amount: round2(Math.abs(patch.amount)) } : {}),
                  ...(patch.dayOfMonth !== undefined
                    ? { dayOfMonth: Math.min(28, Math.max(1, Math.round(patch.dayOfMonth))) }
                    : {}),
                }
              : r
          ),
        }));
      },

      removeRecurringItem: (id) => {
        set((state) => ({ recurringItems: state.recurringItems.filter((r) => r.id !== id) }));
      },

      applyRecurringItem: (id) => {
        const item = get().recurringItems.find((r) => r.id === id);
        if (!item) return;
        get().addTransaction({
          type: item.type,
          amount: item.amount,
          category: item.category,
          note: item.label,
          date: todayIso(),
        });
        set((state) => ({
          recurringItems: state.recurringItems.map((r) =>
            r.id === id ? { ...r, lastAppliedMonth: currentMonth() } : r
          ),
        }));
      },

      skipRecurringItem: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((r) =>
            r.id === id ? { ...r, lastAppliedMonth: currentMonth() } : r
          ),
        }));
      },

      updateSettings: (s) => {
        set((state) => ({ settings: { ...state.settings, ...s } }));
      },

      clearLastUnlocked: () => set({ lastUnlockedIds: [] }),
      clearCelebratedGoal: () => set({ lastCelebratedGoal: null }),
    }),
    {
      name: 'kakeibo-storage',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as StoreState;
        if (version < 2 && state?.settings) {
          const cur = state.settings.currency;
          if (cur && LEGACY_CURRENCY_MAP[cur]) {
            state.settings.currency = LEGACY_CURRENCY_MAP[cur];
          } else if (cur && cur.length !== 3) {
            state.settings.currency = 'EUR';
          }
        }
        return state;
      },
      // Merge profundo de `settings`: por defecto zustand reemplaza el objeto
      // entero, así que cualquier campo nuevo que añadamos a defaultSettings
      // (idioma, meta periódica...) quedaría `undefined` para quien ya tenía
      // datos guardados de una versión anterior. Con esto siempre parte de
      // los valores por defecto y solo sobreescribe lo que sí venía guardado.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
    }
  )
);

/** Racha de días consecutivos con al menos un movimiento registrado (incluye hoy o ayer). */
export function computeStreak(transactions: Transaction[]): number {
  const days = new Set(transactions.map((t) => t.date));
  let streak = 0;
  const cursor = new Date();
  // Si hoy no hay registro, la racha se cuenta desde ayer (para no romperla a medio día)
  if (!days.has(todayIso())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeXp(transactions: Transaction[], unlocked: UnlockedAchievement[]): number {
  const days = new Set(transactions.map((t) => t.date)).size;
  return days * 10 + transactions.length * 5 + unlocked.length * 50;
}

function recomputeAchievements(
  set: (fn: (s: StoreState) => Partial<StoreState>) => void,
  get: () => StoreState
) {
  const state = get();
  const totalSaved = state.goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const monthsTracked = new Set(state.transactions.map((t) => t.date.slice(0, 7))).size;
  const streak = computeStreak(state.transactions);
  const distinctStoresUsed = new Set(state.shoppingList.filter((i) => i.store).map((i) => i.store)).size;
  const unlockedIds = evaluateAchievements({
    transactions: state.transactions,
    goals: state.goals,
    streak,
    totalSaved,
    monthsTracked,
    shoppingCheckedCount: state.shoppingCheckedCount,
    distinctStoresUsed,
  });
  const existingIds = new Set(state.unlocked.map((u) => u.id));
  const newlyUnlocked = unlockedIds.filter((id) => !existingIds.has(id));
  if (newlyUnlocked.length > 0) {
    set((s) => ({
      unlocked: [
        ...s.unlocked,
        ...newlyUnlocked.map((id) => ({ id, unlockedAt: Date.now() })),
      ],
      lastUnlockedIds: newlyUnlocked,
    }));
  }
}
