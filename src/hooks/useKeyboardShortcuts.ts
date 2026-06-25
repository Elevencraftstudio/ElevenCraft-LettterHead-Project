import { useEffect, useRef } from 'react';
import { getShortcutManager } from '../services/keyboard';
import type { ShortcutAction, ShortcutScope } from '../services/keyboard';

type ShortcutDef = Omit<ShortcutAction, 'id'> & { id?: string };

let counter = 0;

export function useKeyboardShortcuts(shortcuts: ShortcutDef[], deps: unknown[] = []) {
  useEffect(() => {
    const manager = getShortcutManager();
    const unregisters = shortcuts.map((s) => {
      const id = s.id || `hook-${++counter}`;
      return manager.register({ ...s, id });
    });
    return () => {
      unregisters.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useShortcutScope(scope: ShortcutScope) {
  useEffect(() => {
    const manager = getShortcutManager();
    manager.pushScope(scope);
    return () => manager.popScope(scope);
  }, [scope]);
}
