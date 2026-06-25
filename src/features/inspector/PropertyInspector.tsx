import React from 'react';
import { Type, Move, RotateCcw, Square, Layers, Palette, Grid3X3, Sliders } from 'lucide-react';
import { useStore } from '../../store';
import { CanvasElement } from '../../types/document';

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-slate-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
      >
        <Icon size={13} className="text-indigo-400" />
        <span className="flex-1 text-left">{title}</span>
        <svg className={`w-3 h-3 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-slate-500 w-16">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded border border-slate-800 bg-transparent cursor-pointer shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-slate-500 w-16">{label}</label>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step || 1}
        className="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function RangeInput({ label, value, onChange, min = 0, max = 100, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-slate-500">{label}</label>
        <span className="text-[9px] font-mono text-slate-600">{Math.round(value)}%</span>
      </div>
      <input
        type="range"
        value={value * (max / 100)}
        onChange={(e) => onChange((parseFloat(e.target.value) / (max / 100)))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-slate-500 w-16">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function PropertyInspector() {
  const { selectedElementIds, pages, activePageId, updateElement } = useStore();

  const activePage = pages.find((p) => p.id === activePageId);
  const selectedElement = selectedElementIds.length === 1
    ? activePage?.elements.find((e) => e.id === selectedElementIds[0])
    : null;

  if (!selectedElement) {
    return (
      <div className="p-4 text-center">
        <Square size={24} className="mx-auto text-slate-700 mb-2" />
        <p className="text-xs text-slate-600">Select an element to edit its properties</p>
        <p className="text-[10px] text-slate-700 mt-1">Click on any element in the canvas</p>
      </div>
    );
  }

  const update = (props: Partial<CanvasElement>) => {
    if (activePageId) updateElement(activePageId, { ...selectedElement, ...props });
  };

  return (
    <div className="divide-y divide-slate-800/50">
      {/* Element type header */}
      <div className="px-3 py-2.5 flex items-center gap-2 bg-slate-900/30">
        <div className="p-1 bg-indigo-600/20 text-indigo-400 rounded">
          <Square size={12} />
        </div>
        <span className="text-xs font-bold text-slate-200 uppercase">{selectedElement.type}</span>
      </div>

      {/* Position */}
      <Section title="Position & Size" icon={Move}>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X" value={selectedElement.x} onChange={(v) => update({ x: v })} />
          <NumberInput label="Y" value={selectedElement.y} onChange={(v) => update({ y: v })} />
          <NumberInput label="W" value={selectedElement.width} onChange={(v) => update({ width: v })} min={1} />
          <NumberInput label="H" value={selectedElement.height} onChange={(v) => update({ height: v })} min={1} />
        </div>
        <NumberInput label="Rotation" value={selectedElement.rotation} onChange={(v) => update({ rotation: v })} min={-360} max={360} />
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <RangeInput label="Opacity" value={selectedElement.opacity * 100} onChange={(v) => update({ opacity: v / 100 })} />
        {selectedElement.props?.fillColor !== undefined && (
          <ColorInput label="Fill" value={selectedElement.props.fillColor || '#000000'} onChange={(v) => update({ props: { ...selectedElement.props, fillColor: v } })} />
        )}
        {selectedElement.props?.strokeColor !== undefined && (
          <ColorInput label="Stroke" value={selectedElement.props.strokeColor || '#000000'} onChange={(v) => update({ props: { ...selectedElement.props, strokeColor: v } })} />
        )}
        {selectedElement.props?.borderRadius !== undefined && (
          <NumberInput label="Radius" value={selectedElement.props.borderRadius || 0} onChange={(v) => update({ props: { ...selectedElement.props, borderRadius: v } })} min={0} />
        )}
      </Section>

      {/* Typography (for text elements) */}
      {selectedElement.type === 'text' && (
        <Section title="Typography" icon={Type}>
          <SelectInput label="Font" value={selectedElement.props?.fontFamily || 'Inter'} onChange={(v) => update({ props: { ...selectedElement.props, fontFamily: v } })}
            options={[
              { value: 'Inter', label: 'Inter' },
              { value: 'Space Grotesk', label: 'Space Grotesk' },
              { value: 'Playfair Display', label: 'Playfair Display' },
              { value: 'Lora', label: 'Lora' },
              { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
            ]}
          />
          <NumberInput label="Size" value={selectedElement.props?.fontSize || 16} onChange={(v) => update({ props: { ...selectedElement.props, fontSize: v } })} min={6} max={200} />
          <NumberInput label="Weight" value={selectedElement.props?.fontWeight || 400} onChange={(v) => update({ props: { ...selectedElement.props, fontWeight: v } })} min={100} max={900} step={100} />
          <NumberInput label="Spacing" value={selectedElement.props?.letterSpacing || 0} onChange={(v) => update({ props: { ...selectedElement.props, letterSpacing: v } })} min={-5} max={20} step={0.5} />
          <NumberInput label="Line H" value={selectedElement.props?.lineHeight || 1.5} onChange={(v) => update({ props: { ...selectedElement.props, lineHeight: v } })} min={0.5} max={3} step={0.1} />
          <ColorInput label="Color" value={selectedElement.props?.textColor || '#000000'} onChange={(v) => update({ props: { ...selectedElement.props, textColor: v } })} />
        </Section>
      )}

      {/* Effects */}
      <Section title="Effects" icon={Sliders} defaultOpen={false}>
        <SelectInput label="Blend" value={selectedElement.props?.blendMode || 'normal'} onChange={(v) => update({ props: { ...selectedElement.props, blendMode: v } })}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'multiply', label: 'Multiply' },
            { value: 'screen', label: 'Screen' },
            { value: 'overlay', label: 'Overlay' },
            { value: 'darken', label: 'Darken' },
            { value: 'lighten', label: 'Lighten' },
          ]}
        />
        {selectedElement.props?.shadowColor !== undefined && (
          <ColorInput label="Shadow" value={selectedElement.props.shadowColor || '#000000'} onChange={(v) => update({ props: { ...selectedElement.props, shadowColor: v } })} />
        )}
      </Section>

      {/* Layer */}
      <Section title="Layer" icon={Layers} defaultOpen={false}>
        <NumberInput label="Z-Index" value={selectedElement.zIndex} onChange={(v) => update({ zIndex: v })} />
        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={selectedElement.locked} onChange={(e) => update({ locked: e.target.checked })} className="w-3 h-3 accent-indigo-500" />
            <span className="text-[10px] text-slate-500">Locked</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={selectedElement.visible} onChange={(e) => update({ visible: e.target.checked })} className="w-3 h-3 accent-indigo-500" />
            <span className="text-[10px] text-slate-500">Visible</span>
          </label>
        </div>
      </Section>
    </div>
  );
}
