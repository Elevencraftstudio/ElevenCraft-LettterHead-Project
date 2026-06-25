import { Exporter, ExportContext, ExportResult, ExportDocumentModel } from '../types';

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphs(body: string): string {
  return String(body ?? '')
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

function letterBody(doc: ExportDocumentModel): string {
  const l = doc.letter as Record<string, string>;
  return `
    <div class="meta">
      ${l.date ? `<div>${esc(l.date)}</div>` : ''}
      ${l.referenceNo ? `<div>Ref: ${esc(l.referenceNo)}</div>` : ''}
    </div>
    <div class="recipient">
      ${l.recipientName ? `<div>${esc(l.recipientName)}</div>` : ''}
      ${l.recipientCompany ? `<div>${esc(l.recipientCompany)}</div>` : ''}
      ${l.recipientAddress ? `<div>${esc(l.recipientAddress)}</div>` : ''}
    </div>
    ${l.subject ? `<p class="subject"><strong>Subject: ${esc(l.subject)}</strong></p>` : ''}
    ${l.salutation ? `<p>${esc(l.salutation)}</p>` : ''}
    ${paragraphs(l.body)}
    ${l.closing ? `<p class="closing">${esc(l.closing)}</p>` : ''}
    <div class="signature">
      ${l.senderName ? `<div><strong>${esc(l.senderName)}</strong></div>` : ''}
      ${l.senderTitle ? `<div>${esc(l.senderTitle)}</div>` : ''}
    </div>`;
}

function proposalBody(doc: ExportDocumentModel): string {
  const p = doc.proposal as Record<string, unknown>;
  const items = (p.budgetItems as Array<Record<string, number | string>>) ?? [];
  const sym = (p.currencySymbol as string) ?? '$';
  const taxRate = Number(p.taxRate ?? 0);
  const subtotal = items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const rows = items
    .map(
      (it) => `<tr>
        <td>${esc(it.description)}</td>
        <td class="num">${esc(it.quantity)}</td>
        <td class="num">${sym}${Number(it.unitPrice).toFixed(2)}</td>
        <td class="num">${sym}${(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}</td>
      </tr>`,
    )
    .join('\n');
  return `
    ${p.projectTitle ? `<h2>${esc(p.projectTitle)}</h2>` : ''}
    ${p.objectives ? `<h3>Objectives</h3>${paragraphs(p.objectives as string)}` : ''}
    ${p.requirements ? `<h3>Requirements</h3>${paragraphs(p.requirements as string)}` : ''}
    ${
      items.length
        ? `<h3>Budget</h3>
      <table class="budget">
        <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="3" class="num">Subtotal</td><td class="num">${sym}${subtotal.toFixed(2)}</td></tr>
          <tr><td colspan="3" class="num">Tax (${taxRate}%)</td><td class="num">${sym}${tax.toFixed(2)}</td></tr>
          <tr><td colspan="3" class="num"><strong>Total</strong></td><td class="num"><strong>${sym}${total.toFixed(2)}</strong></td></tr>
        </tfoot>
      </table>`
        : ''
    }
    ${p.notes ? `<h3>Notes</h3>${paragraphs(p.notes as string)}` : ''}`;
}

export class HtmlExporter implements Exporter {
  readonly format = 'html' as const;
  readonly label = 'HTML Document';
  readonly extension = 'html';
  readonly mimeType = 'text/html';

  async export(ctx: ExportContext): Promise<ExportResult> {
    const doc = ctx.document;
    const c = doc.company as Record<string, string>;
    const s = doc.style as Record<string, string>;
    const primary = s.primaryColor || '#0f172a';
    const text = s.textColor || '#1f2937';
    const m = ctx.options.metadata;
    const wm = ctx.options.watermark;

    ctx.onProgress?.({ phase: 'generating', percent: 50 });

    const watermarkCss =
      wm && wm.enabled && wm.text.trim()
        ? `body::before{content:"${esc(wm.text)}";position:fixed;top:50%;left:50%;
           transform:translate(-50%,-50%) rotate(${wm.rotation}deg);font-size:120px;font-weight:800;
           color:${wm.color || '#ff0000'};opacity:${wm.opacity};pointer-events:none;z-index:0;text-transform:uppercase;}`
        : '';

    const logo =
      c.logoType === 'upload' && c.logoUrl
        ? `<img class="logo" src="${esc(c.logoUrl)}" alt="${esc(c.name)} logo"/>`
        : c.name
          ? `<div class="logo-text">${esc(c.name)}</div>`
          : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(m?.title || doc.title || 'Document')}</title>
<meta name="author" content="${esc(m?.author || '')}"/>
<meta name="description" content="${esc(m?.subject || '')}"/>
<meta name="keywords" content="${esc((m?.keywords || []).join(', '))}"/>
<meta name="generator" content="Eleven Craft Studio ${esc(m?.appVersion || '')}"/>
<style>
  :root{--primary:${primary};--text:${text};}
  *{box-sizing:border-box;}
  body{margin:0;font-family:Georgia,'Times New Roman',serif;color:var(--text);background:#f1f5f9;line-height:1.6;}
  .page{max-width:794px;margin:24px auto;background:#fff;padding:56px 64px;box-shadow:0 2px 16px rgba(0,0,0,.12);position:relative;}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--primary);padding-bottom:16px;margin-bottom:32px;}
  .logo{max-height:64px;} .logo-text{font-size:24px;font-weight:800;color:var(--primary);}
  .tagline{font-size:12px;color:#64748b;}
  h2{color:var(--primary);} h3{color:var(--primary);margin-top:24px;}
  .meta,.recipient{margin-bottom:16px;} .subject{margin:20px 0;}
  .signature{margin-top:40px;}
  table.budget{width:100%;border-collapse:collapse;margin:12px 0;}
  table.budget th,table.budget td{border:1px solid #cbd5e1;padding:8px 10px;text-align:left;}
  table.budget .num{text-align:right;}
  table.budget thead th{background:var(--primary);color:#fff;}
  footer{margin-top:48px;border-top:1px solid #cbd5e1;padding-top:12px;font-size:12px;color:#64748b;display:flex;flex-wrap:wrap;gap:16px;}
  .content{position:relative;z-index:1;}
  ${watermarkCss}
  @media print{
    body{background:#fff;} .page{box-shadow:none;margin:0;max-width:none;padding:0;}
    @page{margin:18mm;}
  }
  @media(max-width:640px){ .page{padding:24px;} header{flex-direction:column;gap:8px;} }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div>${logo}${c.tagline ? `<div class="tagline">${esc(c.tagline)}</div>` : ''}</div>
      <div style="text-align:right;font-size:12px;color:#64748b;">
        ${c.addressLine1 ? `<div>${esc(c.addressLine1)}</div>` : ''}
        ${c.addressLine2 ? `<div>${esc(c.addressLine2)}</div>` : ''}
      </div>
    </header>
    <main class="content">
      ${doc.docMode === 'proposal' ? proposalBody(doc) : letterBody(doc)}
    </main>
    <footer>
      ${c.phone ? `<span>${esc(c.phone)}</span>` : ''}
      ${c.email ? `<span>${esc(c.email)}</span>` : ''}
      ${c.website ? `<span>${esc(c.website)}</span>` : ''}
    </footer>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    ctx.onProgress?.({ phase: 'completed', percent: 100 });
    return { blob, fileName: `${ctx.options.fileName}.html`, mimeType: this.mimeType };
  }
}
