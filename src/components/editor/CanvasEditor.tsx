import React, { useRef, useState, useCallback } from 'react';
import { useStore } from '../../store';
import { CanvasElement } from '../../types/document';
import { CanvasRuler } from './CanvasRuler';
import { motion } from 'motion/react';
import { useKeyboardShortcuts, useShortcutScope } from '../../hooks/useKeyboardShortcuts';
import { ContextMenu } from '../ui/ContextMenu';
import type { ContextMenuItem } from '../ui/ContextMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { StatusBar } from '../ui/StatusBar';
import { useAutosave, useOffline } from '../../offline';
import { Copy, Trash2, Lock, Unlock, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

type DragMode = 'move' | 'resize' | 'rotate' | 'none';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  initialBounds: { x: number; y: number; width: number; height: number };
  elementId: string;
  handle?: ResizeHandle;
  rotationStart?: number;
}

const HANDLE_SIZE = 8;

function moveSelectedElements(dx: number, dy: number) {
  const { activePageId: pid, selectedElementIds: ids, pages, snapToGrid: snap, gridSize, updateElement } = useStore.getState();
  if (!pid || ids.length === 0) return;
  const page = pages.find((p) => p.id === pid);
  if (!page) return;
  ids.forEach((id) => {
    const el = page.elements.find((e) => e.id === id);
    if (el) {
      let newX = el.x + dx;
      let newY = el.y + dy;
      if (snap) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
      }
      updateElement(pid, { ...el, x: newX, y: newY });
    }
  });
}
const HANDLE_COLOR = '#6366f1';

function buildContextMenuItems(elementId: string, close: () => void): ContextMenuItem[] {
  const s = useStore.getState();
  const el = s.pages.flatMap((p) => p.elements).find((e) => e.id === elementId);
  if (!el) return [];
  const pid = s.activePageId!;

  return [
    {
      id: 'copy', label: 'Copy', icon: <Copy size={14} />, shortcut: 'Ctrl+C',
      action: () => { navigator.clipboard?.writeText(JSON.stringify(el)).catch(() => {}); s.addNotification({ type: 'info', message: 'Copied' }); },
    },
    {
      id: 'duplicate', label: 'Duplicate', icon: <Copy size={14} />, shortcut: 'Ctrl+D',
      action: () => { s.addElement(pid, { ...el, id: `element-${Date.now()}`, x: el.x + 20, y: el.y + 20 }); },
    },
    { id: 'div1', label: '', action: () => {}, divider: true },
    {
      id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, shortcut: 'Delete', danger: true,
      action: () => { s.removeElement(pid, elementId); s.deselectAll(); },
    },
    { id: 'div2', label: '', action: () => {}, divider: true },
    {
      id: 'lock', label: el.locked ? 'Unlock' : 'Lock', icon: el.locked ? <Unlock size={14} /> : <Lock size={14} />,
      action: () => s.updateElement(pid, { ...el, locked: !el.locked }),
    },
    {
      id: 'visible', label: el.visible ? 'Hide' : 'Show', icon: el.visible ? <EyeOff size={14} /> : <Eye size={14} />,
      action: () => s.updateElement(pid, { ...el, visible: !el.visible }),
    },
    { id: 'div3', label: '', action: () => {}, divider: true },
    {
      id: 'bring-forward', label: 'Bring Forward', icon: <ArrowUp size={14} />, shortcut: ']',
      action: () => s.updateElement(pid, { ...el, zIndex: el.zIndex + 1 }),
    },
    {
      id: 'send-backward', label: 'Send Backward', icon: <ArrowDown size={14} />, shortcut: '[',
      action: () => s.updateElement(pid, { ...el, zIndex: Math.max(0, el.zIndex - 1) }),
    },
    {
      id: 'bring-to-front', label: 'Bring to Front', icon: <ArrowUp size={14} />, shortcut: 'Shift+]',
      action: () => {
        const maxZ = Math.max(...s.pages.find((p) => p.id === pid)?.elements.map((e) => e.zIndex) || [0]);
        s.updateElement(pid, { ...el, zIndex: maxZ + 1 });
      },
    },
    {
      id: 'send-to-back', label: 'Send to Back', icon: <ArrowDown size={14} />, shortcut: 'Shift+[',
      action: () => {
        s.updateElement(pid, { ...el, zIndex: 0 });
        s.pages.find((p) => p.id === pid)?.elements.filter((e) => e.id !== elementId).forEach((e) => {
          s.updateElement(pid, { ...e, zIndex: e.zIndex + 1 });
        });
      },
    },
  ];
}

