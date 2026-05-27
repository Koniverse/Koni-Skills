---
id: US-4.2
title: "CLI bin + koni-docs.config.{json,mjs} support"
epic: EPIC-4
status: in-progress
priority: P0
points: 5
sprint: sprint-2026-W26
version_shipped: ""
prd_ref: FR-16
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-28
---

## Goal

Add the `koni-docs preview` subcommand (bin shipped in v0.6.0) with `--port/--host/--open` flags that spawn Astro dev with `KONI_DOCS_DIR` set. Optional `koni-docs.config.{json,mjs}` config-file support (title/ordering overrides) is deferred to Pillar F.

## Background

Pillar E of the koni-docs CLI expansion (EPIC-4 v0.6.0). Shipped as part of the [Pillar E implementation plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md) Tasks 7-8.

## Acceptance criteria

- [x] **AC-1** — `koni-docs preview [path] --port <n> --host <h> --open` spawns Astro dev server with `KONI_DOCS_DIR` pointing at resolved docs path
- [ ] **AC-2** — Optional `koni-docs.config.{json,mjs}` overrides title, ordering, hidden folders without crashing on malformed file (deferred to Pillar F)

## Tasks

- [x] **TASK-4.2.1** — Add `preview` subcommand to CLI framework (`src/cli/preview.ts`)
- [x] **TASK-4.2.2** — Wire `--port`, `--host`, `--open` flags; spawn Astro dev via `execa`
- [ ] **TASK-4.2.3** — Implement `koni-docs.config.{json,mjs}` loader and schema (deferred to Pillar F)

## Dev notes

### AC-2 / TASK-4.2.3 deferred rationale

Config-file support was deferred to Pillar F to keep v0.6.0 focused on shipping a working preview binary. The `--port/--host/--open` flags cover the primary use case; title/ordering overrides are a progressive enhancement.

### References

- [Pillar E plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: Koni-Finance-Final/apps/docs/](https://github.com/Koniverse/Koni-Finance-Final/tree/main/apps/docs)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `npx koni-docs preview docs/ --port 4321` then `curl http://localhost:4321/` returns 200 |
| AC-2 | Deferred to Pillar F |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.6.0](../../CHANGELOG.md)
