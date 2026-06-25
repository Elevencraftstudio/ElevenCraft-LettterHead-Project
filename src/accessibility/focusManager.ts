const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details summary',
  'iframe',
].join(', ');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] ?? null;
}

export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
}

export function focusFirst(container: HTMLElement): boolean {
  const el = getFirstFocusable(container);
  if (el) {
    el.focus();
    return true;
  }
  return false;
}

export function saveFocus(): () => void {
  const active = document.activeElement as HTMLElement | null;
  return () => {
    if (active && typeof active.focus === 'function') {
      active.focus();
    }
  };
}
