---
id: US-4.1
title: "Scaffold packages/koni-docs-viewer + SSR migration"
epic: EPIC-4
status: ready
priority: P0
points: 5
sprint: sprint-2026-W23
version_shipped:
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Stand up the `packages/koni-docs-viewer/` skeleton, copy the working
Astro 4 reference implementation from `Koni-Finance-Final` `apps/docs/`,
and convert it from static-build (`getStaticPaths`) to Astro Node SSR
(`@astrojs/node` standalone). After this story, the package builds clean
in isolation, reads docs from `process.cwd()/docs` (or `KONI_DOCS_DIR`),
and renders this repo's `docs/` correctly without any rebuild on edit.
US-4.2 then adds the CLI bin on top of this foundation.

## Background

The reference implementation at
`/Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/`
is ~85% of what we need. It already ships the file-tree sidebar, the
markdown renderer with shiki + mermaid + cross-link rewriting, and the
epic dashboard. The blockers to reuse are:

1. **Hard-coded path** — `DOCS_DIR = path.resolve(process.cwd(), '../../docs')` assumes monorepo-relative.
2. **Static build** — `[...file].astro` uses `getStaticPaths`, forcing a full rebuild on every doc edit.
3. **Monorepo coupling** — `tsconfig` extends `@workspace/typescript-config` and uses a `@/` alias resolved by the workspace.

This story removes all three coupling points so the package can be built
and shipped as a standalone artifact. Schema-graceful behavior and live
reload are deliberately deferred to US-4.3 — this story keeps the existing
Koni-Skills-shaped dashboard working *as is* against this repo's `docs/`.

This story is the foundation for US-4.2 / US-4.3 / US-4.4 — none of them
can start until the package builds.

## Acceptance criteria

- [ ] **AC-1** — **Given** the new `packages/koni-docs-viewer/` directory,
  **When** `npm install && npm run build` runs inside it,
  **Then** Astro produces a `dist/server/entry.mjs` standalone server
  bundle with no warnings or type errors.

- [ ] **AC-2** — **Given** the runtime configuration `KONI_DOCS_DIR=<repo-root>/docs node packages/koni-docs-viewer/dist/server/entry.mjs`,
  **When** a browser hits `http://127.0.0.1:4321/`,
  **Then** the dashboard renders with the actual counts from this repo's
  `docs/sprints/STATUS.md` (3 epics tracked after EPIC-4 lands, 14 stories
  total — counts checked against the regenerated STATUS).

- [ ] **AC-3** — **Given** the server is running,
  **When** the user edits any `.md` file under `docs/` and reloads the
  browser, **Then** the change is visible without restarting the server
  and without any rebuild step.

- [ ] **AC-4** — `rg "process\.cwd\(\), '\.\./\.\./docs'" packages/koni-docs-viewer/src/`
  returns ZERO matches. The only path resolution lives in a single
  `resolveDocsDir()` helper.

- [ ] **AC-5** — `packages/koni-docs-viewer/tsconfig.json` does NOT
  reference `@workspace/typescript-config`. `@/` import alias either
  removed (relative imports) or declared in the package's own `tsconfig`.

- [ ] **AC-6** — Smoke test: hitting `/docs/README` returns the rendered
  README, `/docs/sprints/stories/US-1.1-koni-docs-initial-release`
  returns the story page with frontmatter card + body, and an invalid
  slug returns a 404 (not a 500).

## Tasks

- [ ] **TASK-4.1.1** — Scaffold package skeleton (AC: 1, 5)
  - [ ] Create `packages/koni-docs-viewer/{src/{utils,styles,layouts,components,pages/docs},bin}` directories.
  - [ ] Write `package.json` with `"name": "@koniverse/docs-viewer"`, Astro 4 deps, `prepublishOnly` script.
  - [ ] Write `tsconfig.json` extending only `astro/tsconfigs/base` (no `@workspace/*`).
  - [ ] Write `astro.config.mjs` with `output: 'server'`, `adapter: node({ mode: 'standalone' })`.
  - [ ] Write `.gitignore` for `dist/`, `node_modules/`, `.astro/`.

- [ ] **TASK-4.1.2** — Copy + re-home reference source (AC: 1, 5)
  - [ ] Copy `src/utils/docs.ts`, layouts, components, pages, styles, `env.d.ts` from the reference impl.
  - [ ] Replace `@/` aliases with relative imports OR add `paths` to the package's own `tsconfig`.
  - [ ] Strip `@workspace/typescript-config` from `tsconfig`.
  - [ ] Verify `npm install && npm run build` succeeds.

