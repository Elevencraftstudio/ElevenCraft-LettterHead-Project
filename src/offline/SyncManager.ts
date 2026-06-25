import { connectivityManager } from './ConnectivityManager';
import { queueManager } from './QueueManager';
import { saveProject, getUnsyncedProjects, ProjectRecord } from '../storage/projects';
import { getQueueLength } from '../storage/queue';
import { QueueItem } from '../storage/queue';

interface SyncableService {
  create?(entityType: string, data: Record<string, unknown>): Promise<void>;
  update?(entityType: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete?(entityType: string, id: string): Promise<void>;
  upload?(entityType: string, data: Record<string, unknown>): Promise<void>;
  export?(entityType: string, data: Record<string, unknown>): Promise<void>;
}

export class SyncManager {
  private services: Map<string, SyncableService> = new Map();
  private initialized = false;

  registerService(name: string, service: SyncableService): void {
    this.services.set(name, service);
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    connectivityManager.subscribe((online) => {
      if (online) {
        queueManager.processQueue();
      } else {
        connectivityManager.setSyncStatus('waiting');
      }
    });

    queueManager.setProcessor(async (item: QueueItem) => {
      await this.processItem(item);
    });

    window.addEventListener('focus', () => {
      queueManager.processQueue();
    });
  }

  private async processItem(item: QueueItem): Promise<void> {
    const service = this.services.get(item.entityType);
    if (!service) throw new Error(`No sync service registered for entity type: ${item.entityType}`);

    switch (item.operation) {
      case 'create':
        await service.create?.(item.entityType, item.payload);
        break;
      case 'update':
        await service.update?.(item.entityType, item.entityId, item.payload);
        break;
      case 'delete':
        await service.delete?.(item.entityType, item.entityId);
        break;
      case 'upload':
        await service.upload?.(item.entityType, item.payload);
        break;
      case 'export':
        await service.export?.(item.entityType, item.payload);
        break;
    }
  }

  async syncNow(): Promise<void> {
    if (!connectivityManager.online) return;
    await queueManager.processQueue();
  }

  async getPendingCount(): Promise<number> {
    return getQueueLength();
  }

  async syncUnsyncedProjects(): Promise<void> {
    const unsynced = await getUnsyncedProjects();
    if (unsynced.length === 0) return;
    for (const project of unsynced) {
      await queueManager.enqueue('update', 'project', project.id, project.data as Record<string, unknown>, 1);
    }
  }
}

export const syncManager = new SyncManager();
