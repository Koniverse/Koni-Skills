// Required-field-by-status validator for the Warning view.
// Pillar G (US-4.34): replaces the US-4.20 filter-only impl with the
// koni-erp-02 §4.8 validator. Detects non-backlog stories missing the
// required frontmatter fields for their current status.

import type { StoryRow } from './corpus.ts';

export type WarningField =
  | 'priority'
  | 'points'
  | 'sprint'
  | 'assignee'
  | 'version_shipped'
  | 'commit';

export interface StoryWarning {
  id: string;
  title: string;
  epic: string;
  status: string;
  slug: string;
  missing: WarningField[];
}

function isMissing(field: WarningField, story: StoryRow): boolean {
  const v = story[field as keyof StoryRow];
  // points: 0 is present (legit zero-point story).
  if (field === 'points') return typeof v !== 'number';
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') {
    const t = v.trim();
    // Frontmatter parser fills missing scalars with "—" placeholder.
    return t === '' || t === '—';
  }
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

const NON_BACKLOG_REQUIRED: WarningField[] = ['priority', 'points', 'sprint', 'assignee'];
const DONE_REQUIRED: WarningField[] = [...NON_BACKLOG_REQUIRED, 'version_shipped', 'commit'];

export function findStoryWarnings(stories: StoryRow[]): StoryWarning[] {
  const warnings: StoryWarning[] = [];
  for (const story of stories) {
    if (story.status === 'backlog') continue;
    const required = story.status === 'done' ? DONE_REQUIRED : NON_BACKLOG_REQUIRED;
    const missing = required.filter(f => isMissing(f, story));
    if (missing.length > 0) {
      warnings.push({
        id: story.id,
        title: story.title,
        epic: story.epic,
        status: story.status,
        slug: story.slug,
        missing,
      });
    }
  }
  return warnings;
}
