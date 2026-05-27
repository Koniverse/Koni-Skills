import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runCli } from './_helpers.ts';

function makeRepoWithChangelog(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-cli-bfc-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@test'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.1.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: ship v0.1.0'], { cwd: root });

  const docs = join(root, 'docs');
  mkdirSync(docs, { recursive: true });
  writeFileSync(join(docs, 'CHANGELOG.md'), `# Changelog

## [Unreleased]

(empty)

## [0.1.0] — 2026-01-01 — Initial — v0.1.0

Initial release.

**Commit**: pending
`);
  return root;
}

const repo = makeRepoWithChangelog();
process.on('exit', () => rmSync(repo, { recursive: true, force: true }));

test('backfill-commits: replaces "pending" with real SHA', () => {
  const r = runCli(['backfill-commits', '--docs-path', join(repo, 'docs')], { cwd: repo });
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const cl = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  assert.doesNotMatch(cl, /\*\*Commit\*\*:\s*pending/);
  assert.match(cl, /\*\*Commit\*\*:\s*[0-9a-f]{7}/);
});

test('backfill-commits: idempotent — re-run after fill is a no-op', () => {
  const before = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  const r = runCli(['backfill-commits', '--docs-path', join(repo, 'docs')], { cwd: repo });
  assert.equal(r.status, 0);
  const after = readFileSync(join(repo, 'docs', 'CHANGELOG.md'), 'utf-8');
  assert.equal(after, before);
});
