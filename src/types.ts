// Tipos centrales de la aplicación Kakeibo

export type TransactionType = 'gasto' | 'ingreso';

// Las categorías por defecto usan estos ids fijos; las categorías creadas
// por el usuario llevan un id generado (ver store: `custom-xxxxx`). Por eso
// `CategoryId` ya no es un tipo cerrado — es una guía de los ids de fábrica,
// pero `Transaction.category` acepta cualquier string para soportar las
// categorías personalizadas.
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
  id: string;
  label: string;
  emoji: string;
  /** Colores validados (contraste + distinguibilidad CVD) para modo claro y oscuro. */
  color: string;
  colorDark: string;
  group: KakeiboGroup;
  /** true en las categorías creadas por el usuario (se pueden editar/borrar). */
  custom?: boolean;
}

export type PaymentMethod = 'tarjeta' | 'efectivo' | 'movil' | 'transferencia';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  /** Dónde se hizo (tienda, restaurante...) — opcional, para saber dónde compras cada cosa. */
  place?: string | null;
  paymentMethod?: PaymentMethod;
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

export type Budgets = Record<string, number>;

export interface ShoppingItem {
  id: string;
  name: string;
  estPrice: number | null;
  /** Nota personal: dónde comprarlo mejor/más barato, o lo que sea útil recordar. */
  note: string | null;
  checked: boolean;
  createdAt: number;
}

export type PeriodicGoalType = 'ahorro' | 'gasto_max';
export type PeriodicGoalFrequency = 'semanal' | 'mensual';

export interface UserSettings {
  theme: ThemeId;
  mode: ColorMode;
  currency: string;
  userName: string;
  monthlyIncomeTarget: number;
  onboarded: boolean;
  /** Última versión cuyo "Novedades" ya vio el usuario (ver data/changelog.ts). */
  lastSeenVersion: string;
  language: LanguageCode;
  /** Meta periódica opcional: "ahorra al menos X" o "no gastes más de X" cada semana/mes. */
  periodicGoalEnabled: boolean;
  periodicGoalAmount: number;
  periodicGoalFrequency: PeriodicGoalFrequency;
  periodicGoalType: PeriodicGoalType;
}

export type LanguageCode = 'es' | 'en' | 'pt' | 'it' | 'fr' | 'de';
