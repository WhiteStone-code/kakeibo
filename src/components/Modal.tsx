import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border border-theme shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2 className="font-display font-bold text-xl">{title}</h2>
                <button
                  onClick={onClose}
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
