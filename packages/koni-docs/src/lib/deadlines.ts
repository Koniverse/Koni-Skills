import type { Corpus, MatterEntry } from './types.ts';
import { getStories } from './corpus.ts';

/**
 * Story deadlines — the `due` frontmatter field.
 *
 * A sprint is a *cadence*: it repeats, and `sprint.end` is where the week
 * stops, not a promise made to anyone. `due` is a *commitment*: a date imposed
 * from outside that rhythm (a contract, a customer demo, an audit window).
 *
 * Consequently a story with no `due` has NO deadline — there is deliberately no
 * fallback to `sprint.end`. Inheriting the sprint end would give every story an
 * implicit deadline and bury the two that actually matter under twenty rows of
 * noise. Deadlines stay rare so the warning keeps its weight.
 *
 * Nothing here is stored: state is derived from `due`, `status`, and today on
 * every run, so it cannot go stale.
 */

/** Stories in these states can no longer be late. */
const CLOSED_STATUSES = new Set(['done', 'deprecated']);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MS_PER_DAY = 86_400_000;

export type DeadlineState = 'overdue' | 'due-soon' | 'on-track';

export interface Deadline {
  /** Story id, e.g. "US-5.3". */
  id: string;
  title: string;
  /** Story file path. */
  path: string;
  /** The `due` value, normalized to `YYYY-MM-DD`. */
  due: string;
  /** Whole days from today to `due`. Negative = overdue. 0 = due today. */
  daysRemaining: number;
  state: DeadlineState;
  /** Story `status` frontmatter, carried through for display. */
  status: string;
  assignee: string;
}

export interface MalformedDue {
  /** Story id, e.g. "US-5.3". */
  id: string;
  /** Story file path. */
  source: string;
  /** The offending raw value, stringified. */
  due: string;
  reason: 'not_a_date' | 'impossible_date';
}

/**
 * Normalize a raw `due` frontmatter value to `YYYY-MM-DD`.
 *
 * js-yaml (via gray-matter) parses an unquoted `2026-07-20` into a JS `Date`,
 * not a string — and re-serializes it as a full ISO timestamp. Both forms
 * therefore occur in real corpora, so both are accepted here.
 *
 * Returns null when the value is absent or empty (no deadline), and throws
 * nothing — malformed values are reported by `findMalformedDue`.
 */
export function normalizeDue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  // Tolerate a full ISO timestamp that was round-tripped back into a string.
  const datePart = trimmed.slice(0, 10);
  return ISO_DATE.test(datePart) ? datePart : null;
}

/**
 * True when `value` is a `YYYY-MM-DD` string naming a date that exists.
 * `2026-02-31` matches the shape and is still not a day.
 */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Midnight-UTC epoch of a `YYYY-MM-DD` string. Assumes `isValidIsoDate`. */
function toUtcDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

/**
 * Whole days between two dates, both floored to UTC midnight first, so a run at
 * 23:59 and a run at 00:01 the same day agree on the answer.
 */
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toUtcDay(toIso) - toUtcDay(fromIso)) / MS_PER_DAY);
}

/** `today` as `YYYY-MM-DD` in UTC — the frame every comparison here uses. */
function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fieldString(entry: MatterEntry, key: string): string {
  const v = entry.frontmatter[key];
  return typeof v === 'string' ? v : '';
}

/**
 * Every story carrying a usable `due`, classified against `today` and still
 * open. Closed stories (`done` / `deprecated`) are excluded outright: a shipped
 * story cannot be late.
 *
 * Sorted overdue-first (most overdue at the top), then due-soon, then on-track
 * — the order a reader wants them in. Stories whose `due` is malformed are
 * skipped here and reported by `findMalformedDue` instead.
 *
 * @param today   injected rather than read from the clock, so callers (and
 *                tests) control the frame of reference.
 * @param dueSoonDays  a deadline within this many days of today is `due-soon`.
 */
export function getDeadlines(corpus: Corpus, today: Date, dueSoonDays: number): Deadline[] {
  const todayIso = toIsoDay(today);
  const out: Deadline[] = [];

  for (const story of getStories(corpus)) {
    const status = fieldString(story, 'status');
    if (CLOSED_STATUSES.has(status)) continue;

    const due = normalizeDue(story.frontmatter.due);
    if (due === null || !isValidIsoDate(due)) continue;

    const daysRemaining = daysBetween(todayIso, due);
    const state: DeadlineState =
      daysRemaining < 0 ? 'overdue'
        : daysRemaining <= dueSoonDays ? 'due-soon'
          : 'on-track';

    out.push({
      id: fieldString(story, 'id'),
      title: fieldString(story, 'title'),
      path: story.path,
      due,
      daysRemaining,
      state,
      status,
      assignee: fieldString(story, 'assignee'),
    });
  }

  // Ascending by daysRemaining puts the most overdue first and the furthest-out
  // last, which is exactly overdue → due-soon → on-track. Ties break by id so
  // the output is stable across runs.
  out.sort((a, b) => a.daysRemaining - b.daysRemaining || a.id.localeCompare(b.id));
  return out;
}

/**
 * Stories whose `due` is present but unusable — prose ("end of July"), a
 * non-date string, or a date that does not exist (`2026-02-31`). These are
 * schema violations, not scheduling news: `validate` treats them as errors,
 * whereas a merely-overdue story is a warning.
 *
 * Closed stories are checked too — a malformed value is malformed whether or
 * not the story shipped.
 *
 * Known limit: an *unquoted* impossible date never reaches this function. YAML
 * parses `due: 2026-02-31` as a timestamp and silently rolls it over to
 * 2026-03-03, so the original typo is destroyed a layer below us. Only the
 * quoted form (`due: "2026-02-31"`) survives as a string and gets caught here.
 */
export function findMalformedDue(corpus: Corpus): MalformedDue[] {
  const out: MalformedDue[] = [];
  for (const story of getStories(corpus)) {
    const raw = story.frontmatter.due;
    if (raw === null || raw === undefined) continue;
    if (typeof raw === 'string' && raw.trim().length === 0) continue;

    const id = fieldString(story, 'id');
    const normalized = normalizeDue(raw);
    if (normalized === null) {
      out.push({ id, source: story.path, due: String(raw), reason: 'not_a_date' });
    } else if (!isValidIsoDate(normalized)) {
      out.push({ id, source: story.path, due: String(raw), reason: 'impossible_date' });
    }
  }
  return out;
}
