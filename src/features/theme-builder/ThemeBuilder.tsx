import React, { useState } from 'react';
import { Save, Upload, Download, Copy, Check, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StyleConfig, LayoutTheme } from '../../types';
import { useDocument } from '../../contexts/DocumentContext';

interface CustomTheme {
  id: string;
  name: string;
  style: StyleConfig;
}

export function ThemeBuilder() {
  const { state, updateStyle } = useDocument();
  const [themes, setThemes] = useState<CustomTheme[]>(() => {
    const saved = localStorage.getItem('custom-themes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSave, setShowSave] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const persistThemes = (updated: CustomTheme[]) => {
    setThemes(updated);
    localStorage.setItem('custom-themes', JSON.stringify(updated));
  };

  const handleSaveTheme = () => {
    if (!themeName.trim()) return;
    const newTheme: CustomTheme = { id: `theme-${Date.now()}`, name: themeName.trim(), style: { ...state.style } };
    persistThemes([...themes, newTheme]);
    setThemeName('');
    setShowSave(false);
  };

  const handleApplyTheme = (theme: CustomTheme) => {
    updateStyle(theme.style);
  };

  const handleDuplicateTheme = (theme: CustomTheme) => {
    const dup: CustomTheme = { ...theme, id: `theme-${Date.now()}`, name: `${theme.name} (Copy)` };
    persistThemes([...themes, dup]);
  };

  const handleDeleteTheme = (id: string) => {
    persistThemes(themes.filter(t => t.id !== id));
  };

  const handleExportThemes = () => {
    const blob = new Blob([JSON.stringify(themes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-themes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportThemes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (Array.isArray(imported)) persistThemes([...themes, ...imported]);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Theme Builder</h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleExportThemes} title="Export themes">
            <Upload size={14} />
          </Button>
          <label className="cursor-pointer p-1.5 bg-transparent hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition flex items-center justify-center"
            title="Import themes">
            <Download size={14} />
            <input type="file" accept=".json" onChange={handleImportThemes} className="hidden" />
          </label>
          <Button size="sm" onClick={() => setShowSave(true)}>
            <Save size={14} />
            <span>Save Current</span>
          </Button>
        </div>
      </div>

      {showSave && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2">
          <Input
            value={themeName}
            onChange={e => setThemeName(e.target.value)}
            placeholder="Theme name"
            onKeyDown={e => e.key === 'Enter' && handleSaveTheme()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveTheme} disabled={!themeName.trim()}>
              <Check size={14} /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowSave(false); setThemeName(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {themes.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">No custom themes saved yet.</p>
        )}
        {themes.map(theme => (
          <div key={theme.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.style.primaryColor }} />
                  <div className="w-3 h-3 rounded-full -ml-1" style={{ backgroundColor: theme.style.secondaryColor }} />
                </div>
                <span className="text-xs font-bold text-slate-200 truncate">{theme.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleDuplicateTheme(theme)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition cursor-pointer" title="Duplicate">
                  <Copy size={11} />
                </button>
                <button onClick={() => handleDeleteTheme(theme.id)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition cursor-pointer" title="Delete">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 mb-2">
              {theme.style.theme} &middot; {theme.style.fontPair} &middot; {theme.style.paperBackground}
            </div>
            <Button size="sm" variant="outline" onClick={() => handleApplyTheme(theme)} className="w-full">
              Apply Theme
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
