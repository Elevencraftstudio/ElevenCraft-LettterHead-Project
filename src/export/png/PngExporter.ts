import { Exporter, ExportContext, ExportResult, throwIfAborted } from '../types';
import { captureCanvas, canvasToBlob } from '../capture';
import { prepareTarget } from '../watermark';

export class PngExporter implements Exporter {
  readonly format = 'png' as const;
  readonly label = 'PNG Image';
  readonly extension = 'png';
  readonly mimeType = 'image/png';

  async export(ctx: ExportContext): Promise<ExportResult> {
    if (!ctx.element) throw new Error('No element available to export');
    ctx.onProgress?.({ phase: 'preparing', percent: 10 });
    const { target, cleanup } = prepareTarget(ctx.element, ctx.options.watermark);
    try {
      throwIfAborted(ctx.signal);
      ctx.onProgress?.({ phase: 'rendering', percent: 40 });
      const canvas = await captureCanvas(target, ctx.options, ctx.signal);
      ctx.onProgress?.({ phase: 'generating', percent: 80 });
      const blob = await canvasToBlob(canvas, 'image/png');
      ctx.onProgress?.({ phase: 'completed', percent: 100 });
      return { blob, fileName: `${ctx.options.fileName}.png`, mimeType: this.mimeType };
    } finally {
      cleanup();
    }
  }
}
