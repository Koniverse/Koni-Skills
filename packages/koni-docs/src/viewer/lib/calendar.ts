// Calendar + commit-activity helpers for the /project page.
// Pillar G (US-4.32 / US-4.33): commits-per-day overlay + 26-week activity
// heatmap. Reads local `git log` via execSync — node-only, no extra deps.
// Module-init cached for the process lifetime; chokidar --watch (US-4.21)
// invalidates by restart.

import { execSync } from 'node:child_process';
import { isGitRepo } from '@koniverse/koni-docs/lib';
import type { StoryRow } from './corpus.ts';

export interface CommitMeta {
  sha: string;
  shortSha: string;
  subject: string;
  author: string;
  date: string; // YYYY-MM-DD (author date, local TZ)
}

const COMMIT_LIMIT = 2000;

let _dailyCommits: Map<string, CommitMeta[]> | null = null;
let _allCommits: CommitMeta[] | null = null;

function loadAllCommits(): CommitMeta[] {
  if (_allCommits) return _allCommits;
  if (!isGitRepo()) {
    _allCommits = [];
    return _allCommits;
  }
  try {
    // ISO author date, sha, subject, author name. Delimit with US (\x1f).
    const fmt = '%H\x1f%ad\x1f%an\x1f%s';
    const out = execSync(
      `git log -n ${COMMIT_LIMIT} --date=short --pretty=format:${JSON.stringify(fmt)}`,
      { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' },
    );
    _allCommits = out
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [sha, date, author, subject] = line.split('\x1f');
        return {
          sha: sha ?? '',
          shortSha: (sha ?? '').slice(0, 7),
          subject: subject ?? '',
          author: author ?? '',
          date: date ?? '',
        };
      });
  } catch {
    _allCommits = [];
  }
  return _allCommits;
}

export function loadDailyCommits(): Map<string, CommitMeta[]> {
  if (_dailyCommits) return _dailyCommits;
  const map = new Map<string, CommitMeta[]>();
  for (const c of loadAllCommits()) {
    if (!c.date) continue;
    const arr = map.get(c.date) ?? [];
    arr.push(c);
    map.set(c.date, arr);
  }
  _dailyCommits = map;
  return _dailyCommits;
}

export interface DayCell {
  date: string;          // YYYY-MM-DD
  inMonth: boolean;
  storyCount: number;
  commitCount: number;
}

export interface MonthGrid {
  year: number;
  month: number;         // 1-12
  label: string;         // "May 2026"
  weeks: DayCell[][];    // 6 weeks × 7 days (Sun-Sat)
  prevMonth: { year: number; month: number };
  nextMonth: { year: number; month: number };
}

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  let y = year;
  let m = month + delta;
  while (m < 1) { m += 12; y -= 1; }
  while (m > 12) { m -= 12; y += 1; }
  return { year: y, month: m };
}

export function buildMonthGrid(
  year: number,
  month: number,
  stories: StoryRow[],
  commits: Map<string, CommitMeta[]>,
): MonthGrid {
  const storyByDate = new Map<string, number>();
  for (const s of stories) {
    if (!s.updated) continue;
    storyByDate.set(s.updated, (storyByDate.get(s.updated) ?? 0) + 1);
  }

  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const startOffset = firstDay.getUTCDay(); // 0 = Sun
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: DayCell[] = [];

  // Leading days from previous month
  const prev = shiftMonth(year, month, -1);
  const prevDays = new Date(Date.UTC(prev.year, prev.month, 0)).getUTCDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevDays - i;
    const iso = isoDate(prev.year, prev.month, d);
    cells.push({
      date: iso,
      inMonth: false,
      storyCount: storyByDate.get(iso) ?? 0,
      commitCount: commits.get(iso)?.length ?? 0,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoDate(year, month, d);
    cells.push({
      date: iso,
      inMonth: true,
      storyCount: storyByDate.get(iso) ?? 0,
      commitCount: commits.get(iso)?.length ?? 0,
    });
  }

  // Trailing days from next month to fill last week
  const next = shiftMonth(year, month, 1);
  let dNext = 1;
  while (cells.length % 7 !== 0) {
    const iso = isoDate(next.year, next.month, dNext);
    cells.push({
      date: iso,
      inMonth: false,
      storyCount: storyByDate.get(iso) ?? 0,
      commitCount: commits.get(iso)?.length ?? 0,
    });
    dNext++;
  }

  // Always render 6 rows for visual stability
  while (cells.length < 42) {
    const iso = isoDate(next.year, next.month, dNext);
    cells.push({
      date: iso,
      inMonth: false,
      storyCount: storyByDate.get(iso) ?? 0,
      commitCount: commits.get(iso)?.length ?? 0,
    });
    dNext++;
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return {
    year,
    month,
    label: `${MONTH_LABELS[month - 1]} ${year}`,
    weeks,
    prevMonth: prev,
    nextMonth: next,
  };
}

export interface ActivityWeek {
  weekStart: string; // YYYY-MM-DD (Sunday)
  days: { date: string; count: number }[];
}

const ACTIVITY_WEEKS = 26;

export function loadCommitActivity(weeks: number = ACTIVITY_WEEKS): ActivityWeek[] {
  const commits = loadDailyCommits();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  // Roll back to the most recent Saturday (end of current week).
  const dow = today.getUTCDay();
  const endOfWeek = new Date(today);
  endOfWeek.setUTCDate(today.getUTCDate() + (6 - dow));
  // Start = Sunday of N weeks ago.
  const start = new Date(endOfWeek);
  start.setUTCDate(endOfWeek.getUTCDate() - (weeks * 7 - 1));

  const result: ActivityWeek[] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const weekStartISO = cursor.toISOString().slice(0, 10);
    const days: ActivityWeek['days'] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      days.push({ date: iso, count: commits.get(iso)?.length ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    result.push({ weekStart: weekStartISO, days });
  }
  return result;
}

export function commitsForDay(date: string): CommitMeta[] {
  return loadDailyCommits().get(date) ?? [];
}
