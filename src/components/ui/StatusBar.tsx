import { useStore } from '../../store';
import { Badge } from './Badge';
import { useOffline } from '../../offline';

interface StatusBarProps {
  zoom?: number;
  pageInfo?: string;
  selectionCount?: number;
  isOnline?: boolean;
  autosaveStatus?: 'saved' | 'saving' | 'unsaved' | 'offline' | 'error';
}

export function StatusBar({
  zoom,
  pageInfo,
  selectionCount,
  isOnline: propOnline,
  autosaveStatus,
}: StatusBarProps) {
  const showGrid = useStore((s) => s.showGrid);
  const snapToGrid = useStore((s) => s.snapToGrid);
  const { isOnline: ctxOnline, connectionStatus, queueSize } = useOffline();
  const isOnline = propOnline ?? ctxOnline;

  const effectiveStatus = (() => {
    if (autosaveStatus) return autosaveStatus;
    if (!isOnline) return 'offline';
    if (connectionStatus === 'syncing') return 'saving';
    return 'saved';
  })();

  const autosaveLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
    saved: { label: 'Saved', variant: 'success' },
    saving: { label: 'Saving...', variant: 'warning' },
    unsaved: { label: 'Unsaved', variant: 'warning' },
    offline: { label: 'Offline', variant: 'danger' },
    error: { label: 'Sync Error', variant: 'danger' },
  };

  const as = autosaveLabels[effectiveStatus] || autosaveLabels.saved;

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-3 text-[10px] text-slate-500 shrink-0" role="status" aria-label="Editor status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Badge variant={as.variant} size="sm">{as.label}</Badge>
        {!isOnline && (
          <Badge variant="danger" size="sm">Offline</Badge>
        )}
        {queueSize > 0 && (
          <Badge variant="warning" size="sm">{queueSize} pending</Badge>
        )}
      </div>
      <div className="flex items-center gap-3 font-mono" aria-label="Document information">
        {pageInfo && <span aria-label={`Current page: ${pageInfo}`}>{pageInfo}</span>}
        {selectionCount !== undefined && selectionCount > 0 && (
          <span aria-label={`${selectionCount} element${selectionCount !== 1 ? 's' : ''} selected`}>{selectionCount} selected</span>
        )}
        {zoom !== undefined && <span aria-label={`Zoom ${Math.round(zoom * 100)} percent`}>{Math.round(zoom * 100)}%</span>}
        {showGrid && <span className="text-emerald-500" aria-label="Grid visible">Grid</span>}
        {snapToGrid && <span className="text-indigo-400" aria-label="Snap to grid enabled">Snap</span>}
      </div>
    </footer>
  );
}