const resizeHandles: { id: ResizeHandle; cursor: string; x: number; y: number }[] = [
  { id: 'nw', cursor: 'nw-resize', x: 0, y: 0 },
  { id: 'n', cursor: 'n-resize', x: 0.5, y: 0 },
  { id: 'ne', cursor: 'ne-resize', x: 1, y: 0 },
  { id: 'e', cursor: 'e-resize', x: 1, y: 0.5 },
  { id: 'se', cursor: 'se-resize', x: 1, y: 1 },
  { id: 's', cursor: 's-resize', x: 0.5, y: 1 },
  { id: 'sw', cursor: 'sw-resize', x: 0, y: 1 },
  { id: 'w', cursor: 'w-resize', x: 0, y: 0.5 },
];

function getResizeBounds(
  start: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
  handle: ResizeHandle,
  minSize: number = 10,
) {
  let { x, y, width, height } = start;
  switch (handle) {
    case 'e': width = Math.max(minSize, start.width + dx); break;
    case 'w': width = Math.max(minSize, start.width - dx); x = start.x + (start.width - width); break;
    case 's': height = Math.max(minSize, start.height + dy); break;
    case 'n': height = Math.max(minSize, start.height - dy); y = start.y + (start.height - height); break;
    case 'se': width = Math.max(minSize, start.width + dx); height = Math.max(minSize, start.height + dy); break;
    case 'sw': width = Math.max(minSize, start.width - dx); height = Math.max(minSize, start.height + dy); x = start.x + (start.width - width); break;
    case 'ne': width = Math.max(minSize, start.width + dx); height = Math.max(minSize, start.height - dy); y = start.y + (start.height - height); break;
    case 'nw': width = Math.max(minSize, start.width - dx); height = Math.max(minSize, start.height - dy); x = start.x + (start.width - width); y = start.y + (start.height - height); break;
  }
  return { x, y, width, height };
}

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function CanvasEditor() {
  const {
    pages, activePageId, selectedElementIds, canvasViewport, showGrid, snapToGrid: isSnapEnabled, gridSize,
    selectElement, addToSelection, deselectAll, addElement, updateElement, setZoom, setViewport,
  } = useStore();

  useShortcutScope('canvas');
  useAutosave();
  const { isOnline, connectionStatus } = useOffline();

  const activePage = pages.find((p) => p.id === activePageId);
  const elements = activePage?.elements || [];

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [guides, setGuides] = useState<{ x?: number[]; y?: number[] }>({});
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragRect, setDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dragRectStart, setDragRectStart] = useState<{ x: number; y: number } | null>(null);
  const [isAltDragging, setIsAltDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  const zoom = canvasViewport.zoom;

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - canvasViewport.x) / zoom,
      y: (clientY - rect.top - canvasViewport.y) / zoom,
    };
  }, [canvasViewport, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId?: string) => {
    if (e.button === 1 || e.button === 2) return;
    const target = e.target as HTMLElement;
    const handle = target.dataset.handle as ResizeHandle | undefined;

    if (e.altKey && elementId && !handle) {
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      const newId = `element-${Date.now()}`;
      const cloned: CanvasElement = { ...el, id: newId, x: el.x + 20, y: el.y + 20, zIndex: el.zIndex + 1 };
      addElement(activePageId!, cloned);
      selectElement(newId);
      setIsAltDragging(true);
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'move',
        startX: coords.x,
        startY: coords.y,
        initialBounds: { x: cloned.x, y: cloned.y, width: cloned.width, height: cloned.height },
        elementId: newId,
      });
      return;
    }

    if (e.shiftKey && elementId) {
      addToSelection(elementId);
      return;
    }

    if (elementId && !handle) {
      if (!selectedElementIds.includes(elementId)) {
        selectElement(elementId);
      }
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'move',
        startX: coords.x,
        startY: coords.y,
        initialBounds: { x: el.x, y: el.y, width: el.width, height: el.height },
        elementId,
      });
      return;
    }

    if (elementId && handle) {
      selectElement(elementId);
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'resize',
        startX: coords.x,
        startY: coords.y,
        initialBounds: { x: el.x, y: el.y, width: el.width, height: el.height },
        elementId,
        handle,
      });
      return;
    }

    if (!elementId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragRectStart({ x: e.clientX, y: e.clientY });
      setDragRect({ x: coords.x, y: coords.y, w: 0, h: 0 });
      deselectAll();
    }
  }, [elements, selectedElementIds, selectElement, addToSelection, deselectAll, getCanvasCoords, canvasViewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (dragState) {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;

      if (dragState.mode === 'move') {
        let newX = dragState.initialBounds.x + dx;
        let newY = dragState.initialBounds.y + dy;
        if (isSnapEnabled) {
          newX = snapToGrid(newX, gridSize);
          newY = snapToGrid(newY, gridSize);
        }
        const el = elements.find((el) => el.id === dragState.elementId);
        if (el) {
          updateElement(activePageId!, { ...el, x: newX, y: newY });
        }
      } else if (dragState.mode === 'resize' && dragState.handle) {
        let bounds = getResizeBounds(dragState.initialBounds, dx, dy, dragState.handle);
        if (isSnapEnabled) {
          bounds.x = snapToGrid(bounds.x, gridSize);
          bounds.y = snapToGrid(bounds.y, gridSize);
          bounds.width = snapToGrid(bounds.width, gridSize);
          bounds.height = snapToGrid(bounds.height, gridSize);
        }
        const el = elements.find((el) => el.id === dragState.elementId);
        if (el) {
          updateElement(activePageId!, { ...el, ...bounds });
        }
      }
      return;
    }

    if (isPanning) {
      setViewport({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragRectStart) {
      const rect = getCanvasCoords(dragRectStart.x, dragRectStart.y);
      const current = getCanvasCoords(e.clientX, e.clientY);
      setDragRect({
        x: Math.min(rect.x, current.x),
        y: Math.min(rect.y, current.y),
        w: Math.abs(current.x - rect.x),
        h: Math.abs(current.y - rect.y),
      });
    }
  }, [dragState, isPanning, getCanvasCoords, isSnapEnabled, gridSize, elements, updateElement, activePageId, setViewport, panStart, dragRectStart]);

  const handleMouseUp = useCallback(() => {
    if (dragRect && dragRect.w > 5 && dragRect.h > 5) {
      const r = dragRect;
      const matched = elements.filter(
        (el) => el.x < r.x + r.w && el.x + el.width > r.x && el.y < r.y + r.h && el.y + el.height > r.y,
      );
      if (matched.length > 0) {
        deselectAll();
        matched.forEach((el) => addToSelection(el.id));
      }
    }
    setDragState(null);
    setIsPanning(false);
    setIsAltDragging(false);
    setDragRect(null);
    setDragRectStart(null);
    setGuides({});
  }, [dragRect, elements, deselectAll, addToSelection]);

  const handleContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const selectedElement = selectedElementIds.length === 1 && activePageId
    ? elements.find((el) => el.id === selectedElementIds[0]) || null
    : null;

  useKeyboardShortcuts([
    {
      id: 'canvas-delete', keys: 'Delete', scope: 'canvas', category: 'Editing',
      description: 'Delete selected element',
      action: () => {
        const { activePageId: pid, selectedElementIds: ids, removeElement, deselectAll: desel } = useStore.getState();
        if (ids.length > 0 && pid) {
          ids.forEach((id) => removeElement(pid, id));
          desel();
        }
      },
    },
    {
      id: 'canvas-delete-alt', keys: 'Backspace', scope: 'canvas', category: 'Editing',
      description: 'Delete selected element',
      action: () => {
        const { activePageId: pid, selectedElementIds: ids, removeElement, deselectAll: desel } = useStore.getState();
        if (ids.length > 0 && pid) {
          ids.forEach((id) => removeElement(pid, id));
          desel();
        }
      },
    },
    {
      id: 'canvas-escape', keys: 'Escape', scope: 'canvas', category: 'Editing',
      description: 'Deselect all',
      action: () => useStore.getState().deselectAll(),
    },
    {
      id: 'canvas-copy', keys: 'Ctrl+C', scope: 'canvas', category: 'Editing',
      description: 'Copy selected element',
      action: () => {
        const { selectedElementIds: ids, pages, activePageId: pid } = useStore.getState();
        if (ids.length === 0) return;
        const page = pages.find((p) => p.id === pid);
        if (!page) return;
        const el = page.elements.find((e) => e.id === ids[0]);
        if (el) {
          navigator.clipboard?.writeText(JSON.stringify(el)).catch(() => {});
        }
      },
    },
    {
      id: 'canvas-paste', keys: 'Ctrl+V', scope: 'canvas', category: 'Editing',
      description: 'Paste element',
      action: () => {
        const { activePageId: pid, addElement: addEl, selectElement: selEl } = useStore.getState();
        if (!pid) return;
        navigator.clipboard?.readText().then((text) => {
          try {
            const parsed: CanvasElement = JSON.parse(text);
            if (parsed && parsed.type && parsed.x !== undefined) {
              const newId = `element-${Date.now()}`;
              addEl(pid, { ...parsed, id: newId, x: parsed.x + 20, y: parsed.y + 20 });
              selEl(newId);
            }
          } catch {}
        }).catch(() => {});
      },
    },
    {
      id: 'canvas-duplicate', keys: 'Ctrl+D', scope: 'canvas', category: 'Editing',
      description: 'Duplicate selected element',
      action: () => {
        const { activePageId: pid, selectedElementIds: ids, pages, addElement: addEl } = useStore.getState();
        if (!pid || ids.length === 0) return;
        const page = pages.find((p) => p.id === pid);
        if (!page) return;
        [...ids].forEach((id) => {
          const el = page.elements.find((e) => e.id === id);
          if (el) {
            addEl(pid, { ...el, id: `element-${Date.now()}-${id}`, x: el.x + 20, y: el.y + 20 });
          }
        });
      },
    },
    {
      id: 'canvas-select-all', keys: 'Ctrl+A', scope: 'canvas', category: 'Editing',
      description: 'Select all elements',
      action: () => {
        const { pages, activePageId: pid, addToSelection: addSel, deselectAll: desel } = useStore.getState();
        if (!pid) return;
        const page = pages.find((p) => p.id === pid);
        if (page) {
          desel();
          page.elements.forEach((el) => addSel(el.id));
        }
      },
    },
    {
      id: 'canvas-move-up', keys: 'ArrowUp', scope: 'canvas', category: 'Canvas',
      description: 'Move up 1px',
      action: () => moveSelectedElements(0, -1),
    },
    {
      id: 'canvas-move-down', keys: 'ArrowDown', scope: 'canvas', category: 'Canvas',
      description: 'Move down 1px',
      action: () => moveSelectedElements(0, 1),
    },
    {
      id: 'canvas-move-left', keys: 'ArrowLeft', scope: 'canvas', category: 'Canvas',
      description: 'Move left 1px',
      action: () => moveSelectedElements(-1, 0),
    },
    {
      id: 'canvas-move-right', keys: 'ArrowRight', scope: 'canvas', category: 'Canvas',
      description: 'Move right 1px',
      action: () => moveSelectedElements(1, 0),
    },
    {
      id: 'canvas-move-up-10', keys: 'Shift+ArrowUp', scope: 'canvas', category: 'Canvas',
      description: 'Move up 10px',
      action: () => moveSelectedElements(0, -10),
    },
    {
      id: 'canvas-move-down-10', keys: 'Shift+ArrowDown', scope: 'canvas', category: 'Canvas',
      description: 'Move down 10px',
      action: () => moveSelectedElements(0, 10),
    },
    {
      id: 'canvas-move-left-10', keys: 'Shift+ArrowLeft', scope: 'canvas', category: 'Canvas',
      description: 'Move left 10px',
      action: () => moveSelectedElements(-10, 0),
    },
    {
      id: 'canvas-move-right-10', keys: 'Shift+ArrowRight', scope: 'canvas', category: 'Canvas',
      description: 'Move right 10px',
      action: () => moveSelectedElements(10, 0),
    },
  ]);

  const elementColors: Record<string, string> = {
    logo: '#818cf8', address: '#34d399', contact: '#38bdf8', 'qr-code': '#f472b6',
    signature: '#fb923c', stamp: '#a78bfa', text: '#e2e8f0', image: '#4ade80', shape: '#94a3b8',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Rulers */}
      <div className="flex shrink-0">
        <div className="w-6 h-6 bg-slate-900 border-b border-r border-slate-700 shrink-0" />
        <CanvasRuler orientation="horizontal" zoom={zoom} viewportOffset={canvasViewport.x} length={1200} />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        <CanvasRuler orientation="vertical" zoom={zoom} viewportOffset={canvasViewport.y} length={1600} />

      {/* Canvas area */}
      <div
        className="flex-1 overflow-hidden relative bg-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setZoom(Math.max(0.25, Math.min(4, zoom + delta)));
          }
        }}
        style={{ cursor: isPanning ? 'grabbing' : dragState ? 'grabbing' : 'default' }}
        role="region"
        aria-label="Canvas"
        aria-busy={elements.length === 0 ? false : undefined}
      >
        {/* Grid overlay */}
        {showGrid && (
          <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
            <defs>
              <pattern id="grid-pattern" width={gridSize * zoom} height={gridSize * zoom} patternUnits="userSpaceOnUse">
                <path d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`} fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        )}

        {/* Panning / transform container */}
        <div
          ref={canvasRef}
          className="absolute"
          style={{
            transform: `translate(${canvasViewport.x}px, ${canvasViewport.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Elements */}
          {elements.length === 0 && (
            <div className="w-[600px] h-[400px] flex items-center justify-center text-slate-600 select-none">
              <p className="text-sm">Canvas is empty. Add elements from the Layers panel.</p>
            </div>
          )}

          {[...elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = selectedElementIds.includes(el.id);
              const color = elementColors[el.type] || '#94a3b8';
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, el.id);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, el.id)}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    opacity: el.visible ? el.opacity / 100 : 0.3,
                    transform: `rotate(${el.rotation}deg)`,
                    zIndex: el.zIndex,
                    cursor: el.locked ? 'default' : 'move',
                    boxShadow: isSelected ? `0 0 0 2px ${color}, 0 0 0 4px rgba(99,102,241,0.3)` : 'none',
                    borderRadius: 4,
                    pointerEvents: el.locked ? 'none' : 'auto',
                  }}
                  className="group"
                  role="img"
                  aria-label={`${el.type} element${el.props?.text ? `: ${el.props.text}` : ''}${el.locked ? ', locked' : ''}`}
                  aria-selected={isSelected}
                >
                  {/* Element content */}
                  <div className="w-full h-full bg-slate-800/60 border border-slate-700/50 rounded flex items-center justify-center overflow-hidden text-[10px] text-slate-400">
                    {el.type === 'text' && <span className="truncate px-1">{el.props?.text || 'Text'}</span>}
                    {el.type === 'image' && el.props?.src && <img src={el.props.src} alt="" className="w-full h-full object-contain" />}
                    {el.type === 'logo' && <span className="text-[9px] uppercase font-bold text-indigo-400">Logo</span>}
                    {el.type === 'address' && <span className="text-[9px] px-1">123 Business St, City</span>}
                    {el.type === 'contact' && <span className="text-[9px]">contact@co.com</span>}
                    {el.type === 'shape' && <div className="w-full h-full bg-slate-600/30" />}
                    {(el.type === 'signature' || el.type === 'stamp' || el.type === 'qr-code' || el.type === 'watermark') && (
                      <span className="text-[9px] capitalize">{el.type}</span>
                    )}
                  </div>

                  {/* Label */}
                  {isSelected && (
                    <div
                      className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap"
                      style={{ backgroundColor: color, color: '#0f172a' }}
                    >
                      {el.type} {el.id.slice(-4)}
                    </div>
                  )}

                  {/* Resize handles */}
                  {isSelected && !el.locked && resizeHandles.map((h) => (
                    <div
                      key={h.id}
                      data-handle={h.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, el.id);
                      }}
                      style={{
                        position: 'absolute',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        backgroundColor: HANDLE_COLOR,
                        border: '1px solid #fff',
                        borderRadius: 1,
                        cursor: h.cursor,
                        zIndex: 9999,
                        left: `calc(${h.x * 100}% - ${HANDLE_SIZE / 2}px)`,
                        top: `calc(${h.y * 100}% - ${HANDLE_SIZE / 2}px)`,
                      }}
                    />
                  ))}

                  {/* Rotation handle */}
                  {isSelected && !el.locked && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ top: -28, cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        selectElement(el.id);
                        setDragState({
                          mode: 'rotate',
                          startX: e.clientX,
                          startY: e.clientY,
                          initialBounds: { x: el.x, y: el.y, width: el.width, height: el.height },
                          elementId: el.id,
                          rotationStart: el.rotation,
                        });
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={HANDLE_COLOR} strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Drag selection rectangle */}
      {dragRect && dragRect.w > 0 && dragRect.h > 0 && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: dragRect.x * zoom + canvasViewport.x,
            top: dragRect.y * zoom + canvasViewport.y,
            width: dragRect.w * zoom,
            height: dragRect.h * zoom,
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          }}
        />
      )}

      {/* Floating toolbar for selected element */}
      {selectedElement && <FloatingToolbar element={selectedElement} pageId={activePageId} />}

      {/* Context menu */}
      <ContextMenu
        items={contextMenu ? buildContextMenuItems(contextMenu.elementId, closeContextMenu) : []}
        position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
        onClose={closeContextMenu}
      />

      {/* Zoom controls */}
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-lg">
        <button onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" title="Zoom Out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>
        </button>
        <span className="w-12 text-center font-mono text-[11px] text-slate-300 select-none">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(4, zoom + 0.1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" title="Zoom In">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
        </button>
        <div className="w-px h-4 bg-slate-800 mx-1" />
        <button onClick={() => setViewport({ x: 0, y: 0 })} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 text-[10px] font-bold cursor-pointer" title="Reset view">
          1:1
        </button>
      </div>
      <StatusBar
        zoom={zoom}
        pageInfo={activePage ? `Page ${activePage.number}` : undefined}
        selectionCount={selectedElementIds.length}
        isOnline={isOnline}
        autosaveStatus={isOnline ? (connectionStatus === 'syncing' ? 'saving' : 'saved') : 'offline'}
      />
    </div>
  );
}
