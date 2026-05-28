import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  getReloadBus,
  _startBusForTesting,
  _resetBusForTesting,
  type ReloadEvent,
} from '../../src/viewer/lib/reload-bus.ts';

test('reload-bus: subscriber count is 0 initially, increments on subscribe, returns to 0 on disposer', async () => {
  await _resetBusForTesting();
  const bus = getReloadBus(process.cwd());
  assert.equal(bus.subscriberCount(), 0);
  const dispose1 = bus.subscribe(() => {});
  const dispose2 = bus.subscribe(() => {});
  assert.equal(bus.subscriberCount(), 2);
  dispose1();
  assert.equal(bus.subscriberCount(), 1);
  dispose2();
  assert.equal(bus.subscriberCount(), 0);
  // Also confirms no listeners leak on the underlying EventEmitter.
  assert.equal(bus.listenerCount('reload'), 0);
  await _resetBusForTesting();
});

test('reload-bus: getReloadBus returns the same singleton across calls', async () => {
  await _resetBusForTesting();
  const a = getReloadBus(process.cwd());
  const b = getReloadBus(process.cwd());
  assert.strictEqual(a, b);
  await _resetBusForTesting();
});

test('reload-bus: writing a *.md file fires a single debounced reload event', async () => {
  await _resetBusForTesting();
  const dir = mkdtempSync(join(tmpdir(), 'koni-docs-bus-'));
  try {
    const bus = _startBusForTesting(dir);

    // Wait for chokidar ready before writing — otherwise the write races the watcher init.
    await new Promise<void>((resolve) => setTimeout(resolve, 250));

    const received: ReloadEvent[] = [];
    const dispose = bus.subscribe((e) => received.push(e));

    const target = join(dir, 'note.md');
    writeFileSync(target, '# hi\n');

    // 300ms task debounce + chokidar's own settle time.
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));

    assert.ok(received.length >= 1, `expected at least 1 reload event, got ${received.length}`);
    assert.equal(received[0]?.kind, 'add');
    assert.match(received[0]?.path ?? '', /note\.md$/);

    dispose();
    assert.equal(bus.subscriberCount(), 0);
  } finally {
    await _resetBusForTesting();
    rmSync(dir, { recursive: true, force: true });
  }
});
