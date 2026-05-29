---
id: US-4.32
title: "Viewer `/project` Calendar view — month grid + commits-per-day overlay"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W22
version_shipped: "0.8.0"
prd_ref:
  - FR-19
arch_ref: []
depends_on:
  - US-4.9
assignee: saltict
commit: a213df9
created: 2026-05-28
updated: 2026-05-29
---

## Goal

Render the Calendar tab on `/project` as a month grid that lays out
stories on their `updated` date and overlays a commits-per-day count
sourced from local `git log`. Clicking a day expands an inline list
of that day's stories (`[US-X.Y] title`) and commits (`<sha7>
<subject>`). Prev/next month navigation; defaults to today. Same
sprint + search filter as Table/Board for stories; commits are
unfiltered by design (they are not per-story).

## Background

[Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md)
maps this to [koni-erp-02 §4.6](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#46-calendar-view).
ERP's Calendar joins `github_commits` from Supabase; the koni-docs
viewer reads from local git via the `lib/git` utilities shipped in
US-4.9 — same shape, different source. No DB, no network.

This view is the answer to "when did EPIC-4 actually ship?" — the
density of dots on `2026-05-25 → 2026-05-28` makes the W22 single-
session push visually obvious, in a way the Table cannot show.

## Acceptance criteria

- [x] **AC-1** — Calendar tab on `/project` loses its `disabled` /
  "Coming soon" state. Clicking it renders a month grid (7 cols ×
  6 rows max) for the current month with a `< Month YYYY >` header
  and prev/next buttons.
- [x] **AC-2** — Each day cell shows two counters: stories updated
  that day (filtered by sprint + search) and commits authored that
  day (unfiltered). Counters render as small chips when > 0; the cell
  body is empty when both are 0.
- [x] **AC-3** — Clicking a day cell expands an inline panel below
  the grid listing the day's stories as `[US-X.Y] <title>` links to
  `/docs/<slug>` and commits as `<sha7> <subject>` (subject truncated
  to ~80 chars). Clicking the same day again collapses the panel.
- [x] **AC-4** — Prev/next month buttons navigate by one month
  without page reload; the chosen month persists via `?month=YYYY-MM`
  URL param (default = today).
- [x] **AC-5** — Commits source: new `loadDailyCommits()` helper in
  `viewer/lib/calendar.ts` reads via the `lib/git` utilities from
  US-4.9 (no shell, no extra deps) and returns
  `Map<dateISO, CommitMeta[]>`. Cached at module-init for the
  process lifetime; live-reload (US-4.21) invalidates by restart.
- [x] **AC-6** — Schema-graceful: when there are zero stories AND
  zero commits for a month, render an empty-state row `<No activity
  this month>`. When there are zero stories AND zero commits across
  the entire corpus, the Calendar tab still renders the grid (just
  empty) — no error, no white screen.
- [x] **AC-7** — Sprint filter and search filter apply to plotted
  stories. Switching sprint redraws the visible chips without
  changing the month or losing the expanded-day state.

## Tasks

- [x] **TASK-4.32.1** — Create `viewer/lib/calendar.ts` exporting
  `loadDailyCommits()` + `buildMonthGrid(year, month, stories,
  commits)` returning typed `MonthGrid` shape. (AC: 5)
- [x] **TASK-4.32.2** — Add `renderCalendar(month)` function inside
  `project.astro` inline `<script>`; replace placeholder div with the
  month grid. (AC: 1, 2, 6)
- [x] **TASK-4.32.3** — Implement day-click expand/collapse panel
  with stable `data-date="YYYY-MM-DD"` keys. (AC: 3)
- [x] **TASK-4.32.4** — Wire prev/next month buttons + `?month=`
  URL param read/write. (AC: 4)
- [x] **TASK-4.32.5** — Remove `disabled` + "Coming soon" from the
  Calendar tab button; extend dispatcher to route `view === 'calendar'`
  → `renderCalendar`. (AC: 1)
- [x] **TASK-4.32.6** — Apply sprint + search filter to the stories
  feeding `buildMonthGrid`. (AC: 7)
- [x] **TASK-4.32.7** — Smoke-test against this repo's corpus
  (W22 commit-dense window 2026-05-25 → 2026-05-28 should show the
  daily commit chip cluster; W21 should show a smaller cluster).
  (AC: 1-6)

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §View contracts / Calendar view
- [koni-erp-02 `pod-project-screen.md` §4.6](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md)
- [US-4.9 — Lib changelog + git utilities](US-4.9-lib-changelog-git.md) — git surface reused here
- [US-4.21 — `--watch` live-reload](US-4.21-live-reload.md) — module-cache invalidation by restart

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
