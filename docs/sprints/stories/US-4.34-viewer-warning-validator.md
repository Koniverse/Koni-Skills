---
id: US-4.34
title: "Viewer `/project` Warning view — required-field validator (replace filter-only impl)"
epic: EPIC-4
status: ready
priority: P0
points: 3
sprint: sprint-2026-W22
prd_ref:
  - FR-19
arch_ref: []
depends_on:
  - US-4.7
assignee: saltict
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Replace the current "filter to `status ∈ {backlog, blocked}`" Warning
tab behaviour (US-4.20) with the actual validator from
[koni-erp-02 §4.8](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#48-warning-view).
Detect stories that have left `backlog` but are missing the required
frontmatter fields for their current status. Render them as a
dedicated table with `missing-fields` chips, sorted by missing-count
desc then status order. The view IGNORES the sprint filter so a
contributor can see all gaps at once.

## Background

The current Warning tab is a usability landmine: a user clicks
"Warning" expecting "tell me what's broken" and gets "rows where
status happens to be `blocked` or `backlog`". Those two states are
**not** broken — `backlog` is the default, `blocked` is a legitimate
workflow state with its own required-field bar.

The real signal — "this story claims `status: done` but has no
`commit` or `version_shipped`" — is invisible. This story flips the
behaviour to match the tab's label.

Required-field rules (from
[koni-erp-02 `pod-project-screen.md` §4.8](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#48-warning-view)
and our own [koni-docs SKILL.md](../../../skills/koni-docs/SKILL.md)
RULE catalog):

```
status ∈ {ready, in-progress, review, blocked, reverted, deprecated}
    → priority, points, sprint, assignee

status === "done"
    → priority, points, sprint, assignee, version_shipped, commit
```

A field is "missing" when undefined, null, or whitespace-only string.
`points: 0` is **present** (legit zero-point story). Empty arrays
count as missing for list-form fields (`prd_ref: []` is acceptable
since it's optional, but if it were required, `[]` would miss).

## Acceptance criteria

- [ ] **AC-1** — Warning tab no longer toggles a filter on top of
  the Table; clicking it swaps `#stories-view-container` to a
  dedicated `renderWarning(warnings)` output.
- [ ] **AC-2** — New module `viewer/lib/warnings.ts` exports
  `findStoryWarnings(stories): StoryWarning[]` implementing the
  required-field-by-status logic above. Returns one
  `{ id, title, epic, status, missing: string[] }` per offending
  story.
- [ ] **AC-3** — `isMissing(v)` predicate: `undefined`, `null`,
  whitespace-only string, OR `Array.isArray(v) && v.length === 0` →
  missing. `points: 0` → present (number type, value zero).
- [ ] **AC-4** — Rendered columns: `ID · Title · Epic · Status ·
  Missing fields`. Missing fields render as small red-tinted chips
  (one per field). Title links to `/docs/<slug>`.
- [ ] **AC-5** — Sort: missing-count desc → `STORY_STATUS_ORDER`
  rank asc → `id` asc. Stable.
- [ ] **AC-6** — Warning view IGNORES the sprint filter (global
  visibility, ERP §4.8). Search filter still applies (matches
  `id`/`title`/`epic`/`assignee` substrings).
- [ ] **AC-7** — Empty-state when `findStoryWarnings(stories)` is
  empty: render a single panel `✓ No warnings — all non-backlog
  stories have required fields.` instead of an empty table.
- [ ] **AC-8** — Legacy `?warn=1` URL param continues to work for one
  minor version: it routes to the new Warning view (handled by
  US-4.35's compat shim). No legacy behaviour preserved beyond
  routing.

## Tasks

- [ ] **TASK-4.34.1** — Create `viewer/lib/warnings.ts` with
  `findStoryWarnings` + `isMissing` helpers; unit tests covering
  all status branches + `points: 0` edge case. (AC: 2, 3)
- [ ] **TASK-4.34.2** — Add `renderWarning(warnings)` function in
  `project.astro` inline `<script>`. (AC: 1, 4, 7)
- [ ] **TASK-4.34.3** — Implement sort comparator
  `(a, b) => b.missing.length - a.missing.length || statusRank(a) -
  statusRank(b) || a.id.localeCompare(b.id)`. (AC: 5)
- [ ] **TASK-4.34.4** — Remove the existing `warnTab` click handler
  that toggles `filters.warnOnly`; replace with the standard tab
  dispatcher routing to `renderWarning`. (AC: 1)
- [ ] **TASK-4.34.5** — Decouple Warning view from sprint filter
  state (always reads `stories`, not `sprintFiltered`). (AC: 6)
- [ ] **TASK-4.34.6** — Smoke-test against this repo: induce a
  warning by stripping a required field from a fixture story; assert
  the row appears in Warning with correct chips; restore the field.
  (AC: 1-7)

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §View contracts / Warning view
- [koni-erp-02 `pod-project-screen.md` §4.8](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md)
- [US-4.7 — Lib checkboxes + Zod schemas](US-4.7-lib-checkboxes-schemas.md) — `storySchema` required-field source
- [US-4.20 — Viewer `/project` page](US-4.20-project-page.md) — the filter-only impl being replaced
- [US-4.25 — `koni-docs validate` subcommand](US-4.25-cli-validate.md) — overlapping coverage; Warning is the in-browser equivalent

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
