import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, RotateCcw, Loader2 } from 'lucide-react';
import { useStore, AppNotification } from '../../store';
import { useReducedMotion, announce } from '../../accessibility';

const ICONS: Record<string, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
  loading: Loader2,
};

const COLORS: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-600/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-600/10 text-blue-400',
  warning: 'border-amber-500/30 bg-amber-600/10 text-amber-400',
  loading: 'border-indigo-500/30 bg-indigo-600/10 text-indigo-400',
};

function ToastItem({ notification }: { notification: AppNotification }) {
  const removeNotification = useStore((s) => s.removeNotification);
  const Icon = ICONS[notification.type];
  const isPromise = !!(notification as any).promise;
  const reducedMotion = useReducedMotion();
  const announcedRef = useRef(false);

  useEffect(() => {
    if (isPromise) return;
    const duration = notification.duration || 4000;
    const timer = setTimeout(() => removeNotification(notification.id), duration);
    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, removeNotification, isPromise]);

  useEffect(() => {
    if (!announcedRef.current) {
      announcedRef.current = true;
      announce(notification.message, notification.type === 'error' ? 'assertive' : 'polite');
    }
  }, [notification.message, notification.type]);

  const handleUndo = useCallback(() => {
    (notification as any).onUndo?.();
    removeNotification(notification.id);
  }, [notification, removeNotification]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${COLORS[notification.type]} min-w-[280px] max-w-[400px]`}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${(notification as any).promise ? 'animate-spin' : ''}`} aria-hidden="true" />
      <p className="text-xs font-medium flex-1">{notification.message}</p>
      <div className="flex items-center gap-1 shrink-0">
        {(notification as any).onUndo && (
          <button
            onClick={handleUndo}
            className="p-1 hover:bg-white/10 rounded transition cursor-pointer"
            aria-label="Undo"
          >
            <RotateCcw size={12} aria-hidden="true" />
          </button>
        )}
        <button
          onClick={() => removeNotification(notification.id)}
          className="opacity-50 hover:opacity-100 transition cursor-pointer"
          aria-label="Dismiss"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastNotifications() {
  const notifications = useStore((s) => s.notifications);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="false">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <ToastItem notification={n} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}