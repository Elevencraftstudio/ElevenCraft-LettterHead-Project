const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function shouldCompress(file: File): boolean {
  return file.size > MAX_FILE_SIZE || file.type.startsWith('image/');
}

export function compressImage(file: File, maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context not available')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        file.type === 'image/png' ? 1 : quality,
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

export function generateThumbnail(file: File, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context not available')); return; }
      const ratio = Math.min(size / img.width, size / img.height);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => reject(new Error('Thumbnail generation failed'));
    img.src = url;
  });
}
