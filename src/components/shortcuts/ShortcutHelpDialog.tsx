import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Search, X, Command } from 'lucide-react';
import { getShortcutManager, formatShortcut } from '../../services/keyboard';
import type { ShortcutAction } from '../../services/keyboard';
import { useShortcutContext } from './ShortcutProvider';
import { useFocusTrap, useReducedMotion } from '../../accessibility';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_ORDER = ['General', 'Editing', 'Canvas', 'Text', 'Layers', 'View'];
const CATEGORY_ICONS: Record<string, ReactNode> = {
  General: <Command size={14} />,
  Editing: <span className="text-[10px] font-bold">✂</span>,
  Canvas: <span className="text-[10px] font-bold">◇</span>,
  Text: <span className="text-[10px] font-bold">T</span>,
  Layers: <span className="text-[10px] font-bold">≡</span>,
  View: <span className="text-[10px] font-bold">◎</span>,
};

export function ShortcutHelpDialog() {
  const { isHelpOpen, closeHelp } = useShortcutContext();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useFocusTrap(isHelpOpen);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isHelpOpen) {
      setQuery('');
      setActiveCategory(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isHelpOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeHelp();
  }, [closeHelp]);

  const allShortcuts = getShortcutManager().getAllShortcuts();

  const filtered = allShortcuts.filter((s) => {
    if (s.id === 'shortcut-help' || s.id === 'command-palette') return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.keys.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const categories = [...new Set(filtered.map((s) => s.category))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  const grouped = categories.map((cat) => ({
    category: cat,
    shortcuts: filtered.filter((s) => s.category === cat),
  }));

  return (
    <AnimatePresence>
      {isHelpOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={closeHelp}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Keyboard shortcuts"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Command size={18} className="text-slate-500 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search shortcuts..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
                aria-label="Search shortcuts"
              />
              <button onClick={closeHelp} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition cursor-pointer" aria-label="Close shortcuts dialog">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4" role="region" aria-label="Shortcut categories">
              {grouped.length === 0 ? (
                <div className="py-12 text-center">
                  <Search size={24} className="mx-auto text-slate-600 mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-xs text-slate-500">No shortcuts found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {grouped.map(({ category, shortcuts }) => (
                    <section key={category} aria-labelledby={`category-${category}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500" aria-hidden="true">{CATEGORY_ICONS[category] || null}</span>
                        <h3 id={`category-${category}`} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{category}</h3>
                      </div>
                      <div className="space-y-0.5" role="list" aria-label={`${category} shortcuts`}>
                        {shortcuts.map((s) => (
                          <ShortcutRow key={s.id} shortcut={s} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-800 text-[10px] text-slate-600 flex items-center gap-3">
              <span>Type to filter</span>
              <span className="w-px h-3 bg-slate-800" aria-hidden="true" />
              <kbd className="font-mono text-[9px] text-slate-600 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">ESC</kbd>
              <span>to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutAction }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors" role="listitem">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-200 truncate">{shortcut.description}</span>
      </div>
      <ShortcutBadge keys={shortcut.keys} />
    </div>
  );
}

export function ShortcutBadge({ keys, size = 'sm' }: { keys: string; size?: 'sm' | 'md' }) {
  const formatted = formatShortcut(keys);
  const sizeClass = size === 'md' ? 'text-[11px] px-1.5 py-1' : 'text-[9px] px-1 py-0.5';
  return (
    <kbd className={`font-mono ${sizeClass} text-slate-500 bg-slate-900 rounded border border-slate-800 whitespace-nowrap`}>
      {formatted}
    </kbd>
  );
}