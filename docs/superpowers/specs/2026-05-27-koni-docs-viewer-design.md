# koni-docs-viewer — Package Design Spec

**Date**: 2026-05-27
**Status**: Approved (decisions logged as [D11](../../CONTEXT.md))
**Target**: `packages/koni-docs-viewer/` (new) — publishable npm CLI as `@koniverse/docs-viewer`
**Reference impl (~85% done)**: `/Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/`

## 1. Purpose

`koni-docs-viewer` is a globally-installable npm CLI that renders the
[`docs/`](../../) folder of *any* Koniverse project (or any project that
follows the koni-docs structure) as a polished local web preview. Running

```bash
npx koni-docs-viewer            # one-shot, no install
# or
npm i -g koni-docs-viewer
koni-docs-viewer --open         # global install
```

inside a repo that has a `docs/` folder spins up a styled, dark-mode-ready
preview server with a file tree, breadcrumbs, syntax-highlighted code,
Mermaid diagrams, cross-`.md`-link rewriting, and — when sprint structure
is detected — an aggregate Epic / Story dashboard.

The viewer is a **companion artifact** to the [`koni-docs`](../../../skills/koni-docs/SKILL.md)
skill: it doesn't change docs, doesn't enforce rules, doesn't replace any
skill. It just makes the artifacts the skill produces *legible* to humans
without forcing a Markdown-to-HTML build into every consumer repo.

### Why a separate package (not a skill)

Skills under `skills/` are *instructions for AI agents*. The viewer is a
*runtime program for humans*. They have different lifecycles, different
distribution channels (npm vs `npx skills`), different update cadences,
and different consumers. Conflating them would force every koni-docs
consumer to depend on a 30–50 MB Astro runtime they don't want loaded
into agent context.

## 2. Goals & non-goals

### Goals (in scope)

1. **Zero-config preview** — `npx koni-docs-viewer` in any folder with
   `docs/` Just Works. No required config file. No build step on the
   consumer side.
2. **Schema-graceful** — if `docs/sprints/stories/` exists, show the
   Epic / Story dashboard; if not, fall back to a plain "X docs · Y
   folders" landing page. No hard-coded coupling to Koni-Skills.
3. **Live edits** — markdown edits land in the next page load with no
   rebuild. Optional `--watch` flag adds SSE auto-reload.
4. **Polished UX** — sidebar file tree, dark/light theme toggle,
   breadcrumbs, TOC, mermaid diagrams, shiki syntax highlighting.
5. **Dogfooded** — this very repo (Koni-Skills) consumes the viewer via
   `npm run docs:preview`, so the first end-to-end consumer is also the
   author.

### Non-goals (explicitly out of scope)

1. **Authoring UI** — viewer is read-only. No edit-in-browser, no save,
   no upload. Use your editor.
2. **Multi-repo / multi-tenant hosting** — one repo, one process.
3. **Search across docs** — v1 ships without full-text search. Browser
   `Cmd-F` is enough for v1. (Candidate for v2.)
4. **Authentication / auth** — viewer binds to `localhost` by default.
   Network exposure (`--host 0.0.0.0`) is opt-in with a printed warning.
5. **Plugin-skill rule enforcement** — that lives in `koni-docs` and its
   plugins; the viewer only displays content.
6. **Mobile-first design** — responsive sidebar exists (from ref impl),
   but the primary surface is desktop.

## 3. Architecture

```
packages/koni-docs-viewer/
├── package.json                ← name, bin, files allowlist, scripts
├── astro.config.mjs            ← output: 'server', adapter: @astrojs/node
├── tsconfig.json
├── bin/
│   └── koni-docs-viewer.js     ← CLI entry — arg parse, env, spawn server
├── src/
│   ├── env.d.ts
│   ├── utils/
│   │   ├── docs.ts             ← scan + render (extracted from ref impl)
│   │   ├── config.ts           ← load koni-docs.config.{json,mjs}
│   │   └── watcher.ts          ← (Phase 4) chokidar + SSE emitter
│   ├── styles/global.css
│   ├── layouts/Layout.astro
│   ├── components/TreeNode.astro
│   └── pages/
│       ├── index.astro         ← dashboard (graceful fallback)
│       ├── project.astro       ← stories tracker (hidden if no stories)
│       └── docs/[...file].astro ← SSR markdown renderer
└── dist/                       ← built server bundle (shipped in npm tarball)
```

### Runtime mode: Astro SSR, not static

The reference impl uses `getStaticPaths`, which forces a full rebuild on
every edit. The viewer **must** run Astro in `output: 'server'` mode with
`@astrojs/node` (standalone). Each request reads disk fresh; markdown
edits land on the next browser refresh with zero rebuild.

### Process model

