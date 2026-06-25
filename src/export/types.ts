// Core contracts for the modular export pipeline.
// Adding a new format = implement Exporter + register it with ExportManager.
// No core file needs to change (plugin architecture).

export type ExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg' | 'html' | 'docx';

export type PaperSize = 'a4' | 'letter' | 'legal';
export type Orientation = 'portrait' | 'landscape';
export type ExportScale = 1 | 2 | 3 | 4;
export type BackgroundMode = 'transparent' | 'white' | 'custom';
export type WatermarkPosition = 'center' | 'top' | 'bottom' | 'tile';

export interface WatermarkOptions {
  enabled: boolean;
  text: string;
  opacity: number;        // 0..1
  rotation: number;       // degrees
  position: WatermarkPosition;
  color?: string;
  fontSize?: number;
}

export interface ExportMetadata {
  title?: string;
  author?: string;
  company?: string;
  subject?: string;
  keywords?: string[];
  createdDate?: string;
  modifiedDate?: string;
  documentVersion?: string;
  appVersion?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  fileName: string;
  quality: number;          // 0..1, used by jpeg
  scale: ExportScale;       // raster pixel ratio
  dpi?: number;             // when set (e.g. 300) overrides scale
  paperSize: PaperSize;
  orientation: Orientation;
  background: BackgroundMode;
  backgroundColor?: string; // when background === 'custom'
  margins: number;          // mm (pdf)
  cropMarks?: boolean;
  bleed?: number;           // mm (pdf)
  bookmarks?: boolean;      // pdf outline for multipage
  watermark?: WatermarkOptions;
  metadata?: ExportMetadata;
  pageRange?: string;
}

export type ExportPhase =
  | 'queued' | 'preparing' | 'rendering' | 'generating'
  | 'compressing' | 'saving' | 'completed' | 'failed';

export interface ExportProgress {
  phase: ExportPhase;
  percent: number;          // 0..100
  message?: string;
}

export type ProgressCallback = (p: ExportProgress) => void;

export interface ExportDocumentModel {
  title: string;
  docMode: string;
  company: Record<string, unknown>;
  letter: Record<string, unknown>;
  proposal: Record<string, unknown>;
  style: Record<string, unknown>;
}

export interface ExportContext {
  element: HTMLElement | null;     // primary DOM target (print canvas)
  pageElements?: HTMLElement[];    // optional, for true multi-page raster
  document: ExportDocumentModel;   // content snapshot for content-based exporters
  options: ExportOptions;
  signal?: AbortSignal;            // cancellation token
  onProgress?: ProgressCallback;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export interface Exporter {
  readonly format: ExportFormat;
  readonly label: string;
  readonly extension: string;
  readonly mimeType: string;
  export(ctx: ExportContext): Promise<ExportResult>;
}

export const APP_VERSION = '1.0.0';

/** Throws a DOMException AbortError if the signal is aborted. */
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
