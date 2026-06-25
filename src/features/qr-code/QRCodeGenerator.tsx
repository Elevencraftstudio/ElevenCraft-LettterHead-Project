import React, { useState, useMemo } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export type QRDataType = 'url' | 'whatsapp' | 'email' | 'map' | 'upi' | 'payment' | 'portfolio' | 'text' | 'phone' | 'sms';

interface QRConfig {
  dataType: QRDataType;
  value: string;
  size: number;
  color: string;
  bgColor: string;
  rotation: number;
  opacity: number;
}

interface QRCodeGeneratorProps {
  onGenerate: (dataUrl: string, config: QRConfig) => void;
  onClose: () => void;
}

const QR_TYPES: { id: QRDataType; label: string; placeholder: string }[] = [
  { id: 'url', label: 'Website URL', placeholder: 'https://example.com' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
  { id: 'email', label: 'Email', placeholder: 'email@example.com' },
  { id: 'map', label: 'Google Maps', placeholder: 'https://maps.google.com/?q=place' },
  { id: 'upi', label: 'UPI Payment', placeholder: 'upi://pay?pa=merchant@upi&pn=Name' },
  { id: 'payment', label: 'Payment Link', placeholder: 'https://pay.example.com/invoice/123' },
  { id: 'phone', label: 'Phone', placeholder: '+1234567890' },
  { id: 'sms', label: 'SMS', placeholder: '+1234567890' },
  { id: 'text', label: 'Plain Text', placeholder: 'Enter any text' },
  { id: 'portfolio', label: 'Portfolio', placeholder: 'https://portfolio.example.com' },
];

export function QRCodeGenerator({ onGenerate, onClose }: QRCodeGeneratorProps) {
  const [config, setConfig] = useState<QRConfig>({
    dataType: 'url',
    value: '',
    size: 150,
    color: '#000000',
    bgColor: '#ffffff',
    rotation: 0,
    opacity: 1,
  });

  const qrDataUrl = useMemo(() => {
    if (!config.value.trim()) return '';
    try {
      const encoded = encodeURIComponent(config.value);
      return `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${encoded}&bgcolor=${config.bgColor.replace('#', '')}&color=${config.color.replace('#', '')}`;
    } catch {
      return '';
    }
  }, [config.value, config.size, config.color, config.bgColor]);

  const handleGenerate = () => {
    if (qrDataUrl) onGenerate(qrDataUrl, config);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">QR Code Generator</h3>
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        )}
      </div>

      {/* QR Type */}
      <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
        {QR_TYPES.map(qt => (
          <button
            key={qt.id}
            onClick={() => setConfig(prev => ({ ...prev, dataType: qt.id }))}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
              config.dataType === qt.id
                ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400'
                : 'border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {qt.label}
          </button>
        ))}
      </div>

      {/* Value Input */}
      <Input
        label={QR_TYPES.find(q => q.id === config.dataType)?.placeholder || 'Value'}
        value={config.value}
        onChange={e => setConfig(prev => ({ ...prev, value: e.target.value }))}
        placeholder={QR_TYPES.find(q => q.id === config.dataType)?.placeholder}
      />

      {/* Size */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Size: {config.size}px</label>
        <input
          type="range"
          min={80}
          max={300}
          step={10}
          value={config.size}
          onChange={e => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Color</label>
          <input
            type="color"
            value={config.color}
            onChange={e => setConfig(prev => ({ ...prev, color: e.target.value }))}
            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Background</label>
          <input
            type="color"
            value={config.bgColor}
            onChange={e => setConfig(prev => ({ ...prev, bgColor: e.target.value }))}
            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Opacity: {Math.round(config.opacity * 100)}%</label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={config.opacity}
          onChange={e => setConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Preview & Generate */}
      {qrDataUrl && (
        <div className="flex justify-center">
          <img
            src={qrDataUrl}
            alt="QR Code Preview"
            style={{ opacity: config.opacity, transform: `rotate(${config.rotation}deg)` }}
            className="border border-slate-800 rounded-lg"
          />
        </div>
      )}

      <Button onClick={handleGenerate} disabled={!config.value.trim()} className="w-full">
        Add to Document
      </Button>
    </div>
  );
}
