---
id: EPIC-4
title: "Docs preview tooling — koni-docs-viewer"
status: in-progress
prd_ref: FR-15, FR-16, FR-17, FR-18
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Ship `@koniverse/docs-viewer` — a globally-installable npm CLI that
renders the `docs/` folder of any koni-docs-following project as a
polished local web preview. After this epic, a Koniverse engineer can run
`npx @koniverse/docs-viewer` in any project root and browse the docs
hub, file tree, breadcrumbs, syntax-highlighted code, Mermaid diagrams,
and (when sprint structure is detected) an aggregated Epic / Story
dashboard — with **zero build step** in the consumer repo.

## Overview

### Business context

Before EPIC-4, viewing the rendered koni-docs structure required either
(a) reading raw markdown in the editor, (b) shipping a one-off Astro app
inside the consumer repo (which `Koni-Finance-Final` did at
`apps/docs/`), or (c) waiting for a hosted dashboard that does not
exist. None of these scale: option (a) loses cross-links and Mermaid,
option (b) duplicates ~85% of the same Astro code into every consumer,
option (c) is permanently out of scope (PRD §3 boundaries — Koni-Skills
does not run hosted services).

EPIC-4 turns the working `apps/docs/` reference implementation from
`Koni-Finance-Final` into a reusable, schema-graceful npm package. The
viewer is **not** a "Koniverse skill" in the PRD sense (it's a CLI for
humans, not instructions for AI agents) — which is why it lives in
`packages/`, not `skills/`, and ships through npm, not `npx skills`.

