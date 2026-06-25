import React, { useState } from 'react';
import { Folder, FolderOpen, Search, Upload, File, Image, Trash2, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Asset {
  id: string;
  name: string;
  type: 'logo' | 'signature' | 'stamp' | 'background' | 'watermark' | 'icon' | 'image';
  dataUrl: string;
  folderId?: string;
  createdAt: string;
}

interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
}

export function AssetManager() {
  const [assets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([
    { id: 'root-logos', name: 'Logos' },
    { id: 'root-signatures', name: 'Signatures' },
    { id: 'root-stamps', name: 'Stamps' },
    { id: 'root-backgrounds', name: 'Backgrounds' },
  ]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter(a => {
    const matchesFolder = !activeFolder || a.folderId === activeFolder;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders(prev => [...prev, { id: `folder-${Date.now()}`, name: newFolderName.trim() }]);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for upload handling
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Assets</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(true)}>
            <Folder size={14} />
            <span>Folder</span>
          </Button>
          <Button size="sm" variant="primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            <span>Upload</span>
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {showNewFolder && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2 flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
          />
          <button onClick={handleCreateFolder} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold cursor-pointer">Add</button>
          <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="text-slate-500 hover:text-slate-300 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search assets..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Folders & Assets */}
      <div className="grid grid-cols-2 gap-4">
        {/* Folder Tree */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveFolder(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 ${
              !activeFolder ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <FolderOpen size={12} />
            <span>All Assets</span>
          </button>
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 ${
                activeFolder === folder.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <Folder size={12} />
              <span>{folder.name}</span>
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div className="border border-slate-800 rounded-lg p-2 min-h-[200px]">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Image size={24} className="opacity-30 mb-2" />
              <p className="text-xs">No assets yet</p>
              <p className="text-[10px] mt-0.5">Upload logos, signatures or stamps</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="aspect-square bg-slate-950 rounded-lg border border-slate-800 relative group overflow-hidden">
                  <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button className="p-1 text-white hover:text-red-400 transition cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/60 text-white/80 py-0.5 truncate px-1">
                    {asset.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {assets.length > 0 && (
        <p className="text-[10px] text-slate-600 text-center">{assets.length} asset(s)</p>
      )}
    </div>
  );
}
