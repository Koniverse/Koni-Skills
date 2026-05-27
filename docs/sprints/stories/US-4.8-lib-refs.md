---
id: US-4.8
title: "Lib core — refs (L3 ID graph validator)"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W24
version_shipped: 0.4.0-dev.0
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Ship `listChildrenOf` / `listReferrersTo` / `validateRefs` for cross-doc ID traversal, enabling the L3 ID graph that Pillar C `sync` and `check` subcommands need to validate cross-references between stories, epics, and sprints.

## Background

Pillar B of the koni-docs CLI expansion (EPIC-4 v0.2.0). Shipped as part of the [Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md) covering Task 16.

## Acceptance criteria

- [x] **AC-1** — Lib module `refs.ts` exports the documented surface (see spec §5.6).
- [x] **AC-2** — Test coverage: all unit tests pass via `node --import tsx --test`.
- [x] **AC-3** — `npm run typecheck` exits 0 from `packages/koni-docs/`.

## Tasks

- [x] **TASK-4.8.1** — Implement primitives per plan task 16 (AC: 1, 2, 3)

## Dev notes

### References

- [Source: Pillar B design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep "^export" packages/koni-docs/src/lib/refs.ts` shows the documented exports |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |
| AC-3 | `cd packages/koni-docs && npm run typecheck` exits 0 |

## Changelog entry

(See CHANGELOG.md entry for v0.4.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.4.0-dev.0](../../CHANGELOG.md)
