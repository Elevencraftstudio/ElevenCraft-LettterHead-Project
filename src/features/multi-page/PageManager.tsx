import React, { useState, useCallback } from 'react';
import { Plus, Copy, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { useStore } from '../../store';
import { PageConfig } from '../../types/document';
import { motion } from 'motion/react';

export function PageManager() {
  const { pages, activePageId, addPage, removePage, duplicatePage, reorderPages, setActivePage } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddPage = useCallback(() => {
    const newPage: PageConfig = {
      id: `page-${Date.now()}`,
      number: pages.length + 1,
      orientation: 'portrait',
      elements: [],
    };
    addPage(newPage);
    setActivePage(newPage.id);
  }, [pages.length, addPage, setActivePage]);

  const handleMoveUp = useCallback((index: number) => {
    if (index > 0) reorderPages(index, index - 1);
  }, [reorderPages]);

  const handleMoveDown = useCallback((index: number) => {
    if (index < pages.length - 1) reorderPages(index, index + 1);
  }, [pages.length, reorderPages]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-400" />
          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Pages</h3>
          <span className="text-[10px] text-slate-500 font-mono">{pages.length}</span>
        </div>
        <button
          onClick={handleAddPage}
          className="p-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition cursor-pointer"
          title="Add page"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Page Thumbnails */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {pages.length === 0 ? (
          <div className="py-4 text-center">
            <FileText size={20} className="mx-auto text-slate-700 mb-1" />
            <p className="text-[10px] text-slate-600">No pages yet</p>
          </div>
        ) : (
          pages.map((page, index) => {
            const isActive = page.id === activePageId;
            return (
              <motion.div
                key={page.id}
                layout
                onClick={() => setActivePage(page.id)}
                className={`p-2 rounded-lg border cursor-pointer transition ${
                  isActive
                    ? 'bg-indigo-600/10 border-indigo-500/40'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div
                    className={`w-10 h-14 rounded border flex items-center justify-center shrink-0 ${
                      page.orientation === 'landscape' ? 'w-14 h-10' : ''
                    } ${isActive ? 'border-indigo-500/30 bg-indigo-600/5' : 'border-slate-700 bg-slate-950'}`}
                  >
                    <span className="text-[9px] font-mono text-slate-600">{index + 1}</span>
                  </div>

                  {/* Page info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                      Page {index + 1}
                    </p>
                    <p className="text-[9px] text-slate-600">
                      {page.orientation} · {page.elements.length} elements
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                      className="p-1 text-slate-600 hover:text-slate-300 rounded transition cursor-pointer"
                      title="Duplicate page"
                    >
                      <Copy size={10} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                      className="p-1 text-slate-600 hover:text-red-400 rounded transition cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>

                {/* Order arrows */}
                <div className="flex gap-1 mt-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                    disabled={index === 0}
                    className="text-slate-600 hover:text-slate-300 disabled:opacity-20 p-0.5 rounded transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                    disabled={index === pages.length - 1}
                    className="text-slate-600 hover:text-slate-300 disabled:opacity-20 p-0.5 rounded transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={10} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
