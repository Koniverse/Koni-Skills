---
id: US-4.21
title: "Viewer --watch live-reload (chokidar + SSE)"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W22
version_shipped: "0.7.0"
assignee: saltict
commit: 1022bac
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Make the `--watch` flag on `koni-docs preview` actually work (was a no-op
declared in v0.6.0). A single chokidar watcher over `KONI_DOCS_DIR` feeds
a 300 ms-debounced EventEmitter; a new Astro API route at
`/koni-docs-rt/reload` streams SSE; `Layout.astro` subscribes via
`EventSource` and calls `location.reload()` on event.

## Acceptance criteria

- [x] **AC-1** — **Given** `koni-docs preview --watch`, **When** a `.md`
  file under `KONI_DOCS_DIR` changes, **Then** open browser tabs reload
  within ~300 ms (single SSE event per debounced batch).
- [x] **AC-2** — **Given** the SSE route lives at `/koni-docs-rt/reload`,
  **When** Astro routing scans `pages/`, **Then** the route is discovered
  (avoids the `pages/_*` exclusion trap).
- [x] **AC-3** — **Given** a tab is closed, **When** the `request.signal`
  fires `abort`, **Then** the subscriber is removed from the emitter
  (no listener leaks across reloads).

## Tasks

- [x] **TASK-4.21.1** — Add chokidar singleton + 300 ms-debounced reload-bus (commit 1022bac) (AC: 1)
- [x] **TASK-4.21.2** — Wire SSE endpoint at `/koni-docs-rt/reload` and `<script>` in Layout.astro (AC: 1, 2)
- [x] **TASK-4.21.3** — Hook `request.signal.addEventListener('abort', ...)` for cleanup (AC: 3)

## References

- [Pillar F plan Task 7](../../superpowers/plans/2026-05-28-pillar-f.md)
- [Pillar F design spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
