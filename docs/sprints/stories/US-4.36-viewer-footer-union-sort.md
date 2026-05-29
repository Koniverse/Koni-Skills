---
id: US-4.36
title: "Viewer `/project` footer metadata + UNION-semantics epic buckets + default sort"
epic: EPIC-4
status: ready
priority: P1
points: 2
sprint: sprint-2026-W22
prd_ref:
  - FR-19
arch_ref: []
depends_on: []
assignee: saltict
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Three small parity items shared across all views in Pillar G:

1. **Footer**: a one-line metadata strip below the view container
   showing `N of M stories · K epics · S file(s) skipped · Updated
   <relative>` per [koni-erp-02 §5](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#5-footer--metadata).
2. **UNION-semantics epic buckets**: when grouping by epic, seed the
   bucket map with `loadDashboardData().epics` so an empty
   `EPIC-N.md` (no stories yet) still renders as a group header.
3. **Default sort**: `compareStories` ordering (status → priority →
   updated) applied to Table, Board (within column), and each group
   bucket. Today the Table sorts by filesystem-discovery order; the
   resulting layout is meaningless to a human reviewer.

## Background

[Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md)
§Default sort and §Group-by buckets cover the contract. These three
items are deliberately bundled into one story because they are each
< 1 point and they all touch the same render functions — separating
them would add coordination overhead without value.

UNION semantics matter the moment a contributor adds `EPIC-5.md`
with no stories yet: today the epic vanishes from the Board / Table
group-by view. With UNION seeding it renders as an empty group
header, signalling "this epic exists, plan stories into it".

## Acceptance criteria

- [ ] **AC-1** — A `<footer>` element renders below
  `#stories-view-container` on `/project`, showing
  `N of M stories · K epics · S file(s) skipped · Updated <relative>`.
  When no filter is active, `N` equals `M`. The relative time updates
  on view switch (re-read from `loadDashboardData().meta`).
- [ ] **AC-2** — Implement `compareStories(a, b)` shared helper:
  - 1st key: `STORY_STATUS_ORDER` rank asc
  - 2nd key: priority rank asc (P0 → P3 → missing)
  - 3rd key: `updated` desc (newest first, missing last)
  - 4th key: `id` asc (stable tie-break)
- [ ] **AC-3** — Table view applies `compareStories` to its filtered
  list. Board view applies it within each column. Group-by buckets
  apply it inside each bucket's content.
- [ ] **AC-4** — When `groupBy === 'epic'`, the bucket map is
  initialised from `loadDashboardData().epics.map(e => e.id)` BEFORE
  stories are distributed. Epics with zero stories render as group
  headers with `0 stories · 0 pts · 0/0 done` and an empty body
  (collapsible like any other bucket).
- [ ] **AC-5** — `(no epic)` / `(no sprint)` / `(unassigned)` /
  `(unshipped)` placeholder buckets still sort last regardless of
  alphabetical position.
- [ ] **AC-6** — Skipped-files count surfaced in the footer comes
  from the same `meta.skipped` field that
  `loadDashboardData()` already populates (no new parser changes
  needed).
- [ ] **AC-7** — No regression on existing Table view: search,
  filter, group-by, URL state all continue to work.

## Tasks

- [ ] **TASK-4.36.1** — Add `<footer>` partial at the bottom of
  `/project` rendering the four metadata pills. Use a thin
  `formatRelativeTime(date)` helper inline. (AC: 1, 6)
- [ ] **TASK-4.36.2** — Implement `compareStories(a, b)` as a shared
  helper in `project.astro` (or `viewer/lib/sort.ts` if extracted).
  (AC: 2)
- [ ] **TASK-4.36.3** — Apply `compareStories` to the Table render
  fn input + each group bucket's content array. (AC: 3, 7)
- [ ] **TASK-4.36.4** — Update `renderGrouped` (or its successor) to
  seed `groups` from `loadDashboardData().epics` when `groupBy ===
  'epic'`. (AC: 4)
- [ ] **TASK-4.36.5** — Confirm placeholder-last sort still holds
  after UNION seeding (an empty `(no epic)` bucket sorted last is
  the expected behaviour). (AC: 5)
- [ ] **TASK-4.36.6** — Smoke-test against this repo: add a temp
  `EPIC-9.md` with no stories, group by epic, confirm it appears as
  an empty group header. Remove the temp file. (AC: 4)

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §Default sort + §Group-by buckets + §Footer
- [koni-erp-02 `pod-project-screen.md` §4.2 default sort + §4.3 UNION + §5 footer](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md)
- [US-4.31 — Board view](US-4.31-viewer-board-view.md) — consumes `compareStories` within columns
- [US-4.20 — Viewer `/project` page](US-4.20-project-page.md) — the renderer being patched

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
