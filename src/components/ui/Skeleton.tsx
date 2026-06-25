interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-800/50';
  const variants = {
    text: 'h-3 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
      <Skeleton className="h-32 w-full" variant="rectangular" />
      <Skeleton className="w-3/4" />
      <Skeleton className="w-1/2" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ columns = 3, rows = 2 }: { columns?: number; rows?: number }) {
  return (
    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
