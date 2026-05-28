import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { readFolderMatter, loadCorpus, getStories, getEpics, getSprints, resolveById } from '../../src/lib/corpus.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-corpus-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('readFolderMatter: reads all .md, returns matter entries', () => {
  const entries = readFolderMatter(join(docs, 'sprints', 'stories'));
  assert.equal(entries.length, 3); // US-1.1, US-1.2, README.md
  const ids = entries.map(e => e.frontmatter.id);
  assert.ok(ids.includes('US-1.1'));
  assert.ok(ids.includes('US-1.2'));
});

test('loadCorpus: populates stories, epics, sprints, singletons', () => {
  const c = loadCorpus(docs);
  assert.equal(c.stories.filter(s => s.frontmatter.id).length, 2);
  assert.equal(c.epics.length, 1);
  assert.equal(c.sprints.length, 2);
  assert.ok(c.singletons.prd);
  assert.ok(c.singletons.changelog);
});

test('getStories filters non-story files (no id)', () => {
  const c = loadCorpus(docs);
  const stories = getStories(c);
  assert.equal(stories.length, 2);
  assert.ok(stories.every(s => typeof s.frontmatter.id === 'string'));
});

test('resolveById resolves US-/EPIC-/sprint- prefixes', () => {
  const c = loadCorpus(docs);
  assert.equal(resolveById(c, 'US-1.1')?.frontmatter.id, 'US-1.1');
  assert.equal(resolveById(c, 'EPIC-1')?.frontmatter.id, 'EPIC-1');
  assert.equal(resolveById(c, 'sprint-2026-W01')?.frontmatter.id, 'sprint-2026-W01');
  assert.equal(resolveById(c, 'US-9.9'), null);
});

test('loadCorpus: surfaces file path when a sprint file has invalid YAML', () => {
  const bad = mkdtempSync(join(tmpdir(), 'koni-docs-bad-'));
  mkdirSync(join(bad, 'docs', 'sprints'), { recursive: true });
  const broken = join(bad, 'docs', 'sprints', 'sprint-2026-W99.md');
  // This is the exact corruption shape produced by the reapplyQuoting bug:
  // a quoted folded-scalar indicator with orphaned continuation lines.
  writeFileSync(broken, `---
id: sprint-2026-W99
goal: ">-"
- orphan line at column 1
---

Body.
`);
  try {
    assert.throws(
      () => loadCorpus(join(bad, 'docs')),
      (e: Error) => e.message.includes(broken),
      'YAML parse failure must include the offending file path',
    );
  } finally {
    rmSync(bad, { recursive: true, force: true });
  }
});

test('readFolderMatter: surfaces file path when a story file has invalid YAML', () => {
  const bad = mkdtempSync(join(tmpdir(), 'koni-docs-bad-fm-'));
  mkdirSync(bad, { recursive: true });
  const broken = join(bad, 'US-9.9-broken.md');
  writeFileSync(broken, `---
id: US-9.9
goal: ">-"
- orphan
---

Body.
`);
  try {
    assert.throws(
      () => readFolderMatter(bad),
      (e: Error) => e.message.includes(broken),
      'readFolderMatter must include the file path on parse failure',
    );
  } finally {
    rmSync(bad, { recursive: true, force: true });
  }
});
