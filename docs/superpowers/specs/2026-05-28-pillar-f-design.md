---
title: Koni-docs Pillar F — Viewer polish + CLI fixes + lib cleanup
date: 2026-05-28
status: draft
relates_to:
  - docs/superpowers/specs/2026-05-27-koni-docs-cli-expansion-design.md
  - docs/superpowers/plans/2026-05-27-koni-docs-cli-pillar-e-astro-viewer.md
---

# Pillar F design spec

## Goal

Close the v0.6.0 deferred backlog with **one shipping increment v0.7.0** that:

1. Makes the Astro viewer feel finished — restores the `/project` route, adds live-reload, and supports a config file.
2. Fixes the two real-data interop gaps surfaced during Pillar D testing (PRD §8 header matching, gray-matter YAML normalization).
3. Adds the long-pending `koni-docs validate` subcommand for L3 ID-graph integrity checks.
4. Cleans up dead code carried since Pillar B (unused dep, dead stub function, dead param, mutation-contract docs).
5. Publishes the result to npm as `@koniverse/koni-docs@0.7.0`.

## Non-goals

- New CLI subcommands beyond `validate`.
- Schema additions (the existing zod schemas stay as they are).
- Reworking the dashboard `index.astro` or per-doc `[...file].astro` — they already work.
- Astro 6 upgrade (v4.16 stays).
- TypeScript strictness changes (current settings stay).

## Scope by sub-cluster

### F.1 — Viewer polish (visible to end users)

| ID | Story | What ships |
|---|---|---|
| US-4.20 | `/project` page | Full 366-line port from Koni-Finance-Final, adapted to use Pillar B lib via `loadDashboardData()`. Sidebar nav stops being a dead link. |
| US-4.21 | `--watch` live-reload | Real implementation: chokidar watches `KONI_DOCS_DIR` for `*.md` changes; an SSE endpoint at `/__koni-docs/reload` pushes `reload` events; the layout subscribes via `EventSource` and triggers `location.reload()` on receive. `--watch` flag (already declared, currently no-op) becomes the toggle. |
| US-4.22 | `koni-docs.config.{json,mjs}` | Optional config file at the docs-tree root. Schema (zod): `{ title?: string; folderOrder?: string[]; topLevelOrder?: string[] }`. When present, overrides the hardcoded `TOP_LEVEL_ORDER` / `FOLDER_ORDER` in `viewer/lib/corpus.ts` and the page `<title>`. Loaded once at server startup; live-reload picks up changes on next reload. |

### F.2 — CLI correctness fixes (interop with real docs)

| ID | Story | What ships |
|---|---|---|
| US-4.23 | PRD §8 header matching | `sync.ts` and `validateRefs` (Pillar B) currently look up `## 8. Functional Requirements`. Real docs use `## 8. Functional Requirements (FR)`. Replace exact-match lookup with a prefix-match helper in `lib/markdown/sections.ts` (`findSectionStartingWith(doc, '## 8.')`). Add fixture + regression test. |
| US-4.24 | gray-matter writeDoc YAML normalization | `writeDoc` currently drops user-authored YAML formatting (quotes around values, blank lines). Switch from default gray-matter stringify to a `js-yaml` dump with `forceQuotes: false` BUT preserve quotes when the original value was quoted. Implementation: detect quoted vs unquoted at parse time, stash the flag in a sidecar map, re-apply at serialize. Round-trip test: read fixture → write → diff = empty. |
| US-4.25 | `koni-docs validate` subcommand | New subcommand. Runs `validateRefs(corpus)` from Pillar B's lib (already implemented), formats results, exits non-zero on any error. Flags: `--json`, `--include-warnings`. Output mirrors `status` (one-line summary + table). Add FR-ref check: for each `fr_refs:` entry in story frontmatter, confirm a matching FR row exists in PRD §8 table. |

### F.3 — Lib cleanup (no behavior change)

| ID | Story | What ships |
|---|---|---|
| US-4.26 | Drop dead code | Remove `serializeChangelog` re-export from `lib/index.ts` (stub-only — throws "not implemented"). Remove `recursive` param from `readFolderMatter` signature (never read). Remove `unist-util-visit` from `package.json` dependencies (never imported anywhere in src/). Update `__tests__/lib/changelog.test.ts` if it imports the stub. |
| US-4.27 | Mutation-contract docs | Add a brief comment block at the top of `lib/index.ts` documenting the contract: *"All functions in this lib are pure and return new values. Functions whose names start with `update*` take a value and return the modified value; they do NOT mutate inputs."* This is the documentation contract carry-over from Pillar B review. |

