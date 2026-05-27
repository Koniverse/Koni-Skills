import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storySchema, validateStory, STORY_DEFAULTS } from '../../src/lib/schemas/story.ts';

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
