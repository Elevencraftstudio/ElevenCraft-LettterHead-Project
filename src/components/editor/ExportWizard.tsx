import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, Loader2, Save, ListPlus, RotateCcw, Ban } from 'lucide-react';
import { useStore } from '../../store';
import {
  exportManager, exportQueue, exportBatch, downloadBlob, estimateBlobSize, buildMetadata,
  defaultExportOptions, getLastUsedOptions, saveLastUsedOptions,
  setLiveModelProvider, setLiveElementProvider, getLiveModel, getLiveElement,
  BUILTIN_PRESETS, getCustomPresets, saveCustomPreset,
  ExportOptions, ExportFormat, ExportProgress, ExportPreset, ExportDocumentModel, ExportJob,
  WatermarkPosition,
} from '../../export';

interface ExportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  model: ExportDocumentModel;
}

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'pdf', label: 'PDF' },
  { format: 'png', label: 'PNG' },
  { format: 'jpeg', label: 'JPEG' },
  { format: 'svg', label: 'SVG' },
  { format: 'html', label: 'HTML' },
  { format: 'docx', label: 'Word' },
];

const WM_PRESETS = ['DRAFT', 'CONFIDENTIAL', 'INTERNAL', 'SAMPLE'];

const getTargetEl = () => document.getElementById('letterhead-print-canvas');

