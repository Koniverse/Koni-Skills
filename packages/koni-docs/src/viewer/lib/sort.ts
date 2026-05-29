// Sort helpers for the /project page views.
// Pillar G (US-4.36): default sort = STORY_STATUS_ORDER asc → priority asc →
// updated desc → id asc. Used by Table, Board (within column), Calendar
// (within day cell), and each group bucket.

import type { StoryRow } from './corpus.ts';

export const STORY_STATUS_ORDER = [
  'backlog',
  'ready',
  'in-progress',
  'review',
  'in-review',
  'blocked',
  'done',
  'reverted',
  'deprecated',
] as const;

const STATUS_RANK = new Map<string, number>(
  STORY_STATUS_ORDER.map((s, i) => [s, i]),
);

const PRIORITY_RANK: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

export function statusRank(status: string): number {
  return STATUS_RANK.get(status) ?? STORY_STATUS_ORDER.length;
}

export function priorityRank(priority: string): number {
  return PRIORITY_RANK[priority] ?? 99;
}

export function compareStories(a: StoryRow, b: StoryRow): number {
  const ds = statusRank(a.status) - statusRank(b.status);
  if (ds !== 0) return ds;
  const dp = priorityRank(a.priority) - priorityRank(b.priority);
  if (dp !== 0) return dp;
  // updated desc — empty string sorts last
  if (a.updated !== b.updated) {
    if (!a.updated) return 1;
    if (!b.updated) return -1;
    return a.updated < b.updated ? 1 : -1;
  }
  return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
}
