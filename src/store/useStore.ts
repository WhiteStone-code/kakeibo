import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Budgets,
  Category,
  Goal,
  MonthlyReflection,
  ShoppingItem,
  Transaction,
  UnlockedAchievement,
  UserSettings,
} from '../types';
import { evaluateAchievements } from '../data/achievements';
import { CUSTOM_CATEGORY_COLORS } from '../data/categories';

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

  addCustomCategory: (c: { label: string; emoji: string }) => void;
  updateCustomCategory: (id: string, patch: { label?: string; emoji?: string }) => void;
  removeCustomCategory: (id: string) => void;

  addShoppingItem: (item: { name: string; estPrice: number | null }) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCheckedShoppingItems: () => void;
  clearShoppingList: () => void;

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
            group: 'extra',
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
        const newItem: ShoppingItem = {
          id: uid(),
          name: item.name.trim(),
          estPrice: item.estPrice !== null ? round2(Math.abs(item.estPrice)) : null,
          checked: false,
          createdAt: Date.now(),
        };
        set((state) => ({ shoppingList: [...state.shoppingList, newItem] }));
      },

      toggleShoppingItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        }));
      },

      removeShoppingItem: (id) => {
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => i.id !== id) }));
      },

      clearCheckedShoppingItems: () => {
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => !i.checked) }));
      },

      clearShoppingList: () => set({ shoppingList: [] }),

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
  const unlockedIds = evaluateAchievements({
    transactions: state.transactions,
    goals: state.goals,
    streak,
    totalSaved,
    monthsTracked,
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