### F.4 — Release

| ID | Story | What ships |
|---|---|---|
| US-4.28 | npm publish v0.7.0 | Bump VERSION + package.json + KONI_DOCS_LIB_VERSION to `0.7.0`. Run `npm publish --access public` from `packages/koni-docs/` (assumes user has `npm login` set; document as final manual step like Pillars D/E). Verify by `npm view @koniverse/koni-docs version`. |

## Architecture

### Live-reload data flow (US-4.21)

```
chokidar watcher (KONI_DOCS_DIR/**/*.md)
   │
   │ on('change'|'add'|'unlink')
   ▼
debounced (300ms) reload-bus EventEmitter
   │
   │ emit('reload', { path, kind })
   ▼
GET /__koni-docs/reload  (Astro endpoint, text/event-stream)
   │
   │ data: reload\n\n
   ▼
EventSource client in Layout.astro
   │
   │ onmessage → location.reload()
   ▼
Browser refresh; Astro re-renders page via SSR with fresh corpus
```

**Why SSE over WebSocket:** SSE is one-way (server → client), built into the browser, no extra runtime dep. Astro's `@astrojs/node` supports `Response` streaming.

**Why a debounced single-bus over per-connection watchers:** With N open tabs, only one chokidar instance runs; the bus fan-outs to all subscribers. Prevents per-tab inode pressure.

### Config file loading (US-4.22)

```typescript
// viewer/lib/config.ts (new)
interface KoniDocsViewerConfig {
  title?: string;             // overrides "koni-docs" in <title>
  folderOrder?: string[];     // overrides FOLDER_ORDER
  topLevelOrder?: string[];   // overrides TOP_LEVEL_ORDER
}

export function loadViewerConfig(docsDir: string): KoniDocsViewerConfig {
  // Try koni-docs.config.json first, then koni-docs.config.mjs.
  // Validate against zod schema; throw with clear message on schema error.
  // Return {} if neither file exists.
}
```

Called once at module init in `viewer/lib/corpus.ts`. The result threads through `buildFileTree` (which currently uses module-scoped constants). To make this work without a major refactor: change the constants to read from `loadViewerConfig(DOCS_DIR)` at `buildFileTree` call time. Live-reload guarantees stale config gets picked up.

### Section-header prefix matching (US-4.23)

New helper:

```typescript
// lib/markdown/sections.ts
export function findSectionStartingWith(doc: Doc, prefix: string): SectionRange | null;
```

Where `prefix` is a `## N.` style anchor (e.g., `'## 8.'`). Matches the FIRST heading whose text *starts with* `prefix` (case-sensitive, leading/trailing whitespace tolerant). Returns the same `SectionRange` shape as existing `findSection`. `sync.ts` and `refs.ts` are updated to call this instead of strict `findSection` when looking up numbered PRD sections.

### YAML normalization (US-4.24)

`writeDoc` currently uses gray-matter's `stringify` which calls `js-yaml.dump` with default options. The fix:

1. At parse time (`parseDoc`/`readDoc`), call gray-matter to extract `data` and `content`, but ALSO regex-scan the raw frontmatter for quoted values. Stash a `Set<string>` of quoted keys onto a `Doc.frontmatterQuoting?: Set<string>` field.
2. At serialize time (`writeDoc`), if `frontmatterQuoting` is present, post-process the gray-matter output: for each key in the set, regex-add quotes back around its value if gray-matter dropped them.

This is a heuristic fix, not a structural one. Trade-off: simpler than swapping the YAML engine entirely; might miss edge cases (multi-line values, special chars). Tests will cover the common cases (semver strings, dates, plain words).

### Validate subcommand (US-4.25)

Thin CLI wrapper around the existing `validateRefs` lib function. New file: `src/cli/validate.ts`. Plugs into `registerValidate(program)` from `src/cli/index.ts`. The FR-ref check is added as a NEW lib function `validateFrRefs(corpus)` (returns `{id, missingFr}[]`) so the lib stays the source of truth.

## File structure

