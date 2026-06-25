let announcerId = 0;

function getAnnouncer(politeness: 'polite' | 'assertive'): HTMLElement {
  const id = `a11y-announcer-${politeness}`;
  let el = document.getElementById(id) as HTMLElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
  }
  return el;
}

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  const el = getAnnouncer(politeness);
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

export function createAnnouncer(politeness: 'polite' | 'assertive' = 'polite') {
  const id = `a11y-announcer-${++announcerId}`;
  return {
    id,
    announce: (message: string) => {
      let el = document.getElementById(id) as HTMLElement | null;
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.setAttribute('aria-live', politeness);
        el.setAttribute('aria-atomic', 'true');
        el.className = 'sr-only';
        document.body.appendChild(el);
      }
      el.textContent = '';
      requestAnimationFrame(() => {
        el!.textContent = message;
      });
    },
  };
}
