---
id: US-4.25
title: "koni-docs validate subcommand + validateFrRefs lib fn"
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

Add `koni-docs validate` — a read-only integrity check that runs
`validateRefs(corpus)` (L3 ID-graph — already in the lib) plus the new
`validateFrRefs(corpus)` (each story's `prd_ref` resolves to a real FR-row
in PRD §8). Flags: `--json`, `--include-warnings`. Exits non-zero on any
error. Dogfooded against this repo's `docs/`.

## Acceptance criteria

- [x] **AC-1** — **Given** a clean corpus, **When** `koni-docs validate`
  runs, **Then** it prints a success summary and exits 0.
- [x] **AC-2** — **Given** a story with `prd_ref: FR-999` (nonexistent),
  **When** `validate` runs, **Then** it prints the broken ref and exits
  non-zero.
- [x] **AC-3** — **Given** `--json`, **When** `validate` runs, **Then**
  stdout is machine-parseable JSON (errors + warnings).

## Tasks

- [x] **TASK-4.25.1** — Add `validateFrRefs` to `lib/refs.ts` (commit ab9eb5b) (AC: 2)
- [x] **TASK-4.25.2** — Add `cli/validate.ts` subcommand wiring (AC: 1, 2, 3)
- [x] **TASK-4.25.3** — Cover via `__tests__/cli/validate.test.ts` (AC: 1, 2, 3)

## References

- [Pillar F plan Task 4](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
