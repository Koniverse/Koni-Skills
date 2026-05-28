import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChangelog, findEntryByVersion, formatVersionHeader, updateCommitSha } from '../../src/lib/changelog.ts';

const cl = `# Changelog

## [Unreleased]

(empty)

## [0.2.0] — 2026-06-10 — Lib core + CLI — v0.2.0

Body content here.

### Added
- Lib

**Commit**: pending

## [0.1.0] — 2026-05-27 — Initial — v0.1.0

Initial release.

**Commit**: abc1234
`;

test('parseChangelog: returns entries newest-first', () => {
  const entries = parseChangelog(cl);
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.version, '0.2.0');
  assert.equal(entries[1]?.version, '0.1.0');
});

test('parseChangelog: extracts commit SHA + detects "pending"', () => {
  const entries = parseChangelog(cl);
  assert.equal(entries[0]?.commitSha, 'pending');
  assert.equal(entries[1]?.commitSha, 'abc1234');
});

test('findEntryByVersion: locates by version', () => {
  const entries = parseChangelog(cl);
  assert.equal(findEntryByVersion(entries, '0.1.0')?.commitSha, 'abc1234');
  assert.equal(findEntryByVersion(entries, '9.9.9'), null);
});

test('formatVersionHeader: produces the canonical header', () => {
  const h = formatVersionHeader({ version: '0.3.0', date: '2026-07-01', title: 'New' });
  assert.equal(h, '## [0.3.0] — 2026-07-01 — New — v0.3.0');
});

test('updateCommitSha: replaces "pending" with real sha; preserves other content', () => {
  const updated = updateCommitSha(cl, '0.2.0', 'def5678');
  assert.match(updated, /## \[0\.2\.0\][^\n]+v0\.2\.0/);
  assert.match(updated, /\*\*Commit\*\*: def5678/);
  assert.doesNotMatch(updated, /\*\*Commit\*\*: pending/);
  assert.match(updated, /\*\*Commit\*\*: abc1234/); // unchanged
});

test('updateCommitSha: returns unchanged input when version not found', () => {
  const updated = updateCommitSha(cl, '9.9.9', 'deadbee');
  assert.equal(updated, cl);
});

test('parseChangelog: handles pre-release semver (0.5.0-dev.0)', () => {
  const raw = `# Changelog

## [Unreleased]

(empty)

## [0.5.0-dev.0] — 2026-05-27 — Pre-release entry — v0.5.0-dev.0

Body text.

**Commit**: abc1234

## [0.4.0-dev.0] — 2026-05-27 — Earlier — v0.4.0-dev.0

Older.

**Commit**: def5678
`;
  const entries = parseChangelog(raw);
  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.version, '0.5.0-dev.0');
  assert.equal(entries[0]?.title, 'Pre-release entry');
  assert.equal(entries[0]?.commitSha, 'abc1234');
  assert.equal(entries[1]?.version, '0.4.0-dev.0');
});
