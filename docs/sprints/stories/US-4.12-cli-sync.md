---
id: US-4.12
title: "`koni-docs sync` subcommand (W23 BLOCKER fix)"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W25
version_shipped: "0.5.0-dev.0"
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Deliver the `koni-docs sync` subcommand that propagates story status through 5 doc layers using column-by-NAME table addressing. This subcommand delivers the W23 BLOCKER fix to end-users: `agile-sync-up.mjs` silently wrote status icons into the wrong `Carry` column; `koni-docs sync` now addresses columns by name and throws clearly if a column is missing. The W23 BLOCKER regression test is locked in `__tests__/cli/sync.test.ts`.

## Background

Pillar C of the koni-docs CLI expansion (EPIC-4 v0.5.0-dev.0). Shipped as part of the [Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md) Task 3.

## Acceptance criteria

- [x] **AC-1** — `koni-docs sync` is registered in commander, callable via `npx koni-docs sync`.
- [x] **AC-2** — Test coverage: unit/integration tests pass via `node --import tsx --test`, including the W23 BLOCKER regression test in `__tests__/cli/sync.test.ts`.
- [x] **AC-3** — Legacy `agile-sync-up.mjs` deleted from `skills/koni-docs/scripts/`.

## Tasks

- [x] **TASK-4.12.1** — Implement `sync` subcommand per plan Task 3 (AC: 1, 2, 3)

## Dev notes

### References

- [Source: Pillar C design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `npx koni-docs sync --help` shows subcommand help |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |
| AC-3 | `! test -f skills/koni-docs/scripts/agile-sync-up.mjs` (file does not exist) |

## Changelog entry

(See CHANGELOG.md entry for v0.5.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.5.0-dev.0](../../CHANGELOG.md)
