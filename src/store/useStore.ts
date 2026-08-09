import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Goal,
  MonthlyReflection,
  Transaction,
  UnlockedAchievement,
  UserSettings,
} from '../types';
import { evaluateAchievements } from '../data/achievements';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const todayIso = () => new Date().toISOString().slice(0, 10);

interface StoreState {
  transactions: Transaction[];
  goals: Goal[];
  reflections: MonthlyReflection[];
  unlocked: UnlockedAchievement[];
  settings: UserSettings;
  lastCelebratedGoal: string | null;
  lastUnlockedIds: string[];

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  removeTransaction: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'savedAmount' | 'achieved'>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;

  saveReflection: (r: Omit<MonthlyReflection, 'id' | 'createdAt'>) => void;

  updateSettings: (s: Partial<UserSettings>) => void;
  clearLastUnlocked: () => void;
  clearCelebratedGoal: () => void;

  getStreak: () => number;
  getXp: () => number;
}

const defaultSettings: UserSettings = {
  theme: 'zen',
  mode: 'light',
  currency: '€',
  userName: '',
  monthlyIncomeTarget: 0,
  onboarded: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      reflections: [],
      unlocked: [],
      settings: defaultSettings,
      lastCelebratedGoal: null,
      lastUnlockedIds: [],

      addTransaction: (t) => {
        const tx: Transaction = { ...t, id: uid(), createdAt: Date.now() };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        recomputeAchievements(set, get);
      },

      removeTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },

      addGoal: (g) => {
        const goal: Goal = { ...g, id: uid(), createdAt: Date.now(), savedAmount: 0, achieved: false };
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
            const newAmount = Math.max(0, g.savedAmount + amount);
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

      updateSettings: (s) => {
        set((state) => ({ settings: { ...state.settings, ...s } }));
      },

      clearLastUnlocked: () => set({ lastUnlockedIds: [] }),
      clearCelebratedGoal: () => set({ lastCelebratedGoal: null }),

      getStreak: () => computeStreak(get().transactions),

      getXp: () => computeXp(get().transactions, get().unlocked),
    }),
    { name: 'kakeibo-storage' }
  )
);

function computeStreak(transactions: Transaction[]): number {
  const days = new Set(transactions.map((t) => t.date));
  let streak = 0;
  const cursor = new Date();
  // Si hoy no hay registro, la racha se cuenta desde ayer (para no romperla a medio día)
  if (!days.has(todayIso())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (days.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function computeXp(transactions: Transaction[], unlocked: UnlockedAchievement[]): number {
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
