---
id: US-4.35
title: "Viewer `/project` `?view=` URL param + legacy `?warn=1` compat shim"
epic: EPIC-4
status: done
priority: P1
points: 1
sprint: sprint-2026-W22
version_shipped: "0.8.0"
prd_ref:
  - FR-19
arch_ref: []
depends_on: []
assignee: saltict
commit: a213df9
created: 2026-05-28
updated: 2026-05-29
---

## Goal

Persist the active `/project` view tab across reloads and deep-link
shares via `?view=table|board|calendar|analysis|warning`. Today only
`?warn=1` is persisted (and only as a filter, not a view). Add the
proper `?view=` param, keep `?warn=1` working for one minor version
by silently redirecting to `?view=warning` on `astro:page-load`.

## Background

[Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md)
§URL state lists the full URL contract. This story owns the
`?view=` portion. The other params (`search`, `sprint`, `group`)
already round-trip via `readUrlParams` / `writeUrlParams` in
`project.astro`.

Sharing a deep link like
`/project?view=analysis&sprint=sprint-2026-W22` becomes the canonical
way to point a reviewer at "the EPIC-4 close-out dashboard" without
walking them through three clicks.

## Acceptance criteria

- [x] **AC-1** — `?view=` accepts values `table` (default), `board`,
  `calendar`, `analysis`, `warning`. Unknown values fall back to
  `table` (no crash, no console error).
- [x] **AC-2** — On `astro:page-load`, `readUrlParams` reads `?view=`
  and activates the matching tab (sets `data-active="true"` on the
  tab button, swaps view container).
- [x] **AC-3** — Clicking a tab calls `writeUrlParams` with the new
  view; the URL updates via `history.replaceState` (no navigation
  event, no scroll jump).
- [x] **AC-4** — Legacy `?warn=1` is recognised on load; the shim
  silently rewrites the URL to `?view=warning` (via
  `replaceState`) and activates the Warning tab. Both forms work
  for one minor version (v0.8.x); v0.9.0 may drop the shim.
- [x] **AC-5** — All other URL params (`search`, `sprint`, `group`,
  `month`) are preserved unchanged when `?view=` is added / removed.
- [x] **AC-6** — Removing `?view=` from the URL (e.g. clearing the
  param manually) activates the default Table tab on next load.

## Tasks

- [x] **TASK-4.35.1** — Extend `readUrlParams()` to parse `?view=`
  and store in component state. (AC: 1, 2)
- [x] **TASK-4.35.2** — Extend `writeUrlParams()` to write `?view=`
  (omit when `view === 'table'` to keep URLs short by default).
  (AC: 3, 5)
- [x] **TASK-4.35.3** — Update tab-button click handlers to call
  `writeUrlParams` then re-render the active view. (AC: 3)
- [x] **TASK-4.35.4** — Add the `?warn=1` → `?view=warning` compat
  shim in `readUrlParams` (translate, then drop the legacy param via
  `replaceState`). (AC: 4)
- [x] **TASK-4.35.5** — Smoke-test: open
  `/project?view=board&group=epic`, reload — Board view by epic
  persists. Open `/project?warn=1`, observe URL silently becomes
  `/project?view=warning`. Open `/project?view=banana`, observe
  fallback to Table.

## References

- [Pillar G design spec](../../superpowers/specs/2026-05-28-project-page-multi-view-design.md) — §URL state
- [koni-erp-02 `pod-project-screen.md` §3](https://github.com/Koniverse/koni-erp-02/blob/main/Docs/pod-project-screen.md#3-url-state-model) — URL state model
- [US-4.20 — Viewer `/project` page](US-4.20-project-page.md) — current `?warn=1` impl

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.8.0 (pending)](../../CHANGELOG.md)
