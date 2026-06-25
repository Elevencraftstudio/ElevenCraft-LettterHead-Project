import { getDatabase } from '../storage/database';
import { connectivityManager } from './ConnectivityManager';

export interface RecoverySnapshot {
  id: string;
  timestamp: number;
  appVersion: string;
  data: Record<string, unknown>;
  documentTitle: string;
  canvasViewport: { x: number; y: number; zoom: number };
  activePageId: string | null;
  activeSidebarTab: string;
  panelLayout?: Record<string, unknown>;
}

class RecoveryManagerClass {
  private readonly key = 'recovery-snapshot';
  private readonly maxSnapshots = 5;
  private appVersion: string = '1.0.0';

  setAppVersion(version: string): void {
    this.appVersion = version;
  }

  async saveSnapshot(data: Record<string, unknown>, metadata?: Partial<RecoverySnapshot>): Promise<void> {
    try {
      const db = await getDatabase();
      const snapshot: RecoverySnapshot = {
        id: this.key,
        timestamp: Date.now(),
        appVersion: this.appVersion,
        data,
        documentTitle: (data as any).documentTitle || 'Untitled',
        canvasViewport: (data as any).canvasViewport || { x: 0, y: 0, zoom: 0.75 },
        activePageId: (data as any).activePageId || null,
        activeSidebarTab: (data as any).activeSidebarTab || 'design',
        ...metadata,
      };
      await db.put('recovery', snapshot);
    } catch {
      // Silently fail — recovery is best-effort
    }
  }

  async getLatestSnapshot(): Promise<RecoverySnapshot | undefined> {
    try {
      const db = await getDatabase();
      return db.get('recovery', this.key);
    } catch {
      return undefined;
    }
  }

  async hasRecoveryData(): Promise<boolean> {
    const snapshot = await this.getLatestSnapshot();
    if (!snapshot) return false;
    const staleThreshold = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - snapshot.timestamp < staleThreshold;
  }

  async clearRecoveryData(): Promise<void> {
    try {
      const db = await getDatabase();
      await db.delete('recovery', this.key);
    } catch {
      // best-effort
    }
  }

  async getRecoveryList(): Promise<RecoverySnapshot[]> {
    try {
      const db = await getDatabase();
      const all = await db.getAll('recovery');
      return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, this.maxSnapshots);
    } catch {
      return [];
    }
  }

  async deleteSnapshot(id: string): Promise<void> {
    try {
      const db = await getDatabase();
      await db.delete('recovery', id);
    } catch {
      // best-effort
    }
  }

  get isOnline(): boolean {
    return connectivityManager.online;
  }
}

export const recoveryManager = new RecoveryManagerClass();
