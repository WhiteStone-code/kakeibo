import Modal from './Modal';
import { CHANGELOG, APP_VERSION } from '../data/changelog';
import { useT } from '../i18n/useT';

export default function WhatsNewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useT();
  return (
    <Modal open={open} onClose={onClose} title={t('whatsnew.title')}>
      <div className="flex flex-col gap-5 -mt-1">
        <p className="text-sm text-soft -mt-2">
          {t('whatsnew.subtitle')}
          {lang !== 'es' && <span className="block text-xs mt-0.5">{t('whatsnew.spanishNote')}</span>}
        </p>
        {CHANGELOG.map((entry) => (
          <div key={entry.version} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  entry.version === APP_VERSION ? 'btn-accent' : 'card-soft text-soft'
                }`}
              >
                v{entry.version}
              </span>
              <span className="w-px flex-1 bg-theme border-l border-theme mt-1.5" />
            </div>
            <div className="pb-1 min-w-0">
              <p className="font-display font-bold text-sm">{entry.title}</p>
              <p className="text-xs text-soft mb-1.5">{entry.date}</p>
              <ul className="flex flex-col gap-1">
                {entry.items.map((item, i) => (
                  <li key={i} className="text-sm flex gap-1.5">
                    <span className="text-accent shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        <button onClick={onClose} className="btn-accent font-bold py-2.5 rounded-2xl text-sm">
          {t('whatsnew.close')}
        </button>
      </div>
    </Modal>
  );
}
