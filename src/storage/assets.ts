import { getDatabase } from './database';

export interface AssetRecord {
  id: string;
  type: 'logo' | 'background' | 'image' | 'font' | 'icon' | 'template' | 'thumbnail' | 'brand';
  name: string;
  data: string | ArrayBuffer | null;
  contentType: string;
  size: number;
  originalUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export async function getAllAssets(): Promise<AssetRecord[]> {
  const db = await getDatabase();
  const assets = await db.getAll('assets');
  return assets.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getAssetsByType(type: AssetRecord['type']): Promise<AssetRecord[]> {
  const db = await getDatabase();
  const index = db.transaction('assets').store.index('type');
  return index.getAll(type);
}

export async function getAsset(id: string): Promise<AssetRecord | undefined> {
  const db = await getDatabase();
  return db.get('assets', id);
}

export async function saveAsset(asset: AssetRecord): Promise<void> {
  const db = await getDatabase();
  await db.put('assets', { ...asset, updatedAt: Date.now() });
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('assets', id);
}

export async function getAssetCount(): Promise<number> {
  const db = await getDatabase();
  return db.count('assets');
}

export async function getTotalAssetSize(): Promise<number> {
  const db = await getDatabase();
  const assets = await db.getAll('assets');
  return assets.reduce((sum, a) => sum + (a.size || 0), 0);
}

export async function clearAssetsByType(type: AssetRecord['type']): Promise<void> {
  const db = await getDatabase();
  const assets = await db.getAll('assets');
  const ids = assets.filter((a) => a.type === type).map((a) => a.id);
  const tx = db.transaction('assets', 'readwrite');
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

export async function clearAllAssets(): Promise<void> {
  const db = await getDatabase();
  await db.clear('assets');
}
