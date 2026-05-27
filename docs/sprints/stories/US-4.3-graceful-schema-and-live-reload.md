---
id: US-4.3
title: "Schema-graceful fallback + chokidar/SSE live reload"
epic: EPIC-4
status: ready
priority: P0
points: 5
sprint: sprint-2026-W23
version_shipped:
prd_ref: FR-17
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Make the viewer usable by **any** project that follows the koni-docs
shape, not only Koni-Skills. Two things land in this story:

1. **Schema detection** — if `<docs>/sprints/stories/*.md` exists with
   `id:` frontmatter, show the full Epic / Story dashboard; otherwise
   fall back to a plain "X docs · Y folders" landing page.
2. **Live reload** — `--watch` (default on TTY) watches `**/*.md` with
   chokidar and pushes `reload` events over SSE so the browser refreshes
   within ~200 ms of a save.

After this story the viewer works on a docs folder that has only a
`README.md` (no sprints, no stories) without throwing, and edits land
in the browser without a manual refresh.

## Background

The reference impl assumes a Koni sprint structure (epics, stories with
`epic`/`points`/`status`/`assignee` frontmatter). The viewer aspires to
be the default Koniverse docs preview tool — so it MUST run on minimal
docs folders too (e.g. early-stage projects that haven't adopted
sprints yet, or non-Koni repos experimenting with the structure).

Live reload is the second half of the "fast feedback loop" promise.
SSR (US-4.1) means edits land on the next request — but a developer
saving a file and switching back to the browser shouldn't have to
remember to hit `Cmd-R`. A 50-LOC chokidar + SSE pair gets us full-page
auto-reload without a full HMR stack.

## Acceptance criteria

- [ ] **AC-1** — **Given** a docs folder containing ONLY `README.md` (no
  `sprints/`),
  **When** `koni-docs-viewer <that-folder>` boots,
  **Then** the landing page renders the README link + a "1 doc · 0
  folders" summary without throwing.

- [ ] **AC-2** — **Given** a docs folder with `sprints/stories/*.md`
  files that each have `id:` frontmatter,
  **When** the server boots, **Then** the full Epic dashboard renders
  with epic counts + point totals matching the underlying files.

- [ ] **AC-3** — **Given** the docs folder has no `sprints/` subfolder,
  **When** the user navigates to `/project`,
  **Then** the server returns a 404 (not a 500 with a `cannot read
  property of undefined` stack).

- [ ] **AC-4** — **Given** `--watch` mode is on and the browser tab is
  open at `/`,
  **When** the user edits `docs/README.md` and saves,
  **Then** the browser auto-reloads within 200 ms and shows the new
  content. No manual refresh required.

- [ ] **AC-5** — **Given** `--no-watch` is passed,
  **When** the user edits a `.md` file,
  **Then** the browser does NOT auto-reload (manual `Cmd-R` still works
  to show the change because SSR reads disk fresh).

- [ ] **AC-6** — **Given** the SSE endpoint `/__koni/events` is open
  with multiple browser tabs,
  **When** a single `.md` edit fires,
  **Then** every connected tab reloads (broadcast, not single subscriber).

- [ ] **AC-7** — `packages/koni-docs-viewer/__tests__/fixtures/minimal-docs/`
  and `koni-sprints-docs/` exist and are used by a smoke test that
  boots the server against each fixture and asserts the dashboard
  branch.

## Tasks

- [ ] **TASK-4.3.1** — Schema detection helper (AC: 1, 2, 3)
  - [ ] `detectSchema(docsDir): 'koni-sprints' | 'plain'` in `src/utils/docs.ts`.
  - [ ] Returns `'koni-sprints'` only when `<docsDir>/sprints/stories/` exists AND ≥ 1 `.md` in it has `id:` frontmatter.
  - [ ] Cache result at module load (refresh only when `--watch` detects a sprint structure change — out of scope for v0.1).

- [ ] **TASK-4.3.2** — Make `extractAllUserStories` / `aggregateByEpic` graceful (AC: 1, 2)
  - [ ] Return `[]` (not throw) when `stories/` is missing.
  - [ ] Add unit-style assertion in the smoke test against `minimal-docs/`.

- [ ] **TASK-4.3.3** — Index page branching (AC: 1, 2)
  - [ ] `index.astro` checks `detectSchema(docsDir)`.
  - [ ] `koni-sprints` → existing dashboard.
  - [ ] `plain` → simple landing: "X docs · Y folders" + a top-level file list + folder cards.

- [ ] **TASK-4.3.4** — `/project` graceful 404 (AC: 3)
  - [ ] `project.astro` returns `Astro.response.status = 404` when schema is plain; render a "no sprint structure detected" message.

- [ ] **TASK-4.3.5** — Chokidar watcher (AC: 4, 5, 6)
  - [ ] `src/utils/watcher.ts` — `chokidar.watch(docsDir, { ignoreInitial: true })` on `**/*.md`, `**/*.mdx`.
  - [ ] In-process EventEmitter relays `add`/`change`/`unlink` events.

