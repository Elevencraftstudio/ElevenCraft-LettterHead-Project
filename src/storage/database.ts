import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'business-document-studio';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDatabase(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('updatedAt', 'updatedAt');
          projectStore.createIndex('title', 'title');
        }
        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetStore.createIndex('type', 'type');
          assetStore.createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('status', 'status');
          queueStore.createIndex('priority', 'priority');
          queueStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('recovery')) {
          db.createObjectStore('recovery', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function closeDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

export async function deleteDatabase(): Promise<void> {
  await closeDatabase();
  await indexedDB.deleteDatabase(DB_NAME);
}
