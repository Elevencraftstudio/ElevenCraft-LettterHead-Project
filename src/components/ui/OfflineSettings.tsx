import { useOffline } from '../../offline';

export function OfflineSettings() {
  const {
    isOnline,
    connectionStatus,
    queueSize,
    settings,
    updateOfflineSettings,
    clearCache,
    clearLocalProjects,
    storageUsage,
    refreshStorageUsage,
    syncNow,
    retryFailed,
  } = useOffline();

  const statusLabel = (() => {
    switch (connectionStatus) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'syncing': return 'Syncing...';
      case 'waiting': return 'Waiting...';
      case 'error': return 'Sync Error';
    }
  })();

  const statusColor = (() => {
    switch (connectionStatus) {
      case 'online': return 'text-emerald-400';
      case 'offline': return 'text-red-400';
      case 'syncing': return 'text-blue-400';
      case 'waiting': return 'text-amber-400';
      case 'error': return 'text-red-400';
    }
  })();

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Connection</h3>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-sm text-slate-300">{statusLabel}</span>
        {queueSize > 0 && (
          <span className="text-xs text-slate-500">({queueSize} pending)</span>
        )}
      </div>

      {queueSize > 0 && isOnline && (
        <button
          onClick={syncNow}
          className="text-xs px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition cursor-pointer"
        >
          Sync Now
        </button>
      )}

      {connectionStatus === 'error' && (
        <button
          onClick={retryFailed}
          className="text-xs px-3 py-1.5 rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition cursor-pointer"
        >
          Retry Failed
        </button>
      )}

      <h3 className="text-sm font-semibold text-slate-200 pt-2">Offline Mode</h3>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => updateOfflineSettings({ enabled: e.target.checked })}
          className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-xs text-slate-400">Enable offline support</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.autoSync}
          onChange={(e) => updateOfflineSettings({ autoSync: e.target.checked })}
          className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-xs text-slate-400">Auto-sync when online</span>
      </label>

      <h3 className="text-sm font-semibold text-slate-200 pt-2">Storage</h3>
      {storageUsage && (
        <div className="space-y-1 text-xs text-slate-400">
          <p>Cache: {formatBytes(storageUsage.cacheSize)} / {formatBytes(storageUsage.maxCacheSize)}</p>
          <p>Assets cached: {storageUsage.assetCount}</p>
          {storageUsage.browserQuota !== null && (
            <p>Browser quota: {formatBytes(storageUsage.browserQuota)}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={clearCache}
          className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition cursor-pointer"
        >
          Clear Cache
        </button>
        <button
          onClick={clearLocalProjects}
          className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition cursor-pointer"
        >
          Clear Local Projects
        </button>
        <button
          onClick={refreshStorageUsage}
          className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition cursor-pointer"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
