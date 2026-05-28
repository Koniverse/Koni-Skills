import { EventEmitter } from 'node:events';
import chokidar from 'chokidar';

export interface ReloadEvent {
  path: string;
  kind: 'change' | 'add' | 'unlink';
}

class ReloadBus extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private timer: NodeJS.Timeout | null = null;
  private lastEvent: ReloadEvent | null = null;
  private subscribers = 0;

  start(docsDir: string): void {
    if (this.watcher) return;
    this.watcher = chokidar.watch(docsDir, {
      ignored: /(\/node_modules\/|\/\.git\/|\/\.astro\/)/,
      ignoreInitial: true,
    });
    const fire = (kind: ReloadEvent['kind']) => (filePath: string) => {
      if (!filePath.endsWith('.md')) return;
      this.lastEvent = { path: filePath, kind };
      // Debounce: wait until the bus has been "quiet" for 300ms before firing,
      // so a rapid burst (e.g., editor save flush) only triggers one reload.
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.lastEvent) this.emit('reload', this.lastEvent);
        this.lastEvent = null;
        this.timer = null;
      }, 300);
    };
    this.watcher.on('change', fire('change'));
    this.watcher.on('add', fire('add'));
    this.watcher.on('unlink', fire('unlink'));
  }

  /** Subscribe a listener and return a disposer that decrements the count + removes it. */
  subscribe(listener: (e: ReloadEvent) => void): () => void {
    this.on('reload', listener);
    this.subscribers++;
    return () => {
      this.off('reload', listener);
      this.subscribers = Math.max(0, this.subscribers - 1);
    };
  }

  subscriberCount(): number {
    return this.subscribers;
  }

  async close(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.removeAllListeners();
    this.subscribers = 0;
  }
}

let busSingleton: ReloadBus | null = null;

/**
 * Returns the process-wide singleton reload-bus.
 *
 * Lazy: the chokidar watcher is only started the first time this is called
 * AND `KONI_DOCS_WATCH === '1'`. In non-watch contexts (tests, normal preview
 * without --watch), the bus exists but no FS watcher is attached, so it
 * never emits `reload`.
 */
export function getReloadBus(docsDir: string): ReloadBus {
  if (!busSingleton) {
    busSingleton = new ReloadBus();
    if (process.env.KONI_DOCS_WATCH === '1') {
      busSingleton.start(docsDir);
    }
  }
  return busSingleton;
}

// Test-only export so unit tests can simulate watch-mode without relying on env.
export function _startBusForTesting(docsDir: string): ReloadBus {
  const bus = getReloadBus(docsDir);
  bus.start(docsDir);
  return bus;
}

// Test-only reset for unit tests that need a fresh singleton.
// Closes any active watcher before discarding the reference, so the event loop can drain.
export async function _resetBusForTesting(): Promise<void> {
  if (busSingleton) {
    await busSingleton.close();
  }
  busSingleton = null;
}
