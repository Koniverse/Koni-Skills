---
id: US-4.4
title: "Dogfood in Koni-Skills + publish @koniverse/docs-viewer v0.1.0"
epic: EPIC-4
status: ready
priority: P1
points: 3
sprint: sprint-2026-W23
version_shipped:
prd_ref: FR-18
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Close EPIC-4 by (a) dogfooding the viewer on its own home repo
(`npm run docs:preview` in Koni-Skills boots the local server) and
(b) publishing `@koniverse/docs-viewer@0.1.0` to npm so any Koniverse
project can `npx @koniverse/docs-viewer`. Smoke-test the published
package against `Koni-Finance-Final` to confirm the viewer is a true
drop-in replacement for its in-repo `apps/docs/`.

## Background

Per the Dogfood First philosophy (PRD §1.5), the Koni-Skills repo MUST
consume what it ships. After US-4.1/4.2/4.3 land, the viewer works as
a CLI but is not yet ergonomic to use against this repo (still requires
`packages/koni-docs-viewer/bin/koni-docs-viewer.js` invocation post-link).
This story adds the `docs:preview` npm script + README usage + skill
SKILL.md callout, then runs the publish flow.

Publish is **gated** on:
1. `npm pack --dry-run` showing tarball ≤ 5 MB (NFR-V4).
2. Tarball boots successfully when extracted into a clean `node_modules`.
3. `@koniverse` npm org exists with publish rights.

If gates (1) or (2) fail, this story stays in-progress until fixed —
**no `pending` commit shortcuts** (RULE-2).

## Acceptance criteria

- [ ] **AC-1** — **Given** the repo's `package.json` includes
  `"scripts": { "docs:preview": "koni-docs-viewer" }`,
  **When** the user runs `npm run docs:preview` from repo root,
  **Then** the viewer boots and serves this repo's `docs/` at
  `http://127.0.0.1:4321/` within 1.5 s.

- [ ] **AC-2** — **Given** the package has a `README.md` with install +
  usage + config + dogfood example,
  **When** a reader lands on the npm registry page,
  **Then** they can copy-paste their way to a working preview in under
  60 seconds without reading source.

- [ ] **AC-3** — `npm pack --dry-run` inside
  `packages/koni-docs-viewer/` shows a tarball ≤ 5 MB (NFR-V4) and the
  `files` allowlist limits content to `dist/`, `bin/`, `README.md`,
  `LICENSE`.

- [ ] **AC-4** — **Given** the `@koniverse` npm org exists and the
  maintainer has publish rights,
  **When** `npm publish --access public` runs from inside
  `packages/koni-docs-viewer/`,
  **Then** the package appears at
  `https://www.npmjs.com/package/@koniverse/docs-viewer` with version
  `0.1.0`.

- [ ] **AC-5** — **Given** the published package,
  **When** the user runs `npx @koniverse/docs-viewer@0.1.0` in a freshly
  cloned `Koni-Skills` repo,
  **Then** the viewer boots and renders the dashboard correctly — no
  local `npm link` needed.

- [ ] **AC-6** — **Given** the published package,
  **When** the user runs `npx @koniverse/docs-viewer@0.1.0` inside
  `Koni-Finance-Final`'s repo root,
  **Then** the viewer renders the docs there with no visual regression
  compared to that repo's in-repo `apps/docs/` (manual side-by-side check
  on 5 most-trafficked pages).

- [ ] **AC-7** — Repo-root `docs/CHANGELOG.md` gains an entry under the
  next release header noting "`@koniverse/docs-viewer` v0.1.0 published —
  see `packages/koni-docs-viewer/`".

- [ ] **AC-8** — `skills/koni-docs/SKILL.md` gets a "Preview docs
  locally" callout linking to `@koniverse/docs-viewer`. SKILL.md
  body stays ≤ 500 lines (NFR-2 of EPIC-1).

## Tasks

- [ ] **TASK-4.4.1** — Dogfood wiring (AC: 1, 7, 8)
  - [ ] Add `"scripts": { "docs:preview": "koni-docs-viewer" }` to repo-root `package.json`. Create scripts block if it doesn't exist.
  - [ ] Add a "Preview docs locally" section to repo-root `README.md` with the npx + `npm run docs:preview` commands.
  - [ ] Add a "Preview docs locally" callout to `skills/koni-docs/SKILL.md` (small — pointer only, full docs in viewer README).

- [ ] **TASK-4.4.2** — Publish prep (AC: 2, 3)
  - [ ] Write `packages/koni-docs-viewer/README.md` (install, usage, config schema, screenshots-or-ASCII, troubleshooting).
  - [ ] Add `packages/koni-docs-viewer/LICENSE` (match Koni-Skills license — confirm with maintainer).
  - [ ] Confirm `"files": ["dist/", "bin/", "README.md", "LICENSE"]`.
  - [ ] Confirm `"prepublishOnly": "npm run build"` runs `astro build` cleanly.
  - [ ] `npm pack --dry-run` — assert tarball ≤ 5 MB.

