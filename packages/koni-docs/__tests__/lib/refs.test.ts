import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { loadCorpus } from '../../src/lib/corpus.ts';
import { listChildrenOf, listReferrersTo, validateRefs } from '../../src/lib/refs.ts';

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
