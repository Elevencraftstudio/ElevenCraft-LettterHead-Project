import { toCanvas, toSvg } from 'html-to-image';
import { ExportOptions, throwIfAborted } from './types';

const SCREEN_DPI = 96;

export function resolveBackground(o: Pick<ExportOptions, 'background' | 'backgroundColor'>): string | undefined {
  if (o.background === 'transparent') return undefined;
  if (o.background === 'white') return '#ffffff';
  return o.backgroundColor || '#ffffff';
}

export function resolvePixelRatio(o: Pick<ExportOptions, 'dpi' | 'scale'>): number {
  if (o.dpi && o.dpi > 0) return Math.max(1, o.dpi / SCREEN_DPI);
  return o.scale || 2;
}

/** Rasterize a DOM element to a canvas at the requested resolution. */
export async function captureCanvas(
  el: HTMLElement,
  o: ExportOptions,
  signal?: AbortSignal,
  backgroundOverride?: string,
): Promise<HTMLCanvasElement> {
  throwIfAborted(signal);
  return toCanvas(el, {
    pixelRatio: resolvePixelRatio(o),
    backgroundColor: backgroundOverride ?? resolveBackground(o),
    cacheBust: true,
  });
}

/** Capture a DOM element as an SVG markup string (text + fonts preserved via foreignObject). */
export async function captureSvgMarkup(el: HTMLElement, o: ExportOptions, signal?: AbortSignal): Promise<string> {
  throwIfAborted(signal);
  const dataUrl = await toSvg(el, {
    backgroundColor: resolveBackground(o),
    cacheBust: true,
  });
  const comma = dataUrl.indexOf(',');
  return decodeURIComponent(dataUrl.slice(comma + 1));
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob produced no data'))), mime, quality);
  });
}
