import { exportManager } from './ExportManager';
import { PdfExporter } from './pdf/PdfExporter';
import { PngExporter } from './png/PngExporter';
import { JpegExporter } from './jpeg/JpegExporter';
import { SvgExporter } from './svg/SvgExporter';
import { HtmlExporter } from './html/HtmlExporter';
import { DocxExporter } from './docx/DocxExporter';

let registered = false;

/** Register the built-in exporters. Idempotent. Additional formats (ODT, RTF,
 *  Markdown…) can be registered the same way without changing the manager. */
export function registerBuiltinExporters(): void {
  if (registered) return;
  registered = true;
  exportManager.register(new PdfExporter());
  exportManager.register(new PngExporter());
  exportManager.register(new JpegExporter());
  exportManager.register(new SvgExporter());
  exportManager.register(new HtmlExporter());
  exportManager.register(new DocxExporter());
}

registerBuiltinExporters();

export * from './types';
export { exportManager, ExportManager } from './ExportManager';
export { exportQueue } from './ExportQueue';
export type { ExportJob, ExportJobStatus, JobRunner } from './ExportQueue';
export { exportBatch } from './batch/BatchExporter';
export type { BatchParams } from './batch/BatchExporter';
export {
  defaultExportOptions, setLiveModelProvider, setLiveElementProvider, getLiveModel, getLiveElement,
} from './ExportContext';
export {
  BUILTIN_PRESETS, getCustomPresets, saveCustomPreset, deleteCustomPreset,
  getLastUsedOptions, saveLastUsedOptions,
} from './presets';
export type { ExportPreset } from './presets';
export { downloadBlob, estimateBlobSize } from './download';
export { buildMetadata } from './metadata';