```
user runs: koni-docs-viewer [path] [--port 4321] [--host 127.0.0.1] [--open] [--watch]
   │
   ├─ bin/koni-docs-viewer.js
   │    1. resolve docs dir: arg > KONI_DOCS_DIR > $PWD/docs
   │    2. load config (optional)
   │    3. set process.env so SSR pages see the resolved values
   │    4. require('../dist/server/entry.mjs')
   │
   ├─ Astro standalone server boots on PORT
   │    routes:
   │      GET /              → dashboard (graceful: stories OR plain)
   │      GET /project       → stories tracker (404 if no stories)
   │      GET /docs/<slug>   → SSR markdown page
   │      GET /__koni/events → SSE stream (when --watch)
   │
   └─ (--open) opens the browser to http://HOST:PORT
```

### Why Astro (vs Express + vanilla SPA)

The reference impl already invested heavily in Astro components, theming,
the tree component, the dashboard, the mermaid client, the link rewriter.
Throwing it away for "lighter" Express would be ~3 weeks of UI rewrite
for marginal bundle savings. Astro SSR is **the cheapest path to a
polished v1**. If bundle becomes a problem later, `utils/docs.ts` is
already framework-agnostic and can be reused under any frontend.

## 4. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-V1 | `npx koni-docs-viewer` resolves docs from `$PWD/docs` (no flag needed) | P0 |
| FR-V2 | `koni-docs-viewer <path>` overrides the resolved docs path | P0 |
| FR-V3 | `--port` / `--host` / `--open` / `--watch` flags | P0 |
| FR-V4 | Astro SSR renders markdown on every request — no rebuild | P0 |
| FR-V5 | Sidebar file tree with folder collapse + active highlight | P0 |
| FR-V6 | Breadcrumbs + on-this-page TOC for `h2`/`h3` | P0 |
| FR-V7 | Cross-`.md` link rewriting (relative resolution → `/docs/<slug>`) | P0 |
| FR-V8 | Syntax highlighting (shiki, dark+light) | P0 |
| FR-V9 | Mermaid diagrams (client CDN) | P1 |
| FR-V10 | Schema detection — Epic dashboard renders only if `docs/sprints/stories/*.md` exists with `id:` frontmatter | P0 |
| FR-V11 | Plain-mode landing page when no sprint schema detected (X docs · Y folders + top-level links) | P0 |
| FR-V12 | Optional `koni-docs.config.{json,mjs}` for title, ordering overrides, hidden folders | P1 |
| FR-V13 | `--watch` adds chokidar + SSE → browser auto-reload on `.md` change | P1 |
| FR-V14 | `koni-docs-viewer --version` and `--help` print sane output | P1 |
| FR-V15 | npm `prepublishOnly` runs `astro build` so `dist/` is always fresh | P0 |
| FR-V16 | Dogfood: `package.json` at repo root gains `docs:preview` script | P1 |

## 5. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-V1 | Cold-start time (CLI invoke → server listening) | ≤ 1.5 s |
| NFR-V2 | First request render (with shiki warmup) | ≤ 800 ms |
| NFR-V3 | Subsequent request render | ≤ 80 ms |
| NFR-V4 | Installed package size (tarball) | ≤ 5 MB |
| NFR-V5 | Installed `node_modules/koni-docs-viewer` size | ≤ 60 MB |
| NFR-V6 | Node version | ≥ 18.17 (Astro 4 minimum) |
| NFR-V7 | No required network access at runtime (Mermaid CDN is a soft dep) | — |

## 6. Schema graceful fallback

The reference impl hard-codes sprint-specific fields (`epic`, `points`,
`assignee`, `status`, `version_shipped`, ...). The viewer **must
detect** the schema at scan time and gracefully degrade:

| Detection signal | Behavior |
|---|---|
| `<docs>/sprints/stories/*.md` exists AND ≥ 1 file has `id:` frontmatter | Show full Epic dashboard + `/project` route |
| Only `<docs>/sprints/` exists (no `stories/` subfolder) | Show stripped dashboard (no story table) + hide `/project` |
| No `sprints/` folder | Plain landing page: `X docs · Y folders` + ordered top-level links + folder cards |

The current `extractAllUserStories()` + `aggregateByEpic()` move into a
`maybe…` variant that returns `null` on missing schema rather than
throwing. `index.astro` switches on `stories === null`.

## 7. Config file (optional)

`koni-docs.config.json` or `.mjs` at repo root:

```jsonc
{
  "title": "Koni Skills Docs",
  "docsDir": "docs",
  "topLevelOrder": ["README","BRIEF","PRD","ARCHITECTURE","CONTEXT","SETUP","CHANGELOG","LESSONS"],
  "folderOrder": ["sprints","decisions","superpowers","dev","reference"],
  "hiddenFolders": ["audit","_archive_bmad","node_modules"],
  "schema": "auto"
}
```

- `title` — appears in `<title>` and sidebar header. Default: `"Docs"`.
- `docsDir` — override resolved docs path (relative to repo root). CLI
  arg still wins.
- `topLevelOrder` / `folderOrder` — replace the hard-coded arrays
  currently in `utils/docs.ts`.
- `hiddenFolders` — appended to the built-in exclusion list (`.git`,
  `node_modules`, dotfiles).
- `schema` — `"auto"` (default), `"koni-sprints"`, or `"plain"`.

Config loading is **strict-optional**: missing file = use defaults.
Malformed file = print warning + use defaults (never crash).

