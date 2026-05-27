---
id: US-4.19
title: "koni-docs preview subcommand"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W26
version_shipped: "0.6.0"
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-28
---

## Goal

Add the `koni-docs preview` subcommand to the existing CLI binary. Spawns Astro dev server with `KONI_DOCS_DIR` set from the resolved docs path argument. Supports `--port`, `--host`, and `--open` flags. Smoke-tested via `__tests__/cli/preview.test.ts`.

## Background

Pillar E of the koni-docs CLI expansion (EPIC-4 v0.6.0). Shipped as part of the [Pillar E implementation plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md) Tasks 7-8.

## Acceptance criteria

- [x] **AC-1** — `koni-docs preview --help` prints usage with `--port`, `--host`, `--open` flags
- [x] **AC-2** — `koni-docs preview docs/` sets `KONI_DOCS_DIR` to resolved absolute path and spawns Astro dev server
- [x] **AC-3** — Preview smoke test in `__tests__/cli/preview.test.ts` passes

## Tasks

- [x] **TASK-4.19.1** — Implement `src/cli/preview.ts` subcommand with commander wiring
- [x] **TASK-4.19.2** — Spawn Astro dev via child process with `KONI_DOCS_DIR` env var
- [x] **TASK-4.19.3** — Add smoke test `__tests__/cli/preview.test.ts`

## Dev notes

### References

- [Pillar E plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: Koni-Finance-Final/apps/docs/](https://github.com/Koniverse/Koni-Finance-Final/tree/main/apps/docs)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `node --import tsx packages/koni-docs/src/cli/index.ts preview --help` |
| AC-2 | `cd packages/koni-docs && npm test` (71 passes) |
| AC-3 | `cd packages/koni-docs && npm test` (71 passes) |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.6.0](../../CHANGELOG.md)
