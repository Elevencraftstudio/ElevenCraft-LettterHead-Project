import { ExportOptions, ExportProgress, isAbortError } from './types';

export type ExportJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExportJob {
  id: string;
  label: string;
  options: ExportOptions;
  status: ExportJobStatus;
  progress: ExportProgress;
  error?: string;
  createdAt: number;
}

export type JobRunner = (
  job: ExportJob,
  signal: AbortSignal,
  onProgress: (p: ExportProgress) => void,
) => Promise<void>;

type Listener = (jobs: ExportJob[]) => void;

// Function boundary intentionally widens status back to the full union — the job
// may be cancelled externally mid-export, which TS flow-narrowing can't see.
function isCancelled(job: ExportJob): boolean {
  return job.status === 'cancelled';
}

/**
 * In-memory export job queue with progress, cancel, retry/resume.
 * Processes one job at a time to bound memory; the actual export work is
 * supplied via setRunner so this stays decoupled from React/DOM.
 */
class ExportQueueManager {
  private jobs: ExportJob[] = [];
  private controllers = new Map<string, AbortController>();
  private runner: JobRunner | null = null;
  private processing = false;
  private listeners = new Set<Listener>();
  private seq = 0;

  setRunner(fn: JobRunner): void {
    this.runner = fn;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.jobs);
    return () => this.listeners.delete(fn);
  }

  getJobs(): ExportJob[] {
    return this.jobs;
  }

  enqueue(label: string, options: ExportOptions): string {
    const id = `job_${++this.seq}`;
    this.jobs.push({
      id,
      label,
      options,
      status: 'queued',
      progress: { phase: 'queued', percent: 0 },
      createdAt: this.seq,
    });
    this.emit();
    void this.process();
    return id;
  }

  cancel(id: string): void {
    this.controllers.get(id)?.abort();
    const job = this.jobs.find((j) => j.id === id);
    if (job && (job.status === 'queued' || job.status === 'running')) {
      job.status = 'cancelled';
      job.progress = { phase: 'failed', percent: job.progress.percent, message: 'Cancelled' };
      this.emit();
    }
  }

  retry(id: string): void {
    const job = this.jobs.find((j) => j.id === id);
    if (job && (job.status === 'failed' || job.status === 'cancelled')) {
      job.status = 'queued';
      job.error = undefined;
      job.progress = { phase: 'queued', percent: 0 };
      this.emit();
      void this.process();
    }
  }

  clearFinished(): void {
    this.jobs = this.jobs.filter((j) => j.status === 'queued' || j.status === 'running');
    this.emit();
  }

  private emit(): void {
    const snapshot = [...this.jobs];
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private async process(): Promise<void> {
    if (this.processing || !this.runner) return;
    this.processing = true;
    try {
      let job = this.jobs.find((j) => j.status === 'queued');
      while (job) {
        const controller = new AbortController();
        this.controllers.set(job.id, controller);
        job.status = 'running';
        job.progress = { phase: 'preparing', percent: 0 };
        this.emit();

        try {
          const current = job;
          await this.runner(current, controller.signal, (p) => {
            current.progress = p;
            this.emit();
          });
          // status may have been mutated to 'cancelled' by cancel() during the await.
          if (!isCancelled(current)) {
            current.status = 'completed';
            current.progress = { phase: 'completed', percent: 100 };
          }
        } catch (err) {
          if (isAbortError(err) || isCancelled(job)) {
            job.status = 'cancelled';
          } else {
            job.status = 'failed';
            job.error = err instanceof Error ? err.message : 'Export failed';
            job.progress = { phase: 'failed', percent: job.progress.percent };
          }
        } finally {
          this.controllers.delete(job.id);
          this.emit();
        }

        job = this.jobs.find((j) => j.status === 'queued');
      }
    } finally {
      this.processing = false;
    }
  }
}

export const exportQueue = new ExportQueueManager();
