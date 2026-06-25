import JSZip from 'jszip';
import { exportManager } from '../ExportManager';
import {
  ExportFormat, ExportOptions, ExportResult, ExportDocumentModel,
  ExportProgress, throwIfAborted,
} from '../types';

export interface BatchParams {
  element: HTMLElement | null;
  pageElements?: HTMLElement[];
  document: ExportDocumentModel;
  baseOptions: ExportOptions;
  formats: ExportFormat[];
  zip: boolean;
  zipName?: string;
  signal?: AbortSignal;
  onProgress?: (p: ExportProgress) => void;
}

/**
 * Run several exporters over the same document. Optionally bundle the outputs
 * into a single ZIP package. Honours the cancellation signal between formats.
 */
export async function exportBatch(params: BatchParams): Promise<ExportResult[]> {
  const { element, pageElements, document, baseOptions, formats, zip, zipName, signal, onProgress } = params;
  const results: ExportResult[] = [];

  for (let i = 0; i < formats.length; i++) {
    throwIfAborted(signal);
    const fmt = formats[i];
    if (!exportManager.has(fmt)) continue;
    onProgress?.({
      phase: 'rendering',
      percent: Math.round((i / formats.length) * (zip ? 80 : 100)),
      message: `${fmt.toUpperCase()} (${i + 1}/${formats.length})`,
    });
    const result = await exportManager.export({
      element,
      pageElements,
      document,
      options: { ...baseOptions, format: fmt },
      signal,
    });
    results.push(result);
  }

  if (!zip) {
    onProgress?.({ phase: 'completed', percent: 100 });
    return results;
  }

  onProgress?.({ phase: 'compressing', percent: 85 });
  const archive = new JSZip();
  results.forEach((r) => archive.file(r.fileName, r.blob));
  const blob = await archive.generateAsync({ type: 'blob', compression: 'DEFLATE' }, (meta) =>
    onProgress?.({ phase: 'compressing', percent: 85 + Math.round(meta.percent * 0.14) }),
  );
  onProgress?.({ phase: 'completed', percent: 100 });
  return [{ blob, fileName: `${zipName || baseOptions.fileName}.zip`, mimeType: 'application/zip' }];
}
