import React, { useState } from 'react';
import { Search, Star, Clock, Grid3X3, List, X } from 'lucide-react';
import { useTemplates } from '../../contexts/TemplateContext';
import { TemplateCategory } from '../../types/template';
import { DocumentCategory } from '../../types/document';

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'creative', label: 'Creative' },
  { id: 'legal', label: 'Legal' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'construction', label: 'Construction' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'real-estate', label: 'Real Estate' },
  { id: 'technology', label: 'Technology' },
];

const DOC_TYPES: { id: DocumentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'letter', label: 'Letter' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'quotation', label: 'Quotation' },
];

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  onClose: () => void;
}

export function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const { state, filteredTemplates, isFavorite, toggleFavorite, setSearch, setFilter, setDocType, addRecent } = useTemplates();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleSelect = (id: string) => {
    addRecent(id);
    onSelectTemplate(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-white">Template Gallery</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 space-y-4 shrink-0">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={state.searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {state.searchQuery && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer ${
                state.activeFilter === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Doc Type + View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                onClick={() => setDocType(dt.id)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition cursor-pointer ${
                  state.activeDocType === dt.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'} cursor-pointer`}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'} cursor-pointer`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Grid3X3 size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No templates found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isFav={isFavorite(template.id)}
                onToggleFav={() => toggleFavorite(template.id)}
                onSelect={() => handleSelect(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {filteredTemplates.map(template => (
              <TemplateListItem
                key={template.id}
                template={template}
                isFav={isFavorite(template.id)}
                onToggleFav={() => toggleFavorite(template.id)}
                onSelect={() => handleSelect(template.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TemplateCard: React.FC<{
  template: TemplateCategoryInfo;
  isFav: boolean;
  onToggleFav: () => void;
  onSelect: () => void;
}> = ({ template, isFav, onToggleFav, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
    >
      {/* Preview area */}
      <div className="aspect-[210/297] bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white/5 rounded border border-white/10" />
        </div>
        {/* Badge */}
        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-white/80">
          {template.documentType}
        </span>
        {/* Favorite */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFav(); }}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Star size={12} className={isFav ? 'fill-yellow-400 text-yellow-400' : 'text-white/70'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-200 truncate">{template.name}</h3>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {template.category}
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateListItem({ template, isFav, onToggleFav, onSelect }: {
  template: TemplateCategoryInfo;
  isFav: boolean;
  onToggleFav: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all cursor-pointer"
    >
      <div className="w-12 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded border border-slate-700 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-200 truncate">{template.name}</h3>
          <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {template.documentType}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{template.description}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] text-slate-600">{template.category}</span>
          {template.popular && <span className="text-[10px] text-amber-500">★ Popular</span>}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onToggleFav(); }}
        className="p-1.5 hover:bg-slate-800 rounded-lg transition cursor-pointer"
      >
        <Star size={14} className={isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
      </button>
    </div>
  );
}

interface TemplateCategoryInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  documentType: string;
  popular?: boolean;
}
