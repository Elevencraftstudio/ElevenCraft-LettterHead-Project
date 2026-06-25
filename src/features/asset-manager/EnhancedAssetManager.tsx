import React, { useState, useCallback } from 'react';
import {
  Folder, FolderOpen, Search, Upload, Image, Trash2, Plus, X, Star,
  Tags, Grid3X3, List, Download, CheckSquare, Square, Archive
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';

interface Asset {
  id: string;
  name: string;
  type: 'logo' | 'signature' | 'stamp' | 'background' | 'watermark' | 'icon' | 'image' | 'font';
  dataUrl: string;
  folderId?: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  size?: number;
}

interface AssetCollection {
  id: string;
  name: string;
  assetIds: string[];
}

interface AssetFolder {
  id: string;
  name: string;
  color?: string;
}

const DEFAULT_FOLDERS: AssetFolder[] = [
  { id: 'logos', name: 'Logos' },
  { id: 'signatures', name: 'Signatures' },
  { id: 'stamps', name: 'Stamps' },
  { id: 'backgrounds', name: 'Backgrounds' },
  { id: 'watermarks', name: 'Watermarks' },
  { id: 'icons', name: 'Icons' },
  { id: 'fonts', name: 'Fonts' },
  { id: 'templates', name: 'Templates' },
];

export function EnhancedAssetManager() {
  const addNotification = useStore((s) => s.addNotification);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders] = useState<AssetFolder[]>(DEFAULT_FOLDERS);
  const [collections, setCollections] = useState<AssetCollection[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter((a) => {
    if (showFavorites && !a.favorite) return false;
    if (activeFolder && a.folderId !== activeFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAsset: Asset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'image',
          dataUrl: reader.result as string,
          tags: [],
          favorite: false,
          createdAt: new Date().toISOString(),
          size: file.size,
          folderId: activeFolder || undefined,
        };
        setAssets((prev) => [...prev, newAsset]);
        addNotification({ type: 'success', message: `Uploaded ${file.name}` });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [activeFolder, addNotification]);

  const handleDeleteSelected = () => {
    setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
    addNotification({ type: 'info', message: `Deleted ${selectedIds.size} asset(s)` });
  };

  const handleToggleFavorite = (id: string) => {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, favorite: !a.favorite } : a));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setShowNewFolder(false);
    setNewFolderName('');
    addNotification({ type: 'success', message: `Folder "${newFolderName}" created` });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        Array.from(files).forEach((f) => dt.items.add(f));
        input.files = dt.files;
        handleUpload({ target: input } as any);
      }
    }
  }, [handleUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const getFolderAssetCount = (folderId: string) => assets.filter((a) => a.folderId === folderId).length;

  return (
    <div className="space-y-4" onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Assets</h3>
        <div className="flex gap-1">
          <div className="flex bg-slate-900 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'} cursor-pointer`}>
              <Grid3X3 size={12} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'} cursor-pointer`}>
              <List size={12} />
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(true)} title="New folder">
            <Folder size={13} />
          </Button>
          <Button size="sm" variant="primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={13} />
            <span>Upload</span>
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {showNewFolder && (
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-3">
          <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} />
          <button onClick={handleCreateFolder} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold cursor-pointer">Add</button>
          <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="text-slate-500 hover:text-slate-300 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..." className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <button onClick={() => setShowFavorites(!showFavorites)}
          className={`p-1.5 rounded-lg border transition cursor-pointer ${showFavorites ? 'bg-amber-600/20 border-amber-500/30 text-amber-400' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}
          title="Favorites only">
          <Star size={13} fill={showFavorites ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Folder + Asset grid */}
      <div className="grid grid-cols-[140px_1fr] gap-3">
        {/* Folders */}
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
          <button onClick={() => { setActiveFolder(null); setShowFavorites(false); }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 ${!activeFolder ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Archive size={12} /> All
          </button>
          {folders.map((f) => (
            <button key={f.id} onClick={() => setActiveFolder(f.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 ${activeFolder === f.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <FolderOpen size={12} />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-[9px] text-slate-600">{getFolderAssetCount(f.id)}</span>
            </button>
          ))}
        </div>

        {/* Assets */}
        <div className="border border-slate-800 rounded-lg p-2 min-h-[200px]">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                <X size={12} /> Clear
              </Button>
              <span className="text-xs text-slate-400">{selectedIds.size} selected</span>
              <Button size="sm" variant="danger" onClick={handleDeleteSelected}>
                <Trash2 size={12} /> Delete
              </Button>
            </div>
          )}

          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 py-8"
              onDoubleClick={() => fileInputRef.current?.click()}>
              <Image size={28} className="opacity-20 mb-2" />
              <p className="text-xs mb-1">Drop files here or click to upload</p>
              <p className="text-[10px] text-slate-700">Supports PNG, JPG, SVG</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-4 gap-2">
              {filteredAssets.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <div key={asset.id}
                    onClick={() => handleToggleSelect(asset.id)}
                    className={`aspect-square bg-slate-950 rounded-lg border relative group overflow-hidden cursor-pointer transition ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}>
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-contain p-1" />
                    {asset.favorite && <Star size={10} className="absolute top-1 left-1 fill-amber-400 text-amber-400" />}
                    {isSelected && <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"><CheckSquare size={10} className="text-white" /></div>}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(asset.id); }}
                        className="p-1 text-white/80 hover:text-amber-400 transition cursor-pointer">
                        <Star size={10} fill={asset.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setAssets((prev) => prev.filter((a) => a.id !== asset.id)); }}
                        className="p-1 text-white/80 hover:text-red-400 transition cursor-pointer">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 text-[7px] text-white/70 text-center truncate px-1 pb-0.5">{asset.name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAssets.map((asset) => (
                <div key={asset.id} onClick={() => handleToggleSelect(asset.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                    selectedIds.has(asset.id) ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-slate-800/30'}`}>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleSelect(asset.id); }}>
                    {selectedIds.has(asset.id) ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} className="text-slate-600" />}
                  </button>
                  <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                    <img src={asset.dataUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{asset.name}</p>
                    <p className="text-[9px] text-slate-600">{asset.type} · {asset.tags.length} tags</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(asset.id); }}
                    className={`p-1 transition cursor-pointer ${asset.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}>
                    <Star size={11} fill={asset.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredAssets.length > 0 && (
            <p className="text-[9px] text-slate-600 text-center mt-2">{filteredAssets.length} asset(s)</p>
          )}
        </div>
      </div>
    </div>
  );
}