This epic intentionally does NOT cover authoring UI, full-text search,
multi-repo aggregation, or auth hardening — see [Out of scope](#out-of-scope).

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Package scaffold + SSR** | [US-4.1](../stories/US-4.1-scaffold-and-ssr.md) | Set up `packages/koni-docs-viewer/`, switch ref impl from static to Astro SSR, decouple monorepo paths |
| 2 | **CLI + config** | [US-4.2](../stories/US-4.2-cli-bin-and-config.md) | `bin/koni-docs-viewer.js` with `--port/--host/--open/--watch`, optional `koni-docs.config.{json,mjs}` |
| 3 | **Graceful schema + live reload** | [US-4.3](../stories/US-4.3-graceful-schema-and-live-reload.md) | Detect sprint structure; fall back to plain landing page; chokidar + SSE auto-reload on `.md` change |
| 4 | **Dogfood + publish** | [US-4.4](../stories/US-4.4-dogfood-and-publish.md) | Wire `npm run docs:preview` into Koni-Skills; publish v0.1.0 to `@koniverse/docs-viewer` |

### Out of scope

- **Authoring / edit-in-browser** — viewer is read-only. Use your editor.
- **Full-text search** — deferred to v0.2; browser `Cmd-F` is enough for v0.1.
- **Multi-repo / multi-tenant hosting** — one repo, one process. Hosted dashboard is out of PRD scope (§3).
- **Authentication / network exposure hardening** — viewer binds to `localhost` by default. `--host 0.0.0.0` is opt-in with a printed warning. Anything beyond that lives in consumer infra.
- **Plugin-skill rule rendering** — that lives in `koni-docs` and its plugins (EPIC-3); the viewer only displays content.
- **PDF / printable export** — candidate for v0.2 if demand emerges.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-15 | [US-4.1](../stories/US-4.1-scaffold-and-ssr.md) | 🟢 ready (sprint-2026-W23) |
| FR-16 | [US-4.2](../stories/US-4.2-cli-bin-and-config.md) | 🟢 ready (sprint-2026-W23) |
| FR-17 | [US-4.3](../stories/US-4.3-graceful-schema-and-live-reload.md) | 🟢 ready (sprint-2026-W23) |
| FR-18 | [US-4.4](../stories/US-4.4-dogfood-and-publish.md) | 🟢 ready (sprint-2026-W23) |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-4.1](../stories/US-4.1-scaffold-and-ssr.md) | Scaffold `packages/koni-docs-viewer` + SSR migration | Set up the package, copy reference impl, switch from `getStaticPaths` to Astro Node SSR, decouple `DOCS_DIR` from monorepo paths | ✅ done | v0.6.0 |
| [US-4.2](../stories/US-4.2-cli-bin-and-config.md) | CLI bin + `koni-docs.config.{json,mjs}` | `koni-docs-viewer [path] --port --host --open --watch --config`; optional config file overrides title and ordering | ✅ done | v0.7.0 |
| [US-4.3](../stories/US-4.3-graceful-schema-and-live-reload.md) | Schema-graceful fallback + chokidar/SSE live reload | Detect sprint structure; plain landing page when absent; `--watch` auto-reloads browser on `.md` change | ✅ done | v0.7.0 |
| [US-4.4](../stories/US-4.4-dogfood-and-publish.md) | Dogfood in Koni-Skills + publish v0.1.0 | Wire `npm run docs:preview`; publish `@koniverse/docs-viewer@0.1.0`; smoke-test against `Koni-Finance-Final` | 🟢 ready | — |
| [US-4.19](../stories/US-4.19-cli-preview.md) | `koni-docs preview` subcommand | Spawn Astro dev with runtime DOCS_DIR; --port/--host/--open flags | ✅ done | v0.6.0 |
| [US-4.5](../stories/US-4.5-lib-corpus-doc.md) | Lib core — corpus + doc module | Compose gray-matter + remark for typed Doc/Corpus value types | ✅ done | v0.4.0-dev.0 |
| [US-4.6](../stories/US-4.6-lib-sections-tables.md) | Lib core — sections + tables (column-by-NAME) | Section + table primitives with column-name addressing — fixes W23 BLOCKER | ✅ done | v0.4.0-dev.0 |
| [US-4.7](../stories/US-4.7-lib-checkboxes-schemas.md) | Lib core — checkboxes + Zod schemas | Typed checkbox lists + Zod schemas for story/epic/sprint/changelog-entry | ✅ done | v0.4.0-dev.0 |
| [US-4.8](../stories/US-4.8-lib-refs.md) | Lib core — refs (L3 ID graph) | listChildrenOf / listReferrersTo / validateRefs for cross-doc IDs | ✅ done | v0.4.0-dev.0 |
| [US-4.9](../stories/US-4.9-lib-changelog-git.md) | Lib core — changelog + git utilities | CHANGELOG parse/updateCommitSha + thin git wrappers (no shell) | ✅ done | v0.4.0-dev.0 |
| [US-4.10](../stories/US-4.10-cli-framework.md) | CLI framework + global opts | commander wiring, --docs-path/--dry-run/--json/--verbose, bin entry | ✅ done | v0.5.0-dev.0 |
| [US-4.11](../stories/US-4.11-cli-status.md) | `koni-docs status` subcommand | Regenerate STATUS.md kanban; delete generate-status.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.12](../stories/US-4.12-cli-sync.md) | `koni-docs sync` subcommand | 5-layer propagation, column-by-NAME (W23 BLOCKER fix); delete agile-sync-up.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.13](../stories/US-4.13-cli-inject-tasks.md) | `koni-docs inject-tasks` subcommand | Regen ## Tasks from AC checkboxes; delete agile-inject-tasks.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.14](../stories/US-4.14-cli-backfill-fields.md) | `koni-docs backfill-fields` subcommand | Merge STORY_DEFAULTS for missing keys; delete agile-backfill-fields.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.15](../stories/US-4.15-cli-backfill-commits.md) | `koni-docs backfill-commits` subcommand | Replace pending SHA via git; delete changelog-backfill-commits.mjs + sync-test.mjs | ✅ done | v0.5.0-dev.0 |
| [US-4.16](../stories/US-4.16-cli-migration-docs.md) | Migration docs (SKILL.md / sprint-system.md / CLAUDE.md / SETUP.md) | Rewrite agent-facing docs to point at CLI; consumer migration table | ✅ done | v0.5.0 |
| [US-4.17](../stories/US-4.17-cli-npm-publish.md) | Publish @koniverse/koni-docs@0.5.0 to npm | npm publish prep complete; actual publish DEFERRED awaiting npm credentials | 👀 review | — |
| [US-4.18](../stories/US-4.18-cli-polish-fixes.md) | CLI polish — 5 minor fixes | inject-tasks dry-run; sync stderr; SyncStats fields; pre-release test; version skew | ✅ done | v0.5.0 |
| [US-4.20](../stories/US-4.20-project-page.md) | Viewer `/project` page — User Stories Tracker port | Port 366-line tracker from Koni-Finance-Final; commit cell as mono plain text | ✅ done | v0.7.0 |
| [US-4.21](../stories/US-4.21-live-reload.md) | Viewer `--watch` live-reload (chokidar + SSE) | Single watcher + 300 ms-debounced reload-bus + EventSource subscribe; flag no longer no-op | ✅ done | v0.7.0 |
| [US-4.22](../stories/US-4.22-viewer-config.md) | `koni-docs.config.{json,mjs}` viewer config loader | Optional zod-validated title / folderOrder / topLevelOrder overrides; defaults preserved | ✅ done | v0.7.0 |
| [US-4.23](../stories/US-4.23-section-prefix.md) | `findSectionStartingWith` + PRD §8 prefix lookup | Heading-prefix helper used by `sync.ts` for FR-row lookup; tolerant of casing variants | ✅ done | v0.7.0 |
| [US-4.24](../stories/US-4.24-yaml-quoting.md) | YAML quoting preservation in parseDoc/writeDoc | `Doc.frontmatterQuoting` Map preserves `"` vs `'` across CLI write round-trips | ✅ done | v0.7.0 |
| [US-4.25](../stories/US-4.25-cli-validate.md) | `koni-docs validate` subcommand + `validateFrRefs` | Read-only L3 ID-graph + FR-ref integrity check; `--json`, `--include-warnings`; exits non-zero on error | ✅ done | v0.7.0 |
| [US-4.26](../stories/US-4.26-lib-cleanup.md) | Lib cleanup — drop dead code | `serializeChangelog` stub + `recursive` param + `unist-util-visit` dep gone; tsconfig excludes viewer | ✅ done | v0.7.0 |
| [US-4.27](../stories/US-4.27-mutation-contract.md) | Mutation-contract docblock on `lib/index.ts` | Documents pure-by-default convention; names the `parseTable(...).node` exception | ✅ done | v0.7.0 |
| [US-4.28](../stories/US-4.28-publish-v0.7.0.md) | Publish `@koniverse/koni-docs@0.7.0` to npm | Manual publish gate; awaits maintainer npm credentials | 🚧 in-progress | — |

