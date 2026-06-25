type ConnectivityListener = (online: boolean) => void;

type SyncStatus = 'idle' | 'syncing' | 'waiting' | 'error';

type SyncStatusListener = (status: SyncStatus, queueSize?: number) => void;

class ConnectivityManagerClass {
  private _online: boolean = navigator.onLine;
  private _syncStatus: SyncStatus = 'idle';
  private _queueSize: number = 0;
  private _reconnectCountdown: number = 0;
  private listeners: Set<ConnectivityListener> = new Set();
  private syncListeners: Set<SyncStatusListener> = new Set();
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  get online(): boolean {
    return this._online;
  }

  get syncStatus(): SyncStatus {
    return this._syncStatus;
  }

  get queueSize(): number {
    return this._queueSize;
  }

  get reconnectCountdown(): number {
    return this._reconnectCountdown;
  }

  init(): void {
    this.onlineHandler = () => {
      this._online = true;
      this.broadcast();
    };
    this.offlineHandler = () => {
      this._online = false;
      this.broadcast();
    };
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  destroy(): void {
    if (this.onlineHandler) window.removeEventListener('online', this.onlineHandler);
    if (this.offlineHandler) window.removeEventListener('offline', this.offlineHandler);
    this.listeners.clear();
    this.syncListeners.clear();
  }

  setSyncStatus(status: SyncStatus, queueSize?: number): void {
    this._syncStatus = status;
    if (queueSize !== undefined) this._queueSize = queueSize;
    this.syncListeners.forEach((fn) => fn(status, this._queueSize));
  }

  setQueueSize(size: number): void {
    this._queueSize = size;
  }

  setReconnectCountdown(seconds: number): void {
    this._reconnectCountdown = seconds;
  }

  subscribe(fn: ConnectivityListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribeSync(fn: SyncStatusListener): () => void {
    this.syncListeners.add(fn);
    return () => this.syncListeners.delete(fn);
  }

  private broadcast(): void {
    this.listeners.forEach((fn) => fn(this._online));
  }
}

export const connectivityManager = new ConnectivityManagerClass();