- [ ] **TASK-4.3.6** — SSE endpoint (AC: 4, 6)
  - [ ] `src/pages/__koni/events.ts` — write `Content-Type: text/event-stream`, keep connection open, broadcast `event: reload\ndata: <relpath>\n\n` per event.
  - [ ] Handle client disconnect (cleanup subscriber).

- [ ] **TASK-4.3.7** — Browser subscriber script (AC: 4, 5)
  - [ ] Inline script in `Layout.astro`, gated on `import.meta.env.WATCH === 'true'`.
  - [ ] `new EventSource('/__koni/events')` + reload on `reload` event.
  - [ ] CLI bin (US-4.2) sets `WATCH=true` env when `--watch` (default on TTY, off when stdout is piped or `--no-watch`).

- [ ] **TASK-4.3.8** — Test fixtures + smoke (AC: 1, 2, 7)
  - [ ] Create `__tests__/fixtures/minimal-docs/README.md`.
  - [ ] Create `__tests__/fixtures/koni-sprints-docs/{README.md,sprints/stories/US-1.1-...md,sprints/epics/EPIC-1.md}` — small but valid.
  - [ ] Add a Node test script that boots the server against each fixture and asserts the dashboard branch via fetch.

## Dev notes

### Architecture constraints

- **Schema is detected, never declared by environment**: a project's
  shape determines behavior, not a CLI flag. The optional
  `koni-docs.config.json` `schema: "koni-sprints" | "plain" | "auto"`
  field (US-4.2) is an *override*, default `"auto"`.
- **SSE not WebSockets**: SSE is one-way (server → client), trivial to
  set up, and Astro's standalone Node server supports it natively. No
  need for a separate WS lib.
- **Full-page reload, not HMR**: keeps the implementation small. Docs
  pages are stateless; full reload is fine.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-scaffold-and-ssr.md) — uses `resolveDocsDir`
  and the SSR routes.
- Builds on [US-4.2](US-4.2-cli-bin-and-config.md) — uses `--watch` /
  `--no-watch` flag + `WATCH` env var contract.
- Required by [US-4.4](US-4.4-dogfood-and-publish.md) — publish gate
  needs the graceful-fallback AC to pass against a synthetic minimal
  docs fixture.

### What we explicitly did NOT do

- **No partial DOM swap / HMR** — full page reload, deferred to v0.2 if
  reload flicker becomes annoying.
- **No watching of `koni-docs.config.{json,mjs}`** — config changes
  require a restart. Acceptable for a dev tool.
- **No schema = "deep search"** — we look only at `sprints/stories/` for
  detection. Projects with a different layout can declare via config
  (US-4.2 `schema:` field).

### References

- [Spec §6 Schema graceful fallback](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#6-schema-graceful-fallback)
- [Spec §9 Live-reload mechanism](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#9-live-reload-mechanism)
- [Plan Phase 4](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: PRD §8 FR-17](../../PRD.md#8-functional-requirements)
- chokidar: https://github.com/paulmillr/chokidar
- SSE on MDN: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `koni-docs-viewer __tests__/fixtures/minimal-docs/ --no-watch --port 5051`; `curl -s http://127.0.0.1:5051/ \| grep -c 'docs ·'` ≥ 1 |
| AC-2 | `koni-docs-viewer __tests__/fixtures/koni-sprints-docs/ --no-watch --port 5052`; `curl -s http://127.0.0.1:5052/ \| grep -c 'Epics'` ≥ 1 |
| AC-3 | from AC-1 setup: `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5051/project` returns 404 |
| AC-4 | manual: open `--watch` session in 2 browser tabs; save edit; both reload within 200 ms |
| AC-5 | `koni-docs-viewer ./docs --no-watch`; edit file; confirm no reload until manual refresh |
| AC-6 | covered by AC-4 manual check (two tabs) |
| AC-7 | `node packages/koni-docs-viewer/__tests__/smoke.mjs` exits 0 |

## Changelog entry

### Added
- Schema detection: `<docs>/sprints/stories/*.md` with `id:` frontmatter → Epic dashboard; otherwise plain "X docs · Y folders" landing.
- `--watch` mode with chokidar + Server-Sent Events at `/__koni/events`; full-page auto-reload on `.md` change.
- Test fixtures: `__tests__/fixtures/{minimal-docs,koni-sprints-docs}/` + smoke runner.

### Changed
- `extractAllUserStories` / `aggregateByEpic` now return `[]` instead of throwing when `sprints/stories/` is absent.
- `/project` returns 404 (not 500) when schema is plain.

**Commit**: <pending — fill at landing>

## Implementation notes

(empty until sprint pickup)

## Files modified

(empty until sprint pickup)

## Cross-references

- [PRD FR-17](../../PRD.md#8-functional-requirements)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [Spec §6, §9](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Plan Phase 4](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
