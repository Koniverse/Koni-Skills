# koni-docs-viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Pair with the spec [`../specs/2026-05-27-koni-docs-viewer-design.md`](../specs/2026-05-27-koni-docs-viewer-design.md).

**Goal:** Ship `@koniverse/docs-viewer@0.1.0` to npm — a globally-installable CLI that previews any `docs/` folder following the koni-docs structure. First consumer = this very repo (`Koni-Skills`), dogfooded via `npm run docs:preview`. EPIC home = [EPIC-4](../../sprints/epics/EPIC-4.md). Stories US-4.1 .. US-4.4 cover the four phases below.

**Architecture:** Extract the working Astro 4 docs preview from `Koni-Finance-Final` worktree, switch from static-build (`getStaticPaths`) to SSR (`@astrojs/node` standalone), de-couple the hard-coded monorepo paths, make the Koni-sprint dashboard schema-graceful, add a CLI bin, ship `dist/` in the npm tarball.

**Tech Stack:** Astro 4 SSR · `@astrojs/node` standalone · TypeScript · Tailwind v4 · `gray-matter` · `marked` · `shiki` · `chokidar` (Phase 4) · `node:util.parseArgs` for the CLI.

**Source:** `/Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/` (~85% reusable).

**Target structure:**
```
packages/koni-docs-viewer/
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── README.md
├── bin/
│   └── koni-docs-viewer.js
├── src/
│   ├── env.d.ts
│   ├── utils/{docs.ts, config.ts, watcher.ts}
│   ├── styles/global.css
│   ├── layouts/Layout.astro
│   ├── components/TreeNode.astro
│   └── pages/{index.astro, project.astro, docs/[...file].astro}
└── dist/                  ← built, shipped in tarball
```

---

## Phase 1 — Scaffold package + de-monorepo (US-4.1)

### Task 1.1: Create `packages/koni-docs-viewer/` skeleton

**Files:**
- Create: `packages/koni-docs-viewer/package.json`
- Create: `packages/koni-docs-viewer/tsconfig.json`
- Create: `packages/koni-docs-viewer/astro.config.mjs`
- Create: `packages/koni-docs-viewer/.gitignore`

- [ ] **Step 1**: Create directory skeleton.
  ```bash
  mkdir -p packages/koni-docs-viewer/{src/{utils,styles,layouts,components,pages/docs},bin}
  ```
- [ ] **Step 2**: Write `package.json` with `"name": "@koniverse/docs-viewer"`, `bin`, `files` allowlist, scripts (`build`, `dev`, `start`, `prepublishOnly`), peer-free runtime deps (astro, @astrojs/node, gray-matter, marked, shiki, chokidar — Phase 4).
- [ ] **Step 3**: Write `tsconfig.json` extending Astro's base, *no* `@workspace/*` references.
- [ ] **Step 4**: Write `astro.config.mjs` with `output: 'server'`, `adapter: node({ mode: 'standalone' })`, no `srcDir` override (default is `./src`).
- [ ] **Step 5**: `.gitignore` for `dist/`, `node_modules/`, `.astro/`.

### Task 1.2: Copy & re-home source files

**Files:**
- Copy: `src/utils/docs.ts`, `src/layouts/Layout.astro`, `src/components/TreeNode.astro`, `src/styles/global.css`, `src/pages/{index,project}.astro`, `src/pages/docs/[...file].astro`, `src/env.d.ts` from reference impl.

- [ ] **Step 1**: Copy files verbatim into `packages/koni-docs-viewer/src/`.
- [ ] **Step 2**: Replace `@/` import aliases with relative paths (or configure `paths` in `tsconfig.json` — pick one and stay consistent).
- [ ] **Step 3**: Strip `@workspace/typescript-config` dependency.
- [ ] **Step 4**: `cd packages/koni-docs-viewer && npm install && npm run build` — confirm it builds clean.

### Task 1.3: Verify scaffold

- [ ] **Step 1**: `node packages/koni-docs-viewer/dist/server/entry.mjs` boots the standalone server on the default port.
- [ ] **Step 2**: Hitting `http://127.0.0.1:4321/` returns *something* (the server reads from `cwd/docs` which won't exist yet inside `packages/`, so the page will be empty — that's fine for now).
- [ ] **Step 3**: Commit (`chore(viewer): scaffold packages/koni-docs-viewer with Astro SSR`).

