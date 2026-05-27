import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readDoc, parseDoc, serializeDoc } from '../../src/lib/doc.ts';

const root = mkdtempSync(join(tmpdir(), 'koni-docs-doc-'));
process.on('exit', () => rmSync(root, { recursive: true, force: true }));

test('readDoc: reads frontmatter + body', () => {
  const p = join(root, 'a.md');
  writeFileSync(p, '---\nid: US-1.1\nstatus: done\n---\n\n# Hello\n');
  const doc = readDoc(p);
  assert.equal(doc.frontmatter.id, 'US-1.1');
  assert.equal(doc.frontmatter.status, 'done');
  assert.match(doc.body, /# Hello/);
  assert.equal(doc.ast.type, 'root');
});

test('parseDoc: pure parse of raw string', () => {
  const raw = '---\nid: US-2.1\n---\n\nbody text\n';
  const doc = parseDoc(raw, '/virtual/path.md');
  assert.equal(doc.frontmatter.id, 'US-2.1');
  assert.equal(doc.path, '/virtual/path.md');
});

test('serializeDoc: round-trip preserves content when AST untouched', () => {
  const raw = '---\nid: US-3.1\ntitle: "T"\n---\n\n# Heading\n\nParagraph.\n';
  const doc = parseDoc(raw, '/x.md');
  const out = serializeDoc(doc);
  assert.match(out, /^---\n/);
  assert.match(out, /id: US-3.1/);
  assert.match(out, /# Heading/);
});
