import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFixture } from './_fixtures/build-fixture.ts';
import { readFolderMatter } from '../../src/lib/corpus.ts';

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
