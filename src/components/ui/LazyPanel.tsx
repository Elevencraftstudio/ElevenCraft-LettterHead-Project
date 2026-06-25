import React, { Suspense } from 'react';

function PanelSkeleton() {
  return (
    <div className="space-y-4 p-5 animate-pulse">
      <div className="h-4 w-24 bg-slate-800 rounded" />
      <div className="h-8 w-full bg-slate-800/50 rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-800/30 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

interface LazyPanelProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyPanel({ children, fallback = <PanelSkeleton /> }: LazyPanelProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
