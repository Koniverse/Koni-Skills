import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = join(__dirname, '..', '..', 'src', 'cli', 'index.ts');

async function waitFor(predicate: () => Promise<boolean>, timeoutMs = 15_000, intervalMs = 250): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if (await predicate()) return true; } catch {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

test('preview: serves /project (User Stories Tracker) with HTTP 200', { timeout: 30_000 }, async () => {
  // Use this repo's docs/ as the live fixture (4 levels up).
  const docsDir = join(__dirname, '..', '..', '..', '..', 'docs');
  const port = '47341'; // unique port, distinct from preview.test.ts (47324)

  const child = spawn(process.execPath, ['--import', 'tsx', CLI_ENTRY, 'preview', docsDir, '--port', port], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NO_COLOR: '1' },
  });

  const ready = await waitFor(async () => {
    try {
      const r = await fetch(`http://localhost:${port}/project`);
      return r.status === 200;
    } catch { return false; }
  });

  try {
    assert.equal(ready, true, 'server did not become ready within 15s');
    const r = await fetch(`http://localhost:${port}/project`);
    assert.equal(r.status, 200, '/project should return 200');
    const html = await r.text();
    assert.match(html, /User Stories/, '/project should render the "User Stories" heading');
  } finally {
    child.kill('SIGTERM');
    await new Promise<void>(resolve => {
      const t = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
      child.on('exit', () => { clearTimeout(t); resolve(); });
    });
  }
});