## 8. CLI surface

```
koni-docs-viewer [PATH] [options]

Arguments
  PATH                 Path to docs folder (default: ./docs from cwd)

Options
  -p, --port <n>       Port (default: 4321)
  -H, --host <h>       Host (default: 127.0.0.1)
  -o, --open           Open browser on start
  -w, --watch          Auto-reload browser on .md change (default: on for TTY)
      --no-watch       Disable watch even on TTY
  -c, --config <file>  Path to koni-docs.config.{json,mjs}
      --version        Print version
  -h, --help           Print this help
```

CLI is implemented with **`node:util.parseArgs`** — no external dep,
matches the "no required runtime deps beyond Astro" goal.

## 9. Live-reload mechanism

When `--watch` is on:

1. `chokidar.watch(docsDir, { ignoreInitial: true })` watches `**/*.md`.
2. SSE endpoint `/__koni/events` keeps an open connection per browser tab.
3. On `change`/`add`/`unlink`, server sends `event: reload` to all
   subscribers.
4. A tiny inline script in `Layout.astro` (gated on `meta` tag) subscribes
   and calls `location.reload()` on `reload` events.

No HMR, no module graph — full page reload is fine for a docs viewer
and keeps the implementation under 50 lines.

## 10. Distribution & publish flow

1. `package.json` declares `"name": "koni-docs-viewer"` (unscoped) or
   `"@koniverse/docs-viewer"` (scoped — decision deferred to plan).
2. `"files": ["dist/", "bin/", "README.md", "LICENSE"]` keeps the tarball
   lean — source `.astro` files are *not* shipped.
3. `"prepublishOnly": "npm run build"` runs `astro build` before publish.
4. Initial publish: `npm publish --access public` (or `--access restricted`
   if Koniverse-internal — decision deferred).
5. Versioning: independent semver from Koni-Skills repo. The viewer's
   `VERSION` lives inside `packages/koni-docs-viewer/package.json`, not
   the repo-root `VERSION` (which tracks the skill catalog).

## 11. Decisions resolved + remaining open questions

### Resolved (2026-05-27, see [CONTEXT D11](../../CONTEXT.md))

1. ✅ **Package name** → `@koniverse/docs-viewer` (scoped). Cleaner
   namespace; gates publish under the Koniverse npm org.
2. ✅ **Where in the repo** → `packages/koni-docs-viewer/`. Distinguishes
   "publishable code" from "agent instructions in `skills/`".
3. ✅ **EPIC home** → new [**EPIC-4** (Docs preview tooling)](../../sprints/epics/EPIC-4.md).
   Viewer is a CLI, not a "Koniverse skill" per PRD §1.

### Still open (for `/plan-eng-review`)

4. **Independent versioning**: viewer semver vs lock-stepped with
   Koni-Skills `VERSION`. Lean: **independent** — viewer evolves on its
   own cadence, ships under `packages/koni-docs-viewer/package.json`.
5. **Mermaid CDN vs bundled**: ref impl loads from `cdn.jsdelivr.net`.
   Offline-friendly mode would require bundling (~600 KB) — opt-in via
   config? Lean: keep CDN for v0.1, add `{ offline: true }` config for v0.2.
6. **Tailwind v4 future-proofing**: ref impl uses TW v4 + PostCSS. Keep,
   or switch to vanilla CSS to drop the build-time dep? Lean: keep TW v4.

## 12. Acceptance criteria (rolls up into the user stories)

- [ ] **AC-1** — Running `npx koni-docs-viewer` in this repo's root
  serves a working preview at `http://127.0.0.1:4321` within 1.5 s.
- [ ] **AC-2** — Sidebar renders all 21 markdown files currently in
  `docs/`, sorted per `topLevelOrder` + `folderOrder`.
- [ ] **AC-3** — Epic dashboard renders all 3 epics + 10 stories with
  correct point totals and completion % (matches `sprints/STATUS.md`).
- [ ] **AC-4** — Editing `docs/README.md` and reloading shows the change
  with no rebuild.
- [ ] **AC-5** — Running `koni-docs-viewer` in a folder with **no**
  `sprints/` subfolder shows the plain landing page without crashing.
- [ ] **AC-6** — `npm pack` tarball is ≤ 5 MB.
- [ ] **AC-7** — `koni-docs-viewer --help` and `--version` print sane
  output.
- [ ] **AC-8** — A second consumer repo (e.g. `Koni-Finance-Final`)
  swaps its in-repo `apps/docs/` for `npx koni-docs-viewer` without
  visual regression.

## 13. References

- Reference impl: `Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/`
- Companion plan: [`../plans/2026-05-27-koni-docs-viewer-implementation.md`](../plans/2026-05-27-koni-docs-viewer-implementation.md)
- PRD FR-10 candidate: [`../../PRD.md#8-functional-requirements`](../../PRD.md#8-functional-requirements)
- Skill that this complements: [`../../../skills/koni-docs/SKILL.md`](../../../skills/koni-docs/SKILL.md)
- Astro Node adapter: https://docs.astro.build/en/guides/integrations-guide/node/
