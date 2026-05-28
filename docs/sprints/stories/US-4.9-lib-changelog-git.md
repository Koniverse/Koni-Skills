---
id: US-4.9
title: "Lib core — changelog + git utilities"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: 0.4.0-dev.0
prd_ref: FR-15
assignee: saltict
commit: a7c9d42, c93e1ee, e378abd
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Ship CHANGELOG parse/`updateCommitSha` + thin git wrappers using `execFileSync` (no shell injection surface), giving Pillar C CLI subcommands a safe, testable interface to both CHANGELOG mutation and git history queries without spawning shell strings.

## Background

Pillar B of the koni-docs CLI expansion (EPIC-4 v0.2.0). Shipped as part of the [Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md) covering Tasks 17-19.

## Acceptance criteria

- [x] **AC-1** — Lib modules `changelog.ts` and `git.ts` export the documented surface (see spec §5.7-5.8).
- [x] **AC-2** — Test coverage: all unit tests pass via `node --import tsx --test`.
- [x] **AC-3** — `npm run typecheck` exits 0 from `packages/koni-docs/`.

## Tasks

- [x] **TASK-4.9.1** — Implement primitives per plan tasks 17-19 (AC: 1, 2, 3)

## Dev notes

### References

- [Source: Pillar B design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep "^export" packages/koni-docs/src/lib/changelog.ts packages/koni-docs/src/lib/git.ts` shows the documented exports |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |
| AC-3 | `cd packages/koni-docs && npm run typecheck` exits 0 |

## Changelog entry

(See CHANGELOG.md entry for v0.4.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.4.0-dev.0](../../CHANGELOG.md)
