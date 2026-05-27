import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc } from '../../../src/lib/doc.ts';
import { findSection, getSectionText, replaceSection, appendToSection, removeSection } from '../../../src/lib/markdown/sections.ts';
import { serializeDoc } from '../../../src/lib/doc.ts';

const md = `---
id: US-1.1
---

## Goal

The goal paragraph.

## Acceptance criteria

- [ ] AC-1: First
- [ ] AC-2: Second

## Tasks

Placeholder.
`;

test('findSection: returns the section node by heading text', () => {
  const doc = parseDoc(md, '/x.md');
  const sec = findSection(doc, 'Goal');
  assert.ok(sec);
  assert.equal(sec!.heading.type, 'heading');
});

test('findSection: returns null for missing heading', () => {
  const doc = parseDoc(md, '/x.md');
  assert.equal(findSection(doc, 'Nope'), null);
});

test('getSectionText: returns the markdown of the section body', () => {
  const doc = parseDoc(md, '/x.md');
  const text = getSectionText(doc, 'Goal');
  assert.match(text, /The goal paragraph\./);
  assert.doesNotMatch(text, /Acceptance criteria/);
});

test('replaceSection: replaces section body, preserves heading', () => {
  const doc = parseDoc(md, '/x.md');
  const next = replaceSection(doc, 'Goal', 'Replaced.\n');
  const out = serializeDoc(next);
  assert.match(out, /## Goal\n\nReplaced\./);
  assert.doesNotMatch(out, /The goal paragraph\./);
});

test('appendToSection: appends to existing section content', () => {
  const doc = parseDoc(md, '/x.md');
  const next = appendToSection(doc, 'Goal', '\nAdditional sentence.\n');
  const out = serializeDoc(next);
  assert.match(out, /The goal paragraph\./);
  assert.match(out, /Additional sentence\./);
});

test('removeSection: removes heading and body', () => {
  const doc = parseDoc(md, '/x.md');
  const next = removeSection(doc, 'Tasks');
  const out = serializeDoc(next);
  assert.doesNotMatch(out, /## Tasks/);
  assert.match(out, /Acceptance criteria/);
});
