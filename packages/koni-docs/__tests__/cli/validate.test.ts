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
  assert.deepEqual(parsed.summary, { ref: 0, fr: 0, dueMalformed: 0, overdue: 0, dueRedundant: 0 });
});

test('validate: a due that just restates the sprint end warns, and does not fail', () => {
  const docs = freshDocs();
  // The fixture's sprint-2026-W01 ends 2026-01-07 — so this `due` says nothing
  // that `sprint:` did not already say.
  writeFileSync(join(docs, 'sprints', 'stories', 'US-1.3-dated.md'), `---
id: US-1.3
title: "Dated"
epic: EPIC-1
status: in-progress
priority: P1
points: 1
sprint: sprint-2026-W01
due: 2026-01-07
---

## Goal

Dated story.
`);
  const r = runCli(['validate', '--docs-path', docs, '--json']);
  assert.equal(r.status, 0, 'signal drift is a warning, never a blocker');
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.summary.dueRedundant, 1);
  assert.equal(parsed.dueRedundant[0].sprint, 'sprint-2026-W01');
});

/** A story in EPIC-1 whose only interesting property is its `due` value. */
function writeStoryWithDue(docs: string, id: string, dueYaml: string, status = 'in-progress'): void {
  writeFileSync(join(docs, 'sprints', 'stories', `${id}-dated.md`), `---
id: ${id}
title: "Dated"
epic: EPIC-1
status: ${status}
priority: P1
points: 1
due: ${dueYaml}
---

## Goal

Dated story.
`);
}

test('validate: a due date that is not a date is an error', () => {
  const docs = freshDocs();
  writeStoryWithDue(docs, 'US-1.3', '"end of July"');
  const r = runCli(['validate', '--docs-path', docs]);
  assert.equal(r.status, 1, `stdout: ${r.stdout}`);
  assert.match(r.stdout, /malformed due date/);
  assert.match(r.stdout, /US-1\.3/);
});

test('validate: an overdue story warns but does NOT fail the run', () => {
  const docs = freshDocs();
  writeStoryWithDue(docs, 'US-1.3', '2020-01-01');
  const r = runCli(['validate', '--docs-path', docs]);
  // The whole point of the chosen enforcement level: deadlines inform, they do
  // not block. A missed date must never wedge someone's commit.
  assert.equal(r.status, 0, `stdout: ${r.stdout}`);
  assert.match(r.stdout, /overdue story/);
  assert.match(r.stdout, /US-1\.3/);
});

test('validate: a shipped story past its due date is not overdue', () => {
  const docs = freshDocs();
  writeStoryWithDue(docs, 'US-1.3', '2020-01-01', 'done');
  const r = runCli(['validate', '--docs-path', docs, '--json']);
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).summary.overdue, 0);
});