## Cross-cutting invariants

- **Read-only contract:** the viewer NEVER writes to the docs folder. Reviewers reject any change that opens a file in write mode against `KONI_DOCS_DIR`. Enforced by code review + a grep gate in `agile-sync-up.mjs` (added during US-4.1).
- **Schema-graceful by default:** every story that touches the dashboard / project routes must handle the "no sprints" case without throwing. Enforced by AC on US-4.3 and a synthetic-minimal-docs fixture in `packages/koni-docs-viewer/__tests__/`.
- **No hard-coded Koni-specific paths:** `DOCS_DIR`, top-level ordering, and folder ordering are all runtime-configurable. Hardcoded fallbacks are explicitly labeled `// default — overridable via koni-docs.config`.
- **English-only (RULE-13):** matches the skill convention — package source, CLI help text, and config schema labels are all English.

## Cross-story testing requirements

| Pattern | Stories | Shared infra |
|---|---|---|
| **Synthetic minimal docs fixture** | US-4.1, US-4.3 | `packages/koni-docs-viewer/__tests__/fixtures/minimal-docs/` — one `README.md` only; used to assert the plain landing page renders without sprint structure |
| **Synthetic koni-sprints fixture** | US-4.1, US-4.3 | `packages/koni-docs-viewer/__tests__/fixtures/koni-sprints-docs/` — 3 epics, 5 stories with frontmatter; used to assert the full dashboard renders |
| **`npm pack` size gate** | US-4.4 | CI / pre-publish check: tarball ≤ 5 MB (NFR-V4) |

## Performance budgets & invariants

| Concern | Budget | Story | Rationale |
|---|---|---|---|
| **CLI cold-start (invoke → listening)** | ≤ 1.5 s | US-4.2 | If `npx` boot is slow, no one will use it instead of "just opening the markdown file" |
| **First request render (shiki warm)** | ≤ 800 ms | US-4.1 | shiki theme + lang load happens once; budget guards the cache path |
| **Subsequent request render** | ≤ 80 ms | US-4.1 | Hot-path: same page reload during edits should feel instant |
| **Installed tarball size** | ≤ 5 MB | US-4.4 | Keeps `npx` first-run cheap |

## Acceptance criteria (propagated from stories)

- [ ] `packages/koni-docs-viewer/` builds clean with Astro SSR (`output: 'server'`) (US-4.1)
- [ ] `DOCS_DIR` resolves from `process.cwd()/docs` or `KONI_DOCS_DIR`; no monorepo coupling (US-4.1)
- [ ] `koni-docs-viewer --help` / `--version` print sane output (US-4.2)
- [ ] Optional `koni-docs.config.{json,mjs}` overrides title, ordering, hidden folders without crashing on malformed file (US-4.2)
- [ ] Plain-mode landing renders when `docs/sprints/` is absent (US-4.3)
- [ ] `--watch` auto-reloads browser within 200 ms of a `.md` edit (US-4.3)
- [ ] `npm pack --dry-run` shows tarball ≤ 5 MB (US-4.4)
- [ ] `@koniverse/docs-viewer@0.1.0` published; `npm run docs:preview` works in this repo (US-4.4)
