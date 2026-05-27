import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc, serializeDoc } from '../../../src/lib/doc.ts';
import { parseCheckboxes, setCheckboxState, appendCheckbox, replaceCheckboxes } from '../../../src/lib/markdown/checkboxes.ts';

const storyMd = `---
id: US-1.1
---

## Acceptance criteria

- [ ] **AC-1** — Given X, When Y, Then Z
- [x] **AC-2** — Declarative criterion
- [ ] **AC-3** — Edge case
`;

test('parseCheckboxes: extracts id, text, done', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const items = parseCheckboxes(doc, 'Acceptance criteria');
  assert.equal(items.length, 3);
  assert.equal(items[0]?.id, 'AC-1');
  assert.equal(items[1]?.done, true);
  assert.match(items[0]?.text ?? '', /Given X, When Y/);
});

test('setCheckboxState: toggles by AC ID', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = setCheckboxState(doc, { heading: 'Acceptance criteria', id: 'AC-1', done: true });
  const out = serializeDoc(next);
  assert.match(out, /- \[x\] \*\*AC-1\*\*/);
});

test('appendCheckbox: appends a new AC', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = appendCheckbox(doc, { heading: 'Acceptance criteria', id: 'AC-4', text: 'New criterion' });
  const out = serializeDoc(next);
  assert.match(out, /- \[ \] \*\*AC-4\*\* — New criterion/);
});

test('replaceCheckboxes: regenerates the full list', () => {
  const doc = parseDoc(storyMd, '/s.md');
  const next = replaceCheckboxes(doc, 'Acceptance criteria', [
    { id: 'AC-1', text: 'Rewritten one', done: false },
    { id: 'AC-2', text: 'Rewritten two', done: true },
  ]);
  const out = serializeDoc(next);
  assert.match(out, /- \[ \] \*\*AC-1\*\* — Rewritten one/);
  assert.match(out, /- \[x\] \*\*AC-2\*\* — Rewritten two/);
  assert.doesNotMatch(out, /AC-3/);
});
