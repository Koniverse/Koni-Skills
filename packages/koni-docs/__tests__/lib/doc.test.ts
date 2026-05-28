import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readDoc, parseDoc, serializeDoc, updateFrontmatter, writeDoc } from '../../src/lib/doc.ts';

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

test('updateFrontmatter: merges and preserves existing keys', () => {
  const doc = parseDoc('---\nid: US-1.1\nstatus: backlog\n---\n\nbody\n', '/x.md');
  const next = updateFrontmatter(doc, { status: 'done', version_shipped: 'v0.1.0' });
  assert.equal(next.frontmatter.id, 'US-1.1');
  assert.equal(next.frontmatter.status, 'done');
  assert.equal(next.frontmatter.version_shipped, 'v0.1.0');
});

test('writeDoc: writes serialized doc to disk', () => {
  const p = join(root, 'wd.md');
  const doc = parseDoc('---\nid: US-1.2\n---\n\n# Hi\n', p);
  const next = updateFrontmatter(doc, { status: 'done' });
  writeDoc(p, next);
  const onDisk = readFileSync(p, 'utf-8');
  assert.match(onDisk, /id: US-1\.2/);
  assert.match(onDisk, /status: done/);
  assert.match(onDisk, /# Hi/);
});

test('writeDoc: preserves quoted YAML values across round-trip', () => {
  const raw = `---
id: US-1.1
title: "Foo bar"
status: done
version_shipped: "0.6.0"
priority: "P1"
points: 5
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/story.md');
  const out = serializeDoc(doc);
  assert.match(out, /^title: "Foo bar"$/m);
  assert.match(out, /^version_shipped: "0\.6\.0"$/m);
  assert.match(out, /^priority: "P1"$/m);
  assert.match(out, /^id: US-1\.1$/m);
  assert.match(out, /^status: done$/m);
  assert.match(out, /^points: 5$/m);
});

test('writeDoc: preserves single-quoted YAML values', () => {
  const raw = `---
title: 'Foo'
status: done
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/story.md');
  const out = serializeDoc(doc);
  assert.match(out, /^title: 'Foo'$/m);
});

test('writeDoc: does NOT add quotes to keys that were unquoted', () => {
  const raw = `---
id: US-2.3
status: ready
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/story.md');
  const out = serializeDoc(doc);
  assert.match(out, /^id: US-2\.3$/m);
  assert.match(out, /^status: ready$/m);
  assert.doesNotMatch(out, /^id: "US-2\.3"$/m);
});

test('writeDoc: long quoted value that js-yaml folds stays parseable on round-trip', () => {
  // Regression: reapplyQuoting was wrapping the YAML folded-scalar indicator
  // `>-` in quotes, producing `goal: ">-"` followed by orphaned continuation
  // lines — corrupt frontmatter that fails to re-parse on the next sync.
  const longGoal = 'Carry the open W21 strands to landing: US-4.29 EOA execute path (close out FSM + task-list rationalisation), US-7.7 accounting-sync security follow-up (OAuth + token-at-rest + live Xero/QuickBooks adapters per D42), US-9.8 web balance-dashboard migration.';
  const raw = `---
id: sprint-2026-W22
status: planned
goal: "${longGoal}"
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/sprint.md');
  const out = serializeDoc(doc);

  // The output must NOT contain the bug signature `goal: ">-"`.
  assert.doesNotMatch(out, /^goal: "[>|][-+]?"$/m,
    'reapplyQuoting must not wrap a YAML block-scalar indicator in quotes');

  // And the output must be re-parseable: a second round-trip recovers the
  // same `goal` value.
  const reparsed = parseDoc(out, '/tmp/sprint.md');
  assert.equal(reparsed.frontmatter.goal, longGoal);
});

test('writeDoc: long single-quoted value also survives folded-style round-trip', () => {
  const longValue = 'A very long single-quoted value that exceeds the default js-yaml lineWidth of 80 characters and will therefore be emitted in folded block-scalar style on serialize.';
  const raw = `---
id: x
note: '${longValue}'
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/x.md');
  const out = serializeDoc(doc);
  assert.doesNotMatch(out, /^note: '[>|][-+]?'$/m);
  const reparsed = parseDoc(out, '/tmp/x.md');
  assert.equal(reparsed.frontmatter.note, longValue);
});
