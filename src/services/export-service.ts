export type ExportFormat = 'pdf' | 'png' | 'jpeg' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  fileName?: string;
  dpi?: number;
  pageRange?: string;
  batch?: boolean;
}

export async function exportDocument(element: HTMLElement | null, options: ExportOptions): Promise<boolean> {
  if (!element) return false;

  const { format, fileName = 'document' } = options;

  switch (format) {
    case 'pdf':
      return exportAsPDF(element, fileName);
    case 'png':
      return exportAsImage(element, fileName, 'png', options.quality);
    case 'jpeg':
      return exportAsImage(element, fileName, 'jpeg', options.quality);
    case 'svg':
      return exportAsSVG(element, fileName);
    default:
      return false;
  }
}

async function exportAsPDF(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    window.print();
    return true;
  } catch {
    return false;
  }
}

async function exportAsImage(element: HTMLElement, fileName: string, format: 'png' | 'jpeg', quality = 1): Promise<boolean> {
  try {
    const canvas = await htmlToCanvas(element);
    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`, quality);
    link.click();
    return true;
  } catch {
    return false;
  }
}

async function exportAsSVG(element: HTMLElement, fileName: string): Promise<boolean> {
  try {
    const clone = element.cloneNode(true) as HTMLElement;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">
      <foreignObject width="210" height="297">
        <div xmlns="http://www.w3.org/1999/xhtml">${clone.innerHTML}</div>
      </foreignObject>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `${fileName}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    return true;
  } catch {
    return false;
  }
}

async function htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const rect = element.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;

  const dataUrl = await captureElementAsImage(element);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function captureElementAsImage(element: HTMLElement): Promise<string> {
  // Use the browser's built-in image capture via SVG foreignObject
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${element.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function batchExport(elements: HTMLElement[], options: ExportOptions): Promise<boolean> {
  for (let i = 0; i < elements.length; i++) {
    const success = await exportDocument(elements[i], { ...options, fileName: `${options.fileName || 'document'}_page_${i + 1}` });
    if (!success) return false;
  }
  return true;
}