---

## Phase 2 — SSR migration + path decoupling (US-4.1 continued)

### Task 2.1: Convert `[...file].astro` from static → SSR

**Files:**
- Edit: `packages/koni-docs-viewer/src/pages/docs/[...file].astro`

- [ ] **Step 1**: Delete the `getStaticPaths` block.
- [ ] **Step 2**: Read `Astro.params.file` instead. Validate the slug points to an existing file under the resolved `DOCS_DIR` (no `..` escape).
- [ ] **Step 3**: Return a 404 page (`Astro.response.status = 404`) when the slug doesn't resolve.
- [ ] **Step 4**: Verify in browser by hitting `/docs/README` against a sample docs folder.

### Task 2.2: Make `DOCS_DIR` runtime-configurable

**Files:**
- Edit: `packages/koni-docs-viewer/src/utils/docs.ts`

- [ ] **Step 1**: Replace the hard-coded `path.resolve(process.cwd(), '../../docs')` with a function that reads `process.env.KONI_DOCS_DIR` and falls back to `path.resolve(process.cwd(), 'docs')`.
- [ ] **Step 2**: Add a guard: throw a clear error if the resolved dir doesn't exist (CLI bin catches & prints).
- [ ] **Step 3**: Resolve once at module load; cache the value.

### Task 2.3: Smoke-test against this repo's docs

- [ ] **Step 1**: From repo root: `KONI_DOCS_DIR=$(pwd)/docs node packages/koni-docs-viewer/dist/server/entry.mjs`.
- [ ] **Step 2**: Open `http://127.0.0.1:4321/` — confirm the Koni-Skills epic dashboard renders (3 epics, 10 stories, point totals match `sprints/STATUS.md`).
- [ ] **Step 3**: Click into 3 random docs (`README`, `PRD`, `sprints/stories/US-1.1-koni-docs-initial-release`) — confirm cross-links, code blocks, and mermaid all render.
- [ ] **Step 4**: Edit `docs/README.md` (add a sentence), reload, confirm change is live without rebuild.
- [ ] **Step 5**: Commit (`feat(viewer): SSR mode + runtime-configurable docs path`).

---

## Phase 3 — CLI bin + config file (US-4.2)

### Task 3.1: Write `bin/koni-docs-viewer.js`

**Files:**
- Create: `packages/koni-docs-viewer/bin/koni-docs-viewer.js`

- [ ] **Step 1**: Shebang `#!/usr/bin/env node`.
- [ ] **Step 2**: Parse args with `node:util.parseArgs` — positional `PATH`, options `--port|-p`, `--host|-H`, `--open|-o`, `--watch|-w`, `--no-watch`, `--config|-c`, `--version`, `--help`.
- [ ] **Step 3**: `--help` prints the surface from spec §8. `--version` reads `package.json`.
- [ ] **Step 4**: Resolve docs dir: arg > `--config docsDir` > `$KONI_DOCS_DIR` > `$PWD/docs`.
- [ ] **Step 5**: Validate dir exists; if not, print clear error and exit 1.
- [ ] **Step 6**: Set `process.env.KONI_DOCS_DIR`, `process.env.HOST`, `process.env.PORT` (Astro Node adapter reads these).
- [ ] **Step 7**: `await import('../dist/server/entry.mjs')`.
- [ ] **Step 8**: If `--open`, spawn `open` / `xdg-open` / `start` to launch the browser.
- [ ] **Step 9**: `chmod +x bin/koni-docs-viewer.js`.

### Task 3.2: Wire `bin` in `package.json`

**Files:**
- Edit: `packages/koni-docs-viewer/package.json`

- [ ] **Step 1**: Add `"bin": { "koni-docs-viewer": "./bin/koni-docs-viewer.js" }`. (Unscoped CLI name even though the package is scoped — matches user-facing brief.)
- [ ] **Step 2**: `npm link` from package dir.
- [ ] **Step 3**: From repo root: `koni-docs-viewer --help` works; `koni-docs-viewer --port 5050 --open` boots, opens browser to `http://127.0.0.1:5050/`.
- [ ] **Step 4**: Commit (`feat(viewer): CLI bin with --port/--host/--open/--watch flags`).

