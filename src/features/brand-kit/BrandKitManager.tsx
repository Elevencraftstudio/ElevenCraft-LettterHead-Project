import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, Check, ChevronRight, Palette, Type, Image } from 'lucide-react';
import { useBrandKit } from '../../contexts/BrandKitContext';
import { useDocument } from '../../contexts/DocumentContext';
import { BrandKit } from '../../types/brand-kit';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function BrandKitManager() {
  const { state, activeKit, addKit, updateKit, removeKit, setActiveKit, createDefaultKit } = useBrandKit();
  const { state: docState, updateCompany, updateStyle } = useDocument();
  const [showCreate, setShowCreate] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [editingKitId, setEditingKitId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKitName.trim()) return;
    const kit = createDefaultKit(newKitName.trim());
    addKit(kit);
    setNewKitName('');
    setShowCreate(false);
  };

  const handleApply = (kit: BrandKit) => {
    setActiveKit(kit.id);
    updateCompany(kit.company);
    if (kit.colors) {
      updateStyle({ primaryColor: kit.colors.primary, secondaryColor: kit.colors.secondary, textColor: kit.colors.text });
    }
  };

  const handleDuplicate = (kit: BrandKit) => {
    const duplicate: BrandKit = {
      ...kit,
      id: `brand-${Date.now()}`,
      name: `${kit.name} (Copy)`,
      metadata: { ...kit.metadata, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDefault: false },
    };
    addKit(duplicate);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Brand Kits</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          <span>New Brand</span>
        </Button>
      </div>

      {showCreate && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
          <Input
            label="Brand Name"
            value={newKitName}
            onChange={e => setNewKitName(e.target.value)}
            placeholder="e.g. My Company Brand"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!newKitName.trim()}>
              <Check size={14} />
              <span>Create</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowCreate(false); setNewKitName(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {state.kits.length === 0 && !showCreate && (
          <p className="text-xs text-slate-500 text-center py-6">No brand kits yet. Create your first one.</p>
        )}
        {state.kits.map(kit => {
          const isActive = activeKit?.id === kit.id;
          const isEditing = editingKitId === kit.id;

          return (
            <div
              key={kit.id}
              className={`bg-slate-900/40 border rounded-xl p-3 transition ${
                isActive ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={kit.name}
                    onChange={e => updateKit(kit.id, { name: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => setEditingKitId(null)}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingKitId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: kit.colors?.primary || '#0f172a' }} />
                      <span className="text-sm font-bold text-slate-200 truncate">{kit.name}</span>
                      {kit.metadata.isDefault && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingKitId(kit.id)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition cursor-pointer">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDuplicate(kit)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition cursor-pointer">
                        <Copy size={12} />
                      </button>
                      <button onClick={() => removeKit(kit.id)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Kit Preview */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Palette size={10} />
                      {kit.colors?.primary} / {kit.colors?.secondary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Type size={10} />
                      {kit.fonts?.heading}
                    </span>
                    {kit.assets?.logo && (
                      <span className="flex items-center gap-1">
                        <Image size={10} />
                        Logo
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? 'primary' : 'outline'}
                    onClick={() => handleApply(kit)}
                    className="w-full"
                  >
                    {isActive ? (
                      <><Check size={12} /> Active</>
                    ) : (
                      <><ChevronRight size={12} /> Apply Brand</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
