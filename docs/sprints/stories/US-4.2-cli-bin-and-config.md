---
id: US-4.2
title: "CLI bin + koni-docs.config.{json,mjs} support"
epic: EPIC-4
status: ready
priority: P0
points: 5
sprint: sprint-2026-W23
version_shipped:
prd_ref: FR-16
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Make the viewer usable as a true CLI. After this story, a Koniverse
engineer can run `koni-docs-viewer` (after `npm link` or, post-publish,
via `npx @koniverse/docs-viewer`) from any project root and see their
docs at `http://127.0.0.1:4321/`. CLI flags cover the common dev knobs
(`--port`, `--host`, `--open`, `--watch`, `--config`), and an optional
`koni-docs.config.{json,mjs}` lets repos override title and ordering
without forking the package.

## Background

US-4.1 produces a runnable server bundle but boot path is "set env vars
manually + `node dist/server/entry.mjs`" — fine for testing, terrible
for a published CLI. This story closes the UX gap.

CLI is implemented with `node:util.parseArgs` (Node 18.17+) to avoid an
external dep — matches the [NFR-V6](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#5-non-functional-requirements)
minimum Node version and keeps the install footprint lean.

Config file is **strict-optional**: a missing file uses defaults, a
malformed file warns and falls back to defaults (never crashes). This is
deliberate — the viewer should never break the developer's flow because
they typo'd a JSON file.

## Acceptance criteria

- [ ] **AC-1** — **Given** the bin is `npm link`-ed,
  **When** the user runs `koni-docs-viewer --help`,
  **Then** the output lists positional `PATH` argument and all options
  (`--port`, `--host`, `--open`, `--watch`, `--no-watch`, `--config`,
  `--version`, `--help`) with one-line descriptions.

- [ ] **AC-2** — **Given** `koni-docs-viewer --version`,
  **When** invoked, **Then** the output is the `version` from
  `packages/koni-docs-viewer/package.json`.

- [ ] **AC-3** — **Given** the user runs `koni-docs-viewer ./docs --port 5050 --open`,
  **When** the command executes,
  **Then** the server boots on port 5050 within 1.5 s, the browser
  opens to `http://127.0.0.1:5050/`, and the page renders the docs hub.

- [ ] **AC-4** — **Given** the user runs `koni-docs-viewer ./nope`
  where `./nope` does not exist,
  **When** the command executes,
  **Then** the process prints a clear error (`error: docs directory not
  found: ./nope`) and exits with code 1. No stack trace.

- [ ] **AC-5** — **Given** a `koni-docs.config.json` exists at the repo
  root with `{ "title": "Koni Skills Docs" }`,
  **When** the server boots, **Then** the sidebar header shows
  "Koni Skills Docs" instead of the default "Docs".

- [ ] **AC-6** — **Given** a malformed `koni-docs.config.json`
  (invalid JSON),
  **When** the server boots,
  **Then** stderr shows `warn: koni-docs.config.json is malformed
  (<error>) — using defaults`, the server still boots successfully, and
  the page renders with default settings.

- [ ] **AC-7** — Resolution order documented and verified:
  CLI positional arg > `--config docsDir` > `KONI_DOCS_DIR` env >
  `$PWD/docs`.

## Tasks

- [ ] **TASK-4.2.1** — Write `bin/koni-docs-viewer.js` (AC: 1, 2, 3, 4, 7)
  - [ ] Shebang `#!/usr/bin/env node`.
  - [ ] `parseArgs` configuration with all flags from spec §8.
  - [ ] `--help` and `--version` short-circuit before booting the server.
  - [ ] Resolve docs dir per AC-7; validate existence; print clear error on miss.
  - [ ] Set `process.env.KONI_DOCS_DIR`, `process.env.HOST`, `process.env.PORT` so the Astro Node adapter picks them up.
  - [ ] `await import('../dist/server/entry.mjs')` to boot the SSR server.
  - [ ] `--open` spawns `open` (macOS) / `xdg-open` (Linux) / `start` (Windows) to launch the browser.
  - [ ] `chmod +x bin/koni-docs-viewer.js`.

- [ ] **TASK-4.2.2** — Wire `bin` in `package.json` (AC: 1, 3)
  - [ ] Add `"bin": { "koni-docs-viewer": "./bin/koni-docs-viewer.js" }`.
  - [ ] `npm link` from `packages/koni-docs-viewer/`.
  - [ ] Confirm `which koni-docs-viewer` resolves and `koni-docs-viewer --help` works from any cwd.

- [ ] **TASK-4.2.3** — `src/utils/config.ts` config loader (AC: 5, 6, 7)
  - [ ] `loadConfig(cwd, explicitPath?)` — looks for `koni-docs.config.mjs` then `.json`.
  - [ ] Returns defaults merged with file contents.
  - [ ] Wraps file read + parse in try/catch; `console.warn` + return defaults on failure.
  - [ ] Schema: `{ title, docsDir, topLevelOrder[], folderOrder[], hiddenFolders[], schema }` (defaults from spec §7).

- [ ] **TASK-4.2.4** — Wire config into `utils/docs.ts` (AC: 5)
  - [ ] Replace the hard-coded `TOP_LEVEL_ORDER` and `FOLDER_ORDER` arrays with values from the loaded config.
  - [ ] Pass `title` through to `Layout.astro` as a prop / locals.
  - [ ] Apply `hiddenFolders` in `scanDocFiles` (additive to the built-in `.git`/`node_modules`/dotfile exclusions).

- [ ] **TASK-4.2.5** — Smoke-test malformed config (AC: 6)
  - [ ] Drop a malformed `koni-docs.config.json` (e.g. `{ bad json`) into the repo root.
  - [ ] Boot the server; confirm warning + successful render.
  - [ ] Remove the file after the test.

## Dev notes

### Architecture constraints

- **Strict-optional config**: never crash on missing/malformed config —
  the viewer is a dev tool and must not break the developer's flow.
- **No external CLI lib** (no `commander`, `yargs`, `meow`): `node:util.parseArgs`
  is sufficient for this surface and keeps NFR-V4/V5 tarball size in budget.
- **Astro Node adapter env contract**: the standalone adapter reads
  `HOST` and `PORT` from `process.env`. Our CLI MUST set these BEFORE
  importing the entry module.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-scaffold-and-ssr.md) — that story produces
  `dist/server/entry.mjs` and the `resolveDocsDir` helper.
