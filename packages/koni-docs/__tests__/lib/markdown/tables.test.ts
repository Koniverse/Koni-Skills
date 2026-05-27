import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc, serializeDoc } from '../../../src/lib/doc.ts';
import { findTable, parseTable, findRow, updateCell } from '../../../src/lib/markdown/tables.ts';

const sprintMd = `---
id: sprint-2026-W23
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
|---|---|---|---|---|---|---|---|
| US-4.1 | Foo | EPIC-4 | P0 | 5 | 🟢 ready | new | [link](stories/US-4.1.md) |
| US-4.2 | Bar | EPIC-4 | P0 | 5 | 🟢 ready | new | [link](stories/US-4.2.md) |
`;

test('findTable: finds the GFM table inside the section', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' });
  assert.ok(tbl);
});

test('parseTable: returns headers + rows as cell text', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' })!;
  const parsed = parseTable(tbl);
  assert.deepEqual(parsed.headers, ['US', 'Title', 'Epic', 'Pri', 'Points', 'Status', 'Carry', 'Story file']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0]?.[0], 'US-4.1');
});

test('findRow: matches by column NAME, not position', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const tbl = findTable(doc, { inSection: 'Sprint scope' })!;
  const parsed = parseTable(tbl);
  assert.equal(findRow(parsed, { column: 'US', value: 'US-4.2' }), 1);
  assert.equal(findRow(parsed, { column: 'US', value: 'US-9.9' }), -1);
});

test('updateCell: writes by column NAME — Status, not Carry (W23 BLOCKER fix)', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  const next = updateCell(doc, {
    tableLocator: { inSection: 'Sprint scope' },
    rowMatcher: { column: 'US', value: 'US-4.1' },
    column: 'Status',
    value: '✅ done',
  });
  const out = serializeDoc(next);
  // Verify that Status column was updated to "✅ done"
  assert.match(out, /✅ done\s*\|\s*new/);
  // Verify that Carry (between Status and Story file) is still "new", not overwritten
  assert.doesNotMatch(out, /✅ done\s*\|\s*✅ done/);
});

test('updateCell: throws when column name not in header', () => {
  const doc = parseDoc(sprintMd, '/sprint.md');
  assert.throws(
    () => updateCell(doc, {
      tableLocator: { inSection: 'Sprint scope' },
      rowMatcher: { column: 'US', value: 'US-4.1' },
      column: 'NoSuchColumn',
      value: 'x',
    }),
    /column "NoSuchColumn" not found/,
  );
});
