---
id: US-4.31
title: "Viewer `/project` Board view — 6-column kanban + group-by"
epic: EPIC-4
status: ready
priority: P0
points: 3
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

Wire the Board tab on `/project` so it no longer reads "Coming soon".
Render a 6-column kanban (`backlog` → `done`, excluding `reverted`
and `deprecated`) populated from the same in-memory `stories[]` the
Table view consumes. When the user picks a `group` other than `none`,
render N stacked kanbans — one per bucket — each with the same
collapsible header pattern Table already uses. Same sprint filter,
same search filter, same default sort as Table.

## Background

[Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md)
defines the Board contract by reference to
[koni-erp-02 §4.5](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#45-board-view).
US-4.20 (v0.7.0) declared the tab in the toolbar but left it disabled.
The disabled tab is a UX paper cut — labelled affordance, no action.

The Board is also where group-by becomes load-bearing for visual
planning: stacked kanbans by epic let a contributor see "how many P0
done in EPIC-4 vs EPIC-3" at a glance — something the Table cannot
show without scrolling.

## Acceptance criteria

- [ ] **AC-1** — **Given** a running `koni-docs preview`, **When** the
  user clicks the Board tab, **Then** the tab loses its `disabled` /
  "Coming soon" state and the view container swaps from Table to
  Board within one frame.
- [ ] **AC-2** — Six columns render in this order with header
  `<label> · <count>`: `Backlog`, `Ready`, `In progress`, `Review`,
  `Blocked`, `Done`. Stories with `status: reverted` or `deprecated`
  do not appear on the Board (they remain in Table).
- [ ] **AC-3** — Card content reads directly from frontmatter and
  shows: title (linked to `/docs/<slug>`), priority chip (only if
  set), epic, sprint, assignee, commit short-SHA (each only when the
  field is present). Missing fields render nothing — no `—`
  placeholder.
- [ ] **AC-4** — Within a column, cards sort by `compareStories`
  (priority asc, then `updated` desc). When two stories share both,
  fall back to `id` asc for stable order.
- [ ] **AC-5** — **Given** `group=epic|sprint|assignee|shipped`,
  **When** the Board renders, **Then** N stacked 6-column kanbans
  appear — one per bucket — each with a collapsible header matching
  the Table group-header style (`<label>: <key>` left, `N stories ·
  P pts · D/N done` right). Placeholder buckets (`(no epic)`,
  `(unassigned)`, etc.) sort last.
- [ ] **AC-6** — Sprint filter and search filter both apply to Board
  (same `tableBoardStories` semantics as Table). An empty column
  renders an "—" placeholder centred in the column body so the column
  outline doesn't collapse to zero width.
- [ ] **AC-7** — Switching back to Table preserves filter / group /
  search state without re-running the data fetch.

## Tasks

- [ ] **TASK-4.31.1** — Rename `#stories-table-wrapper` to
  `#stories-view-container` and update existing Table renderer to
  target it. (AC: 1)
- [ ] **TASK-4.31.2** — Add `renderBoard(list, groupBy)` function in
  the inline `<script>` of `project.astro`. (AC: 2, 3, 6)
- [ ] **TASK-4.31.3** — Implement `compareStories(a, b)` helper
  (shared with US-4.36); apply inside each Board column. (AC: 4)
- [ ] **TASK-4.31.4** — Extend the tab-click dispatcher: when
  `view === 'board'`, route to `renderBoard`; remove the `disabled`
  attribute + "Coming soon" title from the Board tab button. (AC: 1)
- [ ] **TASK-4.31.5** — Reuse the existing `wireAccordion()` for
  collapsible stacked-kanban headers when `group !== 'none'`. (AC: 5)
- [ ] **TASK-4.31.6** — Smoke-test via `npm run docs:preview` against
  this repo's corpus (≥36 stories across EPIC-1/2/3/4) and confirm:
  Backlog column non-empty for EPIC-3, Done column heavy for EPIC-4,
  Blocked column shows zero (or current real count). (AC: 1-6)

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §View contracts / Board view
- [koni-erp-02 `pod-project-screen.md` §4.5](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md) — board semantics of record
- [US-4.20 — Viewer `/project` page (Table view)](US-4.20-project-page.md) — predecessor
- [`packages/koni-docs/src/viewer/pages/project.astro`](../../../packages/koni-docs/src/viewer/pages/project.astro) — page being extended

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