```
packages/koni-docs/
├── package.json                       # M: bump 0.6.1 → 0.7.0, drop unist-util-visit
├── src/
│   ├── cli/
│   │   └── validate.ts                # NEW (US-4.25)
│   ├── lib/
│   │   ├── index.ts                   # M: drop serializeChangelog re-export, add mutation-contract comment, bump KONI_DOCS_LIB_VERSION
│   │   ├── corpus.ts                  # M: drop `recursive` param from readFolderMatter
│   │   ├── refs.ts                    # M: add validateFrRefs; switch FR lookup to findSectionStartingWith
│   │   ├── markdown/
│   │   │   └── sections.ts            # M: add findSectionStartingWith
│   │   ├── doc.ts                     # M: parseDoc + writeDoc YAML quoting preservation
│   │   └── changelog.ts               # M: drop serializeChangelog stub (or keep but unexport)
│   └── viewer/
│       ├── lib/
│       │   ├── config.ts              # NEW (US-4.22)
│       │   ├── corpus.ts              # M: read from config, add commit field to stories
│       │   └── reload-bus.ts          # NEW (US-4.21) — chokidar + EventEmitter
│       ├── pages/
│       │   ├── project.astro          # NEW (US-4.20)
│       │   └── __koni-docs/
│       │       └── reload.ts          # NEW (US-4.21) — SSE endpoint
│       └── layouts/
│           └── Layout.astro           # M: add EventSource subscribe when window.__KONI_DOCS_WATCH__
└── __tests__/
    ├── cli/
    │   └── validate.test.ts           # NEW
    ├── lib/
    │   ├── markdown/
    │   │   └── sections.test.ts       # M: add findSectionStartingWith tests
    │   ├── refs.test.ts               # M: add validateFrRefs tests
    │   └── doc.test.ts                # M: add YAML round-trip test
    └── viewer/
        └── config.test.ts             # NEW
```

## Tech-stack additions

| Dep | Already in tree? | Purpose |
|---|---|---|
| `chokidar` | yes (dependency since Pillar E) | live-reload file watcher |
| `js-yaml` | yes (via gray-matter) | YAML round-trip — already pulled in transitively, hoist to direct dep |

No new top-level deps. Drop `unist-util-visit` (unused).

## Cross-cutting acceptance

- Backward-compat: all existing 71 tests pass unchanged.
- New tests: ≥ 1 per US (counting US-4.21 viewer e2e, US-4.22 config zod schema, US-4.23 section helper, US-4.24 YAML round-trip, US-4.25 validate CLI). Target: 80+ tests on green.
- Type-check: `npm run typecheck` exit 0 (continues using current tsconfig).
- Install size: `npm pack --dry-run` reports `total files: ≤ 36` (vs current 34 — accounting for new viewer/lib + cli/validate files).
- Dogfood: `koni-docs validate` against this repo's own `docs/` exits 0 (no integrity errors).
- Manual smoke: `koni-docs preview docs --watch` — open browser, edit `docs/CHANGELOG.md` from a separate terminal, observe automatic reload.

## Risks and mitigations

**SSE compatibility with `@astrojs/node`.** Need to confirm the adapter streams `Response` bodies without buffering. Mitigation: prototype-spike first task; fall back to long-polling if blocked.

**YAML quoting heuristic misses edge case.** Trade-off accepted (Pillar B review noted this as Tier B fix). Add explicit test fixture for known sticky values (`version_shipped: "0.6.0"`, `priority: "P1"`). Document in CHANGELOG that complex YAML may still round-trip imperfectly.

**Live-reload bus leaks subscribers when tabs close.** SSE response writer needs `req.on('close')` handler to remove the subscriber. Mitigation: explicit cleanup in the endpoint handler; assert subscriber count returns to baseline in a unit test.

**Config file breaks existing repos.** Make it strictly optional + zod-validated. Missing fields default to current hardcoded values. Schema errors throw with clear path-to-fix message at startup, not at request time.

## Migration / consumer impact

- v0.6.x → v0.7.0: no API removals from the public `@koniverse/koni-docs/lib` surface (we are only removing internal dead code that was never documented). `serializeChangelog` re-export was a stub that always threw — its removal is observable only if someone called it expecting a throw, which is nobody.
- `--watch` flag was previously a no-op; v0.7.0 makes it actually work. Any caller passing `--watch` for forward-compat now gets the behavior they expected.
- Config file: opt-in only. No existing repo is forced to add one.

## Open questions

None — all decisions captured above. If the SSE prototype fails, fallback path (HTTP long-poll) is identified.

## Pillar G+ (out of scope)

- Astro 6 upgrade.
- Per-doc TOC anchor highlighting (the per-doc page has a static TOC; auto-scrollspy is a polish item).
- Search across docs (Fuse.js index or remote search service).
- Plugin system for `koni-docs` (supabase, nextjs plugins from EPIC-3).
