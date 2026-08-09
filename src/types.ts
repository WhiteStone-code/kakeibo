// Tipos centrales de la aplicación Kakeibo

export type TransactionType = 'gasto' | 'ingreso';

export type CategoryId =
  | 'comida'
  | 'compras'
  | 'ropa'
  | 'social'
  | 'transporte'
  | 'vivienda'
  | 'salud'
  | 'educacion'
  | 'ocio'
  | 'ahorro'
  | 'suscripciones'
  | 'ingresos'
  | 'otros';

/** Los 4 grupos tradicionales del método Kakeibo japonés */
export type KakeiboGroup = 'supervivencia' | 'ocio' | 'cultura' | 'extra' | 'ingreso';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Colores validados (contraste + distinguibilidad CVD) para modo claro y oscuro. */
  color: string;
  colorDark: string;
  group: KakeiboGroup;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  note: string;
  date: string; // ISO yyyy-MM-dd
  createdAt: number;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null; // ISO date
  color: string;
  createdAt: number;
  achieved: boolean;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
}

export interface MonthlyReflection {
  id: string; // yyyy-MM
  month: string;
  disponible: number;
  deseoAhorrar: number;
  gastoReal: number; // calculado
  comoMejorar: string;
  createdAt: number;
}

export type ThemeId = 'zen' | 'sakura' | 'neon' | 'oceano' | 'bosque';
export type ColorMode = 'light' | 'dark';

export interface AchievementDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  transactions: Transaction[];
  goals: Goal[];
  streak: number;
  totalSaved: number;
  monthsTracked: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export interface UserSettings {
  theme: ThemeId;
  mode: ColorMode;
  currency: string;
  userName: string;
  monthlyIncomeTarget: number;
  onboarded: boolean;
}
