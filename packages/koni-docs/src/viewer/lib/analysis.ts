// Analysis aggregation for the /project page.
// Pillar G (US-4.33): hero KPIs, status breakdown, 30-day completion bar,
// 26-week commit heatmap, per-epic progress with UNION semantics.
// Search-unaffected — feeds on sprint-filtered stories per ERP §4.1.

import type { StoryRow, EpicStat } from './corpus.ts';
import { findStoryWarnings } from './warnings.ts';
import { STORY_STATUS_ORDER } from './sort.ts';

export interface HeroKpis {
  startDate: string;       // YYYY-MM-DD or "" if unknown
  daysElapsed: number;     // 0 when no start
  totalStories: number;
  doneStories: number;
  completionPct: number;   // 0-100
  warningCount: number;
}

export interface StatusBreakdownEntry {
  status: string;
  count: number;
}

export interface DailyCompletion {
  date: string;            // YYYY-MM-DD
  count: number;
}

export interface PersonStat {
  person: string;          // assignee handle or "(unassigned)"
  stories: number;
  done: number;
}

export interface AnalysisStats {
  hero: HeroKpis;
  statusBreakdown: StatusBreakdownEntry[];
  dailyCompletion: DailyCompletion[];   // last 30 days oldest → newest
  epicProgress: EpicStat[];             // UNION-seeded already by corpus
  peopleStats: PersonStat[];            // bucketed by assignee, unassigned last
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso + 'T00:00:00Z').getTime();
  const b = new Date(bIso + 'T00:00:00Z').getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function earliestSprintStart(corpusSprints: Array<{ start?: unknown }>): string {
  const dates = corpusSprints
    .map(s => {
      const v = s.start;
      if (!v) return '';
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      const t = String(v).trim();
      return t ? t.slice(0, 10) : '';
    })
    .filter(Boolean)
    .sort();
  return dates[0] ?? '';
}

export function buildAnalysisStats(
  stories: StoryRow[],
  epics: EpicStat[],
  sprints: Array<{ start?: unknown }>,
): AnalysisStats {
  const startDate = earliestSprintStart(sprints);
  const today = todayIso();
  const totalStories = stories.length;
  const doneStories = stories.filter(s => s.status === 'done').length;
  const completionPct = totalStories === 0
    ? 0
    : Math.round((doneStories / totalStories) * 1000) / 10;

  const warningCount = findStoryWarnings(stories).length;

  const hero: HeroKpis = {
    startDate,
    daysElapsed: startDate ? daysBetween(startDate, today) : 0,
    totalStories,
    doneStories,
    completionPct,
    warningCount,
  };

  // Status breakdown — UNION over STORY_STATUS_ORDER so empty buckets render.
  const counts = new Map<string, number>();
  for (const s of stories) counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
  const statusBreakdown: StatusBreakdownEntry[] = STORY_STATUS_ORDER
    .filter((v, i, arr) => arr.indexOf(v) === i) // dedupe synonyms (review/in-review)
    .map(status => ({ status, count: counts.get(status) ?? 0 }));

  // Daily completion — last 30 days. Use `updated` as a proxy when status=done.
  const todayDate = new Date(today + 'T00:00:00Z');
  const completionMap = new Map<string, number>();
  for (const s of stories) {
    if (s.status !== 'done' || !s.updated) continue;
    completionMap.set(s.updated, (completionMap.get(s.updated) ?? 0) + 1);
  }
  const dailyCompletion: DailyCompletion[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setUTCDate(todayDate.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    dailyCompletion.push({ date: iso, count: completionMap.get(iso) ?? 0 });
  }

  // People stats — bucket by assignee, unassigned last.
  const byPerson = new Map<string, { stories: number; done: number }>();
  for (const s of stories) {
    const person = s.assignee && s.assignee !== '—' ? s.assignee : '(unassigned)';
    const entry = byPerson.get(person) ?? { stories: 0, done: 0 };
    entry.stories += 1;
    if (s.status === 'done') entry.done += 1;
    byPerson.set(person, entry);
  }
  const peopleStats: PersonStat[] = [...byPerson.entries()]
    .map(([person, c]) => ({ person, ...c }))
    .sort((a, b) => {
      if (a.person === '(unassigned)') return 1;
      if (b.person === '(unassigned)') return -1;
      if (b.stories !== a.stories) return b.stories - a.stories;
      return a.person.localeCompare(b.person);
    });

  return {
    hero,
    statusBreakdown,
    dailyCompletion,
    epicProgress: epics,
    peopleStats,
  };
}
