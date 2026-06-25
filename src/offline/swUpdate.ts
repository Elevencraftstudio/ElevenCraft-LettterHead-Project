// Holds the service-worker update callback registered in main.tsx so any
// component (e.g. the update banner) can apply a pending update.

type UpdateFn = (reloadPage?: boolean) => Promise<void>;

let updateSW: UpdateFn | null = null;

export function setUpdateSW(fn: UpdateFn): void {
  updateSW = fn;
}

/** Activate the waiting service worker and reload, or fall back to a plain reload. */
export function applyUpdate(): void {
  if (updateSW) {
    void updateSW(true);
  } else {
    window.location.reload();
  }
}
