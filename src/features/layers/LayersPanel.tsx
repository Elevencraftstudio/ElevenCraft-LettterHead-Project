import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'motion/react';
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, GripVertical,
  ChevronDown, ChevronRight, Search, Folder, Image, Type, QrCode,
  Stamp, Signature, Table, Square, Minus
} from 'lucide-react';
import { useStore } from '../../store';
import { CanvasElement } from '../../types/document';

const ELEMENT_ICONS: Record<string, React.ElementType> = {
  logo: Image,
  text: Type,
  image: Image,
  'qr-code': QrCode,
  stamp: Stamp,
  signature: Signature,
  table: Table,
  shape: Square,
  line: Minus,
  'social-icons': Layers,
  watermark: Image,
  address: Type,
  contact: Type,
};

const ELEMENT_LABELS: Record<string, string> = {
  logo: 'Logo',
  text: 'Text',
  image: 'Image',
  'qr-code': 'QR Code',
  stamp: 'Stamp',
  signature: 'Signature',
  table: 'Table',
  shape: 'Shape',
  line: 'Line',
  'social-icons': 'Social Icons',
  watermark: 'Watermark',
  address: 'Address',
  contact: 'Contact',
};

export function LayersPanel() {
  const { pages, activePageId, selectedElementIds, selectElement, addToSelection, deselectAll, updateElement, removeElement, addNotification } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['elements']));

  const activePage = pages.find((p) => p.id === activePageId);
  const sortedElements = [...(activePage?.elements || [])].sort((a, b) => b.zIndex - a.zIndex);

  const filteredElements = searchQuery
    ? sortedElements.filter((el) => ELEMENT_LABELS[el.type]?.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedElements;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      addToSelection(id);
    } else {
      selectElement(id);
    }
  };

  const handleDuplicate = useCallback((id: string) => {
    if (!activePageId) return;
    const el = (activePage?.elements || []).find((e) => e.id === id);
    if (el) {
      const dup: CanvasElement = { ...el, id: `el-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
      useStore.getState().addElement(activePageId, dup);
    }
  }, [activePageId, activePage]);

  const handleDelete = useCallback((id: string) => {
    if (activePageId) removeElement(activePageId, id);
  }, [activePageId, removeElement]);

  const handleToggleLock = useCallback((id: string) => {
    if (!activePageId) return;
    const el = (activePage?.elements || []).find((e) => e.id === id);
    if (el) updateElement(activePageId, { ...el, locked: !el.locked });
  }, [activePageId, activePage, updateElement]);

  const handleToggleVisibility = useCallback((id: string) => {
    if (!activePageId) return;
    const el = (activePage?.elements || []).find((e) => e.id === id);
    if (el) updateElement(activePageId, { ...el, visible: !el.visible });
  }, [activePageId, activePage, updateElement]);

  const handleReorder = (reordered: CanvasElement[]) => {
    if (!activePageId) return;
    reordered.forEach((el, i) => {
      updateElement(activePageId, { ...el, zIndex: reordered.length - i });
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          <span>Layers</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">{sortedElements.length} items</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search layers..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Layer list */}
      <div className="bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden">
        {/* Group header */}
        <button
          onClick={() => toggleGroup('elements')}
          className="w-full flex items-center gap-2 px-3 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          {expandedGroups.has('elements') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span>Page Elements</span>
          <span className="text-[9px] text-slate-600 font-mono ml-auto">{sortedElements.length}</span>
        </button>

        {expandedGroups.has('elements') && (
          <Reorder.Group axis="y" values={filteredElements} onReorder={handleReorder} className="divide-y divide-slate-800/50">
            {filteredElements.length === 0 ? (
              <div className="py-8 text-center">
                <Layers size={20} className="mx-auto text-slate-700 mb-2" />
                <p className="text-xs text-slate-600">No elements on this page</p>
                <p className="text-[10px] text-slate-700 mt-0.5">Add elements from the sidebar</p>
              </div>
            ) : (
              filteredElements.map((el) => {
                const ElIcon = ELEMENT_ICONS[el.type] || Layers;
                const isSelected = selectedElementIds.includes(el.id);
                return (
                  <Reorder.Item
                    key={el.id}
                    value={el}
                    className={`flex items-center gap-2 px-3 py-2 transition cursor-pointer group ${
                      isSelected ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : 'hover:bg-slate-800/30 border-l-2 border-transparent'
                    }`}
                    onClick={(e) => handleSelect(el.id, e as any)}
                  >
                    {/* Drag handle */}
                    <div className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
                      <GripVertical size={12} />
                    </div>

                    {/* Icon */}
                    <div className={`p-1 rounded ${isSelected ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'} shrink-0`}>
                      <ElIcon size={11} />
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-medium truncate ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {ELEMENT_LABELS[el.type] || el.type}
                      </p>
                      <p className="text-[8px] text-slate-600 font-mono">
                        z:{el.zIndex} · {Math.round(el.x)},{Math.round(el.y)}
                      </p>
                    </div>

                    {/* Visibility */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(el.id); }}
                      className={`p-1 rounded transition cursor-pointer ${el.visible ? 'text-slate-500 hover:text-slate-300' : 'text-slate-700'}`}
                      title={el.visible ? 'Hide' : 'Show'}
                    >
                      {el.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>

                    {/* Lock */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleLock(el.id); }}
                      className={`p-1 rounded transition cursor-pointer ${el.locked ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                      title={el.locked ? 'Unlock' : 'Lock'}
                    >
                      {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(el.id); }}
                      className="p-1 rounded text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy size={11} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(el.id); }}
                      className="p-1 rounded text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </Reorder.Item>
                );
              })
            )}
          </Reorder.Group>
        )}
      </div>

      {/* Selection info */}
      {selectedElementIds.length > 1 && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg px-3 py-2">
          <p className="text-[11px] text-indigo-400 font-semibold">{selectedElementIds.length} elements selected</p>
        </div>
      )}
    </div>
  );
}
