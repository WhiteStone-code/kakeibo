import { useEffect, useId, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/useT';

export default function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  const { t } = useT();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Foco: al abrir, se mueve dentro del diálogo (lo anuncia el lector de
  // pantalla y evita que Tab siga recorriendo el resto de la página por
  // detrás); al cerrar, vuelve al elemento que lo abrió. Antes no se movía
  // en ningún sentido — hallazgo real de auditoría, afectaba a todos los
  // modales, incluido el de borrar datos.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else {
      previouslyFocused.current?.focus?.();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-theme shadow-2xl max-h-[90vh] overflow-y-auto outline-none"
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2 id={titleId} className="font-display font-bold text-xl">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label={t('common.close')}
                  className="text-soft hover:text-inherit text-xl leading-none px-2 py-1 rounded-full hover:bg-app-soft"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="p-6 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
