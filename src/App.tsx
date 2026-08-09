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
import { ACHIEVEMENTS } from './data/achievements';

export type View =
  | 'dashboard'
  | 'transacciones'
  | 'objetivos'
  | 'logros'
  | 'reflexion'
  | 'ajustes';

export default function App() {
  useApplyTheme();

  const onboarded = useStore((s) => s.settings.onboarded);
  const lastCelebratedGoal = useStore((s) => s.lastCelebratedGoal);
  const lastUnlockedIds = useStore((s) => s.lastUnlockedIds);
  const clearCelebratedGoal = useStore((s) => s.clearCelebratedGoal);
  const clearLastUnlocked = useStore((s) => s.clearLastUnlocked);
  const goals = useStore((s) => s.goals);

  const [view, setView] = useState<View>('dashboard');
  const [formOpen, setFormOpen] = useState(false);

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
      <Sidebar view={view} setView={setView} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar onAdd={() => setFormOpen(true)} />
        <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto">
          {view === 'dashboard' && <Dashboard setView={setView} />}
          {view === 'transacciones' && <TransactionsView />}
          {view === 'objetivos' && <GoalsView />}
          {view === 'logros' && <AchievementsView />}
          {view === 'reflexion' && <ReflectionView />}
          {view === 'ajustes' && <SettingsView />}
        </main>
      </div>

      <MobileNav view={view} setView={setView} />
      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />

      <AnimatePresence>
        {celebratedGoal && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className="fixed top-5 left-1/2 z-[60] card px-5 py-4 shadow-xl flex items-center gap-3"
          >
            <span className="text-3xl">{celebratedGoal.emoji}</span>
            <div>
              <p className="font-display font-bold">¡Objetivo cumplido! 🎉</p>
              <p className="text-sm text-soft">{celebratedGoal.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newAchievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: i * 76, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-[60] card px-5 py-3 shadow-xl flex items-center gap-3"
          >
            <span className="text-3xl">{a.emoji}</span>
            <div>
              <p className="font-display font-bold text-sm">¡Logro desbloqueado!</p>
              <p className="text-sm text-soft">{a.title}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
