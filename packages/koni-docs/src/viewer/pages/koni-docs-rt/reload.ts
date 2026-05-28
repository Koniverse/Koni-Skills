import type { APIRoute } from 'astro';
import { getReloadBus, type ReloadEvent } from '../../lib/reload-bus.ts';
import { getDocsDir } from '../../lib/corpus.ts';

/**
 * SSE endpoint streaming live-reload events.
 *
 * The route name avoids the `_` prefix that Astro reserves for non-routed
 * files — `koni-docs-rt` (rt = runtime) is namespaced to avoid colliding
 * with user docs.
 *
 * Idempotency: if `KONI_DOCS_WATCH !== '1'`, the bus never starts the FS
 * watcher, so the connection stays open and emits only keepalive comments —
 * no infinite-reload loop, no overhead beyond a parked socket.
 */
export const GET: APIRoute = ({ request }) => {
  const bus = getReloadBus(getDocsDir());
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let keepalive: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    if (keepalive) {
      clearInterval(keepalive);
      keepalive = null;
    }
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      // Initial comment flushes response headers to the client.
      controller.enqueue(encoder.encode(': connected\n\n'));

      const listener = (e: ReloadEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {
          // Controller already closed (client gone) — drop the event.
          cleanup();
        }
      };
      unsubscribe = bus.subscribe(listener);

      // Keepalive comment every 25s to keep intermediate proxies happy.
      keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          cleanup();
        }
      }, 25_000);

      // Client disconnect (tab closed, navigation) — abort signal fires.
      request.signal.addEventListener('abort', () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
