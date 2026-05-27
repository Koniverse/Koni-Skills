import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storySchema, validateStory, STORY_DEFAULTS } from '../../src/lib/schemas/story.ts';
import { validateEpic } from '../../src/lib/schemas/epic.ts';
import { validateSprint } from '../../src/lib/schemas/sprint.ts';
import { validateChangelogEntry } from '../../src/lib/schemas/changelog-entry.ts';

test('storySchema: accepts a full valid story', () => {
  const data = {
    id: 'US-1.1', title: 'Foo', epic: 'EPIC-1', status: 'done',
    priority: 'P0', points: 5, sprint: 'sprint-2026-W01',
    version_shipped: '0.1.0', prd_ref: 'FR-1', created: '2026-01-01', updated: '2026-01-05',
  };
  const r = validateStory(data);
  assert.equal(r.ok, true);
});

test('storySchema: rejects bad id format', () => {
  const r = validateStory({ id: 'us1', title: 'x', epic: 'EPIC-1', status: 'backlog' });
  assert.equal(r.ok, false);
});

test('STORY_DEFAULTS: has every field listed', () => {
  assert.equal(STORY_DEFAULTS.status, 'backlog');
  assert.equal(STORY_DEFAULTS.priority, 'P2');
  assert.equal(STORY_DEFAULTS.points, '');
});

test('validateEpic: accepts a minimal valid epic', () => {
  const r = validateEpic({ id: 'EPIC-1', title: 'E', status: 'backlog' });
  assert.equal(r.ok, true);
});

test('validateSprint: accepts a minimal valid sprint', () => {
  const r = validateSprint({
    id: 'sprint-2026-W23', status: 'planned',
    start: '2026-05-27', end: '2026-06-03',
    goal: 'ship epic-4 viewer',
  });
  assert.equal(r.ok, true);
});

test('validateChangelogEntry: accepts entry with full commit SHA', () => {
  const r = validateChangelogEntry({ version: '0.2.0', date: '2026-06-10', title: 'Lib core', commitSha: 'abc1234' });
  assert.equal(r.ok, true);
});
