import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getShortcutManager, detectPlatform, setPlatform, getDefaultCommands } from '../../services/keyboard';
import type { ShortcutScope, ShortcutAction } from '../../services/keyboard';

interface ShortcutContextValue {
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  toggleHelp: () => void;
  getShortcuts: () => ShortcutAction[];
  getShortcutsByScope: (scope: ShortcutScope) => ShortcutAction[];
  getShortcutsByCategory: (category: string) => ShortcutAction[];
  executeCommand: (id: string) => boolean;
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

export function pushScope(scope: ShortcutScope) {
  getShortcutManager().pushScope(scope);
}

export function popScope(scope: ShortcutScope) {
  getShortcutManager().popScope(scope);
}

export function ShortcutProvider({ children, devLogging }: { children: ReactNode; devLogging?: boolean }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    const manager = getShortcutManager();
    if (devLogging) manager.setDevLogging(true);

    const defaults = getDefaultCommands();
    const unregisters = defaults.map((cmd) => manager.register(cmd));

    const helpShortcut = manager.register({
      id: 'shortcut-help',
      keys: 'Ctrl+/',
      scope: 'global',
      description: 'Show keyboard shortcuts',
      category: 'General',
      action: () => setIsHelpOpen((v) => !v),
    });

    const paletteShortcut = manager.register({
      id: 'command-palette',
      keys: 'Ctrl+K',
      scope: 'global',
      description: 'Toggle command palette',
      category: 'General',
      action: () => {},
    });

    return () => {
      unregisters.forEach((fn) => fn());
      helpShortcut();
      paletteShortcut();
    };
  }, [devLogging]);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);
  const toggleHelp = useCallback(() => setIsHelpOpen((v) => !v), []);

  const getShortcuts = useCallback(() => getShortcutManager().getAllShortcuts(), []);
  const getShortcutsByScope = useCallback((scope: ShortcutScope) => getShortcutManager().getShortcutsByScope(scope), []);
  const getShortcutsByCategory = useCallback((category: string) => getShortcutManager().getShortcutsByCategory(category), []);
  const executeCommand = useCallback((id: string) => getShortcutManager().executeCommand(id), []);

  return (
    <ShortcutContext.Provider value={{ isHelpOpen, openHelp, closeHelp, toggleHelp, getShortcuts, getShortcutsByScope, getShortcutsByCategory, executeCommand }}>
      {children}
    </ShortcutContext.Provider>
  );
}

export function useShortcutContext(): ShortcutContextValue {
  const ctx = useContext(ShortcutContext);
  if (!ctx) throw new Error('useShortcutContext must be used within ShortcutProvider');
  return ctx;
}
