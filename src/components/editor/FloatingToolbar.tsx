import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Lock, Unlock, Eye, EyeOff, Copy, ArrowUpToLine, ArrowDownToLine, Image, Type, Minus, Plus } from 'lucide-react';
import { useStore } from '../../store';
import { CanvasElement } from '../../types/document';
import { Tooltip } from '../ui/Tooltip';
import { useReducedMotion } from '../../accessibility';

interface FloatingToolbarProps {
  element: CanvasElement | null;
  pageId: string | null;
}

export function FloatingToolbar({ element, pageId }: FloatingToolbarProps) {
  const { updateElement, addNotification } = useStore();
  const [showOpacity, setShowOpacity] = useState(false);
  const reducedMotion = useReducedMotion();

  const update = useCallback((props: Partial<CanvasElement>) => {
    if (element && pageId) {
      updateElement(pageId, { ...element, ...props });
    }
  }, [element, pageId, updateElement]);

  const handleCopy = useCallback(() => {
    if (!element) return;
    navigator.clipboard?.writeText(JSON.stringify(element)).catch(() => {});
    addNotification({ type: 'info', message: 'Copied' });
  }, [element, addNotification]);

  if (!element) return null;

  const isText = element.type === 'text';
  const isImage = element.type === 'image';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: reducedMotion ? 0 : 0.12 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] flex items-center gap-0.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl px-1.5 py-1"
        role="toolbar"
        aria-label="Element toolbar"
        aria-controls={`element-${element.id}`}
      >
        {/* Type label */}
        <span className="text-[9px] font-bold uppercase text-slate-500 px-1.5 mr-0.5 border-r border-slate-700" aria-label={`Element type: ${element.type}`}>{element.type}</span>

        {/* Text controls */}
        {isText && (
          <>
            <Tooltip content="Bold" shortcut="Ctrl+B"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Bold" aria-pressed="false"><Bold size={14} aria-hidden="true" /></button></Tooltip>
            <Tooltip content="Italic" shortcut="Ctrl+I"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Italic" aria-pressed="false"><Italic size={14} aria-hidden="true" /></button></Tooltip>
            <Tooltip content="Underline" shortcut="Ctrl+U"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Underline" aria-pressed="false"><Underline size={14} aria-hidden="true" /></button></Tooltip>
            <div className="w-px h-4 bg-slate-700 mx-0.5" role="separator" />
            <Tooltip content="Align left"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Align left" aria-pressed="false"><AlignLeft size={14} aria-hidden="true" /></button></Tooltip>
            <Tooltip content="Align center"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Align center" aria-pressed="false"><AlignCenter size={14} aria-hidden="true" /></button></Tooltip>
            <Tooltip content="Align right"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Align right" aria-pressed="false"><AlignRight size={14} aria-hidden="true" /></button></Tooltip>
          </>
        )}

        {/* Image controls */}
        {isImage && (
          <>
            <Tooltip content="Replace image"><button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Replace image"><Image size={14} aria-hidden="true" /></button></Tooltip>
          </>
        )}

        {/* Common controls */}
        <div className="w-px h-4 bg-slate-700 mx-0.5" role="separator" />

        <Tooltip content="Opacity">
          <div className="relative">
            <button onClick={() => setShowOpacity(!showOpacity)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Adjust opacity" aria-expanded={showOpacity}>
              <span className="text-[10px] font-mono font-bold">{element.opacity}%</span>
            </button>
            {showOpacity && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl" role="presentation">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={element.opacity}
                  onChange={(e) => update({ opacity: parseInt(e.target.value) })}
                  className="w-20 h-1 accent-indigo-500 cursor-pointer"
                  aria-label="Opacity slider"
                  aria-valuenow={element.opacity}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            )}
          </div>
        </Tooltip>

        <div className="w-px h-4 bg-slate-700 mx-0.5" role="separator" />

        <Tooltip content="Lock">
          <button onClick={() => update({ locked: !element.locked })} className={`p-1 hover:bg-slate-800 rounded transition cursor-pointer ${element.locked ? 'text-indigo-400' : 'text-slate-500'}`} aria-label={element.locked ? 'Unlock' : 'Lock'} aria-pressed={element.locked}>
            {element.locked ? <Lock size={14} aria-hidden="true" /> : <Unlock size={14} aria-hidden="true" />}
          </button>
        </Tooltip>

        <Tooltip content="Toggle visibility">
          <button onClick={() => update({ visible: !element.visible })} className={`p-1 hover:bg-slate-800 rounded transition cursor-pointer ${element.visible ? 'text-slate-500' : 'text-slate-600'}`} aria-label={element.visible ? 'Hide' : 'Show'} aria-pressed={element.visible}>
            {element.visible ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-slate-700 mx-0.5" role="separator" />

        <Tooltip content="Duplicate" shortcut="Ctrl+D">
          <button onClick={() => {
            if (!pageId) return;
            const newId = `element-${Date.now()}`;
            useStore.getState().addElement(pageId, { ...element, id: newId, x: element.x + 20, y: element.y + 20 });
            useStore.getState().selectElement(newId);
          }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" aria-label="Duplicate">
            <Copy size={14} aria-hidden="true" />
          </button>
        </Tooltip>

        <Tooltip content="Delete" shortcut="Delete">
          <button onClick={() => {
            if (pageId) {
              useStore.getState().removeElement(pageId, element.id);
              useStore.getState().deselectAll();
            }
          }} className="p-1 hover:bg-red-600/10 rounded text-slate-400 hover:text-red-400 transition cursor-pointer" aria-label="Delete element">
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
}