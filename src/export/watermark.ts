import { WatermarkOptions } from './types';

interface PreparedTarget {
  target: HTMLElement;
  cleanup: () => void;
}

/**
 * Returns a capture target with an export-only watermark overlay.
 * The editor document is never modified — we clone the element offscreen,
 * stamp the watermark on the clone, and capture that.
 */
export function prepareTarget(element: HTMLElement, wm?: WatermarkOptions): PreparedTarget {
  if (!wm || !wm.enabled || !wm.text.trim()) {
    return { target: element, cleanup: () => {} };
  }

  const rect = element.getBoundingClientRect();
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'relative';
  clone.style.margin = '0';

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;left:-99999px;top:0;width:${rect.width}px;height:${rect.height}px;`;

  const overlay = document.createElement('div');
  const align = wm.position === 'top' ? 'flex-start' : wm.position === 'bottom' ? 'flex-end' : 'center';
  overlay.style.cssText =
    `position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:99999;` +
    `display:flex;flex-direction:column;align-items:center;justify-content:${align};gap:48px;`;

  const color = wm.color || '#ff0000';
  const fontSize = wm.fontSize || 72;
  const makeText = () => {
    const t = document.createElement('div');
    t.textContent = wm.text;
    t.style.cssText =
      `transform:rotate(${wm.rotation}deg);opacity:${wm.opacity};color:${color};` +
      `font-weight:800;font-size:${fontSize}px;letter-spacing:4px;white-space:nowrap;` +
      `text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;`;
    return t;
  };

  if (wm.position === 'tile') {
    for (let i = 0; i < 5; i++) overlay.appendChild(makeText());
  } else {
    overlay.appendChild(makeText());
  }

  clone.appendChild(overlay);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { target: clone, cleanup: () => wrapper.remove() };
}