- [ ] **TASK-4.1.3** — Decouple `DOCS_DIR` (AC: 2, 4)
  - [ ] Add `resolveDocsDir()` helper in `src/utils/docs.ts` reading `process.env.KONI_DOCS_DIR ?? path.resolve(process.cwd(), 'docs')`.
  - [ ] Throw a clear error if the resolved dir does not exist.
  - [ ] Cache the value at module load.
  - [ ] Replace every direct `DOCS_DIR` reference with the helper.

- [ ] **TASK-4.1.4** — SSR migration of `[...file].astro` (AC: 3, 6)
  - [ ] Delete `getStaticPaths` block.
  - [ ] Read `Astro.params.file` and validate against the scanned tree (no `..` escape).
  - [ ] Return `Astro.response.status = 404` on miss; render a 404 layout.
  - [ ] Confirm in browser that markdown edits show without a rebuild.

- [ ] **TASK-4.1.5** — Smoke test against this repo (AC: 2, 6)
  - [ ] From repo root: `KONI_DOCS_DIR=$(pwd)/docs node packages/koni-docs-viewer/dist/server/entry.mjs`.
  - [ ] Confirm dashboard counts match `docs/sprints/STATUS.md`.
  - [ ] Click into 3 random docs (README, PRD, a US-* story) — confirm cross-links + code blocks + mermaid render.
  - [ ] Try an invalid slug — confirm 404 page.

## Dev notes

### Architecture constraints

- **Skill-vs-package boundary** ([CONTEXT D11](../../CONTEXT.md)): viewer
  is a package, not a skill. No SKILL.md, no `references/`, no
  `.agents/` consumption. The viewer also does NOT change the koni-docs
  skill or its scripts.
- **Astro 4 + Node SSR** is the chosen runtime ([spec §3](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#3-architecture)).
  Static build is forbidden — every edit must show without a rebuild.

### Cross-story dependencies

- Builds on the reference impl at
  `Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/`
  — read-only source, not imported.
- Required by [US-4.2](US-4.2-cli-bin-and-config.md) — that story adds
  the CLI bin that boots `dist/server/entry.mjs`.
- Required by [US-4.3](US-4.3-graceful-schema-and-live-reload.md) and
  [US-4.4](US-4.4-dogfood-and-publish.md).

### What we explicitly did NOT do

- **No schema-graceful behavior yet** — deferred to US-4.3. This story
  keeps the existing Koni-Skills-shaped dashboard wired exactly as ref
  impl does.
- **No CLI** — deferred to US-4.2. This story is invoked manually via
  `node dist/server/entry.mjs` + env vars.
- **No live-reload** — deferred to US-4.3 (chokidar + SSE).
- **No config file** — deferred to US-4.2.

### References

- [Spec §3 Architecture](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#3-architecture)
- [Plan Phase 1 + Phase 2](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: PRD §8 FR-15](../../PRD.md#8-functional-requirements)
- [Source: CONTEXT D11](../../CONTEXT.md)
- Astro Node adapter: https://docs.astro.build/en/guides/integrations-guide/node/

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `cd packages/koni-docs-viewer && npm install && npm run build` exits 0 |
| AC-2, AC-3, AC-6 | `KONI_DOCS_DIR=$(pwd)/docs node packages/koni-docs-viewer/dist/server/entry.mjs` then curl the relevant URLs |
| AC-4 | `rg "'\.\./\.\./docs'" packages/koni-docs-viewer/src/` returns 0 matches |
| AC-5 | `cat packages/koni-docs-viewer/tsconfig.json \| jq -r '.extends'` does NOT contain `@workspace` |

## Changelog entry

### Added
- `packages/koni-docs-viewer/` — new Astro 4 SSR-based docs viewer scaffold (foundation for `@koniverse/docs-viewer` npm package; consumes this repo's `docs/` via `KONI_DOCS_DIR`).

**Commit**: <pending — fill at landing>

## Implementation notes

(empty until sprint pickup)

## Files modified

(empty until sprint pickup)

## Cross-references

- [PRD FR-15](../../PRD.md#8-functional-requirements)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [Spec](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Plan](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [CONTEXT D11](../../CONTEXT.md)