- [ ] **TASK-4.4.3** — Publish (AC: 4)
  - [ ] Verify `@koniverse` npm org exists; create with `npm org create koniverse` if not.
  - [ ] Confirm the maintainer is in the org with publish rights.
  - [ ] `cd packages/koni-docs-viewer && npm publish --access public`.
  - [ ] Tag `viewer-v0.1.0` in git: `git tag viewer-v0.1.0 && git push origin viewer-v0.1.0`.

- [ ] **TASK-4.4.4** — Smoke tests on published artifact (AC: 5, 6)
  - [ ] In a fresh clone of `Koni-Skills`: `npx @koniverse/docs-viewer@0.1.0 --open`. Confirm dashboard.
  - [ ] In a fresh clone of `Koni-Finance-Final`: `npx @koniverse/docs-viewer@0.1.0 --open`. Side-by-side compare to that repo's in-repo `apps/docs/` on 5 pages: home, README, PRD, ARCHITECTURE, a US-* story.
  - [ ] Note any regressions in Implementation notes — file follow-up issues if any.

- [ ] **TASK-4.4.5** — Changelog + epic close (AC: 7)
  - [ ] Add CHANGELOG entry under next release header.
  - [ ] Flip EPIC-4 frontmatter `status: backlog → done` only when ALL four stories are `done`.

## Dev notes

### Architecture constraints

- **Independent semver** (spec §11.4 open question, default-leaning):
  `@koniverse/docs-viewer` ships its own semver in
  `packages/koni-docs-viewer/package.json`. The repo-root `VERSION` still
  tracks the **skill catalog** version. The two evolve independently.
  This story commits to that default unless the user overrides during
  pickup.
- **Publish under public access** — even though `@koniverse` is a
  scoped namespace, the package is published publicly so `npx` works
  without auth.

### Cross-story dependencies

- Builds on US-4.1 / 4.2 / 4.3 — all three must be done before this
  story can publish.
- Sibling: none (this story closes the epic).

### What we explicitly did NOT do

- **No CI publish gate** — manual `npm publish` for v0.1.0. CI/GHA wiring
  is a v0.2 candidate.
- **No prerelease channel** (`@koniverse/docs-viewer@next`) — single
  stable line for v0.1. Add `next` channel when the cadence demands it.
- **No telemetry / usage analytics** — out of scope (spec §2 non-goals).

### References

- [Spec §10 Distribution & publish flow](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md#10-distribution--publish-flow)
- [Plan Phase 5](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
- [Source: PRD §8 FR-18](../../PRD.md#8-functional-requirements)
- npm scoped packages: https://docs.npmjs.com/cli/v10/using-npm/scope

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `npm run docs:preview` from repo root → server up within 1.5 s; `curl -s http://127.0.0.1:4321/ \| head -c 200` returns HTML |
| AC-2 | manual: read `packages/koni-docs-viewer/README.md`; confirm "60 second to first preview" path |
| AC-3 | `cd packages/koni-docs-viewer && npm pack --dry-run \| tail` — tarball size ≤ 5 MB |
| AC-4 | `npm view @koniverse/docs-viewer version` returns `0.1.0` |
| AC-5 | in a fresh clone: `npx @koniverse/docs-viewer@0.1.0 --port 5060 &` then `curl http://127.0.0.1:5060/` returns 200 |
| AC-6 | manual side-by-side on 5 pages in `Koni-Finance-Final` |
| AC-7 | `grep -c '@koniverse/docs-viewer' docs/CHANGELOG.md` ≥ 1 |
| AC-8 | `grep -c 'koni-docs-viewer\|docs-viewer' skills/koni-docs/SKILL.md` ≥ 1; `wc -l skills/koni-docs/SKILL.md` ≤ 500 |

## Changelog entry

### Added
- `@koniverse/docs-viewer` v0.1.0 published to npm — first Koniverse package outside the `koni-docs` skill. See `packages/koni-docs-viewer/`.
- Dogfood: `npm run docs:preview` in Koni-Skills repo boots a local preview of this repo's `docs/`.
- Skill cross-reference: `skills/koni-docs/SKILL.md` now points readers at the viewer for local doc preview.

**Commit**: <pending — fill at landing>

## Implementation notes

(empty until sprint pickup)

## Files modified

(empty until sprint pickup)

## Cross-references

- [PRD FR-18](../../PRD.md#8-functional-requirements)
- [Epic EPIC-4](../epics/EPIC-4.md)
- [Spec §10](../../superpowers/specs/2026-05-27-koni-docs-viewer-design.md)
- [Plan Phase 5](../../superpowers/plans/2026-05-27-koni-docs-viewer-implementation.md)
