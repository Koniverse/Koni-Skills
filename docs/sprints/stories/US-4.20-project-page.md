---
id: US-4.20
title: "Viewer /project page — User Stories Tracker port"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W26
version_shipped: "0.7.0"
assignee: saltict
commit: pending
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Restore the `/project` route in the koni-docs Astro viewer. The sidebar link
to "Project Stories" (`Layout.astro` line 126) was a dead 404 since v0.6.0;
this story ports the 366-line tracker page from Koni-Finance-Final's
`apps/docs/src/pages/project.astro` and wires it to the viewer's
`loadDashboardData()` accessor.

## Acceptance criteria

- [x] **AC-1** — **Given** a running `koni-docs preview`, **When** the user
  navigates to `/project`, **Then** the page returns HTTP 200 and renders a
  Stories tracker table with filter / search / group-by controls.
- [x] **AC-2** — **Given** the `commit` field in story frontmatter, **When**
  the row renders, **Then** the SHA is shown as plain text (font-mono span,
  truncated to 7 chars) — NOT as an outbound link.
- [x] **AC-3** — **Given** the dashboard at `/` already works, **When**
  Pillar F lands, **Then** the dashboard route still returns HTTP 200
  (no regression).

## Tasks

- [x] **TASK-4.20.1** — Port `project.astro` from Koni-Finance-Final (commit defaa92) (AC: 1)
- [x] **TASK-4.20.2** — Adapt commit cell to plain-text mono span (AC: 2)
- [x] **TASK-4.20.3** — Smoke-test against this repo's docs corpus (AC: 1, 3)

## References

- [Pillar F plan Task 6](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Source: Koni-Finance-Final project.astro](https://github.com/Koniverse/Koni-Finance-Final/blob/main/apps/docs/src/pages/project.astro)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
