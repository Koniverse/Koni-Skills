import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCorpus } from '../../src/lib/corpus.ts';
import {
  getDeadlines, findMalformedDue, normalizeDue, isValidIsoDate,
} from '../../src/lib/deadlines.ts';

/** Fixed frame of reference — these tests must not rot as the clock moves. */
const TODAY = new Date('2026-07-13T09:30:00Z');

interface StoryStub {
  id: string;
  status?: string;
  /** Written verbatim into the YAML, so quoting and prose can be exercised. */
  due?: string;
  assignee?: string;
}

/** A docs/ tree whose only interesting axis is the stories' `due` field. */
function fixtureWith(stories: StoryStub[]): string {
  const docs = join(mkdtempSync(join(tmpdir(), 'koni-docs-deadlines-')), 'docs');
  mkdirSync(join(docs, 'sprints', 'stories'), { recursive: true });
  for (const s of stories) {
    const dueLine = s.due === undefined ? '' : `due: ${s.due}\n`;
    writeFileSync(join(docs, 'sprints', 'stories', `${s.id}-x.md`), `---
id: ${s.id}
title: "Story ${s.id}"
epic: EPIC-1
status: ${s.status ?? 'in-progress'}
assignee: ${s.assignee ?? 'saltict'}
${dueLine}---

## Goal

x.
`);
  }
  return docs;
}

const fixtures: string[] = [];
function corpusWith(stories: StoryStub[]) {
  const docs = fixtureWith(stories);
  fixtures.push(docs);
  return loadCorpus(docs);
}
process.on('exit', () => {
  for (const d of fixtures) rmSync(join(d, '..'), { recursive: true, force: true });
});

test('normalizeDue: accepts the string form, the Date form, and a round-tripped timestamp', () => {
  assert.equal(normalizeDue('2026-07-20'), '2026-07-20');
  // js-yaml turns an unquoted date into a Date — the form real corpora carry.
  assert.equal(normalizeDue(new Date('2026-07-20T00:00:00Z')), '2026-07-20');
  assert.equal(normalizeDue('2026-07-20T00:00:00.000Z'), '2026-07-20');
});

test('normalizeDue: absent, empty, and prose values yield no deadline', () => {
  assert.equal(normalizeDue(undefined), null);
  assert.equal(normalizeDue(''), null);
  assert.equal(normalizeDue('   '), null);
  assert.equal(normalizeDue('end of July'), null);
  assert.equal(normalizeDue(42), null);
});

test('normalizeDue: a date with prose stapled to it is NOT a date', () => {
  // REG — the first cut of normalizeDue tested `trimmed.slice(0, 10)`, so the
  // exact anti-pattern the docs promise validate will reject
  // (`due: 2026-07-20 (pending customer confirmation)`) was silently accepted
  // and rendered in STATUS.md as a clean deadline. A guardrail that waves the
  // documented anti-pattern through is worse than none: the reader stops looking.
  assert.equal(normalizeDue('2026-07-20 (pending customer confirmation)'), null);
  assert.equal(normalizeDue('2026-07-20 — before the audit'), null);
  assert.equal(normalizeDue('2026-07-20 or thereabouts'), null);
  // The ISO-timestamp tolerance that motivated the slice must still work.
  assert.equal(normalizeDue('2026-07-20T00:00:00.000Z'), '2026-07-20');
  assert.equal(normalizeDue('2026-07-20T09:30:00+07:00'), '2026-07-20');
});

test('isValidIsoDate: a date that matches the shape but does not exist is not a date', () => {
  assert.equal(isValidIsoDate('2026-07-20'), true);
  assert.equal(isValidIsoDate('2026-02-31'), false);
  assert.equal(isValidIsoDate('2026-13-01'), false);
  assert.equal(isValidIsoDate('20260720'), false);
});

