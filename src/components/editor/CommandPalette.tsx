import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Command, FileText, Layout, Image, QrCode, Stamp, Sparkles, Download, Grid3X3, History, Plus, Settings, Undo2, Redo2, Save, Copy, ClipboardPaste, Trash2, ArrowUp, ArrowDown, Layers, Type } from 'lucide-react';
import { useStore } from '../../store';
import { formatShortcut } from '../../services/keyboard';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusTrap, useReducedMotion } from '../../accessibility';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useFocusTrap(isOpen);
  const reducedMotion = useReducedMotion();

  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return cmd.label.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, onClose]);

  useEffect(() => {
    if (listRef.current && filtered[selectedIndex]) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filtered]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
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
            className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
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
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
                aria-label="Search commands"
                role="combobox"
                aria-expanded={filtered.length > 0}
                aria-controls="command-list"
                aria-activedescendant={filtered[selectedIndex] ? `cmd-${filtered[selectedIndex].id}` : undefined}
              />
              <kbd className="text-[10px] font-mono text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">ESC</kbd>
            </div>

            <div ref={listRef} id="command-list" className="max-h-[350px] overflow-y-auto p-2 space-y-0.5" role="listbox" aria-label="Commands">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <Search size={24} className="mx-auto text-slate-600 mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-xs text-slate-500">No results for "{query}"</p>
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  const isSelected = i === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => { cmd.action(); onClose(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition cursor-pointer ${
                        isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600/30 text-indigo-400' : 'bg-slate-800 text-slate-500'}`} aria-hidden="true">
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>{cmd.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{cmd.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-600 uppercase">{cmd.category}</span>
                        {cmd.shortcut && (
                          <kbd className="text-[9px] font-mono text-slate-600 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">{formatShortcut(cmd.shortcut)}</kbd>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function useDefaultCommands(): CommandItem[] {
  const store = useStore;
  return [
    {
      id: 'new-doc', label: 'New Document', description: 'Create a new blank document',
      icon: FileText, shortcut: 'Ctrl+N', action: () => store.getState().reset(), category: 'Document',
    },
    {
      id: 'save', label: 'Save', description: 'Save the current document',
      icon: Save, shortcut: 'Ctrl+S', action: () => store.getState().addNotification({ type: 'info', message: 'Document saved' }), category: 'Document',
    },
    {
      id: 'toggle-grid', label: 'Toggle Grid', description: 'Show or hide the canvas grid',
      icon: Grid3X3, shortcut: 'Ctrl+G', action: () => store.getState().toggleGrid(), category: 'Canvas',
    },
    {
      id: 'undo', label: 'Undo', description: 'Undo the last action',
      icon: Undo2, shortcut: 'Ctrl+Z', action: () => store.getState().undo(), category: 'Edit',
    },
    {
      id: 'redo', label: 'Redo', description: 'Redo the last undone action',
      icon: Redo2, shortcut: 'Ctrl+Y', action: () => store.getState().redo(), category: 'Edit',
    },
    {
      id: 'zoom-in', label: 'Zoom In', description: 'Zoom into the canvas',
      icon: Search, shortcut: 'Ctrl++', action: () => store.getState().setZoom(store.getState().canvasViewport.zoom + 0.1), category: 'Canvas',
    },
    {
      id: 'zoom-out', label: 'Zoom Out', description: 'Zoom out of the canvas',
      icon: Search, shortcut: 'Ctrl+-', action: () => store.getState().setZoom(store.getState().canvasViewport.zoom - 0.1), category: 'Canvas',
    },
    {
      id: 'zoom-reset', label: 'Reset Zoom', description: 'Reset zoom to 100%',
      icon: Search, shortcut: 'Ctrl+0', action: () => store.getState().setZoom(1), category: 'Canvas',
    },
    {
      id: 'select-all', label: 'Select All', description: 'Select all elements on the canvas',
      icon: Layers, shortcut: 'Ctrl+A', action: () => {
        const { pages, activePageId, addToSelection, deselectAll } = store.getState();
        if (!activePageId) return;
        const page = pages.find((p) => p.id === activePageId);
        if (page) {
          deselectAll();
          page.elements.forEach((el) => addToSelection(el.id));
        }
      }, category: 'Edit',
    },
    {
      id: 'duplicate', label: 'Duplicate', description: 'Duplicate selected elements',
      icon: Copy, shortcut: 'Ctrl+D', action: () => {
        const { activePageId, selectedElementIds, pages, addElement } = store.getState();
        if (!activePageId || selectedElementIds.length === 0) return;
        const page = pages.find((p) => p.id === activePageId);
        if (!page) return;
        [...selectedElementIds].forEach((id) => {
          const el = page.elements.find((e) => e.id === id);
          if (el) {
            addElement(activePageId, { ...el, id: `element-${Date.now()}-${id}`, x: el.x + 20, y: el.y + 20 });
          }
        });
      }, category: 'Edit',
    },
    {
      id: 'add-qr', label: 'Add QR Code', description: 'Insert a QR code element',
      icon: QrCode, shortcut: '', action: () => store.getState().setActiveSidebarTab('qr'), category: 'Elements',
    },
    {
      id: 'add-stamp', label: 'Add Stamp', description: 'Insert a company stamp',
      icon: Stamp, shortcut: '', action: () => store.getState().setActiveSidebarTab('stamp'), category: 'Elements',
    },
    {
      id: 'ai-assistant', label: 'AI Assistant', description: 'Open AI document assistant',
      icon: Sparkles, shortcut: '', action: () => store.getState().setActiveSidebarTab('ai'), category: 'AI',
    },
    {
      id: 'export-pdf', label: 'Export as PDF', description: 'Export document as PDF',
      icon: Download, shortcut: 'Ctrl+P', action: () => window.print(), category: 'Export',
    },
    {
      id: 'shortcut-help', label: 'Keyboard Shortcuts', description: 'Show keyboard shortcut reference',
      icon: Command, shortcut: 'Ctrl+/', action: () => {}, category: 'Help',
    },
    {
      id: 'settings', label: 'Settings', description: 'Open application settings',
      icon: Settings, shortcut: '', action: () => store.getState().setActiveSidebarTab('settings'), category: 'App',
    },
  ];
}