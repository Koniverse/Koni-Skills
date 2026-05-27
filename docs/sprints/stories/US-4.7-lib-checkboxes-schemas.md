---
id: US-4.7
title: "Lib core — checkboxes + Zod schemas"
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

Ship typed checkbox lists and Zod schemas for story, epic, sprint, and changelog-entry frontmatter. Provides the validation layer that allows Pillar C CLI subcommands to reject malformed docs at the I/O boundary rather than propagating bad data into business logic.

## Background

Pillar B of the koni-docs CLI expansion (EPIC-4 v0.2.0). Shipped as part of the [Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md) covering Tasks 13-15.

## Acceptance criteria

- [x] **AC-1** — Lib modules `checkboxes.ts` and `schemas/` export the documented surface (see spec §5.4-5.5).
- [x] **AC-2** — Test coverage: all unit tests pass via `node --import tsx --test`.
- [x] **AC-3** — `npm run typecheck` exits 0 from `packages/koni-docs/`.

## Tasks

- [x] **TASK-4.7.1** — Implement primitives per plan tasks 13-15 (AC: 1, 2, 3)

## Dev notes

### References

- [Source: Pillar B design spec](../../superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md)
- [Source: Pillar B implementation plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-b-lib-foundation.md)
- [Source: ARCHITECTURE.md — Managed object inventory](../../ARCHITECTURE.md#managed-object-inventory)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep "^export" packages/koni-docs/src/lib/checkboxes.ts packages/koni-docs/src/lib/schemas/index.ts` shows the documented exports |
| AC-2 | `cd packages/koni-docs && npm test` shows all tests pass |
| AC-3 | `cd packages/koni-docs && npm run typecheck` exits 0 |

## Changelog entry

(See CHANGELOG.md entry for v0.4.0-dev.0 — this story is one slice of that combined entry.)

## Cross-references

- [PRD FR-15](../../PRD.md)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.4.0-dev.0](../../CHANGELOG.md)
