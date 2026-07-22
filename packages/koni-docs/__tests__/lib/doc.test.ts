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

test('writeDoc: long quoted value stays on ONE line and re-parses', () => {
  // Two layered regressions on the same value:
  //  1. US-4.24 — reapplyQuoting wrapped the folded-scalar indicator, producing
  //     `goal: ">-"` plus orphaned continuation lines: corrupt frontmatter.
  //  2. US-4.37 — the fold itself. js-yaml's default lineWidth of 80 re-emitted
  //     this value as `goal: >-`, which line-based external readers render
  //     literally as `>-`. Now serialized with lineWidth: -1.
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

  // Nor may it fold at all: no block-scalar indicator on the `goal` line.
  assert.doesNotMatch(out, /^goal: *[>|][-+]?\s*$/m,
    'a long value must not be emitted as a folded/literal block scalar');

  // The whole value sits on one physical line.
  const goalLine = out.split('\n').find(l => l.startsWith('goal:'));
  assert.ok(goalLine?.includes('web balance-dashboard migration.'),
    'the entire value must be on the `goal:` line itself');

  // And the output must be re-parseable: a second round-trip recovers the
  // same `goal` value.
  const reparsed = parseDoc(out, '/tmp/sprint.md');
  assert.equal(reparsed.frontmatter.goal, longGoal);
});

test('writeDoc: long single-quoted value stays on ONE line and re-parses', () => {
  const longValue = 'A very long single-quoted value that exceeds the default js-yaml lineWidth of 80 characters and would therefore have been emitted in folded block-scalar style before US-4.37.';
  const raw = `---
id: x
note: '${longValue}'
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/x.md');
  const out = serializeDoc(doc);
  assert.doesNotMatch(out, /^note: '[>|][-+]?'$/m);
  assert.doesNotMatch(out, /^note: *[>|][-+]?\s*$/m);
  const reparsed = parseDoc(out, '/tmp/x.md');
  assert.equal(reparsed.frontmatter.note, longValue);
});

test('writeDoc: long UNQUOTED title stays on one line (the US-4.37 defect)', () => {
  // The reported shape: an epic title with no character forcing a quote. It is
  // exactly this class that folded, because js-yaml wraps purely on width.
  const longTitle = 'Admin System-wide Statistics — Population-filtered Performance Aggregate + Platform Composition';
  assert.ok(longTitle.length > 80, 'fixture must exceed the js-yaml default lineWidth');

  const raw = `---
id: EPIC-99
title: ${longTitle}
status: planned
---

Body.
`;
  const doc = parseDoc(raw, '/tmp/epic.md');
  const out = serializeDoc(doc);

  assert.match(out, new RegExp(`^title: ${longTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'),
    'the title must be emitted bare, whole, on a single line');
  assert.doesNotMatch(out, /^title: *[>|][-+]?\s*$/m);

  const reparsed = parseDoc(out, '/tmp/epic.md');
  assert.equal(reparsed.frontmatter.title, longTitle);
});

test('writeDoc: a value REQUIRING quotes is still quoted — on one line', () => {
  // lineWidth: -1 must not be mistaken for "stop quoting". js-yaml quotes on
  // content (here, the `: ` that would otherwise read as a mapping), not width.
  const longWithColon = 'Crypto workspace — sync to KMT v0.11.1: gate the release commit, then reconcile the ledger against the upstream snapshot before publishing.';
  const doc = parseDoc(`---\nid: x\ngoal: "${longWithColon}"\n---\n\nBody.\n`, '/tmp/q.md');
  const out = serializeDoc(doc);

  const goalLine = out.split('\n').find(l => l.startsWith('goal:'));
  assert.ok(goalLine, 'goal line must exist');
  assert.match(goalLine, /^goal: ["'].*["']$/, 'must remain quoted on a single line');
  assert.equal(parseDoc(out, '/tmp/q.md').frontmatter.goal, longWithColon);
});

test('writeDoc: a value with REAL newlines is still a literal block', () => {
  // The counterpart guarantee. lineWidth: -1 turns off *width* folding only —
  // a value carrying newlines must still serialize as `|` and keep them. This
  // is why reapplyQuoting's block-scalar bail-out stays: quoting or collapsing
  // this line would destroy the newlines.
  const doc = parseDoc('---\nid: x\n---\n\nBody.\n', '/tmp/m.md');
  const multi = updateFrontmatter(doc, { supersedes: 'line one\nline two\nline three' });
  const out = serializeDoc(multi);

  assert.match(out, /^supersedes: *\|[-+]?\s*$/m,
    'a multi-line value must be emitted as a literal block scalar');
  assert.equal(parseDoc(out, '/tmp/m.md').frontmatter.supersedes, 'line one\nline two\nline three');
});
