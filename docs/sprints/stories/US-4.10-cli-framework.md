---
id: US-4.10
title: "CLI framework + global opts"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: "0.5.0-dev.0"
prd_ref: FR-15
assignee: saltict
commit: b2dadbf, 7bc86ce
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Wire the `koni-docs` binary entry point using `commander` and expose four global flags (`--docs-path`, `--dry-run`, `--json`, `--verbose`) that all subcommands inherit. After this story, the CLI skeleton exists and every subsequent subcommand can be registered against it without revisiting the entry-point architecture.

## Background

Pillar C of the koni-docs CLI expansion (EPIC-4 v0.5.0-dev.0). Shipped as part of the [Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md) Task 1.

## Acceptance criteria

- [x] **AC-1** — `npx koni-docs --help` prints the top-level help listing all subcommands and global flags.
- [x] **AC-2** — Test coverage: all framework unit/integration tests pass via `node --import tsx --test`.
- [x] **AC-3** — (N/A — framework task, no legacy script deletion.)

## Tasks

- [x] **TASK-4.10.1** — Implement CLI framework per plan Task 1 (AC: 1, 2)

## Dev notes

### References

- [Source: Pillar C design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar C implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `npx koni-docs --help` shows top-level help with all subcommands |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |

## Changelog entry

(See CHANGELOG.md entry for v0.5.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.5.0-dev.0](../../CHANGELOG.md)
