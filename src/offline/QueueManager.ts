import { dequeue, enqueue as storageEnqueue, markCompleted, markFailed, retryItem, getQueueLength, getQueueStats, QueueItem, QueueOperation } from '../storage/queue';
import { connectivityManager } from './ConnectivityManager';

type ProcessFunction = (item: QueueItem) => Promise<void>;

export class QueueManager {
  private processFn: ProcessFunction | null = null;
  private processing = false;
  private batchSize = 5;
  private retryDelay = 2000;
  private maxConsecutiveFailures = 3;
  private consecutiveFailures = 0;

  setProcessor(fn: ProcessFunction): void {
    this.processFn = fn;
  }

  setBatchSize(size: number): void {
    this.batchSize = size;
  }

  async enqueue(
    operation: QueueOperation,
    entityType: string,
    entityId: string,
    payload: Record<string, unknown>,
    priority = 0,
    maxRetries = 3
  ): Promise<number> {
    const id = await storageEnqueue({ operation, entityType, entityId, payload, priority, maxRetries });
    connectivityManager.setQueueSize(await getQueueLength());
    if (connectivityManager.online) {
      this.processQueue();
    }
    return id;
  }

  async processQueue(): Promise<void> {
    if (this.processing || !this.processFn) return;
    this.processing = true;
    connectivityManager.setSyncStatus('syncing');

    try {
      const items = await dequeue(this.batchSize);
      if (items.length === 0) {
        this.consecutiveFailures = 0;
        connectivityManager.setSyncStatus('idle');
        this.processing = false;
        return;
      }

      for (const item of items) {
        if (!connectivityManager.online) {
          connectivityManager.setSyncStatus('waiting');
          break;
        }

        try {
          await this.processFn(item);
          await markCompleted(item.id!);
          this.consecutiveFailures = 0;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown sync error';
          await markFailed(item.id!, message);
          this.consecutiveFailures++;

          if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
            connectivityManager.setSyncStatus('error');
            break;
          }

          if (item.retryCount < item.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          }
        }
      }

      const remaining = await getQueueLength();
      connectivityManager.setQueueSize(remaining);
      connectivityManager.setSyncStatus(remaining > 0 ? 'waiting' : 'idle');
    } finally {
      this.processing = false;
    }

    if (connectivityManager.online) {
      const remaining = await getQueueLength();
      if (remaining > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  async retryFailed(): Promise<void> {
    const stats = await getQueueStats();
    const db = await import('../storage/queue').then((m) => m);
    const index = (await import('../storage/database').then((m) => m.getDatabase()))
      .transaction('syncQueue').store.index('status');
    const failedItems: QueueItem[] = await index.getAll('failed');
    for (const item of failedItems) {
      await retryItem(item.id!);
    }
    connectivityManager.setQueueSize(await getQueueLength());
    this.processQueue();
  }

  async getLength(): Promise<number> {
    return getQueueLength();
  }

  async getStats(): Promise<ReturnType<typeof getQueueStats>> {
    return getQueueStats();
  }
}

export const queueManager = new QueueManager();
