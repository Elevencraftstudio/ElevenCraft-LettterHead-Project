/** Trigger a browser download for a blob, cleaning up the object URL afterwards. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function estimateBlobSize(blob: Blob): string {
  const bytes = blob.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
