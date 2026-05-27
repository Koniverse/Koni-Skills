import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
