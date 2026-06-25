import { getDatabase } from './database';

export interface OfflineSettings {
  key: 'offline';
  enabled: boolean;
  maxCacheSize: number;
  syncOnWifiOnly: boolean;
  autoSync: boolean;
}

export interface EditorPreferences {
  key: 'editorPreferences';
  activeSidebarTab: string;
  sidebarWidth: number;
  themeMode: 'dark' | 'light';
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
}

export type SettingsKey = OfflineSettings | EditorPreferences;

export async function getSetting<K extends SettingsKey['key']>(key: K): Promise<Extract<SettingsKey, { key: K }> | undefined> {
  const db = await getDatabase();
  return db.get('settings', key) as Promise<Extract<SettingsKey, { key: K }> | undefined>;
}

export async function setSetting( setting: SettingsKey): Promise<void> {
  const db = await getDatabase();
  await db.put('settings', setting);
}

export async function getAllSettings(): Promise<SettingsKey[]> {
  const db = await getDatabase();
  return db.getAll('settings');
}

export async function clearSettings(): Promise<void> {
  const db = await getDatabase();
  await db.clear('settings');
}

export function getDefaultOfflineSettings(): OfflineSettings {
  return {
    key: 'offline',
    enabled: true,
    maxCacheSize: 100 * 1024 * 1024,
    syncOnWifiOnly: false,
    autoSync: true,
  };
}

export function getDefaultEditorPreferences(): EditorPreferences {
  return {
    key: 'editorPreferences',
    activeSidebarTab: 'design',
    sidebarWidth: 380,
    themeMode: 'dark',
    showGrid: false,
    snapToGrid: true,
    gridSize: 10,
    canvasZoom: 0.75,
    canvasPanX: 0,
    canvasPanY: 0,
  };
}
