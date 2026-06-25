import { getDatabase } from './database';

export type QueueOperation = 'create' | 'update' | 'delete' | 'upload' | 'export';

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueueItem {
  id?: number;
  operation: QueueOperation;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number;
  status: QueueStatus;
  error?: string;
  lastAttemptAt?: number;
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<number> {
  const db = await getDatabase();
  const id = await db.add('syncQueue', {
    ...item,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending' as QueueStatus,
  });
  return id as number;
}

export async function dequeue(batchSize = 10): Promise<QueueItem[]> {
  const db = await getDatabase();
  const index = db.transaction('syncQueue').store.index('status');
  const pending = await index.getAll('pending');
  return pending
    .sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp)
    .slice(0, batchSize);
}

export async function markCompleted(id: number): Promise<void> {
  const db = await getDatabase();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.status = 'completed';
    await db.put('syncQueue', item);
  }
}

export async function markFailed(id: number, error: string): Promise<void> {
  const db = await getDatabase();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.status = 'failed';
    item.error = error;
    item.lastAttemptAt = Date.now();
    item.retryCount += 1;
    await db.put('syncQueue', item);
  }
}

export async function retryItem(id: number): Promise<void> {
  const db = await getDatabase();
  const item = await db.get('syncQueue', id);
  if (item && item.retryCount < item.maxRetries) {
    item.status = 'pending';
    item.lastAttemptAt = Date.now();
    item.retryCount += 1;
    await db.put('syncQueue', item);
  }
}

export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  total: number;
}> {
  const db = await getDatabase();
  const items = await db.getAll('syncQueue');
  return {
    pending: items.filter((i) => i.status === 'pending').length,
    processing: items.filter((i) => i.status === 'processing').length,
    failed: items.filter((i) => i.status === 'failed').length,
    completed: items.filter((i) => i.status === 'completed').length,
    total: items.length,
  };
}

export async function clearCompleted(): Promise<void> {
  const db = await getDatabase();
  const index = db.transaction('syncQueue').store.index('status');
  const completed = await index.getAll('completed');
  const tx = db.transaction('syncQueue', 'readwrite');
  await Promise.all(completed.map((item) => tx.store.delete(item.id!)));
  await tx.done;
}

export async function cancelAllPending(): Promise<void> {
  const db = await getDatabase();
  const index = db.transaction('syncQueue').store.index('status');
  const pending = await index.getAll('pending');
  const tx = db.transaction('syncQueue', 'readwrite');
  for (const item of pending) {
    item.status = 'cancelled';
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getQueueLength(): Promise<number> {
  const db = await getDatabase();
  const index = db.transaction('syncQueue').store.index('status');
  const pending = await index.getAll('pending');
  return pending.length;
}
