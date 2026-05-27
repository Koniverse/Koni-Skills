import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  return buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-inject-')));
}

test('inject-tasks: regenerates Tasks from AC checkbox list', () => {
  const docs = freshDocs();
  const storyPath = join(docs, 'sprints', 'stories', 'US-1.2-bar.md');
  // Add a Tasks placeholder to the story
  const raw = readFileSync(storyPath, 'utf-8');
  writeFileSync(storyPath, raw + '\n## Tasks\n\n_placeholder_\n');

  const r = runCli(['inject-tasks', '--story', 'US-1.2', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const updated = readFileSync(storyPath, 'utf-8');
  // US-1.2 has AC-1: "Pending criterion" — Tasks section should mirror it
  assert.match(updated, /## Tasks/);
  assert.match(updated, /TASK-1\.2\.1.*Pending criterion/);
  assert.doesNotMatch(updated, /_placeholder_/);
});

test('inject-tasks: --all processes every story with AC', () => {
  const docs = freshDocs();
  // Pre-add a Tasks placeholder to BOTH stories
  for (const f of ['US-1.1-foo.md', 'US-1.2-bar.md']) {
    const p = join(docs, 'sprints', 'stories', f);
    writeFileSync(p, readFileSync(p, 'utf-8') + '\n## Tasks\n\n_placeholder_\n');
  }
  const r = runCli(['inject-tasks', '--all', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const foo = readFileSync(join(docs, 'sprints', 'stories', 'US-1.1-foo.md'), 'utf-8');
  assert.match(foo, /TASK-1\.1\.1.*First criterion/);
});

test('inject-tasks: missing --story and --all exits non-zero', () => {
  const docs = freshDocs();
  const r = runCli(['inject-tasks', '--docs-path', docs]);
  assert.notEqual(r.status, 0);
});
