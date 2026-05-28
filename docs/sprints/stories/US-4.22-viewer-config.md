---
id: US-4.22
title: "koni-docs.config.{json,mjs} viewer config loader"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: "0.7.0"
assignee: saltict
commit: b40d75e
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Add optional `koni-docs.config.{json,mjs}` at the docs-tree root with
zod-validated shape `{ title?: string; folderOrder?: string[];
topLevelOrder?: string[] }`. Overrides the hardcoded `TOP_LEVEL_ORDER` /
`FOLDER_ORDER` constants in `viewer/lib/corpus.ts` and the page `<title>`.
Missing file falls back to current defaults — opt-in only.

## Acceptance criteria

- [x] **AC-1** — **Given** no config file present, **When** the viewer
  loads, **Then** behaviour is identical to v0.6.x (hardcoded defaults).
- [x] **AC-2** — **Given** a valid `koni-docs.config.json`, **When** the
  viewer loads, **Then** `title`, `folderOrder`, and `topLevelOrder` are
  applied to the dashboard.
- [x] **AC-3** — **Given** a malformed config (zod fails), **When** the
  viewer loads, **Then** the loader logs a clear error and falls back to
  defaults — no crash.

## Tasks

- [x] **TASK-4.22.1** — Add config loader + zod schema in `viewer/lib/config.ts` (commit b40d75e) (AC: 1, 2, 3)
- [x] **TASK-4.22.2** — Wire overrides into `viewer/lib/corpus.ts` ordering (AC: 2)
- [x] **TASK-4.22.3** — Add `commit: string` to `loadDashboardData().stories` for `/project` SHA cell (AC: 2)

## References

- [Pillar F plan Task 5](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