- Required by [US-4.3](US-4.3-graceful-schema-and-live-reload.md) —
  `--watch` flag handling is added here; the watcher/SSE implementation
  comes from US-4.3.
- Required by [US-4.4](US-4.4-dogfood-and-publish.md) — `npm run
  docs:preview` invokes this CLI.

### What we explicitly did NOT do

- **No interactive prompts / TUI** — the CLI is one-shot. If `docs/` is
  missing we print and exit, not prompt to create.
- **No global state between flags and config**: flags always win over
  config (per AC-7), so the precedence is explicit.

### References

- [Spec §7 Config file](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#7-config-file-optional)
- [Spec §8 CLI surface](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#8-cli-surface)
- [Plan Phase 3](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: PRD §8 FR-16](../../PRD.md#8-functional-requirements)
- Node `parseArgs`: https://nodejs.org/api/util.html#utilparseargsconfig

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `koni-docs-viewer --help` lists all 8 flags |
| AC-2 | `koni-docs-viewer --version` matches `node -p "require('./packages/koni-docs-viewer/package.json').version"` |
| AC-3 | `koni-docs-viewer ./docs --port 5050 --open` boots; `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5050/` returns 200 |
| AC-4 | `koni-docs-viewer ./nope; echo $?` prints clear error and exits 1 |
| AC-5 | with `koni-docs.config.json` present, `curl -s http://127.0.0.1:4321/ \| grep -c 'Koni Skills Docs'` returns ≥ 1 |
| AC-6 | with malformed config, server still returns 200 + stderr contains `malformed` |
| AC-7 | manual: walk the 4-step precedence and confirm each step wins over the next |

## Changelog entry

### Added
- `bin/koni-docs-viewer.js` — CLI entry with `--port`, `--host`, `--open`, `--watch`, `--config`, `--version`, `--help`.
- `koni-docs.config.{json,mjs}` strict-optional config support: title, docsDir, top-level + folder ordering, hidden folders.

**Commit**: <pending — fill at landing>

## Implementation notes

(empty until sprint pickup)

## Files modified

(empty until sprint pickup)

## Cross-references

- [PRD FR-16](../../PRD.md#8-functional-requirements)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [Spec §7-§8](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Plan Phase 3](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
