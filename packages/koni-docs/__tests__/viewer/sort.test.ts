import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareStories, statusRank, priorityRank, STORY_STATUS_ORDER } from '../../src/viewer/lib/sort.ts';
import type { StoryRow } from '../../src/viewer/lib/corpus.ts';

function story(over: Partial<StoryRow>): StoryRow {
  return {
    id: 'US-1.1',
    title: 'Test',
    epic: 'EPIC-1',
    status: 'backlog',
    priority: '—',
    points: 0,
    sprint: '—',
    assignee: '—',
    version_shipped: '',
    commit: '',
    slug: 'sprints/stories/test',
    updated: '',
    ...over,
  };
}

test('statusRank: known statuses map to ascending integers', () => {
  assert.equal(statusRank('backlog'), 0);
  assert.equal(statusRank('done'), STORY_STATUS_ORDER.indexOf('done'));
  assert.ok(statusRank('backlog') < statusRank('ready'));
  assert.ok(statusRank('ready') < statusRank('in-progress'));
  assert.ok(statusRank('in-progress') < statusRank('done'));
});

test('statusRank: unknown status sorts last', () => {
  assert.equal(statusRank('unknown'), STORY_STATUS_ORDER.length);
});

test('priorityRank: P0 < P1 < P2 < P3 < missing', () => {
  assert.ok(priorityRank('P0') < priorityRank('P1'));
  assert.ok(priorityRank('P1') < priorityRank('P2'));
  assert.ok(priorityRank('P2') < priorityRank('P3'));
  assert.ok(priorityRank('P3') < priorityRank('—'));
});

test('compareStories: primary key is status order asc', () => {
  const done = story({ id: 'US-1.1', status: 'done', priority: 'P3' });
  const backlog = story({ id: 'US-1.2', status: 'backlog', priority: 'P0' });
  assert.ok(compareStories(backlog, done) < 0);
});

test('compareStories: priority breaks status ties', () => {
  const a = story({ id: 'US-1.1', status: 'ready', priority: 'P2' });
  const b = story({ id: 'US-1.2', status: 'ready', priority: 'P0' });
  assert.ok(compareStories(b, a) < 0);
});

test('compareStories: updated desc breaks priority ties', () => {
  const newer = story({ id: 'US-1.1', status: 'ready', priority: 'P0', updated: '2026-05-28' });
  const older = story({ id: 'US-1.2', status: 'ready', priority: 'P0', updated: '2026-05-01' });
  assert.ok(compareStories(newer, older) < 0);
});

test('compareStories: missing updated sorts last', () => {
  const has = story({ id: 'US-1.1', status: 'ready', priority: 'P0', updated: '2026-05-01' });
  const missing = story({ id: 'US-1.2', status: 'ready', priority: 'P0', updated: '' });
  assert.ok(compareStories(has, missing) < 0);
});

test('compareStories: id asc is the final tie-break', () => {
  const a = story({ id: 'US-1.1', status: 'ready', priority: 'P0', updated: '2026-05-28' });
  const b = story({ id: 'US-1.10', status: 'ready', priority: 'P0', updated: '2026-05-28' });
  // numeric collation: 1.1 < 1.10
  assert.ok(compareStories(a, b) < 0);
});
