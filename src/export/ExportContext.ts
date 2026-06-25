import { ExportOptions, ExportFormat, ExportDocumentModel } from './types';

export function defaultExportOptions(format: ExportFormat, fileName: string): ExportOptions {
  return {
    format,
    fileName: fileName || 'document',
    quality: 0.92,
    scale: 2,
    paperSize: 'a4',
    orientation: 'portrait',
    background: 'white',
    margins: 0,
    cropMarks: false,
    bleed: 0,
    bookmarks: true,
    watermark: { enabled: false, text: 'DRAFT', opacity: 0.15, rotation: -30, position: 'center' },
    metadata: {},
  };
}

// Live providers let the background ExportQueue pull the *current* document and
// DOM target at run time, avoiding stale React closures.
let modelProvider: (() => ExportDocumentModel) | null = null;
let elementProvider: (() => HTMLElement | null) | null = null;

export function setLiveModelProvider(fn: () => ExportDocumentModel): void {
  modelProvider = fn;
}

export function setLiveElementProvider(fn: () => HTMLElement | null): void {
  elementProvider = fn;
}

export function getLiveModel(): ExportDocumentModel {
  if (!modelProvider) throw new Error('No live document model provider registered');
  return modelProvider();
}

export function getLiveElement(): HTMLElement | null {
  return elementProvider ? elementProvider() : null;
}
