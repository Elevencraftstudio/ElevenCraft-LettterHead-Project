import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useFocusTrap, useReducedMotion } from '../../accessibility';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'primary', loading,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const containerRef = useFocusTrap(open);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white',
  };
  const iconColors = {
    danger: 'text-red-400 bg-red-600/10 border-red-500/30',
    primary: 'text-indigo-400 bg-indigo-600/10 border-indigo-500/30',
    warning: 'text-amber-400 bg-amber-600/10 border-amber-500/30',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="relative bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="alertdialog"
            aria-label={title}
            aria-describedby="confirm-dialog-message"
          >
            <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition cursor-pointer" aria-label="Close dialog">
              <X size={16} />
            </button>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl border ${iconColors[variant]} shrink-0`} aria-hidden="true">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-slate-100" id="confirm-dialog-title">{title}</h2>
                  <p id="confirm-dialog-message" className="text-xs text-slate-400 mt-1.5 leading-relaxed">{message}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 pb-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
                aria-busy={loading}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}