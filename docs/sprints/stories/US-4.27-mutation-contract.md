---
id: US-4.27
title: "Mutation-contract docblock on lib/index.ts"
epic: EPIC-4
status: done
priority: P1
points: 1
sprint: sprint-2026-W22
version_shipped: "0.7.0"
assignee: saltict
commit: c4e0c87
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Add a top-of-file JSDoc comment to `lib/index.ts` documenting the lib's
mutation convention: all exports are pure unless a call-site comment says
otherwise; `update*` returns a new value, never mutates the input. The
sole exception (`parseTable(...).node` mutates `doc.ast`) is called out
explicitly. Documentation only — no behaviour change.

## Acceptance criteria

- [x] **AC-1** — **Given** `lib/index.ts`, **When** Pillar F lands,
  **Then** the file opens with a JSDoc block stating the mutation
  contract.
- [x] **AC-2** — **Given** the JSDoc, **When** read by a future
  maintainer, **Then** the `parseTable(...).node` exception is named.
- [x] **AC-3** — **Given** the change is doc-only, **When** the test
  suite runs, **Then** it remains at 92 passing tests (no regression).

## Tasks

- [x] **TASK-4.27.1** — Author the mutation-contract docblock atop
  `lib/index.ts` (commit c4e0c87) (AC: 1, 2)
- [x] **TASK-4.27.2** — Confirm zero behavioural change via test suite (AC: 3)

## References

- [Pillar F plan Task 1](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
