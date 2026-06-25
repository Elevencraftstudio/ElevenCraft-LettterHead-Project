import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Header, Footer, Table, TableRow, TableCell, WidthType,
} from 'docx';
import { Exporter, ExportContext, ExportResult, ExportDocumentModel } from '../types';

function hex(color?: string): string | undefined {
  return color ? color.replace('#', '') : undefined;
}

function textParagraphs(body: string): Paragraph[] {
  return String(body ?? '')
    .split(/\n+/)
    .filter((line) => line.trim().length > 0)
    .map((line) => new Paragraph({ children: [new TextRun(line)], spacing: { after: 160 } }));
}

function buildLetter(doc: ExportDocumentModel, primary?: string): Paragraph[] {
  const l = doc.letter as Record<string, string>;
  const out: Paragraph[] = [];
  if (l.date) out.push(new Paragraph({ children: [new TextRun(l.date)], spacing: { after: 120 } }));
  if (l.referenceNo) out.push(new Paragraph({ children: [new TextRun(`Ref: ${l.referenceNo}`)], spacing: { after: 200 } }));
  [l.recipientName, l.recipientCompany, l.recipientAddress].forEach((line) => {
    if (line) out.push(new Paragraph({ children: [new TextRun(line)] }));
  });
  if (l.subject) {
    out.push(new Paragraph({
      children: [new TextRun({ text: `Subject: ${l.subject}`, bold: true, color: hex(primary) })],
      spacing: { before: 200, after: 200 },
    }));
  }
  if (l.salutation) out.push(new Paragraph({ children: [new TextRun(l.salutation)], spacing: { after: 160 } }));
  out.push(...textParagraphs(l.body));
  if (l.closing) out.push(new Paragraph({ children: [new TextRun(l.closing)], spacing: { before: 200 } }));
  if (l.senderName) out.push(new Paragraph({ children: [new TextRun({ text: l.senderName, bold: true })], spacing: { before: 320 } }));
  if (l.senderTitle) out.push(new Paragraph({ children: [new TextRun(l.senderTitle)] }));
  return out;
}

function cell(text: string, opts: { bold?: boolean; align?: typeof AlignmentType[keyof typeof AlignmentType] } = {}): TableCell {
  return new TableCell({
    children: [new Paragraph({ alignment: opts.align, children: [new TextRun({ text, bold: opts.bold })] })],
  });
}

function buildProposal(doc: ExportDocumentModel, primary?: string): (Paragraph | Table)[] {
  const p = doc.proposal as Record<string, unknown>;
  const out: (Paragraph | Table)[] = [];
  if (p.projectTitle) {
    out.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: p.projectTitle as string, color: hex(primary) })],
    }));
  }
  if (p.objectives) {
    out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Objectives')] }));
    out.push(...textParagraphs(p.objectives as string));
  }
  if (p.requirements) {
    out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Requirements')] }));
    out.push(...textParagraphs(p.requirements as string));
  }
  const items = (p.budgetItems as Array<Record<string, number | string>>) ?? [];
  if (items.length) {
    const sym = (p.currencySymbol as string) ?? '$';
    const taxRate = Number(p.taxRate ?? 0);
    const subtotal = items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Budget')] }));
    const rows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [cell('Description', { bold: true }), cell('Qty', { bold: true, align: AlignmentType.RIGHT }),
          cell('Unit', { bold: true, align: AlignmentType.RIGHT }), cell('Amount', { bold: true, align: AlignmentType.RIGHT })],
      }),
      ...items.map((it) => new TableRow({
        children: [
          cell(String(it.description)),
          cell(String(it.quantity), { align: AlignmentType.RIGHT }),
          cell(`${sym}${Number(it.unitPrice).toFixed(2)}`, { align: AlignmentType.RIGHT }),
          cell(`${sym}${(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}`, { align: AlignmentType.RIGHT }),
        ],
      })),
      new TableRow({ children: [cell('Subtotal', { align: AlignmentType.RIGHT }), cell(''), cell(''), cell(`${sym}${subtotal.toFixed(2)}`, { align: AlignmentType.RIGHT })] }),
      new TableRow({ children: [cell(`Tax (${taxRate}%)`, { align: AlignmentType.RIGHT }), cell(''), cell(''), cell(`${sym}${tax.toFixed(2)}`, { align: AlignmentType.RIGHT })] }),
      new TableRow({ children: [cell('Total', { bold: true, align: AlignmentType.RIGHT }), cell(''), cell(''), cell(`${sym}${total.toFixed(2)}`, { bold: true, align: AlignmentType.RIGHT })] }),
    ];
    out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
  }
  if (p.notes) {
    out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Notes')] }));
    out.push(...textParagraphs(p.notes as string));
  }
  return out;
}

export class DocxExporter implements Exporter {
  readonly format = 'docx' as const;
  readonly label = 'Word Document';
  readonly extension = 'docx';
  readonly mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  async export(ctx: ExportContext): Promise<ExportResult> {
    const doc = ctx.document;
    const c = doc.company as Record<string, string>;
    const s = doc.style as Record<string, string>;
    const primary = s.primaryColor;
    const m = ctx.options.metadata;

    ctx.onProgress?.({ phase: 'generating', percent: 40 });

    const header = new Header({
      children: [
        new Paragraph({ children: [new TextRun({ text: c.name || '', bold: true, size: 28, color: hex(primary) })] }),
        ...(c.tagline ? [new Paragraph({ children: [new TextRun({ text: c.tagline, italics: true, size: 18, color: '64748B' })] })] : []),
      ],
    });

    const contactLine = [c.phone, c.email, c.website].filter(Boolean).join('  •  ');
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: [c.addressLine1, c.addressLine2].filter(Boolean).join(', '), size: 16, color: '64748B' })],
        }),
        ...(contactLine ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contactLine, size: 16, color: '64748B' })] })] : []),
      ],
    });

    const body = doc.docMode === 'proposal' ? buildProposal(doc, primary) : buildLetter(doc, primary);

    const document = new Document({
      creator: m?.author || c.name || 'Eleven Craft Studio',
      title: m?.title || doc.title,
      description: m?.subject || '',
      keywords: (m?.keywords || []).join(', '),
      sections: [{
        headers: { default: header },
        footers: { default: footer },
        children: body,
      }],
    });

    ctx.onProgress?.({ phase: 'compressing', percent: 80 });
    const blob = await Packer.toBlob(document);
    ctx.onProgress?.({ phase: 'completed', percent: 100 });
    return { blob, fileName: `${ctx.options.fileName}.docx`, mimeType: this.mimeType };
  }
}
