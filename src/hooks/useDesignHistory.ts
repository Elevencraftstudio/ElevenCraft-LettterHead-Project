import { useState, useCallback, useRef } from 'react';

interface HistoryEntry<T> {
  snapshot: T;
  timestamp: number;
  label?: string;
}

interface UseDesignHistoryOptions {
  maxEntries?: number;
  autoSaveInterval?: number;
}

export function useDesignHistory<T>(initialState: T, options: UseDesignHistoryOptions = {}) {
  const { maxEntries = 50, autoSaveInterval = 0 } = options;

  const [past, setPast] = useState<HistoryEntry<T>[]>([]);
  const [future, setFuture] = useState<HistoryEntry<T>[]>([]);
  const [current, setCurrent] = useState<T>(initialState);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entryCountRef = useRef(0);

  const pushState = useCallback((newState: T, label?: string) => {
    setPast(prev => {
      const entry: HistoryEntry<T> = { snapshot: current, timestamp: Date.now(), label };
      const updated = [...prev, entry];
      if (updated.length > maxEntries) updated.shift();
      return updated;
    });
    setCurrent(newState);
    setFuture([]);
    entryCountRef.current++;
  }, [current, maxEntries]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [...prev, { snapshot: current, timestamp: Date.now(), label: 'undo' }]);
    setCurrent(previous.snapshot);
  }, [past, current]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture(prev => prev.slice(0, -1));
    setPast(prev => [...prev, { snapshot: current, timestamp: Date.now(), label: 'redo' }]);
    setCurrent(next.snapshot);
  }, [future, current]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  const getHistory = useCallback(() => {
    return { entries: [...past], currentIndex: past.length };
  }, [past]);

  const restore = useCallback((index: number) => {
    if (index < 0 || index >= past.length) return;
    const target = past[index];
    const remaining = past.slice(index + 1);
    setPast(prev => prev.slice(0, index));
    setFuture(prev => [...remaining.map(e => ({ ...e, label: 'restore' })), ...prev]);
    setCurrent(target.snapshot);
  }, [past]);

  const startAutoSave = useCallback((onSave: (state: T) => void) => {
    if (autoSaveInterval <= 0) return;
    autoSaveRef.current = setInterval(() => {
      onSave(current);
    }, autoSaveInterval);
  }, [autoSaveInterval, current]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
      autoSaveRef.current = null;
    }
  }, []);

  return {
    current,
    setCurrent,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    getHistory,
    restore,
    startAutoSave,
    stopAutoSave,
    versionCount: entryCountRef.current,
  };
}
