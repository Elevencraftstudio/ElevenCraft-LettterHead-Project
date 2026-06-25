import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { connectivityManager } from './ConnectivityManager';
import { syncManager } from './SyncManager';
import { queueManager } from './QueueManager';
import { recoveryManager } from './RecoveryManager';
import { cacheManager } from './CacheManager';
import { getSetting, setSetting, getDefaultOfflineSettings, OfflineSettings } from '../storage/settings';
import { getQueueStats } from '../storage/queue';
import { getDefaultEditorPreferences, EditorPreferences } from '../storage/settings';
import { useStore } from '../store';

export type ConnectionStatus = 'online' | 'offline' | 'syncing' | 'waiting' | 'error';

export interface StorageUsage {
  cacheSize: number;
  maxCacheSize: number;
  browserQuota: number | null;
  browserUsage: number | null;
  assetCount: number;
}

interface OfflineContextValue {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  queueSize: number;
  syncStatus: string;
  reconnectCountdown: number;
  settings: OfflineSettings;
  editorPreferences: EditorPreferences;
  updateOfflineSettings: (partial: Partial<OfflineSettings>) => Promise<void>;
  updateEditorPreferences: (partial: Partial<EditorPreferences>) => Promise<void>;
  syncNow: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearCache: () => Promise<void>;
  clearLocalProjects: () => Promise<void>;
  hasRecovery: boolean;
  recover: () => Promise<Record<string, unknown> | null>;
  dismissRecovery: () => Promise<void>;
  storageUsage: StorageUsage | null;
  refreshStorageUsage: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const addNotification = useStore((s) => s.addNotification);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(navigator.onLine ? 'online' : 'offline');
  const [queueSize, setQueueSize] = useState(0);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [reconnectCountdown, setReconnectCountdown] = useState(0);
  const [settings, setSettingsState] = useState<OfflineSettings>(getDefaultOfflineSettings());
  const [editorPreferences, setEditorPreferencesState] = useState<EditorPreferences>(getDefaultEditorPreferences());
  const [hasRecovery, setHasRecovery] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const settingsLoaded = useRef(false);

  useEffect(() => {
    connectivityManager.init();
    syncManager.init();

    const unsubOnline = connectivityManager.subscribe((online) => {
      setIsOnline(online);
      setConnectionStatus(online ? 'online' : 'offline');
      if (online) {
        addNotification({ type: 'info', message: 'Connection restored — syncing changes', duration: 3000 });
      } else {
        addNotification({ type: 'warning', message: 'You\'re offline — changes will sync when reconnected', duration: 4000 });
      }
    });

    const unsubSync = connectivityManager.subscribeSync((status, size) => {
      switch (status) {
        case 'syncing':
          setConnectionStatus('syncing');
          setSyncStatus(status);
          break;
        case 'waiting':
          setConnectionStatus('waiting');
          setSyncStatus(status);
          break;
        case 'error':
          setConnectionStatus('error');
          setSyncStatus(status);
          break;
        default:
          setConnectionStatus(isOnline ? 'online' : 'offline');
          setSyncStatus(status);
      }
      if (size !== undefined) setQueueSize(size);
    });

    const loadSettings = async () => {
      let offlineSettings = await getSetting('offline');
      if (!offlineSettings) {
        offlineSettings = getDefaultOfflineSettings();
        await setSetting(offlineSettings);
      }
      setSettingsState(offlineSettings);
      settingsLoaded.current = true;

      let prefs = await getSetting('editorPreferences');
      if (!prefs) {
        prefs = getDefaultEditorPreferences();
        await setSetting(prefs);
      }
      setEditorPreferencesState(prefs);
    };
    loadSettings();

    const checkRecovery = async () => {
      const has = await recoveryManager.hasRecoveryData();
      setHasRecovery(has);
    };
    checkRecovery();

    const refreshUsage = async () => {
      const usage = await cacheManager.getStorageUsage();
      setStorageUsage(usage);
    };
    refreshUsage();

    const interval = setInterval(() => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        void syncManager.getPendingCount().then((c) => {
          if (c > 0) syncManager.syncNow();
        });
      } else {
        void getQueueStats().then((stats) => setQueueSize(stats.pending));
      }
    }, 10000);

    return () => {
      unsubOnline();
      unsubSync();
      connectivityManager.destroy();
      clearInterval(interval);
    };
  }, []);

  const updateOfflineSettings = useCallback(async (partial: Partial<OfflineSettings>) => {
    const updated = { ...settings, ...partial };
    setSettingsState(updated);
    await setSetting(updated);
  }, [settings]);

  const updateEditorPreferences = useCallback(async (partial: Partial<EditorPreferences>) => {
    const updated = { ...editorPreferences, ...partial };
    setEditorPreferencesState(updated);
    await setSetting(updated);
  }, [editorPreferences]);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      addNotification({ type: 'warning', message: 'Cannot sync while offline', duration: 3000 });
      return;
    }
    await syncManager.syncNow();
  }, [addNotification]);

  const retryFailed = useCallback(async () => {
    await queueManager.retryFailed();
  }, []);

  const clearCache = useCallback(async () => {
    await cacheManager.clearCache();
    addNotification({ type: 'success', message: 'Local cache cleared', duration: 3000 });
    const usage = await cacheManager.getStorageUsage();
    setStorageUsage(usage);
  }, [addNotification]);

  const clearLocalProjects = useCallback(async () => {
    const { clearAllProjects } = await import('../storage/projects');
    await clearAllProjects();
    addNotification({ type: 'success', message: 'Local projects cleared', duration: 3000 });
  }, [addNotification]);

  const recover = useCallback(async (): Promise<Record<string, unknown> | null> => {
    const snapshot = await recoveryManager.getLatestSnapshot();
    if (snapshot) {
      await recoveryManager.clearRecoveryData();
      setHasRecovery(false);
      return snapshot.data;
    }
    return null;
  }, []);

  const dismissRecovery = useCallback(async () => {
    await recoveryManager.clearRecoveryData();
    setHasRecovery(false);
  }, []);

  const refreshStorageUsage = useCallback(async () => {
    const usage = await cacheManager.getStorageUsage();
    setStorageUsage(usage);
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        connectionStatus,
        queueSize,
        syncStatus,
        reconnectCountdown,
        settings,
        editorPreferences,
        updateOfflineSettings,
        updateEditorPreferences,
        syncNow,
        retryFailed,
        clearCache,
        clearLocalProjects,
        hasRecovery,
        recover,
        dismissRecovery,
        storageUsage,
        refreshStorageUsage,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
