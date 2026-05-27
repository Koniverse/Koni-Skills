import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  return buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-bf-')));
}

test('backfill-fields: adds STORY_DEFAULTS keys to a sparse story', () => {
  const docs = freshDocs();
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.1-sparse.md');
  writeFileSync(sparsePath, `---
id: US-3.1
title: "Sparse"
epic: EPIC-3
status: backlog
---

## Goal

Sparse story.

## Acceptance criteria

- [ ] AC-1: Something
`);

  const r = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);

  const updated = readFileSync(sparsePath, 'utf-8');
  assert.match(updated, /priority:\s*P2/);
  assert.match(updated, /points:/);
  assert.match(updated, /assignee:/);
  assert.match(updated, /id:\s*US-3\.1/);
  assert.match(updated, /status:\s*backlog/);
});

test('backfill-fields: idempotent — running twice produces no further changes', () => {
  const docs = freshDocs();
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.2-mini.md');
  writeFileSync(sparsePath, `---
id: US-3.2
title: "Mini"
epic: EPIC-3
status: backlog
---

body
`);

  const r1 = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r1.status, 0);
  const after1 = readFileSync(sparsePath, 'utf-8');

  const r2 = runCli(['backfill-fields', '--docs-path', docs]);
  assert.equal(r2.status, 0);
  const after2 = readFileSync(sparsePath, 'utf-8');

  assert.equal(after1, after2);
});

test('backfill-fields: --dry-run does not modify files', () => {
  const docs = freshDocs();
  const sparsePath = join(docs, 'sprints', 'stories', 'US-3.3-untouched.md');
  writeFileSync(sparsePath, `---
id: US-3.3
title: "Untouched"
epic: EPIC-3
status: backlog
---

body
`);
  const before = readFileSync(sparsePath, 'utf-8');
  const r = runCli(['backfill-fields', '--docs-path', docs, '--dry-run']);
  assert.equal(r.status, 0);
  const after = readFileSync(sparsePath, 'utf-8');
  assert.equal(after, before);
});
