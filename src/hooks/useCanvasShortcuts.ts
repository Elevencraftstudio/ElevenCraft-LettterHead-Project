import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useCanvasShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    let shortcutKey = '';
    if (ctrl && key === 'z') shortcutKey = 'ctrl+z';
    else if (ctrl && key === 'y') shortcutKey = 'ctrl+y';
    else if (ctrl && key === 'c') shortcutKey = 'ctrl+c';
    else if (ctrl && key === 'v') shortcutKey = 'ctrl+v';
    else if (ctrl && key === 'd') shortcutKey = 'ctrl+d';
    else if (ctrl && key === 'a') shortcutKey = 'ctrl+a';
    else if (ctrl && key === 'g') shortcutKey = 'ctrl+g';
    else if (key === 'delete' || key === 'backspace') shortcutKey = 'delete';
    else if (key === 'escape') shortcutKey = 'escape';
    else if (ctrl && key === '=') shortcutKey = 'ctrl+plus';
    else if (ctrl && key === '-') shortcutKey = 'ctrl+minus';
    else if (ctrl && key === '0') shortcutKey = 'ctrl+0';
    else if (ctrl && key === 's') shortcutKey = 'ctrl+s';
    else if (ctrl && key === 'k') shortcutKey = 'ctrl+k';
    else if (key === 'arrowup') shortcutKey = 'arrowup';
    else if (key === 'arrowdown') shortcutKey = 'arrowdown';
    else if (key === 'arrowleft') shortcutKey = 'arrowleft';
    else if (key === 'arrowright') shortcutKey = 'arrowright';

    if (shortcutKey && shortcuts[shortcutKey]) {
      e.preventDefault();
      shortcuts[shortcutKey]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useDefaultCanvasShortcuts() {
  const {
    deselectAll, undo, redo, setZoom, canvasViewport,
    selectedElementIds, removeElement, activePageId, pages,
    addNotification, documentTitle, isDirty,
  } = useStore();

  const saveDocument = useCallback(() => {
    addNotification({ type: 'info', message: 'Document saved (auto-save)' });
  }, [addNotification]);

  const shortcuts: ShortcutMap = {
    'escape': () => deselectAll(),
    'ctrl+z': () => undo(),
    'ctrl+y': () => redo(),
    'delete': () => {
      if (selectedElementIds.length > 0 && activePageId) {
        selectedElementIds.forEach((id) => removeElement(activePageId, id));
      }
    },
    'ctrl+a': () => {
      // Select all elements on active page
      const page = pages.find((p) => p.id === activePageId);
      if (page) {
        page.elements.forEach((el) => useStore.getState().addToSelection(el.id));
      }
    },
    'ctrl+plus': () => setZoom(canvasViewport.zoom + 0.1),
    'ctrl+minus': () => setZoom(canvasViewport.zoom - 0.1),
    'ctrl+0': () => setZoom(1),
    'ctrl+s': () => saveDocument(),
    'arrowup': () => { /* move selected elements up */ },
    'arrowdown': () => { /* move selected elements down */ },
    'arrowleft': () => { /* move selected elements left */ },
    'arrowright': () => { /* move selected elements right */ },
  };

  return shortcuts;
}
