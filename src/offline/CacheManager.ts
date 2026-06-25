import { getSetting, setSetting, getDefaultOfflineSettings } from '../storage/settings';
import { clearAllAssets, getTotalAssetSize, getAssetCount, AssetRecord } from '../storage/assets';

export class CacheManager {
  async getCacheSize(): Promise<number> {
    return getTotalAssetSize();
  }

  async getAssetCount(): Promise<number> {
    return getAssetCount();
  }

  async getMaxCacheSize(): Promise<number> {
    const settings = await getSetting('offline');
    return settings?.maxCacheSize ?? getDefaultOfflineSettings().maxCacheSize;
  }

  async setMaxCacheSize(bytes: number): Promise<void> {
    const settings = await getSetting('offline');
    await setSetting({
      key: 'offline',
      enabled: settings?.enabled ?? true,
      maxCacheSize: bytes,
      syncOnWifiOnly: settings?.syncOnWifiOnly ?? false,
      autoSync: settings?.autoSync ?? true,
    });
  }

  async clearCache(): Promise<void> {
    await clearAllAssets();
  }

  async isQuotaExceeded(): Promise<boolean> {
    const current = await this.getCacheSize();
    const max = await this.getMaxCacheSize();
    return current >= max;
  }

  async estimateAvailableQuota(): Promise<number | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota !== undefined && estimate.usage !== undefined
        ? estimate.quota - estimate.usage
        : null;
    }
    return null;
  }

  async getStorageUsage(): Promise<{
    cacheSize: number;
    maxCacheSize: number;
    browserQuota: number | null;
    browserUsage: number | null;
    assetCount: number;
  }> {
    const cacheSize = await this.getCacheSize();
    const maxCacheSize = await this.getMaxCacheSize();
    const assetCount = await this.getAssetCount();
    let browserQuota: number | null = null;
    let browserUsage: number | null = null;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      browserQuota = estimate.quota ?? null;
      browserUsage = estimate.usage ?? null;
    }

    return { cacheSize, maxCacheSize, browserQuota, browserUsage, assetCount };
  }

  async incrementCleanup(): Promise<void> {
    const max = await this.getMaxCacheSize();
    const usage = await this.getCacheSize();
    if (usage > max * 0.9) {
      const assets = await (await import('../storage/assets')).getAllAssets();
      const sorted = assets.sort((a, b) => a.updatedAt - b.updatedAt);
      const toRemove = sorted.slice(0, Math.ceil(sorted.length * 0.2));
      for (const asset of toRemove) {
        await (await import('../storage/assets')).deleteAsset(asset.id);
      }
    }
  }
}

export const cacheManager = new CacheManager();