test('getDeadlines: classifies at the boundaries of the due-soon window', () => {
  const c = corpusWith([
    { id: 'US-1.1', due: '2026-07-12' }, // yesterday
    { id: 'US-1.2', due: '2026-07-13' }, // today
    { id: 'US-1.3', due: '2026-07-16' }, // exactly N days out
    { id: 'US-1.4', due: '2026-07-17' }, // one day past the window
  ]);
  const byId = new Map(getDeadlines(c, TODAY, 3).map(d => [d.id, d]));

  assert.equal(byId.get('US-1.1')?.state, 'overdue');
  assert.equal(byId.get('US-1.1')?.daysRemaining, -1);
  assert.equal(byId.get('US-1.2')?.state, 'due-soon'); // due today is not yet late
  assert.equal(byId.get('US-1.2')?.daysRemaining, 0);
  assert.equal(byId.get('US-1.3')?.state, 'due-soon'); // the window is inclusive
  assert.equal(byId.get('US-1.4')?.state, 'on-track');
  assert.equal(byId.get('US-1.4')?.daysRemaining, 4);
});

test('getDeadlines: the due-soon window is the caller\'s to widen', () => {
  const c = corpusWith([{ id: 'US-1.1', due: '2026-07-20' }]);
  assert.equal(getDeadlines(c, TODAY, 3)[0]?.state, 'on-track');
  assert.equal(getDeadlines(c, TODAY, 7)[0]?.state, 'due-soon');
});

test('getDeadlines: a shipped or retired story cannot be late', () => {
  const c = corpusWith([
    { id: 'US-1.1', due: '2026-01-01', status: 'done' },
    { id: 'US-1.2', due: '2026-01-01', status: 'deprecated' },
    { id: 'US-1.3', due: '2026-01-01', status: 'blocked' },
  ]);
  const ids = getDeadlines(c, TODAY, 3).map(d => d.id);
  assert.deepEqual(ids, ['US-1.3']);
});

test('getDeadlines: a story with no due has no deadline — sprint end is not inherited', () => {
  const c = corpusWith([{ id: 'US-1.1' }, { id: 'US-1.2', due: '' }]);
  assert.deepEqual(getDeadlines(c, TODAY, 3), []);
});

test('getDeadlines: most overdue first, furthest out last', () => {
  const c = corpusWith([
    { id: 'US-1.3', due: '2026-08-01' },
    { id: 'US-1.1', due: '2026-07-01' },
    { id: 'US-1.2', due: '2026-07-14' },
  ]);
  assert.deepEqual(getDeadlines(c, TODAY, 3).map(d => d.id), ['US-1.1', 'US-1.2', 'US-1.3']);
});

test('getDeadlines: carries title, status, and assignee through for display', () => {
  const c = corpusWith([{ id: 'US-1.1', due: '2026-07-20', assignee: 'jindo9986' }]);
  const d = getDeadlines(c, TODAY, 3)[0]!;
  assert.equal(d.title, 'Story US-1.1');
  assert.equal(d.status, 'in-progress');
  assert.equal(d.assignee, 'jindo9986');
  assert.equal(d.due, '2026-07-20');
});

test('findMalformedDue: prose and impossible dates are reported, valid ones are not', () => {
  const c = corpusWith([
    { id: 'US-1.1', due: '"end of July"' },
    { id: 'US-1.2', due: '"2026-02-31"' },
    { id: 'US-1.3', due: '2026-07-20' },
    { id: 'US-1.4', due: '' },
    { id: 'US-1.5' },
  ]);
  const bad = findMalformedDue(c);
  assert.deepEqual(bad.map(b => b.id).sort(), ['US-1.1', 'US-1.2']);
  assert.equal(bad.find(b => b.id === 'US-1.1')?.reason, 'not_a_date');
  assert.equal(bad.find(b => b.id === 'US-1.2')?.reason, 'impossible_date');
});

test('findMalformedDue: an unquoted impossible date is rolled over by YAML before we see it', () => {
  // Documents a limit we cannot close from here: js-yaml parses `2026-02-31` as
  // a timestamp and hands us 2026-03-03. The typo is destroyed a layer below.
  // Quoting the value (`due: "2026-02-31"`) is what preserves it for us to catch.
  const c = corpusWith([{ id: 'US-1.1', due: '2026-02-31' }]);
  assert.deepEqual(findMalformedDue(c), []);
  assert.equal(getDeadlines(c, TODAY, 3)[0]?.due, '2026-03-03');
});

test('findMalformedDue: a shipped story with a broken due is still broken', () => {
  const c = corpusWith([{ id: 'US-1.1', due: '"soon"', status: 'done' }]);
  assert.equal(findMalformedDue(c).length, 1);
});
