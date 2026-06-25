import { jsPDF } from 'jspdf';
import { Exporter, ExportContext, ExportResult, PaperSize, Orientation, throwIfAborted } from '../types';
import { captureCanvas } from '../capture';
import { prepareTarget } from '../watermark';

// Trim dimensions in millimetres.
const PAPER_MM: Record<PaperSize, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

function trimSize(size: PaperSize, orientation: Orientation): [number, number] {
  const [w, h] = PAPER_MM[size];
  return orientation === 'landscape' ? [h, w] : [w, h];
}

export class PdfExporter implements Exporter {
  readonly format = 'pdf' as const;
  readonly label = 'PDF Document';
  readonly extension = 'pdf';
  readonly mimeType = 'application/pdf';

  async export(ctx: ExportContext): Promise<ExportResult> {
    if (!ctx.element) throw new Error('No element available to export');
    const o = ctx.options;
    const bleed = o.bleed ?? 0;
    const [trimW, trimH] = trimSize(o.paperSize, o.orientation);
    const pageW = trimW + bleed * 2;
    const pageH = trimH + bleed * 2;

    const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH], orientation: o.orientation });

    // Metadata
    const m = o.metadata;
    if (m) {
      pdf.setProperties({
        title: m.title ?? '',
        subject: m.subject ?? '',
        author: m.author ?? '',
        keywords: (m.keywords ?? []).join(', '),
        creator: `Eleven Craft Studio ${m.appVersion ?? ''}`.trim(),
      });
    }

    const pages = ctx.pageElements && ctx.pageElements.length > 0 ? ctx.pageElements : [ctx.element];

    for (let i = 0; i < pages.length; i++) {
      throwIfAborted(ctx.signal);
      ctx.onProgress?.({
        phase: 'rendering',
        percent: Math.round((i / pages.length) * 70) + 10,
        message: `Page ${i + 1} of ${pages.length}`,
      });

      const { target, cleanup } = prepareTarget(pages[i], o.watermark);
      try {
        // PDF pages are opaque — default to white if transparent requested.
        const bg = o.background === 'transparent' ? '#ffffff' : undefined;
        const canvas = await captureCanvas(target, o, ctx.signal, bg);
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage([pageW, pageH], o.orientation);

        // Fit the captured image into the trim box minus margins, preserving aspect.
        const availW = trimW - o.margins * 2;
        const availH = trimH - o.margins * 2;
        const ratio = Math.min(availW / canvas.width, availH / canvas.height);
        const drawW = canvas.width * ratio;
        const drawH = canvas.height * ratio;
        const x = bleed + o.margins + (availW - drawW) / 2;
        const y = bleed + o.margins + (availH - drawH) / 2;
        pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);

        if (o.cropMarks && bleed > 0) this.drawCropMarks(pdf, bleed, trimW, trimH);

        if (o.bookmarks && pages.length > 1) {
          const outline = (pdf as unknown as { outline?: { add: (p: unknown, t: string, opt: { pageNumber: number }) => void } }).outline;
          outline?.add(null, `Page ${i + 1}`, { pageNumber: i + 1 });
        }
      } finally {
        cleanup();
      }
    }

    ctx.onProgress?.({ phase: 'generating', percent: 92 });
    const blob = pdf.output('blob');
    ctx.onProgress?.({ phase: 'completed', percent: 100 });
    return { blob, fileName: `${o.fileName}.pdf`, mimeType: this.mimeType };
  }

  private drawCropMarks(pdf: jsPDF, bleed: number, trimW: number, trimH: number): void {
    const len = Math.min(bleed, 5);
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(0, 0, 0);
    const x0 = bleed;
    const y0 = bleed;
    const x1 = bleed + trimW;
    const y1 = bleed + trimH;
    // Top-left
    pdf.line(x0 - len, y0, x0, y0);
    pdf.line(x0, y0 - len, x0, y0);
    // Top-right
    pdf.line(x1, y0, x1 + len, y0);
    pdf.line(x1, y0 - len, x1, y0);
    // Bottom-left
    pdf.line(x0 - len, y1, x0, y1);
    pdf.line(x0, y1, x0, y1 + len);
    // Bottom-right
    pdf.line(x1, y1, x1 + len, y1);
    pdf.line(x1, y1, x1, y1 + len);
  }
}
