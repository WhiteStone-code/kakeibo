import type { View } from '../App';
import { getThemeMeta } from '../data/themes';
import { useStore } from '../store/useStore';
import { APP_VERSION } from '../data/changelog';
import { useT } from '../i18n/useT';
import { getZodiacSign } from '../data/zodiac';

interface NavItem {
  id: View;
  key: string;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', key: 'nav.dashboard', emoji: '🏠' },
  { id: 'transacciones', key: 'nav.transactions', emoji: '📒' },
  { id: 'objetivos', key: 'nav.goals', emoji: '🎯' },
  { id: 'lista', key: 'nav.shopping', emoji: '🛒' },
  { id: 'invertir', key: 'nav.invest', emoji: '📈' },
  { id: 'logros', key: 'nav.achievements', emoji: '🎖️' },
  { id: 'reflexion', key: 'nav.reflection', emoji: '🧘' },
];

// Ajustes va aparte del resto de secciones — no es "una funcionalidad más",
// es la configuración de todas las demás, así que se separa visualmente.
const SETTINGS_ITEM: NavItem = { id: 'ajustes', key: 'nav.settings', emoji: '⚙️' };

export default function Sidebar({
  view,
  setView,
  onShowWhatsNew,
}: {
  view: View;
  setView: (v: View) => void;
  onShowWhatsNew: () => void;
}) {
  const theme = useStore((s) => s.settings.theme);
  const userName = useStore((s) => s.settings.userName);
  const birthDate = useStore((s) => s.settings.birthDate);
  const showZodiac = useStore((s) => s.settings.showZodiac);
  const themeMeta = getThemeMeta(theme);
  const { t } = useT();
  // Toque curioso, 100% opcional (se puede apagar en Ajustes sin borrar la
  // fecha de nacimiento) — no afecta a nada más de la app.
  const zodiac = showZodiac && birthDate ? getZodiacSign(birthDate) : null;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-surface border-r border-theme p-5 gap-6">
      <div className="flex items-center gap-3 px-1">
        <div className="text-3xl animate-float">{themeMeta.emoji}</div>
        <div>
          <p className="font-display font-bold text-lg leading-tight flex items-center gap-1">
            {t('app.name')} {zodiac && <span title={t('onboarding.yourSign')}>{zodiac.emoji}</span>}
          </p>
          <p className="text-xs text-soft leading-tight">
            {userName ? t('sidebar.greeting', { name: userName }) : t('app.tagline')}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                active
                  ? 'btn-accent shadow-sm'
                  : 'text-soft hover:bg-app-soft hover:text-inherit'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              {t(item.key)}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setView(SETTINGS_ITEM.id)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all border-t border-theme pt-4 -mt-2 ${
          view === SETTINGS_ITEM.id
            ? 'btn-accent shadow-sm'
            : 'text-soft hover:bg-app-soft hover:text-inherit'
        }`}
      >
        <span className="text-lg">{SETTINGS_ITEM.emoji}</span>
        {t(SETTINGS_ITEM.key)}
      </button>

      <div className="mt-auto flex flex-col gap-3">
        <div className="card-soft p-4 text-xs text-soft leading-relaxed">
          <p className="font-semibold text-accent mb-1">{t('sidebar.didYouKnowTitle')}</p>
          <p>{t('sidebar.didYouKnowText')}</p>
        </div>
        <button
          onClick={onShowWhatsNew}
          className="text-[11px] font-bold text-soft hover:text-accent text-center py-1"
        >
          🆕 v{APP_VERSION} · {t('sidebar.whatsNew')}
        </button>
      </div>
    </aside>
  );
}
