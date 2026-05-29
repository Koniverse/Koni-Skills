---
id: US-4.33
title: "Viewer `/project` Analysis view — KPIs, status breakdown, commit heatmap, epic progress"
epic: EPIC-4
status: ready
priority: P0
points: 5
sprint: sprint-2026-W22
prd_ref:
  - FR-19
arch_ref: []
depends_on:
  - US-4.9
  - US-4.32
assignee: saltict
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Replace the disabled Analysis tab with a five-panel dashboard:
(1) hero KPI cards, (2) status breakdown, (3) stories completed in
the last 30 days, (4) 26-week commit-activity heatmap, (5) per-epic
progress with UNION semantics (parsed `EPIC-N.md` ids seed the list
so empty epics still appear). All panels derive from
`loadDashboardData()` + the new `loadCommitActivity()` helper. No
network, no live charts library — inline SVG / divs only.

## Background

[Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md)
maps this to [koni-erp-02 §4.7](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#47-analysis-view).
We adopt ERP's panel set verbatim except for the per-assignee
"people stats" panel (deferred — see Non-goals).

Analysis is intentionally **search-unaffected** (ERP §4.1) so that
panel numbers stay stable while a user types in the search box for
Table or Board. Sprint filter still applies (a user filtering to
"this sprint only" wants the dashboard scoped accordingly).

## Acceptance criteria

- [ ] **AC-1** — Analysis tab on `/project` loses its `disabled` /
  "Coming soon" state. Clicking it renders the five panels below in
  a responsive grid (1-col on narrow viewports, 2-col on ≥ 1024px).
- [ ] **AC-2** — Hero KPIs row shows five cards: **Start Date**
  (earliest sprint `start`), **Days Elapsed** (today − start),
  **Stories** (`N / M done`), **Completion** (percentage + filled
  progress bar), **Warnings** (count from `findStoryWarnings`,
  clicking opens `?view=warning`).
- [ ] **AC-3** — Status breakdown card lists each `STORY_STATUS_ORDER`
  status with a horizontal bar whose width is proportional to count,
  count rendered as right-aligned label. Statuses with zero stories
  still render (length-zero bar) — same UNION rationale as epic
  progress.
- [ ] **AC-4** — Stories-completed-last-30-days bar chart: one bar
  per day for the trailing 30 days, height proportional to stories
  flipped to `status: done` on that day (proxy: `updated` field).
  X-axis labels every fifth day; empty days render a 0-height bar
  stub for visual continuity.
- [ ] **AC-5** — 26-week commit-activity heatmap: rows = Sun-Sat,
  cols = week, intensity bucketed into 5 levels (none /  q1 / q2 /
  q3 / q4). Source: new `loadCommitActivity()` helper in
  `viewer/lib/calendar.ts` (or reuse `loadDailyCommits()` and
  bucket here). Hover tooltip per cell shows `<count> commits on
  <YYYY-MM-DD>`.
- [ ] **AC-6** — Epic progress card lists every epic from
  `loadDashboardData().epics` (UNION with `parseStories.epic` values
  — see US-4.36 implementation). Each row: ID, title, status badge,
  `done/total` count, progress bar. Sort: epic id ascending. Empty
  epics (zero stories) still render with `0/0` and an empty progress
  bar — they're real, the renderer must surface them.
- [ ] **AC-7** — Sprint filter applies; search filter does NOT
  (ERP §4.1 invariant). When sprint = `all`, panels reflect the full
  corpus.
- [ ] **AC-8** — Schema-graceful: when there are zero stories,
  zero sprints, or zero commits, each panel renders a polite empty-
  state (`< no <thing> recorded >`) instead of crashing.

## Tasks

- [ ] **TASK-4.33.1** — Create `viewer/lib/analysis.ts` exporting
  `buildAnalysisStats({stories, epics, sprints, commits})` returning a
  typed `AnalysisStats` shape covering all five panels. (AC: 2-6)
- [ ] **TASK-4.33.2** — Add `loadCommitActivity()` in
  `viewer/lib/calendar.ts` (reuse `loadDailyCommits()` from US-4.32
  if landed first; otherwise stand-alone using `lib/git`). (AC: 5)
- [ ] **TASK-4.33.3** — Implement `renderAnalysis(stats)` inside
  `project.astro` inline `<script>`; emit one section per panel with
  inline SVG / divs. No charting library. (AC: 1-6)
- [ ] **TASK-4.33.4** — Wire the Warnings KPI link to navigate to
  `?view=warning` (depends on US-4.35 if landed; else fall back to
  legacy `?warn=1`). (AC: 2)
- [ ] **TASK-4.33.5** — Remove `disabled` + "Coming soon" from the
  Analysis tab; extend dispatcher for `view === 'analysis'`. (AC: 1)
- [ ] **TASK-4.33.6** — Implement search-unaffected behaviour by
  passing `sprintFiltered` (not `tableBoardStories`) to
  `buildAnalysisStats`. (AC: 7)
- [ ] **TASK-4.33.7** — Empty-state handling per panel. (AC: 8)
- [ ] **TASK-4.33.8** — Smoke-test against this repo's corpus:
  Completion ≥ 80% expected (most EPIC-4 done); commit heatmap
  visible cluster in W22 column; Epic progress shows EPIC-3 with
  `0/1 done` (only US-3.1, backlog). (AC: 1-7)

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §View contracts / Analysis view
- [koni-erp-02 `pod-project-screen.md` §4.7](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md)
- [US-4.9 — Lib changelog + git utilities](US-4.9-lib-changelog-git.md)
- [US-4.32 — Calendar view](US-4.32-viewer-calendar-view.md) — shared `loadDailyCommits` source

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
