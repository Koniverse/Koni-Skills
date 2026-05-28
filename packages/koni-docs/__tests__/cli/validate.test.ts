import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

function freshDocs(): string {
  return buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-validate-')));
}

test('validate: exits 0 when corpus is consistent', () => {
  const docs = freshDocs();
  const r = runCli(['validate', '--docs-path', docs]);
  assert.equal(r.status, 0, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  assert.match(r.stdout, /all references resolve/);
});

test('validate: exits 1 when a story references a missing epic', () => {
  const docs = freshDocs();
  // Add a story referencing a non-existent EPIC.
  writeFileSync(join(docs, 'sprints', 'stories', 'US-9.9-orphan.md'), `---
id: US-9.9
title: "Orphan"
epic: EPIC-999
status: backlog
priority: P3
points: 1
---

## Goal

Orphan story.
`);
  const r = runCli(['validate', '--docs-path', docs]);
  assert.equal(r.status, 1, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
  assert.match(r.stdout, /EPIC-999/);
});

test('validate: --json emits structured output', () => {
  const docs = freshDocs();
  const r = runCli(['validate', '--docs-path', docs, '--json']);
  assert.equal(r.status, 0);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.summary, { ref: 0, fr: 0 });
});
