import { useCallback, useRef } from 'react';

let regionCounter = 0;

export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const idRef = useRef<string>(`live-region-${++regionCounter}`);

  const announce = useCallback((message: string) => {
    const id = idRef.current;
    let region = document.getElementById(id) as HTMLElement | null;

    if (!region) {
      region = document.createElement('div');
      region.id = id;
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
    }

    region.textContent = '';
    requestAnimationFrame(() => {
      region!.textContent = message;
    });
  }, [politeness]);

  return { announce, liveRegionId: idRef.current };
}
