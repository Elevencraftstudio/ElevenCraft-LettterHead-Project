export type ShortcutScope = 'global' | 'canvas' | 'inspector' | 'text-editing' | 'modal' | 'command-palette' | 'dialog';

export interface ShortcutAction {
  id: string;
  keys: string;
  scope: ShortcutScope;
  description: string;
  category: string;
  icon?: string;
  priority?: number;
  action: () => void;
  ignoreInput?: boolean;
}

type ParsedKeys = {
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

let platform: 'win' | 'mac' | 'other' = 'win';

export function detectPlatform(): 'win' | 'mac' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.platform?.toLowerCase() || '';
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('win')) return 'win';
  return 'other';
}

export function setPlatform(p: 'win' | 'mac' | 'other') {
  platform = p;
}

export function getPlatform() {
  return platform;
}

export function formatShortcut(keys: string): string {
  const parts = keys.split('+');
  const isMac = platform === 'mac';
  return parts
    .map((p) => {
      if (p === 'Ctrl') return isMac ? '⌘' : 'Ctrl';
      if (p === 'Alt') return isMac ? '⌥' : 'Alt';
      if (p === 'Shift') return isMac ? '⇧' : 'Shift';
      if (p === 'Meta' || p === 'Cmd') return isMac ? '⌘' : 'Win';
      return p;
    })
    .join(isMac ? '' : '+');
}

function parseKeys(keys: string): ParsedKeys {
  const parts = keys.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts.filter((p) => !['ctrl', 'meta', 'cmd', 'shift', 'alt'].includes(p))[0] || '',
  };
}

function matchEvent(e: KeyboardEvent, parsed: ParsedKeys): boolean {
  const key = e.key.toLowerCase();
  const targetKey = parsed.key;
  if (targetKey === ' ') {
    if (key !== ' ') return false;
  } else if (targetKey === 'arrowup' || targetKey === 'arrowdown' || targetKey === 'arrowleft' || targetKey === 'arrowright') {
    if (key !== targetKey) return false;
  } else if (targetKey === 'escape') {
    if (key !== 'escape') return false;
  } else if (targetKey === 'enter') {
    if (key !== 'enter') return false;
  } else if (targetKey === 'tab') {
    if (key !== 'tab') return false;
  } else if (targetKey === 'delete') {
    if (key !== 'delete' && key !== 'backspace') return false;
  } else if (targetKey === 'plus' || targetKey === '=') {
    if (key !== '=' && key !== '+') return false;
  } else if (targetKey === 'minus' || targetKey === '-') {
    if (key !== '-' && key !== '\u2212') return false;
  } else if (targetKey === '[') {
    if (key !== '[') return false;
  } else if (targetKey === ']') {
    if (key !== ']') return false;
  } else {
    if (key !== targetKey) return false;
  }
  if (parsed.ctrl !== (e.ctrlKey || e.metaKey)) return false;
  if (parsed.shift !== e.shiftKey) return false;
  if (parsed.alt !== e.altKey) return false;
  return true;
}

function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.getAttribute('role') === 'textbox';
}

export class ShortcutManager {
  private shortcuts: Map<string, ShortcutAction> = new Map();
  private scopeStack: ShortcutScope[] = ['global'];
  private enabled = true;
  private handleKeyDown: (e: KeyboardEvent) => void;
  private devLogging = false;

  constructor() {
    this.handleKeyDown = this._onKeyDown.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
    this.shortcuts.clear();
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  isEnabled() { return this.enabled; }

  setDevLogging(v: boolean) { this.devLogging = v; }

  pushScope(scope: ShortcutScope) {
    this.scopeStack.unshift(scope);
  }

  popScope(scope?: ShortcutScope) {
    if (scope) {
      const idx = this.scopeStack.indexOf(scope);
      if (idx !== -1) this.scopeStack.splice(idx, 1);
    } else {
      this.scopeStack.shift();
    }
    if (this.scopeStack.length === 0) this.scopeStack.push('global');
  }

  getActiveScopes(): ShortcutScope[] {
    return [...this.scopeStack];
  }

  register(action: ShortcutAction): () => void {
    const existing = this.shortcuts.get(action.id);
    if (existing) {
      if (this.devLogging) {
        console.warn(`[ShortcutManager] Overwriting shortcut "${action.id}"`);
      }
    }
    this._checkConflict(action);
    this.shortcuts.set(action.id, action);
    return () => this.unregister(action.id);
  }

  unregister(id: string) {
    this.shortcuts.delete(id);
  }

  getShortcut(id: string): ShortcutAction | undefined {
    return this.shortcuts.get(id);
  }

  getAllShortcuts(): ShortcutAction[] {
    return Array.from(this.shortcuts.values());
  }

  getShortcutsByScope(scope: ShortcutScope): ShortcutAction[] {
    return this.getAllShortcuts().filter((s) => s.scope === scope);
  }

  getShortcutsByCategory(category: string): ShortcutAction[] {
    return this.getAllShortcuts().filter((s) => s.category === category);
  }

  executeCommand(id: string): boolean {
    const action = this.shortcuts.get(id);
    if (action) {
      action.action();
      return true;
    }
    return false;
  }

  private _checkConflict(action: ShortcutAction) {
    if (!this.devLogging) return;
    const conflict = Array.from(this.shortcuts.values()).find(
      (s) => s.keys === action.keys && s.scope === action.scope && s.id !== action.id,
    );
    if (conflict) {
      console.warn(
        `[ShortcutManager] Conflict: "${action.keys}" (${action.id}) in scope "${action.scope}" ` +
          `collides with "${conflict.id}"`,
      );
    }
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (!this.enabled) return;
    const activeScopes = this.scopeStack;
    const candidates = Array.from(this.shortcuts.values())
      .filter((s) => activeScopes.includes(s.scope))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const action of candidates) {
      if (action.ignoreInput !== false && isInputTarget(e)) continue;
      const parsed = parseKeys(action.keys);
      if (matchEvent(e, parsed)) {
        e.preventDefault();
        e.stopPropagation();
        action.action();
        return;
      }
    }
  }
}

let _instance: ShortcutManager | null = null;

export function getShortcutManager(): ShortcutManager {
  if (!_instance) {
    _instance = new ShortcutManager();
  }
  return _instance;
}

export function resetShortcutManager() {
  if (_instance) {
    _instance.destroy();
    _instance = null;
  }
}
