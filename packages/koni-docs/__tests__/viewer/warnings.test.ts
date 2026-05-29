import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findStoryWarnings } from '../../src/viewer/lib/warnings.ts';
import type { StoryRow } from '../../src/viewer/lib/corpus.ts';

function story(over: Partial<StoryRow>): StoryRow {
  return {
    id: 'US-1.1',
    title: 'Test',
    epic: 'EPIC-1',
    status: 'backlog',
    priority: 'P0',
    points: 3,
    sprint: 'sprint-2026-W22',
    assignee: 'saltict',
    version_shipped: '',
    commit: '',
    slug: 'sprints/stories/test',
    updated: '2026-05-28',
    ...over,
  };
}

test('findStoryWarnings: backlog stories are never flagged', () => {
  const out = findStoryWarnings([story({ status: 'backlog', priority: '—', sprint: '—', assignee: '—' })]);
  assert.equal(out.length, 0);
});

test('findStoryWarnings: ready story missing priority is flagged', () => {
  const out = findStoryWarnings([story({ status: 'ready', priority: '—' })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.missing, ['priority']);
});

test('findStoryWarnings: ready story missing all 4 fields is flagged once with full list', () => {
  const out = findStoryWarnings([story({ status: 'ready', priority: '—', points: undefined as any, sprint: '—', assignee: '—' })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.missing, ['priority', 'points', 'sprint', 'assignee']);
});

test('findStoryWarnings: done story without commit + version_shipped flags both', () => {
  const out = findStoryWarnings([story({ status: 'done' })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.missing, ['version_shipped', 'commit']);
});

test('findStoryWarnings: done story with all required fields is not flagged', () => {
  const out = findStoryWarnings([story({ status: 'done', version_shipped: '0.7.0', commit: 'abc1234' })]);
  assert.equal(out.length, 0);
});

test('findStoryWarnings: points=0 is treated as present (legit zero-point story)', () => {
  const out = findStoryWarnings([story({ status: 'ready', points: 0 })]);
  assert.equal(out.length, 0);
});

test('findStoryWarnings: whitespace-only string counts as missing', () => {
  const out = findStoryWarnings([story({ status: 'ready', priority: '   ' })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.missing, ['priority']);
});

test('findStoryWarnings: em-dash placeholder counts as missing', () => {
  const out = findStoryWarnings([story({ status: 'ready', sprint: '—' })]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.missing, ['sprint']);
});

test('findStoryWarnings: blocked status requires the 4 non-backlog fields, not the done set', () => {
  // blocked story without commit/version_shipped is fine; only checks 4 base fields
  const out = findStoryWarnings([story({ status: 'blocked' })]);
  assert.equal(out.length, 0);
});

test('findStoryWarnings: multiple stories return one warning per offender', () => {
  const out = findStoryWarnings([
    story({ id: 'US-1.1', status: 'done', version_shipped: '0.7.0', commit: 'abc' }), // ok
    story({ id: 'US-1.2', status: 'ready', priority: '—' }),                          // 1 missing
    story({ id: 'US-1.3', status: 'done' }),                                          // 2 missing
  ]);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map(w => w.id), ['US-1.2', 'US-1.3']);
});
