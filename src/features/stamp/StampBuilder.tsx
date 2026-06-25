import React, { useState, useRef } from 'react';
import { Upload, RotateCcw, Download, Check, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export type StampShape = 'round' | 'rectangle' | 'seal';

interface StampConfig {
  shape: StampShape;
  text: string;
  subtext?: string;
  borderColor: string;
  fillColor: string;
  textColor: string;
  rotation: number;
  opacity: number;
  scale: number;
}

interface StampBuilderProps {
  onSave: (dataUrl: string, config: StampConfig) => void;
  existingStamp?: string;
}

export function StampBuilder({ onSave, existingStamp }: StampBuilderProps) {
  const [config, setConfig] = useState<StampConfig>({
    shape: 'round',
    text: 'APPROVED',
    subtext: 'Authorized Signature',
    borderColor: '#1e3a8a',
    fillColor: 'transparent',
    textColor: '#1e3a8a',
    rotation: 0,
    opacity: 1,
    scale: 1,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.save();

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 15;
    const halfW = size / 2 - 20;
    const halfH = size / 2 - 20;

    if (config.shape === 'round') {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = 4;
      ctx.stroke();
      if (config.fillColor !== 'transparent') {
        ctx.fillStyle = config.fillColor;
        ctx.fill();
      }

      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 18px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.text, cx, cy - 8);

      if (config.subtext) {
        ctx.font = '10px Inter';
        ctx.fillText(config.subtext, cx, cy + 16);
      }
    } else if (config.shape === 'rectangle') {
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, size - 40, size - 40);
      if (config.fillColor !== 'transparent') {
        ctx.fillStyle = config.fillColor;
        ctx.fillRect(20, 20, size - 40, size - 40);
      }

      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 22px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.text, cx, cy - 6);

      if (config.subtext) {
        ctx.font = '11px Inter';
        ctx.fillText(config.subtext, cx, cy + 18);
      }
    } else if (config.shape === 'seal') {
      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Star in center
      if (config.fillColor !== 'transparent') {
        ctx.fillStyle = config.fillColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 25, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.text, cx, cy - 10);

      if (config.subtext) {
        ctx.font = '9px Inter';
        ctx.fillText(config.subtext, cx, cy + 10);
      }
    }

    ctx.restore();
    onSave(canvas.toDataURL('image/png'), config);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            onSave(canvas.toDataURL('image/png'), config);
          };
          img.src = reader.result as string;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Stamp Builder</h3>
      </div>

      {/* Shape Selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-900">
        {(['round', 'rectangle', 'seal'] as StampShape[]).map(shape => (
          <button
            key={shape}
            onClick={() => setConfig(prev => ({ ...prev, shape }))}
            className={`py-1.5 text-xs rounded font-medium transition uppercase ${
              config.shape === shape ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {shape === 'seal' ? 'Seal Style' : shape}
          </button>
        ))}
      </div>

      {/* Text Inputs */}
      <Input
        label="Stamp Text"
        value={config.text}
        onChange={e => setConfig(prev => ({ ...prev, text: e.target.value }))}
        placeholder="e.g. APPROVED"
      />
      <Input
        label="Subtext (optional)"
        value={config.subtext || ''}
        onChange={e => setConfig(prev => ({ ...prev, subtext: e.target.value }))}
        placeholder="e.g. Authorized Signature"
      />

      {/* Colors */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Border</label>
          <input
            type="color"
            value={config.borderColor}
            onChange={e => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Fill</label>
          <input
            type="color"
            value={config.fillColor === 'transparent' ? '#ffffff' : config.fillColor}
            onChange={e => setConfig(prev => ({ ...prev, fillColor: e.target.value }))}
            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
          <button
            onClick={() => setConfig(prev => ({ ...prev, fillColor: 'transparent' }))}
            className="text-[9px] text-slate-500 hover:text-slate-300 mt-0.5 cursor-pointer"
          >
            Transparent
          </button>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Text</label>
          <input
            type="color"
            value={config.textColor}
            onChange={e => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase font-bold text-slate-400 w-16">Scale</label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={config.scale}
            onChange={e => setConfig(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-500 w-8">{config.scale}x</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase font-bold text-slate-400 w-16">Rotate</label>
          <input
            type="range"
            min={-180}
            max={180}
            step={5}
            value={config.rotation}
            onChange={e => setConfig(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-500 w-8">{config.rotation}°</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase font-bold text-slate-400 w-16">Opacity</label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={config.opacity}
            onChange={e => setConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-500 w-8">{Math.round(config.opacity * 100)}%</span>
        </div>
      </div>

      {/* Upload existing */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
          <Upload size={14} /> Upload Stamp Image
        </Button>
      </div>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} width={200} height={200} className="hidden" />

      {/* Preview */}
      {existingStamp && (
        <div className="flex justify-center">
          <img
            src={existingStamp}
            alt="Stamp Preview"
            className="border border-slate-800 rounded-lg"
            style={{
              opacity: config.opacity,
              transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={generateStamp} className="flex-1">
          <Check size={14} /> Generate Stamp
        </Button>
      </div>
    </div>
  );
}
