---
id: US-4.23
title: "findSectionStartingWith helper + PRD §8 prefix lookup in sync"
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

Add a `findSectionStartingWith(doc, prefix)` lib helper that matches the
first heading whose text starts with a given `## <num>.` prefix. `sync.ts`
uses it for PRD §8 FR-row lookups — real PRDs use `## 8. Functional
Requirements (FR)`, so a literal title lookup couldn't match. Both casing
variants (`Functional Requirements (FR)`, `Functional requirements`) now
resolve through one call site.

## Acceptance criteria

- [x] **AC-1** — **Given** a PRD doc with `## 8. Functional Requirements
  (FR)`, **When** `findSectionStartingWith(doc, '## 8.')` is called,
  **Then** it returns the matching section node.
- [x] **AC-2** — **Given** the prior literal lookup in `sync.ts`, **When**
  Pillar F lands, **Then** the lookup is replaced by the new helper at
  exactly one call site.
- [x] **AC-3** — **Given** the PRD section title varies in casing, **When**
  the helper is asked, **Then** the match succeeds without case-sensitive
  fragility.

## Tasks

- [x] **TASK-4.23.1** — Add `findSectionStartingWith` to `lib/sections.ts` (commit 44b9f36) (AC: 1, 3)
- [x] **TASK-4.23.2** — Replace literal FR-section lookup in `cli/sync.ts` (AC: 2)
- [x] **TASK-4.23.3** — Cover via unit test in `__tests__/lib/sections.test.ts` (AC: 1, 3)

## References

- [Pillar F plan Task 2](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