### Task 3.3: Optional config file

**Files:**
- Create: `packages/koni-docs-viewer/src/utils/config.ts`

- [ ] **Step 1**: `loadConfig(cwd, explicitPath?)` — looks for `koni-docs.config.mjs` → `.json`, in that order; returns defaults merged with file contents.
- [ ] **Step 2**: Wire `title`, `topLevelOrder`, `folderOrder`, `hiddenFolders`, `schema` into `utils/docs.ts` (replace the hard-coded arrays).
- [ ] **Step 3**: Malformed config → `console.warn` + use defaults (never crash).
- [ ] **Step 4**: Test by adding a sample `koni-docs.config.json` to repo root, restart server, confirm `title` appears in sidebar header.
- [ ] **Step 5**: Commit (`feat(viewer): koni-docs.config.{json,mjs} support`).

---

## Phase 4 — Schema graceful + live reload (US-4.3)

### Task 4.1: Schema detection

**Files:**
- Edit: `packages/koni-docs-viewer/src/utils/docs.ts`
- Edit: `packages/koni-docs-viewer/src/pages/index.astro`
- Edit: `packages/koni-docs-viewer/src/pages/project.astro`

- [ ] **Step 1**: Add `detectSchema(docsDir): 'koni-sprints' | 'plain'` — returns `'koni-sprints'` only when `<docsDir>/sprints/stories/` exists AND at least one `.md` file in it has `id:` frontmatter.
- [ ] **Step 2**: `extractAllUserStories` returns `[]` (not throws) when `stories/` is missing.
- [ ] **Step 3**: `index.astro` switches: schema=koni-sprints → existing dashboard; schema=plain → simple "X docs · Y folders" card grid + top-level file links.
- [ ] **Step 4**: `project.astro` 404s when schema is plain.
- [ ] **Step 5**: Test against a synthetic minimal docs folder (one `README.md` only) — page renders without errors.
- [ ] **Step 6**: Test against this repo (schema=koni-sprints) — dashboard still works.

### Task 4.2: Live reload (`--watch`)

**Files:**
- Create: `packages/koni-docs-viewer/src/utils/watcher.ts`
- Create: `packages/koni-docs-viewer/src/pages/__koni/events.ts` (SSE endpoint)
- Edit: `packages/koni-docs-viewer/src/layouts/Layout.astro` (subscribe script)

- [ ] **Step 1**: `chokidar.watch(docsDir, { ignoreInitial: true })` — track `add`/`change`/`unlink` for `**/*.md` and `**/*.mdx`.
- [ ] **Step 2**: In-memory EventEmitter broadcasts to SSE subscribers.
- [ ] **Step 3**: `/__koni/events` keeps `Content-Type: text/event-stream`, writes `event: reload\ndata: <relpath>\n\n` on each change.
- [ ] **Step 4**: Inline script in `Layout.astro`, gated on `import.meta.env.WATCH === 'true'`, opens `EventSource('/__koni/events')` and calls `location.reload()` on `reload` events.
- [ ] **Step 5**: CLI bin passes `WATCH=true` env when `--watch` (default on TTY, off when piped).
- [ ] **Step 6**: Test: `koni-docs-viewer --watch`, edit `docs/README.md`, browser auto-refreshes within 200 ms.
- [ ] **Step 7**: Commit (`feat(viewer): schema-graceful fallback + chokidar/SSE live reload`).

---

## Phase 5 — Dogfood + publish (US-4.4)

### Task 5.1: Dogfood in this repo

**Files:**
- Edit: `package.json` (repo root — currently no scripts block; create one)
- Edit: `README.md` (add a "Preview docs locally" section)

- [ ] **Step 1**: Add `"scripts": { "docs:preview": "koni-docs-viewer" }` to repo-root `package.json` (after the viewer is `npm link`-ed or published).
- [ ] **Step 2**: Update `README.md` with usage snippet.
- [ ] **Step 3**: Update `skills/koni-docs/SKILL.md` §X with a "Preview docs locally" callout pointing at the viewer (this is a *skill-side* doc update; falls under koni-docs rules — bump SKILL.md version, log lesson if pattern emerges).
- [ ] **Step 4**: Commit (`docs: wire koni-docs-viewer dogfood into Koni-Skills repo`).

