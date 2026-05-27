import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-sync-'));
  const docs = buildFixture(root);
  return docs;
}

test('sync: single story — updates EPIC Stories table row', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const epic = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  // US-1.1 is `done` with version 0.1.0 — should appear with ✅ done + v0.1.0
  assert.match(epic, /US-1\.1[\s\S]*✅ done[\s\S]*0\.1\.0/);
});

test('sync: W23 BLOCKER — Status updated by NAME, Carry left intact (8-col sprint)', () => {
  const docs = freshDocs();
  // Flip US-1.1's sprint to W23 so sync targets the 8-col table
  const storyPath = join(docs, 'sprints', 'stories', 'US-1.1-foo.md');
  const raw = readFileSync(storyPath, 'utf-8');
  writeFileSync(storyPath, raw.replace('sprint: sprint-2026-W01', 'sprint: sprint-2026-W23'));

  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const sprint = readFileSync(join(docs, 'sprints', 'sprint-2026-W23.md'), 'utf-8');
  // Expected: Status column updated to ✅ done, Carry column STILL "new" (NOT overwritten)
  assert.match(sprint, /US-1\.1[\s\S]*✅ done[\s\S]*new/);
  // Regression guard: Carry was NEVER set to ✅ done
  assert.doesNotMatch(sprint, /\| ✅ done \| \[link\]/);
});

test('sync: --dry-run — no files modified', () => {
  const docs = freshDocs();
  const epicBefore = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  const r = runCli(['sync', '--story', 'US-1.1', '--docs-path', docs, '--dry-run']);
  assert.equal(r.status, 0);
  const epicAfter = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  assert.equal(epicAfter, epicBefore);
});

test('sync: all stories — no --story flag syncs everything', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const epic = readFileSync(join(docs, 'sprints', 'epics', 'EPIC-1.md'), 'utf-8');
  assert.match(epic, /US-1\.1[\s\S]*✅ done/);
  assert.match(epic, /US-1\.2[\s\S]*🚧 in-progress/);
});

test('sync: unknown story id — exits non-zero with clear error', () => {
  const docs = freshDocs();
  const r = runCli(['sync', '--story', 'US-9.9', '--docs-path', docs]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /US-9\.9/);
});
