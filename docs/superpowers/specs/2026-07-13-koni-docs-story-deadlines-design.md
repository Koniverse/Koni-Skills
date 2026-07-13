# Story deadlines — a `due` date beside the sprint cadence

**Date**: 2026-07-13
**Status**: approved
**Story**: US-1.6
**Ships**: FR-38, koni-docs CLI 0.9.0, repo 0.39.0

## Problem

Time exists in koni-docs in exactly two places today, and neither expresses a
commitment:

- `sprint.start` / `sprint.end` — the boundaries of a weekly rhythm.
- `story.created` / `story.updated` — bookkeeping, written after the fact.

Nothing records *"this must be finished by the 20th because the customer demo
is on the 21st."* Work that carries a real external date is invisible to every
tool in the framework: `STATUS.md` shows it as an ordinary in-progress row,
`validate` says nothing, and the deadline lives only in someone's head or in a
Slack thread.

## Conceptual model

Sprint and deadline are different things, and the whole design follows from
keeping them apart.

- **Sprint = cadence.** It repeats. `sprint.end` is where the week stops, not a
  promise made to anyone.
- **`due` = commitment.** A specific date imposed from *outside* the sprint
  rhythm: a contract date, a customer demo, an audit window, a legal deadline.

The rule this produces: **set `due` only when the date does not coincide with
the sprint rhythm.** A story that merely needs to land "this sprint" already
says so via `sprint:`. Leave `due` empty.

### Why there is no inheritance

An earlier option had an empty `due` fall back to `sprint.end`, so every story
would carry an implicit deadline. Rejected. Inheritance drags every story in
the sprint into the deadline view, and the two dates that actually matter get
buried under twenty rows of noise. Real deadlines have to stay rare for the
warning to keep any weight. A story with no `due` has no deadline — full stop.

## Frontmatter

One new optional field on the story schema:

| Field | Type | Required? | Pattern | Notes |
|---|---|---|---|---|
| `due` | scalar string | optional | `^\d{4}-\d{2}-\d{2}$` or `''` | Hard deadline imposed from outside the sprint cadence. Empty = no deadline of its own. |

The date must also be a *real* calendar date: `2026-02-31` matches the regex
and is still an error.

`frontmatter-spec.md`'s Iron Law currently governs ID-typed fields only. It
gains a parallel clause for date-typed fields — `due: end of July` and
`due: 2026-07-20 (pending customer confirmation)` are exactly the same class of
bug as `prd_ref: FR-94 (shared with EPIC-5)`. The *reason* for the deadline —
who imposed it, what happens if it slips — goes in the story body under a
`## Deadline` heading, never in the frontmatter value.

## Derived state — computed, never stored

`due` is the only thing an author writes. Everything else is derived at run
time from `due`, `status`, and today's date, so it can never go stale:

| State | Condition |
|---|---|
| `overdue` | `due < today` and status not in `{done, deprecated}` |
| `due-soon` | `today <= due <= today + N` (N default 3) and status not in `{done, deprecated}` |
| `on-track` | `due > today + N` and status not in `{done, deprecated}` |
| — (excluded) | status is `done` or `deprecated`; a shipped story cannot be late |

The `due-soon` threshold N is a `--due-soon-days <n>` flag on `koni-docs status`,
default 3. It is deliberately **not** a `CLAUDE.md` config key: `wip_limit` is
already documented as configurable while `status.ts` hardcodes `> 3`, and the
framework does not need a second config promise it doesn't keep.

## CLI changes (`packages/koni-docs`)

**`lib/deadlines.ts`** (new) — pure, no I/O, unit-testable:

```ts
export type DeadlineState = 'overdue' | 'due-soon' | 'on-track';
export interface Deadline {
  id: string; title: string; path: string;
  due: string;            // ISO date as authored
  daysRemaining: number;  // negative = overdue
  state: DeadlineState;
  status: string; assignee: string;
}
export function isValidIsoDate(v: string): boolean;
export function getDeadlines(corpus: Corpus, today: Date, dueSoonDays: number): Deadline[];
export function findMalformedDue(corpus: Corpus): Array<{ id: string; source: string; due: string }>;
```

