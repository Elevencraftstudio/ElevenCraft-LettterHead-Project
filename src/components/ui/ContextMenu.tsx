import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../accessibility';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  children?: ContextMenuItem[];
  action: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
  children?: ReactNode;
}

export function ContextMenu({ items, position, onClose, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenu, setSubmenu] = useState<{ items: ContextMenuItem[]; x: number; y: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const reducedMotion = useReducedMotion();

  const setItemRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (!position) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
        setSubmenu(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); setSubmenu(null); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  useEffect(() => {
    if (position) {
      const active = document.activeElement as HTMLElement | null;
      const firstFocusable = menuRef.current?.querySelector<HTMLButtonElement>('button[role="menuitem"]');
      setTimeout(() => firstFocusable?.focus(), 0);
      return () => {
        if (active && typeof active.focus === 'function') {
          setTimeout(() => active.focus(), 0);
        }
      };
    }
  }, [position]);

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent, itemsList: ContextMenuItem[]) => {
    const enabledIndices = itemsList.reduce<number[]>((acc, item, idx) => {
      if (!item.divider && !item.disabled) acc.push(idx);
      return acc;
    }, []);

    const currentItem = document.activeElement;
    const currentIdx = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []).indexOf(currentItem as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = enabledIndices[enabledIndices.indexOf(currentIdx) + 1] ?? enabledIndices[0];
      const next = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[nextIdx];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = enabledIndices[enabledIndices.indexOf(currentIdx) - 1] ?? enabledIndices[enabledIndices.length - 1];
      const prev = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[prevIdx];
      prev?.focus();
    } else if (e.key === 'Escape') {
      onClose();
      setSubmenu(null);
    }
  }, [onClose]);

  if (!position) return <>{children}</>;

  const adjustedX = Math.min(position.x, window.innerWidth - 200);
  const adjustedY = Math.min(position.y, window.innerHeight - items.length * 36 - 16);

  const renderItems = (itemsList: ContextMenuItem[], isSubmenu: boolean) => (
    <div
      role="menu"
      onKeyDown={(e) => handleMenuKeyDown(e, itemsList)}
    >
      {itemsList.map((item, i) => {
        if (item.divider) {
          return <div key={`div-${i}`} className="h-px bg-slate-800 my-1 mx-2" role="separator" />;
        }
        return (
          <button
            key={item.id}
            ref={(el) => setItemRef(item.id, el)}
            disabled={item.disabled}
            onClick={() => {
              if (item.children) {
                setSubmenu({ items: item.children, x: adjustedX + 180, y: adjustedY + i * 36 });
              } else {
                item.action();
                onClose();
              }
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              item.danger ? 'text-red-400 hover:bg-red-600/10 focus-visible:bg-red-600/10' : 'text-slate-300 hover:bg-slate-800 focus-visible:bg-slate-800'
            } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500`}
            role="menuitem"
            aria-disabled={item.disabled}
          >
            {item.icon && <span className="w-4 h-4 flex items-center justify-center text-slate-500" aria-hidden="true">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <kbd className="text-[9px] font-mono text-slate-600 bg-slate-800 px-1 py-0.5 rounded">{item.shortcut}</kbd>
            )}
            {item.children && <span className="text-slate-600 text-[10px]" aria-hidden="true">&#9654;</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: reducedMotion ? 0 : 0.1 }}
        className="fixed z-[300] min-w-[180px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 py-1 overflow-hidden"
        style={{ left: adjustedX, top: adjustedY }}
        role="presentation"
      >
        {renderItems(items, false)}
      </motion.div>
      {submenu && (
        <div
          className="fixed z-[301] min-w-[160px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1"
          style={{ left: submenu.x, top: submenu.y }}
          role="presentation"
        >
          <div role="menu">
            {submenu.items.map((item, i) => {
              if (item.divider) {
                return <div key={`div-${i}`} className="h-px bg-slate-800 my-1 mx-2" role="separator" />;
              }
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => { item.action(); onClose(); setSubmenu(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    item.danger ? 'text-red-400 hover:bg-red-600/10 focus-visible:bg-red-600/10' : 'text-slate-300 hover:bg-slate-800 focus-visible:bg-slate-800'
                  } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500`}
                  role="menuitem"
                  aria-disabled={item.disabled}
                >
                  {item.icon && <span className="w-4 h-4 flex items-center justify-center text-slate-500" aria-hidden="true">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="text-[9px] font-mono text-slate-600 bg-slate-800 px-1 py-0.5 rounded">{item.shortcut}</kbd>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}