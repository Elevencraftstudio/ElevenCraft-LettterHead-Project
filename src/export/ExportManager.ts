import { Exporter, ExportFormat, ExportContext, ExportResult } from './types';

/**
 * Central registry + dispatcher. Exporters are plugins: register() any object
 * implementing Exporter and it becomes available without touching this class.
 */
export class ExportManager {
  private exporters = new Map<ExportFormat, Exporter>();

  register(exporter: Exporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  unregister(format: ExportFormat): void {
    this.exporters.delete(format);
  }

  has(format: ExportFormat): boolean {
    return this.exporters.has(format);
  }

  get(format: ExportFormat): Exporter | undefined {
    return this.exporters.get(format);
  }

  list(): Exporter[] {
    return Array.from(this.exporters.values());
  }

  async export(ctx: ExportContext): Promise<ExportResult> {
    const exporter = this.exporters.get(ctx.options.format);
    if (!exporter) throw new Error(`No exporter registered for format: ${ctx.options.format}`);
    ctx.onProgress?.({ phase: 'preparing', percent: 5 });
    return exporter.export(ctx);
  }
}

export const exportManager = new ExportManager();