const sectionCls = 'space-y-2 border-t border-slate-800 pt-4';
const labelCls = 'text-[11px] font-semibold uppercase tracking-wide text-slate-400';
const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none';
const chipCls = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition border ${
    active ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
  }`;

export function ExportWizard({ isOpen, onClose, model }: ExportWizardProps) {
  const addNotification = useStore((s) => s.addNotification);
  const [options, setOptions] = useState<ExportOptions>(() => defaultExportOptions('pdf', model.title || 'document'));
  const [customPresets, setCustomPresets] = useState<ExportPreset[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [lastSize, setLastSize] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchFormats, setBatchFormats] = useState<ExportFormat[]>(['pdf', 'png']);
  const [zipBatch, setZipBatch] = useState(true);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => exportQueue.subscribe(setJobs), []);
  useEffect(() => { void getCustomPresets().then(setCustomPresets); }, []);

  // Background-queue runner + live providers. Set here (lazy chunk) so the heavy
  // export libs only load when the wizard opens. Singletons persist after close.
  useEffect(() => { setLiveElementProvider(() => getTargetEl()); }, []);
  useEffect(() => { setLiveModelProvider(() => model); }, [model]);
  useEffect(() => {
    exportQueue.setRunner(async (job, signal, onProgress) => {
      const result = await exportManager.export({
        element: getLiveElement(), document: getLiveModel(), options: job.options, signal, onProgress,
      });
      downloadBlob(result.blob, result.fileName);
    });
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    void getLastUsedOptions().then((last) => {
      if (last) setOptions({ ...last, fileName: model.title || last.fileName });
    });
  }, [isOpen, model.title]);

  const patch = useCallback((p: Partial<ExportOptions>) => setOptions((o) => ({ ...o, ...p })), []);
  const patchWatermark = useCallback(
    (p: Partial<NonNullable<ExportOptions['watermark']>>) =>
      setOptions((o) => ({ ...o, watermark: { ...(o.watermark ?? { enabled: false, text: 'DRAFT', opacity: 0.15, rotation: -30, position: 'center' }), ...p } })),
    [],
  );
  const patchMeta = useCallback(
    (p: Partial<NonNullable<ExportOptions['metadata']>>) => setOptions((o) => ({ ...o, metadata: { ...(o.metadata ?? {}), ...p } })),
    [],
  );

  const applyPreset = (preset: ExportPreset) => {
    setOptions((o) => ({ ...o, ...preset.options }));
    addNotification({ type: 'info', message: `Preset applied: ${preset.name}`, duration: 2000 });
  };

  const buildOptions = (format: ExportFormat): ExportOptions => ({
    ...options,
    format,
    fileName: options.fileName || model.title || 'document',
    metadata: buildMetadata(model, options.metadata),
  });

  const runExport = async () => {
    if (busy) return;
    setBusy(true);
    setProgress({ phase: 'preparing', percent: 0 });
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const opts = buildOptions(options.format);
      const result = await exportManager.export({
        element: getTargetEl(),
        document: model,
        options: opts,
        signal: controller.signal,
        onProgress: setProgress,
      });
      downloadBlob(result.blob, result.fileName);
      setLastSize(estimateBlobSize(result.blob));
      await saveLastUsedOptions(opts);
      addNotification({ type: 'success', message: `Exported ${result.fileName} (${estimateBlobSize(result.blob)})`, duration: 4000 });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addNotification({ type: 'warning', message: 'Export cancelled', duration: 2500 });
      } else {
        addNotification({ type: 'error', message: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`, duration: 5000 });
      }
    } finally {
      setBusy(false);
      setProgress(null);
      controllerRef.current = null;
    }
  };

  const runBatch = async () => {
    if (busy || batchFormats.length === 0) return;
    setBusy(true);
    setProgress({ phase: 'preparing', percent: 0 });
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const results = await exportBatch({
        element: getTargetEl(),
        document: model,
        baseOptions: { ...buildOptions(options.format), fileName: options.fileName || model.title || 'document' },
        formats: batchFormats,
        zip: zipBatch,
        zipName: options.fileName || model.title || 'document',
        signal: controller.signal,
        onProgress: setProgress,
      });
      results.forEach((r) => downloadBlob(r.blob, r.fileName));
      const total = results.reduce((s, r) => s + r.blob.size, 0);
      setLastSize(`${(total / 1024 / 1024).toFixed(1)} MB`);
      addNotification({ type: 'success', message: `Batch export complete (${batchFormats.length} formats)`, duration: 4000 });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addNotification({ type: 'warning', message: 'Batch cancelled', duration: 2500 });
      } else {
        addNotification({ type: 'error', message: `Batch failed: ${err instanceof Error ? err.message : 'Unknown error'}`, duration: 5000 });
      }
    } finally {
      setBusy(false);
      setProgress(null);
      controllerRef.current = null;
    }
  };

  const addToQueue = () => {
    const opts = buildOptions(options.format);
    exportQueue.enqueue(`${opts.fileName}.${options.format}`, opts);
    addNotification({ type: 'info', message: 'Export added to background queue', duration: 2500 });
  };

  const cancelActive = () => controllerRef.current?.abort();

  const savePresetHandler = async () => {
    const name = window.prompt('Preset name');
    if (!name) return;
    const preset: ExportPreset = {
      id: `custom_${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description: 'Custom preset',
      options: { ...options, format: options.format },
    };
    await saveCustomPreset(preset);
    setCustomPresets(await getCustomPresets());
    addNotification({ type: 'success', message: `Preset "${name}" saved`, duration: 2500 });
  };

  const toggleBatchFormat = (f: ExportFormat) =>
    setBatchFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  if (!isOpen) return null;

  const isPdf = options.format === 'pdf';
  const isRaster = options.format === 'png' || options.format === 'jpeg';
  const wm = options.watermark ?? { enabled: false, text: 'DRAFT', opacity: 0.15, rotation: -30, position: 'center' as WatermarkPosition };
  const meta = options.metadata ?? {};

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Export">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2"><Download size={18} className="text-indigo-400" /> Export Document</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition cursor-pointer" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {/* Presets */}
          <div className="space-y-2">
            <span className={labelCls}>Presets</span>
            <div className="flex flex-wrap gap-2">
              {[...BUILTIN_PRESETS, ...customPresets].map((p) => (
                <button key={p.id} onClick={() => applyPreset(p)} className={chipCls(false)} title={p.description}>{p.name}</button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <span className={labelCls}>Format</span>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button key={f.format} onClick={() => patch({ format: f.format })} className={chipCls(options.format === f.format)}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* File name */}
          <div className="space-y-2">
            <span className={labelCls}>File Name</span>
            <input className={inputCls} value={options.fileName} onChange={(e) => patch({ fileName: e.target.value })} />
          </div>

          {/* Quality (raster / pdf) */}
          {(isRaster || isPdf) && (
            <div className={sectionCls}>
              <span className={labelCls}>Quality</span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <button key={s} onClick={() => patch({ scale: s as ExportOptions['scale'], dpi: undefined })} className={chipCls(options.scale === s && !options.dpi)}>{s}×</button>
                ))}
                <button onClick={() => patch({ dpi: 300 })} className={chipCls(options.dpi === 300)}>300 DPI</button>
              </div>
              {options.format === 'jpeg' && (
                <label className="block text-xs text-slate-400 mt-2">JPEG quality: {Math.round(options.quality * 100)}%
                  <input type="range" min={0.3} max={1} step={0.05} value={options.quality} onChange={(e) => patch({ quality: Number(e.target.value) })} className="w-full" />
                </label>
              )}
            </div>
          )}

          {/* Paper / orientation (pdf) */}
          {isPdf && (
            <div className={sectionCls}>
              <span className={labelCls}>Paper Size & Orientation</span>
              <div className="flex flex-wrap gap-2">
                {(['a4', 'letter', 'legal'] as const).map((p) => (
                  <button key={p} onClick={() => patch({ paperSize: p })} className={chipCls(options.paperSize === p)}>{p.toUpperCase()}</button>
                ))}
                <span className="w-px bg-slate-700 mx-1" />
                {(['portrait', 'landscape'] as const).map((o) => (
                  <button key={o} onClick={() => patch({ orientation: o })} className={chipCls(options.orientation === o)}>{o}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <label className="text-xs text-slate-400">Margins (mm)
                  <input type="number" min={0} max={40} value={options.margins} onChange={(e) => patch({ margins: Number(e.target.value) })} className={inputCls} />
                </label>
                <label className="text-xs text-slate-400">Bleed (mm)
                  <input type="number" min={0} max={10} value={options.bleed ?? 0} onChange={(e) => patch({ bleed: Number(e.target.value) })} className={inputCls} />
                </label>
              </div>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={!!options.cropMarks} onChange={(e) => patch({ cropMarks: e.target.checked })} /> Crop marks
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={!!options.bookmarks} onChange={(e) => patch({ bookmarks: e.target.checked })} /> Bookmarks
                </label>
              </div>
            </div>
          )}

          {/* Background */}
          {(isRaster || options.format === 'svg' || isPdf) && (
            <div className={sectionCls}>
              <span className={labelCls}>Background</span>
              <div className="flex flex-wrap items-center gap-2">
                {(['transparent', 'white', 'custom'] as const).map((b) => (
                  <button key={b} onClick={() => patch({ background: b })} className={chipCls(options.background === b)}>{b}</button>
                ))}
                {options.background === 'custom' && (
                  <input type="color" value={options.backgroundColor ?? '#ffffff'} onChange={(e) => patch({ backgroundColor: e.target.value })} className="w-9 h-8 rounded cursor-pointer bg-transparent" />
                )}
              </div>
            </div>
          )}

          {/* Watermark */}
          <div className={sectionCls}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className={labelCls}>Watermark (export only)</span>
              <input type="checkbox" checked={wm.enabled} onChange={(e) => patchWatermark({ enabled: e.target.checked })} />
            </label>
            {wm.enabled && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {WM_PRESETS.map((t) => (
                    <button key={t} onClick={() => patchWatermark({ text: t })} className={chipCls(wm.text === t)}>{t}</button>
                  ))}
                </div>
                <input className={inputCls} placeholder="Custom text" value={wm.text} onChange={(e) => patchWatermark({ text: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-400">Opacity: {Math.round(wm.opacity * 100)}%
                    <input type="range" min={0.05} max={0.6} step={0.05} value={wm.opacity} onChange={(e) => patchWatermark({ opacity: Number(e.target.value) })} className="w-full" />
                  </label>
                  <label className="text-xs text-slate-400">Rotation: {wm.rotation}°
                    <input type="range" min={-90} max={90} step={5} value={wm.rotation} onChange={(e) => patchWatermark({ rotation: Number(e.target.value) })} className="w-full" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {(['center', 'top', 'bottom', 'tile'] as const).map((p) => (
                    <button key={p} onClick={() => patchWatermark({ position: p })} className={chipCls(wm.position === p)}>{p}</button>
                  ))}
                  <input type="color" value={wm.color ?? '#ff0000'} onChange={(e) => patchWatermark({ color: e.target.value })} className="w-9 h-8 rounded cursor-pointer bg-transparent" />
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className={sectionCls}>
            <span className={labelCls}>Metadata</span>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Title" value={meta.title ?? ''} onChange={(e) => patchMeta({ title: e.target.value })} />
              <input className={inputCls} placeholder="Author" value={meta.author ?? ''} onChange={(e) => patchMeta({ author: e.target.value })} />
              <input className={inputCls} placeholder="Subject" value={meta.subject ?? ''} onChange={(e) => patchMeta({ subject: e.target.value })} />
              <input className={inputCls} placeholder="Keywords (comma sep)" value={(meta.keywords ?? []).join(', ')} onChange={(e) => patchMeta({ keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })} />
            </div>
          </div>

          {/* Batch */}
          <div className={sectionCls}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className={labelCls}>Batch Export (multiple formats)</span>
              <input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} />
            </label>
            {batchMode && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button key={f.format} onClick={() => toggleBatchFormat(f.format)} className={chipCls(batchFormats.includes(f.format))}>{f.label}</button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={zipBatch} onChange={(e) => setZipBatch(e.target.checked)} /> Bundle as ZIP package
                </label>
              </div>
            )}
          </div>

          {/* Queue */}
          {jobs.length > 0 && (
            <div className={sectionCls}>
              <span className={labelCls}>Background Queue</span>
              {jobs.map((j) => (
                <div key={j.id} className="flex items-center gap-2 text-xs bg-slate-800/60 rounded-lg px-3 py-2">
                  <span className="flex-1 truncate text-slate-300">{j.label}</span>
                  <span className="text-slate-500">{j.status === 'running' ? `${j.progress.phase} ${j.progress.percent}%` : j.status}</span>
                  {(j.status === 'queued' || j.status === 'running') && (
                    <button onClick={() => exportQueue.cancel(j.id)} className="text-amber-400 hover:text-amber-300 cursor-pointer" aria-label="Cancel"><Ban size={14} /></button>
                  )}
                  {(j.status === 'failed' || j.status === 'cancelled') && (
                    <button onClick={() => exportQueue.retry(j.id)} className="text-indigo-400 hover:text-indigo-300 cursor-pointer" aria-label="Retry"><RotateCcw size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress / preview summary */}
          <div className="border-t border-slate-800 pt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>{batchMode ? `${batchFormats.length} formats${zipBatch ? ' · ZIP' : ''}` : `${options.format.toUpperCase()} · ${options.dpi ? options.dpi + ' DPI' : options.scale + '×'}`}</span>
            {lastSize && <span>Last export: {lastSize}</span>}
          </div>
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400"><span className="capitalize">{progress.phase}{progress.message ? ` — ${progress.message}` : ''}</span><span>{progress.percent}%</span></div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress.percent}%` }} /></div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-800">
          <button onClick={savePresetHandler} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"><Save size={14} /> Save Preset</button>
          <button onClick={addToQueue} disabled={busy} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"><ListPlus size={14} /> Queue</button>
          <div className="flex-1" />
          {busy ? (
            <button onClick={cancelActive} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 transition cursor-pointer flex items-center gap-2"><Ban size={16} /> Cancel</button>
          ) : (
            <button onClick={batchMode ? runBatch : runExport} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition cursor-pointer flex items-center gap-2">
              <Download size={16} /> Export
            </button>
          )}
          {busy && <Loader2 size={18} className="animate-spin text-indigo-400" />}
        </div>
      </div>
    </div>
  );
}
