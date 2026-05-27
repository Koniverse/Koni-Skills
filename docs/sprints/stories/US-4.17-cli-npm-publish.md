---
id: US-4.17
title: "Publish @koniverse/koni-docs@0.5.0 to npm"
epic: EPIC-4
status: review
priority: P1
points: 2
sprint: sprint-2026-W25
version_shipped: ""
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Publish `@koniverse/koni-docs@0.5.0` to the public npm registry, making the CLI binary installable via `npm install --save-dev @koniverse/koni-docs` and runnable via `npx koni-docs <subcommand>`.

## Background

Pillar D plan Task 7. Prep work (build, README, `npm pack` dry-run) was completed in the worktree. The actual `npm publish` was **deferred at user request** — credentials / @koniverse org access verification was not completed during this sprint. The package is ship-ready locally; publish is a single manual step away.

## Acceptance criteria

- [x] **AC-1** — `npm run build` produces a valid `dist/cli/index.mjs` with `#!/usr/bin/env node` shebang.
- [x] **AC-2** — `npm pack --dry-run` tarball excludes `__tests__/` and `src/`, includes `dist/`, `README.md`, `package.json`.
- [x] **AC-3** — `packages/koni-docs/README.md` ships with install + CLI/lib usage.
- [ ] **AC-4** — `npm publish --access public` returns success (status `+ @koniverse/koni-docs@0.5.0`). **DEFERRED** — awaiting npm credentials.

## Tasks

- [x] **TASK-4.17.1** — Verify build + tarball file list (AC: 1, 2)
- [x] **TASK-4.17.2** — Add README.md (AC: 3)
- [ ] **TASK-4.17.3** — Run `npm publish --access public` (AC: 4) — **BLOCKED**: requires `npm login` + @koniverse org publish rights

## Dev notes

### References

- [Pillar D plan §Task 7](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)
- Build artifact verified: tarball 34 KB, 24 files, includes `dist/**` + `README.md` + `package.json`.

### Deferral note

The publish step is gated on a real-world action (publishing to npm). It was deferred at user request during the Pillar D sprint. To complete:

```bash
cd packages/koni-docs
npm whoami                                # verify logged in
npm publish --access public               # ship to npm
```

When this step lands, mark AC-4 + TASK-4.17.3 as `[x]` and flip story status to `done`, set `version_shipped: "0.5.0"`.

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `head -1 packages/koni-docs/dist/cli/index.mjs` shows `#!/usr/bin/env node` |
| AC-2 | `cd packages/koni-docs && npm pack --dry-run 2>&1` shows expected file list |
| AC-3 | `test -f packages/koni-docs/README.md && echo ok` |
| AC-4 | `npm view @koniverse/koni-docs@0.5.0 version` returns `0.5.0` (after publish) |

## Changelog entry

(See CHANGELOG v0.5.0 entry — the npm publish line will be added when AC-4 lands.)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)
