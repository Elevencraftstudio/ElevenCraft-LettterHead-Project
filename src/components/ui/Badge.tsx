import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-400',
    primary: 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30',
    success: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/30',
  };
  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wider rounded ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
