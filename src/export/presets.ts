import { ExportOptions, ExportFormat } from './types';
import { getDatabase } from '../storage/database';

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  builtin?: boolean;
  options: Partial<ExportOptions> & { format: ExportFormat };
}

export const BUILTIN_PRESETS: ExportPreset[] = [
  {
    id: 'print-ready', name: 'Print Ready', description: 'PDF · A4 · 300 DPI · crop marks + bleed',
    options: { format: 'pdf', paperSize: 'a4', orientation: 'portrait', dpi: 300, background: 'white', margins: 0, bleed: 3, cropMarks: true, bookmarks: true },
  },
  {
    id: 'high-res', name: 'High Resolution', description: 'PNG · 4× · transparent background',
    options: { format: 'png', scale: 4, background: 'transparent' },
  },
  {
    id: 'web', name: 'Web', description: 'PNG · 1× · white background',
    options: { format: 'png', scale: 1, background: 'white' },
  },
  {
    id: 'archive', name: 'Archive', description: 'PDF · embedded metadata + bookmarks',
    options: { format: 'pdf', paperSize: 'a4', orientation: 'portrait', background: 'white', bookmarks: true },
  },
  {
    id: 'email', name: 'Email', description: 'JPEG · 2× · compressed for small size',
    options: { format: 'jpeg', scale: 2, quality: 0.8, background: 'white' },
  },
  {
    id: 'presentation', name: 'Presentation', description: 'PNG · 2× · white background',
    options: { format: 'png', scale: 2, background: 'white' },
  },
];

const PRESETS_KEY = 'exportPresets';
const LAST_USED_KEY = 'exportLastUsed';

interface PresetsRecord { key: string; presets: ExportPreset[]; }
interface LastUsedRecord { key: string; options: ExportOptions; }

export async function getCustomPresets(): Promise<ExportPreset[]> {
  try {
    const db = await getDatabase();
    const rec = (await db.get('settings', PRESETS_KEY)) as PresetsRecord | undefined;
    return rec?.presets ?? [];
  } catch {
    return [];
  }
}

export async function saveCustomPreset(preset: ExportPreset): Promise<void> {
  const db = await getDatabase();
  const existing = await getCustomPresets();
  const next = [...existing.filter((p) => p.id !== preset.id), preset];
  await db.put('settings', { key: PRESETS_KEY, presets: next } satisfies PresetsRecord);
}

export async function deleteCustomPreset(id: string): Promise<void> {
  const db = await getDatabase();
  const existing = await getCustomPresets();
  await db.put('settings', { key: PRESETS_KEY, presets: existing.filter((p) => p.id !== id) } satisfies PresetsRecord);
}

export async function getLastUsedOptions(): Promise<ExportOptions | null> {
  try {
    const db = await getDatabase();
    const rec = (await db.get('settings', LAST_USED_KEY)) as LastUsedRecord | undefined;
    return rec?.options ?? null;
  } catch {
    return null;
  }
}

export async function saveLastUsedOptions(options: ExportOptions): Promise<void> {
  try {
    const db = await getDatabase();
    await db.put('settings', { key: LAST_USED_KEY, options } satisfies LastUsedRecord);
  } catch {
    // best-effort
  }
}
