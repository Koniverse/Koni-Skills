import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isGitRepo, findCommitForVersion, findCommitByTag } from '../../src/lib/git.ts';

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), 'koni-docs-git-'));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@test'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: root });
  execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.1.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: v0.1.0'], { cwd: root });
  writeFileSync(join(root, 'VERSION'), '0.2.0\n');
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-q', '-m', 'feat: v0.2.0'], { cwd: root });
  execFileSync('git', ['tag', 'v0.2.0'], { cwd: root });
  return root;
}

const repo = makeRepo();
process.on('exit', () => rmSync(repo, { recursive: true, force: true }));
const oldCwd = process.cwd();
process.chdir(repo);
process.on('exit', () => process.chdir(oldCwd));

test('isGitRepo: detects git repo', () => {
  assert.equal(isGitRepo(), true);
});

test('findCommitForVersion: finds the commit that set VERSION=0.2.0', () => {
  const sha = findCommitForVersion('0.2.0');
  assert.ok(sha);
  assert.match(sha!, /^[0-9a-f]{7}$/);
});

test('findCommitByTag: finds tagged commit', () => {
  const sha = findCommitByTag('v0.2.0');
  assert.ok(sha);
  assert.match(sha!, /^[0-9a-f]{7}$/);
});

test('findCommitForVersion: returns null when version not in history', () => {
  assert.equal(findCommitForVersion('9.9.9'), null);
});
