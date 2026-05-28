---
id: US-4.1
title: "Scaffold packages/koni-docs/src/viewer + Astro SSR"
epic: EPIC-4
status: done
priority: P0
points: 5
sprint: sprint-2026-W22
version_shipped: "0.6.0"
prd_ref: FR-15
assignee: saltict
commit: de38a64, fe1f52d, acd5561
created: 2026-05-27
updated: 2026-05-28
---

## Goal

Scaffold the Astro SSR viewer inside `packages/koni-docs/src/viewer/` using `@astrojs/node` adapter, with runtime `DOCS_DIR` sourced from env. Lift `Layout.astro` / `TreeNode.astro` / `global.css` from `Koni-Finance-Final/apps/docs/` and adapt for SSR + runtime `KONI_DOCS_DIR` + Pillar B lib reuse.

## Background

Pillar E of the koni-docs CLI expansion (EPIC-4 v0.6.0). Shipped as part of the [Pillar E implementation plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md) Tasks 1-6.

## Acceptance criteria

- [x] **AC-1** — `src/viewer/` exists with `astro.config.mjs`, `package.json`, `pages/index.astro`, `pages/docs/[...file].astro`, `layouts/Layout.astro`, `components/TreeNode.astro`, `styles/global.css`
- [x] **AC-2** — Astro SSR adapter is `@astrojs/node` (`output: 'server'`); `KONI_DOCS_DIR` resolved at runtime (no build-time path baking)
- [x] **AC-3** — `lib/render.ts` and `lib/corpus.ts` delegate to Pillar B lib for file-tree and dashboard data

## Tasks

- [x] **TASK-4.1.1** — Scaffold `src/viewer/` directory structure and `astro.config.mjs`
- [x] **TASK-4.1.2** — Lift and adapt layout + component files from Koni-Finance-Final reference
- [x] **TASK-4.1.3** — Implement `lib/render.ts` (marked + shiki + mermaid passthrough + relative-link rewrite)
- [x] **TASK-4.1.4** — Implement `lib/corpus.ts` (file-tree builder + dashboard data composer)
- [x] **TASK-4.1.5** — Wire `pages/index.astro` (dashboard with KPIs + epic grid)
- [x] **TASK-4.1.6** — Wire `pages/docs/[...file].astro` (per-doc SSR with story frontmatter card + TOC)

## Dev notes

### References

- [Pillar E plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: Koni-Finance-Final/apps/docs/](https://github.com/Koniverse/Koni-Finance-Final/tree/main/apps/docs)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `ls packages/koni-docs/src/viewer/` — verify directory structure |
| AC-2 | `grep -r "output.*server" packages/koni-docs/src/viewer/astro.config.mjs` |
| AC-3 | `cd packages/koni-docs && npm test` (71 passes) |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.6.0](../../CHANGELOG.md)
