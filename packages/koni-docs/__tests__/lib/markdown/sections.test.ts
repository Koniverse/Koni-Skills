import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc } from '../../../src/lib/doc.ts';
import { findSection, findSectionStartingWith, findSectionByLabel, getSectionText, replaceSection, appendToSection, removeSection } from '../../../src/lib/markdown/sections.ts';
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

test('findSectionStartingWith: matches "## 8. Functional Requirements (FR)" via "## 8." prefix', () => {
  const raw = `# PRD\n\n## 8. Functional Requirements (FR)\n\n| ID | Requirement |\n|---|---|\n| FR-1 | Foo |\n\n## 9. Done\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  const match = findSectionStartingWith(doc, '## 8.');
  assert.ok(match, 'expected to find section starting with "## 8."');
  assert.equal(match!.heading.depth, 2);
  assert.ok(match!.body.some(n => n.type === 'table'), 'section body should include the table');
});

test('findSectionStartingWith: returns null when no heading matches the prefix', () => {
  const raw = `# PRD\n\n## 7. Other\n\nbody\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  assert.equal(findSectionStartingWith(doc, '## 8.'), null);
});

test('findSectionStartingWith: matches lowercase "Functional requirements" variant', () => {
  const raw = `# PRD\n\n## 8. Functional requirements\n\n| ID | Requirement |\n|---|---|\n| FR-1 | Foo |\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  const match = findSectionStartingWith(doc, '## 8.');
  assert.ok(match);
});

test('findSectionByLabel: exact label match wins (canonical label form)', () => {
  const raw = `# PRD\n\n## Functional Requirements\n\n| ID | Requirement |\n|---|---|\n| FR-1 | Foo |\n\n## Glossary\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  const match = findSectionByLabel(doc, 'Functional Requirements');
  assert.ok(match);
  assert.equal(match!.heading.depth, 2);
  assert.ok(match!.body.some(n => n.type === 'table'));
});

test('findSectionByLabel: falls back to legacy numbered heading when label not present', () => {
  const raw = `# PRD\n\n## 8. Functional Requirements (FR)\n\n| ID | Requirement |\n|---|---|\n| FR-1 | Foo |\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  const match = findSectionByLabel(doc, 'Functional Requirements', { legacyNumber: 8 });
  assert.ok(match, 'expected legacy fallback to match "## 8. Functional Requirements (FR)"');
  assert.ok(match!.body.some(n => n.type === 'table'));
});

test('findSectionByLabel: returns null when neither label nor legacy number present', () => {
  const raw = `# PRD\n\n## Personas\n\nstuff\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  assert.equal(findSectionByLabel(doc, 'Functional Requirements', { legacyNumber: 8 }), null);
});

test('findSectionByLabel: legacy fallback is opt-in via legacyNumber', () => {
  const raw = `# PRD\n\n## 8. Functional Requirements\n\nstuff\n`;
  const doc = parseDoc(raw, '/tmp/PRD.md');
  assert.equal(findSectionByLabel(doc, 'Functional Requirements'), null,
    'no legacyNumber → must not fall back to numbered heading');
});
