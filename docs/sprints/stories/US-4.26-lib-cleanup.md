---
id: US-4.26
title: "Drop dead code (serializeChangelog + recursive + unist-util-visit)"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2026-W22
version_shipped: "0.7.0"
assignee: saltict
commit: c4e0c87
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Remove three pieces of dead code that accumulated through Pillars B–E:
`serializeChangelog` (always threw `"not implemented in Pillar B"`), the
unused `recursive` parameter on `readFolderMatter`, and the
`unist-util-visit` dependency that no source file imports. Also scope
the package `tsconfig.json` to exclude `src/viewer/`.

## Acceptance criteria

- [x] **AC-1** — **Given** `lib/changelog.ts`, **When** Pillar F lands,
  **Then** `serializeChangelog` and its re-export from `lib/index.ts` are
  gone; no test references it.
- [x] **AC-2** — **Given** `readFolderMatter` signature, **When** Pillar F
  lands, **Then** the `recursive` parameter is removed and the
  function body is unchanged.
- [x] **AC-3** — **Given** `package.json`, **When** Pillar F lands,
  **Then** `unist-util-visit` is no longer a dependency and `npm ls`
  agrees.

## Tasks

- [x] **TASK-4.26.1** — Delete `serializeChangelog` + re-export + test import (commit c4e0c87) (AC: 1)
- [x] **TASK-4.26.2** — Drop `recursive` parameter from `readFolderMatter` (AC: 2)
- [x] **TASK-4.26.3** — Remove `unist-util-visit` from `package.json` + lockfile (AC: 3)
- [x] **TASK-4.26.4** — Scope `tsconfig.json` to exclude `src/viewer/`

## References

- [Pillar F plan Task 1](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
