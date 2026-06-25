import { Exporter, ExportContext, ExportResult, throwIfAborted } from '../types';
import { captureCanvas, canvasToBlob } from '../capture';
import { prepareTarget } from '../watermark';

export class JpegExporter implements Exporter {
  readonly format = 'jpeg' as const;
  readonly label = 'JPEG Image';
  readonly extension = 'jpg';
  readonly mimeType = 'image/jpeg';

  async export(ctx: ExportContext): Promise<ExportResult> {
    if (!ctx.element) throw new Error('No element available to export');
    ctx.onProgress?.({ phase: 'preparing', percent: 10 });
    const { target, cleanup } = prepareTarget(ctx.element, ctx.options.watermark);
    try {
      throwIfAborted(ctx.signal);
      ctx.onProgress?.({ phase: 'rendering', percent: 40 });
      // JPEG has no alpha — force an opaque background.
      const bg = ctx.options.background === 'transparent' ? '#ffffff' : undefined;
      const canvas = await captureCanvas(target, ctx.options, ctx.signal, bg);
      ctx.onProgress?.({ phase: 'compressing', percent: 80 });
      const quality = ctx.options.quality > 0 ? ctx.options.quality : 0.92;
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      ctx.onProgress?.({ phase: 'completed', percent: 100 });
      return { blob, fileName: `${ctx.options.fileName}.jpg`, mimeType: this.mimeType };
    } finally {
      cleanup();
    }
  }
}