### Task 5.2: Publish prep

**Files:**
- Edit: `packages/koni-docs-viewer/package.json`
- Create: `packages/koni-docs-viewer/README.md`
- Create: `packages/koni-docs-viewer/LICENSE`

- [ ] **Step 1**: README.md with install + usage + config + screenshots (or ASCII description if no screenshots yet).
- [ ] **Step 2**: LICENSE (match Koni-Skills license — confirm with maintainer).
- [ ] **Step 3**: Confirm `"files"` allowlist: `["dist/", "bin/", "README.md", "LICENSE"]`. Run `npm pack --dry-run` and verify ≤ 5 MB.
- [ ] **Step 4**: Confirm `"prepublishOnly": "npm run build"` runs `astro build` cleanly.

### Task 5.3: Publish v0.1.0

- [ ] **Step 1**: Confirm `@koniverse` npm org exists and you have publish rights; create if needed (`npm org create koniverse`).
- [ ] **Step 2**: Confirm independent semver decision (spec §11.4 still open — default: independent).
- [ ] **Step 3**: `cd packages/koni-docs-viewer && npm publish --access public`.
- [ ] **Step 4**: Verify `npx @koniverse/docs-viewer@0.1.0` works in a fresh clone of `Koni-Skills` and (smoke-test) a fresh clone of `Koni-Finance-Final`.
- [ ] **Step 5**: Tag release `viewer-v0.1.0` (separate tag scheme to keep distinct from repo-level `VERSION`).
- [ ] **Step 6**: Add to repo-root `docs/CHANGELOG.md` under the next release entry: "`@koniverse/docs-viewer` v0.1.0 published — see `packages/koni-docs-viewer/`".

---

## Verification (final gate before declaring "done")

Run all of these against the final state. **Mark each `[x]` only after the command actually passes**, per RULE-10.

- [ ] **V1**: `npm pack --dry-run` in `packages/koni-docs-viewer/` shows tarball ≤ 5 MB.
- [ ] **V2**: `cd /tmp/empty && npx koni-docs-viewer .` fails *gracefully* with "no docs/ folder" (exit 1, clear error).
- [ ] **V3**: From `Koni-Skills` root: `npm run docs:preview` boots within 1.5 s.
- [ ] **V4**: Dashboard matches `sprints/STATUS.md` totals exactly: 3 epics, 1 backlog + 1 ready + 8 done = 10 stories.
- [ ] **V5**: Editing any `.md` then reloading shows the change without restart.
- [ ] **V6**: `--watch` mode auto-reloads the browser on `.md` edit within 200 ms.
- [ ] **V7**: `koni-docs-viewer --version` prints the published semver.
- [ ] **V8**: A docs folder with **no** `sprints/` renders the plain landing page without crashing.
- [ ] **V9**: `Koni-Finance-Final` swaps `apps/docs/` build for `npx koni-docs-viewer`; visual comparison shows no regression in the 5 most-trafficked pages.
- [ ] **V10**: `wc -l packages/koni-docs-viewer/src/**/*.{ts,astro}` — confirm we haven't bloated the ref impl significantly (target: within ±20%).

## Out of scope (parked for v0.2+)

- Full-text search.
- PDF export.
- Multi-repo aggregation (one viewer process previewing N folders).
- Auth / network-exposure hardening (beyond the `--host 0.0.0.0` warning).
- Plugin-skill awareness (e.g. rendering `koni-supabase` rules differently).
- Telemetry / usage analytics.

## References

- Companion spec: [`../specs/2026-05-27-koni-docs-viewer-design.md`](../specs/2026-05-27-koni-docs-viewer-design.md)
- Reference impl: `/Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/apps/docs/`
- Koni-docs skill (the artifact the viewer renders): [`../../../skills/koni-docs/SKILL.md`](../../../skills/koni-docs/SKILL.md)
- Astro Node adapter docs: https://docs.astro.build/en/guides/integrations-guide/node/
