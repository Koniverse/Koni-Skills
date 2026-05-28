---
id: US-4.3
title: "Graceful schema fallback + chokidar/SSE live reload"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W22
version_shipped: "0.7.0"
prd_ref: FR-17
assignee: saltict
commit: acd5561
created: 2026-05-27
updated: 2026-05-28
---

## Goal

Ensure the viewer renders gracefully when `docs/sprints/` is absent (plain landing page fallback). Live reload via chokidar + SSE on `.md` changes is deferred to Pillar F.

## Background

Pillar E of the koni-docs CLI expansion (EPIC-4 v0.6.0). The graceful 404 / missing-sprints path is handled implicitly by `lib/corpus.ts` returning empty arrays when `sprints/` is absent. Chokidar SSE wiring is deferred to Pillar F. Shipped as part of the [Pillar E implementation plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md).

## Acceptance criteria

- [x] **AC-1** — Plain-mode landing page renders without throwing when `docs/sprints/` is absent (no epic grid, no KPIs — just file tree + README)
- [x] **AC-2** — `--watch` auto-reloads browser within ~300 ms of a `.md` edit via chokidar + SSE (shipped in v0.7.0 via [US-4.21](US-4.21-live-reload.md))

## Tasks

- [x] **TASK-4.3.1** — `lib/corpus.ts` returns empty sprints/epics/stories arrays gracefully when subdirs are absent
- [x] **TASK-4.3.2** — `pages/index.astro` conditionally renders KPI + epic grid only when sprint data is present
- [x] **TASK-4.3.3** — Wire chokidar watcher + SSE endpoint in `preview` subcommand (shipped in v0.7.0 via [US-4.21](US-4.21-live-reload.md))

## Dev notes

### AC-2 / TASK-4.3.3 deferred rationale

Live reload requires a persistent SSE endpoint and chokidar watcher process alongside Astro dev. Since Astro dev already includes HMR, the incremental value is low for v0.6.0. Deferred to Pillar F where the watcher infra will be built alongside config-file support.

### References

- [Pillar E plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: Koni-Finance-Final/apps/docs/](https://github.com/Koniverse/Koni-Finance-Final/tree/main/apps/docs)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `cd packages/koni-docs && npm test` (71 passes) |
| AC-2 | Deferred to Pillar F |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.6.0](../../CHANGELOG.md)
