import type { ShortcutAction, ShortcutScope } from './ShortcutManager';
import { useStore } from '../../store';

export interface CommandDef extends ShortcutAction {
  platformKeys?: { win?: string; mac?: string };
}

export function getDefaultCommands(): CommandDef[] {
  const store = useStore;

  const s = <T extends CommandDef>(d: T): T => d;

  return [
    // General
    s({
      id: 'new-document', keys: 'Ctrl+N', scope: 'global', category: 'General',
      description: 'Create a new blank document',
      action: () => store.getState().reset(),
    }),
    s({
      id: 'open-project', keys: 'Ctrl+O', scope: 'global', category: 'General',
      description: 'Open an existing project',
      action: () => { store.getState().addNotification({ type: 'info', message: 'Open project — feature coming soon' }); },
    }),
    s({
      id: 'save', keys: 'Ctrl+S', scope: 'global', category: 'General',
      description: 'Save document',
      action: () => {
        store.getState().addNotification({ type: 'info', message: 'Document saved' });
      },
    }),
    s({
      id: 'save-as', keys: 'Ctrl+Shift+S', scope: 'global', category: 'General',
      description: 'Save document as a copy',
      action: () => { store.getState().addNotification({ type: 'info', message: 'Save As — feature coming soon' }); },
    }),
    s({
      id: 'print', keys: 'Ctrl+P', scope: 'global', category: 'General',
      description: 'Print document',
      action: () => window.print(),
    }),
    s({
      id: 'command-palette', keys: 'Ctrl+K', scope: 'global', category: 'General',
      description: 'Open command palette',
      action: () => {},
    }),
    s({
      id: 'shortcut-help', keys: 'Ctrl+/', scope: 'global', category: 'General',
      description: 'Show keyboard shortcut help',
      action: () => {},
    }),

    // Editing
    s({
      id: 'undo', keys: 'Ctrl+Z', scope: 'global', category: 'Editing',
      description: 'Undo last action',
      action: () => store.getState().undo(),
    }),
    s({
      id: 'redo', keys: 'Ctrl+Shift+Z', scope: 'global', category: 'Editing',
      description: 'Redo last undone action',
      action: () => store.getState().redo(),
    }),
    s({
      id: 'redo-alt', keys: 'Ctrl+Y', scope: 'global', category: 'Editing',
      description: 'Redo (alternate)',
      action: () => store.getState().redo(),
    }),
    s({
      id: 'cut', keys: 'Ctrl+X', scope: 'global', category: 'Editing',
      description: 'Cut selected element',
      action: () => {},
    }),
    s({
      id: 'copy', keys: 'Ctrl+C', scope: 'global', category: 'Editing',
      description: 'Copy selected element',
      action: () => {},
    }),
    s({
      id: 'paste', keys: 'Ctrl+V', scope: 'global', category: 'Editing',
      description: 'Paste element from clipboard',
      action: () => {},
    }),
    s({
      id: 'duplicate', keys: 'Ctrl+D', scope: 'canvas', category: 'Editing',
      description: 'Duplicate selected element',
      action: () => {},
    }),
    s({
      id: 'delete', keys: 'Delete', scope: 'global', category: 'Editing',
      description: 'Delete selected element',
      action: () => {},
    }),
    s({
      id: 'delete-alt', keys: 'Backspace', scope: 'global', category: 'Editing',
      description: 'Delete selected element',
      action: () => {},
    }),
    s({
      id: 'select-all', keys: 'Ctrl+A', scope: 'global', category: 'Editing',
      description: 'Select all elements',
      action: () => {},
    }),
    s({
      id: 'escape', keys: 'Escape', scope: 'global', category: 'Editing',
      description: 'Deselect all / close dialog',
      action: () => {},
    }),

    // Canvas
    s({
      id: 'zoom-in', keys: 'Ctrl++', scope: 'canvas', category: 'Canvas',
      description: 'Zoom in',
      action: () => store.getState().setZoom(store.getState().canvasViewport.zoom + 0.1),
      platformKeys: { win: 'Ctrl++', mac: '⌘+' },
    }),
    s({
      id: 'zoom-out', keys: 'Ctrl+-', scope: 'canvas', category: 'Canvas',
      description: 'Zoom out',
      action: () => store.getState().setZoom(store.getState().canvasViewport.zoom - 0.1),
    }),
    s({
      id: 'zoom-reset', keys: 'Ctrl+0', scope: 'canvas', category: 'Canvas',
      description: 'Reset zoom to 100%',
      action: () => store.getState().setZoom(1),
    }),
    s({
      id: 'fit-page', keys: 'F', scope: 'canvas', category: 'Canvas',
      description: 'Fit page to viewport',
      action: () => {},
    }),
    s({
      id: 'fit-width', keys: 'Shift+F', scope: 'canvas', category: 'Canvas',
      description: 'Fit page width to viewport',
      action: () => {},
    }),
    s({
      id: 'move-up', keys: 'ArrowUp', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element up 1px',
      action: () => {},
    }),
    s({
      id: 'move-down', keys: 'ArrowDown', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element down 1px',
      action: () => {},
    }),
    s({
      id: 'move-left', keys: 'ArrowLeft', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element left 1px',
      action: () => {},
    }),
    s({
      id: 'move-right', keys: 'ArrowRight', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element right 1px',
      action: () => {},
    }),
    s({
      id: 'move-up-10', keys: 'Shift+ArrowUp', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element up 10px',
      action: () => {},
    }),
    s({
      id: 'move-down-10', keys: 'Shift+ArrowDown', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element down 10px',
      action: () => {},
    }),
    s({
      id: 'move-left-10', keys: 'Shift+ArrowLeft', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element left 10px',
      action: () => {},
    }),
    s({
      id: 'move-right-10', keys: 'Shift+ArrowRight', scope: 'canvas', category: 'Canvas',
      description: 'Move selected element right 10px',
      action: () => {},
    }),
    s({
      id: 'toggle-grid', keys: 'Ctrl+G', scope: 'global', category: 'Canvas',
      description: 'Toggle grid overlay',
      action: () => store.getState().toggleGrid(),
    }),

    // Layers
    s({
      id: 'bring-forward', keys: ']', scope: 'canvas', category: 'Layers',
      description: 'Bring element forward',
      action: () => {},
    }),
    s({
      id: 'send-backward', keys: '[', scope: 'canvas', category: 'Layers',
      description: 'Send element backward',
      action: () => {},
    }),
    s({
      id: 'bring-to-front', keys: 'Shift+]', scope: 'canvas', category: 'Layers',
      description: 'Bring element to front',
      action: () => {},
    }),
    s({
      id: 'send-to-back', keys: 'Shift+[', scope: 'canvas', category: 'Layers',
      description: 'Send element to back',
      action: () => {},
    }),

    // Text
    s({
      id: 'text-bold', keys: 'Ctrl+B', scope: 'text-editing', category: 'Text',
      description: 'Bold selected text',
      action: () => {},
    }),
    s({
      id: 'text-italic', keys: 'Ctrl+I', scope: 'text-editing', category: 'Text',
      description: 'Italicize selected text',
      action: () => {},
    }),
    s({
      id: 'text-underline', keys: 'Ctrl+U', scope: 'text-editing', category: 'Text',
      description: 'Underline selected text',
      action: () => {},
    }),
    s({
      id: 'text-size-up', keys: 'Ctrl+Shift+>', scope: 'text-editing', category: 'Text',
      description: 'Increase font size',
      action: () => {},
    }),
    s({
      id: 'text-size-down', keys: 'Ctrl+Shift+<', scope: 'text-editing', category: 'Text',
      description: 'Decrease font size',
      action: () => {},
    }),

    // View
    s({
      id: 'toggle-sidebar', keys: 'Ctrl+B', scope: 'global', category: 'View',
      description: 'Toggle sidebar visibility',
      action: () => {},
      priority: -1,
    }),
  ];
}
