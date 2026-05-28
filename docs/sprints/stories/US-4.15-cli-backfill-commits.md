---
id: US-4.15
title: "`koni-docs backfill-commits` subcommand"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: "0.5.0-dev.0"
prd_ref: FR-15
assignee: saltict
commit: 9622687
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Deliver the `koni-docs backfill-commits` subcommand that replaces `**Commit**: pending` placeholders in CHANGELOG.md with real git SHAs resolved from the commit graph. After this story, consumer repos can replace the `node skills/koni-docs/scripts/changelog-backfill-commits.mjs` invocation with `npx koni-docs backfill-commits` — and this story's own CHANGELOG entry is the first dogfood use of the new subcommand.

## Background

Pillar C of the koni-docs CLI expansion (EPIC-4 v0.5.0-dev.0). Shipped as part of the [Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md) Task 6.

## Acceptance criteria

- [x] **AC-1** — `koni-docs backfill-commits` is registered in commander, callable via `npx koni-docs backfill-commits`.
- [x] **AC-2** — Test coverage: unit/integration tests pass via `node --import tsx --test`.
- [x] **AC-3** — Legacy `changelog-backfill-commits.mjs` and `sync-test.mjs` deleted from `skills/koni-docs/scripts/`.

## Tasks

- [x] **TASK-4.15.1** — Implement `backfill-commits` subcommand per plan Task 6 (AC: 1, 2, 3)

## Dev notes

### References

- [Source: Pillar C design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `npx koni-docs backfill-commits --help` shows subcommand help |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |
| AC-3 | `! test -f skills/koni-docs/scripts/changelog-backfill-commits.mjs` (file does not exist) |

## Changelog entry

(See CHANGELOG.md entry for v0.5.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.5.0-dev.0](../../CHANGELOG.md)
