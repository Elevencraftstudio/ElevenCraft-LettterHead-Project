import { Exporter, ExportContext, ExportResult, throwIfAborted } from '../types';
import { captureSvgMarkup } from '../capture';
import { prepareTarget } from '../watermark';

export class SvgExporter implements Exporter {
  readonly format = 'svg' as const;
  readonly label = 'SVG Vector';
  readonly extension = 'svg';
  readonly mimeType = 'image/svg+xml';

  async export(ctx: ExportContext): Promise<ExportResult> {
    if (!ctx.element) throw new Error('No element available to export');
    ctx.onProgress?.({ phase: 'preparing', percent: 10 });
    const { target, cleanup } = prepareTarget(ctx.element, ctx.options.watermark);
    try {
      throwIfAborted(ctx.signal);
      ctx.onProgress?.({ phase: 'rendering', percent: 50 });
      let markup = await captureSvgMarkup(target, ctx.options, ctx.signal);
      ctx.onProgress?.({ phase: 'generating', percent: 85 });
      // Light optimisation: collapse redundant whitespace between tags.
      markup = markup.replace(/>\s+</g, '><').trim();
      if (!markup.startsWith('<?xml')) {
        markup = `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
      }
      const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
      ctx.onProgress?.({ phase: 'completed', percent: 100 });
      return { blob, fileName: `${ctx.options.fileName}.svg`, mimeType: this.mimeType };
    } finally {
      cleanup();
    }
  }
}
