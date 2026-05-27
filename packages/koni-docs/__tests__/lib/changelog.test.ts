import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChangelog, findEntryByVersion, formatVersionHeader } from '../../src/lib/changelog.ts';

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
