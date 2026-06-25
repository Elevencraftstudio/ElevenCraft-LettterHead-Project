import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, secondaryAction, compact }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}
    >
      {icon && (
        <div className={`${compact ? 'w-10 h-10 mb-2' : 'w-14 h-14 mb-4'} rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500`}>
          {icon}
        </div>
      )}
      <h3 className={`font-semibold text-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h3>
      {description && (
        <p className={`text-slate-500 mt-1 max-w-[260px] ${compact ? 'text-[10px]' : 'text-xs'}`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
      {secondaryAction && <div className="mt-2">{secondaryAction}</div>}
    </motion.div>
  );
}
