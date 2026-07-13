import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from '../lib/_fixtures/build-fixture.ts';
import { runCli } from './_helpers.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-status-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('status: regenerates STATUS.md grouped by status', () => {
  const r = runCli(['status', '--docs-path', docs]);
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /## .*Done/);
  assert.match(status, /## .*In Progress/);
  assert.match(status, /US-1\.1/);
  assert.match(status, /US-1\.2/);
});

test('status: --dry-run does not write the file', () => {
  const docsB = buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-status-b-')));
  const r = runCli(['status', '--docs-path', docsB, '--dry-run']);
  assert.equal(r.status, 0);
  assert.throws(() => readFileSync(join(docsB, 'sprints', 'STATUS.md'), 'utf-8'));
});

test('status: regenerates cleanly', () => {
  const r = runCli(['status', '--docs-path', docs]);
  assert.equal(r.status, 0);
  const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /US-1\.1/);
});

/** Far enough out that the assertions hold whenever the suite happens to run. */
const FAR_FUTURE = '2099-01-01';
const LONG_PAST = '2020-01-01';

function docsWithDue(dueYaml: string, status = 'in-progress'): string {
  const d = buildFixture(mkdtempSync(join(tmpdir(), 'koni-docs-cli-status-due-')));
  writeFileSync(join(d, 'sprints', 'stories', 'US-1.3-dated.md'), `---
id: US-1.3
title: "Dated"
epic: EPIC-1
status: ${status}
priority: P1
points: 1
assignee: saltict
due: ${dueYaml}
---

## Goal

Dated story.
`);
  return d;
}

test('status: the Deadlines section is quiet, not absent, when nothing is dated', () => {
  const r = runCli(['status', '--docs-path', docs]);
  assert.equal(r.status, 0);
  const status = readFileSync(join(docs, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /## .*Deadlines \(0\)/);
  assert.match(status, /_No stories carry an explicit deadline\._/);
  assert.match(status, /✓ No overdue stories\./);
});

test('status: Deadlines sits above the kanban — it is the first thing worth seeing', () => {
  const d = docsWithDue(FAR_FUTURE);
  runCli(['status', '--docs-path', d]);
  const status = readFileSync(join(d, 'sprints', 'STATUS.md'), 'utf-8');
  assert.ok(status.indexOf('Deadlines') < status.indexOf('Backlog'));
});

test('status: an overdue story is flagged in the table and the summary', () => {
  const d = docsWithDue(LONG_PAST);
  const r = runCli(['status', '--docs-path', d]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /1 story\(ies\) overdue/);
  const status = readFileSync(join(d, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /US-1\.3 \| Dated \| 2020-01-01 \| -\d+ \| 🔴 overdue \| saltict \|/);
  assert.match(status, /\*\*Deadlines\*\*: 1 overdue/);
});

test('status: a shipped story past its date never appears as overdue', () => {
  const d = docsWithDue(LONG_PAST, 'done');
  runCli(['status', '--docs-path', d]);
  const status = readFileSync(join(d, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /## .*Deadlines \(0\)/);
});

test('status: --due-soon-days widens the window', () => {
  // A story with no due must stay out of the section however wide the window is.
  const d = docsWithDue(FAR_FUTURE);
  const r = runCli(['status', '--docs-path', d, '--due-soon-days', '30']);
  assert.equal(r.status, 0);
  const status = readFileSync(join(d, 'sprints', 'STATUS.md'), 'utf-8');
  assert.match(status, /## .*Deadlines \(1\)/);
  assert.match(status, /🟢 on-track/); // 2099 is beyond any sane window
  assert.match(status, /due within 30 days|✓ No overdue stories\./);
});

test('status: --due-soon-days rejects a value that is not a count of days', () => {
  const r = runCli(['status', '--docs-path', docs, '--due-soon-days', 'soon']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /non-negative integer/);
});
