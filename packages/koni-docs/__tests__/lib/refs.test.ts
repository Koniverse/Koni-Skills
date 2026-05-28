import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { loadCorpus } from '../../src/lib/corpus.ts';
import { listChildrenOf, listReferrersTo, validateRefs, validateFrRefs } from '../../src/lib/refs.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-refs-'));
const docs = buildFixture(root);
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('listChildrenOf: stories of an epic', () => {
  const c = loadCorpus(docs);
  const kids = listChildrenOf(c, 'EPIC-1');
  assert.equal(kids.length, 2);
  assert.ok(kids.some(s => s.frontmatter.id === 'US-1.1'));
});

test('listReferrersTo: stories of an FR', () => {
  const c = loadCorpus(docs);
  const refs = listReferrersTo(c, 'FR-1');
  assert.equal(refs.length, 1);
  assert.equal(refs[0]?.frontmatter.id, 'US-1.1');
});

test('validateRefs: clean corpus reports no broken refs', () => {
  const c = loadCorpus(docs);
  const broken = validateRefs(c);
  assert.equal(broken.length, 0);
});

test('validateFrRefs: returns empty when all story FR-refs are present in PRD Functional Requirements', () => {
  const c = loadCorpus(docs);
  const results = validateFrRefs(c);
  assert.equal(results.length, 0, JSON.stringify(results));
});

test('validateFrRefs: flags story FR-refs not present in PRD Functional Requirements table', () => {
  // Use a fresh fixture so we don't pollute the shared `docs` corpus for other tests.
  const root2 = mkdtempSync(join(tmpdir(), 'koni-docs-refs-missing-'));
  const docs2 = buildFixture(root2);
  const storyPath = join(docs2, 'sprints', 'stories', 'US-1.9-bogus.md');
  writeFileSync(storyPath, `---
id: US-1.9
title: "Bogus"
epic: EPIC-1
status: backlog
priority: P2
points: 1
prd_ref: FR-99
---

## Goal

Bogus.
`, 'utf-8');
  const c = loadCorpus(docs2);
  const results = validateFrRefs(c);
  assert.ok(results.length >= 1, 'expected at least one missing-FR result');
  assert.ok(results.some(r => r.id === 'US-1.9' && r.missingFr.includes('FR-99')));
  rmSync(root2, { recursive: true, force: true });
});

test('validateFrRefs: stories with no prd_ref frontmatter are skipped', () => {
  const root3 = mkdtempSync(join(tmpdir(), 'koni-docs-refs-noref-'));
  const docs3 = buildFixture(root3);
  const storyPath = join(docs3, 'sprints', 'stories', 'US-1.8-noprdref.md');
  writeFileSync(storyPath, `---
id: US-1.8
title: "No PRD Ref"
epic: EPIC-1
status: backlog
priority: P2
points: 1
---

## Goal

No prd_ref here.
`, 'utf-8');
  const c = loadCorpus(docs3);
  const results = validateFrRefs(c);
  // US-1.8 has no prd_ref, should not appear
  assert.ok(!results.some(r => r.id === 'US-1.8'));
  rmSync(root3, { recursive: true, force: true });
});
