---
id: US-4.24
title: "YAML quoting preservation in parseDoc/writeDoc round-trip"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W26
version_shipped: "0.7.0"
assignee: saltict
commit: pending
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Preserve YAML key-quoting style across `parseDoc` → mutate → `writeDoc`
round-trips. `Doc.frontmatterQuoting?: Map<string, '"' | "'">` records
which keys carried which quote style in the raw frontmatter; on serialize,
gray-matter's bare output is re-wrapped to match. Eliminates the noisy
diffs where `version_shipped: "0.6.0"` became `version_shipped: 0.6.0`
after every CLI write.

## Acceptance criteria

- [x] **AC-1** — **Given** a story with `version_shipped: "0.6.0"` (double
  quotes), **When** `writeDoc` re-serializes after a no-op mutation,
  **Then** the value remains double-quoted in the output file.
- [x] **AC-2** — **Given** a key written with single quotes, **When**
  serialized, **Then** single quotes are preserved.
- [x] **AC-3** — **Given** a bare scalar value, **When** serialized,
  **Then** it remains bare (no spurious quotes).

## Tasks

- [x] **TASK-4.24.1** — Add `frontmatterQuoting` parser in `lib/doc.ts` (commit 44dd016) (AC: 1, 2, 3)
- [x] **TASK-4.24.2** — Re-wrap gray-matter output on serialize (AC: 1, 2, 3)
- [x] **TASK-4.24.3** — Cover round-trip in `__tests__/lib/doc.test.ts` (AC: 1, 2, 3)

## Dev notes

Best-effort heuristic — plain scalar values only. Multi-line and block
scalars are not preserved (none used in the corpus today).

## References

- [Pillar F plan Task 3](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
