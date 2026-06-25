import React from 'react';
import { Check } from 'lucide-react';

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'texture' | 'gradient' | 'pattern' | 'glass';
  cssClass: string;
  category: 'paper' | 'texture' | 'gradient' | 'pattern' | 'glass';
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'solid-white', name: 'Solid White', type: 'color', cssClass: 'bg-white', category: 'paper' },
  { id: 'warm-ivory', name: 'Warm Ivory', type: 'color', cssClass: 'bg-[#FAF9F5]', category: 'paper' },
  { id: 'cream-texture', name: 'Classic Cream', type: 'color', cssClass: 'bg-[#FCF8F2]', category: 'paper' },
  { id: 'linen', name: 'Linen', type: 'texture', cssClass: 'bg-[#F5F0EB]', category: 'texture' },
  { id: 'marble', name: 'Marble', type: 'texture', cssClass: 'bg-[#F0EDE8]', category: 'texture' },
  { id: 'cotton', name: 'Cotton', type: 'texture', cssClass: 'bg-[#F8F6F2]', category: 'texture' },
  { id: 'kraft', name: 'Kraft Paper', type: 'texture', cssClass: 'bg-[#D4A76A]', category: 'texture' },
  { id: 'watercolor', name: 'Watercolor', type: 'texture', cssClass: 'bg-gradient-to-br from-blue-50 via-white to-amber-50', category: 'texture' },
  { id: 'mesh-gradient-1', name: 'Indigo Glow', type: 'gradient', cssClass: 'bg-gradient-to-br from-indigo-100 via-white to-purple-100', category: 'gradient' },
  { id: 'mesh-gradient-2', name: 'Emerald Mist', type: 'gradient', cssClass: 'bg-gradient-to-br from-emerald-100 via-white to-teal-100', category: 'gradient' },
  { id: 'mesh-gradient-3', name: 'Rose Blush', type: 'gradient', cssClass: 'bg-gradient-to-br from-rose-100 via-white to-amber-100', category: 'gradient' },
  { id: 'geometric-1', name: 'Dots Grid', type: 'pattern', cssClass: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px]', category: 'pattern' },
  { id: 'geometric-2', name: 'Diagonal Stripes', type: 'pattern', cssClass: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f1f5f9_10px,#f1f5f9_11px)]', category: 'pattern' },
  { id: 'glass-1', name: 'Frosted Glass', type: 'glass', cssClass: 'backdrop-blur-md bg-white/70', category: 'glass' },
];

interface BackgroundLibraryProps {
  activeBackground: string;
  onSelect: (background: BackgroundPreset) => void;
}

export function BackgroundLibrary({ activeBackground, onSelect }: BackgroundLibraryProps) {
  const categories = [
    { id: 'paper', label: 'Paper' },
    { id: 'texture', label: 'Textures' },
    { id: 'gradient', label: 'Gradients' },
    { id: 'pattern', label: 'Patterns' },
    { id: 'glass', label: 'Glass' },
  ] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Background Library</h3>

      {categories.map(cat => {
        const items = BACKGROUND_PRESETS.filter(b => b.category === cat.id);
        if (items.length === 0) return null;

        return (
          <div key={cat.id} className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{cat.label}</h4>
            <div className="grid grid-cols-4 gap-2">
              {items.map(bg => {
                const isActive = activeBackground === bg.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => onSelect(bg)}
                    className={`aspect-[3/2] rounded-lg border overflow-hidden relative transition ${
                      isActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-full h-full ${bg.cssClass}`} />
                    {isActive && (
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                      <p className="text-[8px] text-white/90 truncate text-center">{bg.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
