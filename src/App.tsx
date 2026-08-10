import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { useApplyTheme } from './hooks/useApplyTheme';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import TopBar from './components/TopBar';
import TransactionForm from './components/TransactionForm';
import Onboarding from './components/Onboarding';
import Dashboard from './components/views/Dashboard';
import TransactionsView from './components/views/TransactionsView';
import GoalsView from './components/views/GoalsView';
import AchievementsView from './components/views/AchievementsView';
import ReflectionView from './components/views/ReflectionView';
import SettingsView from './components/views/SettingsView';
import InvestView from './components/views/InvestView';
import ShoppingListView from './components/views/ShoppingListView';
import WhatsNewModal from './components/WhatsNewModal';
import { ACHIEVEMENTS } from './data/achievements';
import { APP_VERSION } from './data/changelog';
import { useT } from './i18n/useT';
import { translateWithFallback } from './i18n/translations';
import type { Transaction } from './types';

export type View =
  | 'dashboard'
  | 'transacciones'
  | 'objetivos'
  | 'logros'
  | 'reflexion'
  | 'invertir'
  | 'lista'
  | 'ajustes';

export default function App() {
  useApplyTheme();
  const { t, lang } = useT();

  const onboarded = useStore((s) => s.settings.onboarded);
  const lastSeenVersion = useStore((s) => s.settings.lastSeenVersion);
  const updateSettings = useStore((s) => s.updateSettings);
  const lastCelebratedGoal = useStore((s) => s.lastCelebratedGoal);
  const lastUnlockedIds = useStore((s) => s.lastUnlockedIds);
  const clearCelebratedGoal = useStore((s) => s.clearCelebratedGoal);
  const clearLastUnlocked = useStore((s) => s.clearLastUnlocked);
  const goals = useStore((s) => s.goals);

  const [view, setView] = useState<View>('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  const openNewTransaction = () => {
    setEditingTx(null);
    setFormOpen(true);
  };
  const openEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setFormOpen(true);
  };
  const closeTransactionForm = () => {
    setFormOpen(false);
    setEditingTx(null);
  };

  // Si hay una versión nueva desde la última vez que abrió la app, se lo
  // enseñamos automáticamente una vez (y solo una vez) al entrar.
  useEffect(() => {
    if (onboarded && lastSeenVersion !== APP_VERSION) {
      setWhatsNewOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded]);

  const closeWhatsNew = () => {
    setWhatsNewOpen(false);
    updateSettings({ lastSeenVersion: APP_VERSION });
  };

  // Confetti al cumplir un objetivo
  useEffect(() => {
    if (!lastCelebratedGoal) return;
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    const t = setTimeout(clearCelebratedGoal, 4000);
    return () => clearTimeout(t);
  }, [lastCelebratedGoal, clearCelebratedGoal]);

  // Confetti pequeño al desbloquear un logro
  useEffect(() => {
    if (lastUnlockedIds.length === 0) return;
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.15 }, gravity: 0.7, scalar: 0.8 });
    const t = setTimeout(clearLastUnlocked, 3500);
    return () => clearTimeout(t);
  }, [lastUnlockedIds, clearLastUnlocked]);

  if (!onboarded) return <Onboarding />;

  const celebratedGoal = goals.find((g) => g.id === lastCelebratedGoal);
  const newAchievements = ACHIEVEMENTS.filter((a) => lastUnlockedIds.includes(a.id));

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar view={view} setView={setView} onShowWhatsNew={() => setWhatsNewOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar onAdd={openNewTransaction} />
        <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto">
          {view === 'dashboard' && <Dashboard setView={setView} onAddTransaction={openNewTransaction} />}
          {view === 'transacciones' && <TransactionsView onEdit={openEditTransaction} />}
          {view === 'objetivos' && <GoalsView />}
          {view === 'logros' && <AchievementsView />}
          {view === 'reflexion' && <ReflectionView />}
          {view === 'invertir' && <InvestView />}
          {view === 'lista' && <ShoppingListView />}
          {view === 'ajustes' && <SettingsView />}
        </main>
      </div>

      <MobileNav view={view} setView={setView} />
      <TransactionForm open={formOpen} onClose={closeTransactionForm} editing={editingTx} />
      <WhatsNewModal open={whatsNewOpen} onClose={closeWhatsNew} />

      {/* Cola de notificaciones de celebración: en la esquina superior derecha para
          no tapar nunca la racha/nivel de la barra superior (a la izquierda). */}
      <div className="fixed bottom-20 left-3 right-3 md:left-auto md:bottom-auto md:top-20 md:right-4 z-[60] flex flex-col gap-2.5 items-end pointer-events-none">
        <AnimatePresence>
          {celebratedGoal && (
            <motion.div
              key="goal-toast"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="card px-5 py-4 shadow-xl flex items-center gap-3 max-w-xs pointer-events-auto"
            >
              <span className="text-3xl">{celebratedGoal.emoji}</span>
              <div>
                <p className="font-display font-bold">{t('goals.achievedBadge')}</p>
                <p className="text-sm text-soft">{celebratedGoal.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {newAchievements.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="card px-5 py-3 shadow-xl flex items-center gap-3 max-w-xs pointer-events-auto"
            >
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <p className="font-display font-bold text-sm">{t('achievements.unlocked')}</p>
                <p className="text-sm text-soft">{translateWithFallback(`ach.${a.id}.title`, lang, a.title)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