`getDeadlines` returns overdue first (most overdue at the top), then due-soon,
then on-track — the order you want to read them in.

**`lib/schemas/story.ts`** — add `due` to `storySchema` and `''` to
`STORY_DEFAULTS`, so `backfill-fields` writes the empty field on existing
stories rather than leaving it absent.

**`cli/status.ts`** — a `## ⏰ Deadlines` section, placed directly after the
header and *above* the kanban columns; it is the first thing worth seeing.

```
## ⏰ Deadlines (3)

| ID | Title | Due | Days | State | Assignee |
|---|---|---|---|---|---|
| US-5.3 | Audit export | 2026-07-10 | -3 | 🔴 overdue | saltict |
| US-6.1 | Demo dashboard | 2026-07-15 | +2 | 🟠 due-soon | jindo9986 |
| US-4.9 | Contract sync | 2026-08-01 | +19 | 🟢 on-track | saltict |
```

With no dated stories the section renders `_No stories carry an explicit
deadline._` — present but quiet, so nobody wonders whether the feature ran. The
Summary block gains one line: `⚠️ Deadlines: 1 overdue · 1 due within 3 days`,
or `✓ No overdue stories.`

**`cli/validate.ts`** — a `validateDueDates` pass with two distinct severities,
which is the crux of the enforcement level chosen:

- A malformed or impossible `due` is an **error**. It exits non-zero. This is a
  schema violation, no different from a bad `prd_ref`.
- An overdue open story is a **warning**. It prints, and it does **not** touch
  the exit code. Deadlines inform; they do not block the commit gate.

## Honesty discipline

Moving a `due` must leave a trace. Editing `due` from `2026-07-10` to
`2026-07-24` in silence erases the fact that the story missed its date once,
and `STATUS.md` will then cheerfully report it as on-track. So: **every change
to an existing `due` requires a `CONTEXT.md` entry** recording old date → new
date → why.

This is the same principle the repo already settled on for sprints ("sprint by
ship date, correct forward" — CONTEXT D32, LESSONS §12), applied to a new field
before it has a chance to grow its own dishonesty.

## Skill-doc changes (`skills/koni-docs`)

| File | Change |
|---|---|
| `references/frontmatter-spec.md` | `due` row in §3.1; date-typed clause added to the Iron Law (§2); a `due` anti-pattern in §5 |
| `references/templates/story.md` | `due:` in the frontmatter skeleton; guidance bullet in §3 §1 Frontmatter; a `## Deadline` body section |
| `references/sprint-system.md` | New "Deadlines vs sprint cadence" section — the model, the sparse-use rule, the move-requires-CONTEXT rule; pre-commit checklist line |
| `SKILL.md` | `due` named in the story-creation trigger and the status workflow |

## Testing

- `__tests__/lib/deadlines.test.ts` — state classification at the boundaries
  (due today, due exactly at N, one day past N), `done`/`deprecated` exclusion,
  malformed and impossible dates, sort order.
- `__tests__/cli/status.test.ts` — Deadlines section renders, is placed above
  the kanban, is quiet when empty, and respects `--due-soon-days`.
- `__tests__/cli/validate.test.ts` — malformed `due` exits 1; overdue-only exits 0
  while still printing the warning.

Tests inject `today` explicitly rather than reading the clock, so they do not
rot.

## Out of scope

- Deadlines on epics or sprints. Story-level only.
- `due_type` (hard/soft) and `due_source`. One field, no taxonomy, until the
  single field proves insufficient in practice.
- Blocking any gate on an overdue story.
- Viewer (Astro) rendering of deadlines — a follow-up once the field carries
  real data.
