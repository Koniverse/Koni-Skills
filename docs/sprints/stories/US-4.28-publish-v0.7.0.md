---
id: US-4.28
title: "Publish @koniverse/koni-docs@0.7.0 to npm"
epic: EPIC-4
status: in-progress
priority: P2
points: 1
sprint: sprint-2026-W26
version_shipped: ""
assignee: saltict
commit: pending
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Publish the Pillar F release of `@koniverse/koni-docs` to npm at version
`0.7.0` and verify a fresh global install picks it up. Manual gate — runs
only after the PR is merged and a maintainer has npm publish credentials
available.

## Acceptance criteria

- [ ] **AC-1** — **Given** a clean working tree at the merge commit,
  **When** `npm publish --access public` runs in
  `packages/koni-docs/`, **Then** the publish succeeds without errors.
- [ ] **AC-2** — **Given** the publish completes, **When**
  `npm view @koniverse/koni-docs version` runs, **Then** it reports
  `0.7.0`.
- [ ] **AC-3** — **Given** a fresh global install
  (`npm i -g @koniverse/koni-docs@0.7.0`), **When**
  `koni-docs --version` runs, **Then** it reports `0.7.0`.

## Tasks

- [ ] **TASK-4.28.1** — Verify `npm pack --dry-run` tarball contents are clean (AC: 1)
- [ ] **TASK-4.28.2** — `npm publish --access public` from
  `packages/koni-docs/` (AC: 1, 2)
- [ ] **TASK-4.28.3** — Smoke-test via `npx @koniverse/koni-docs@0.7.0
  --version` (AC: 3)

## Dev notes

Manual publish gate — blocked on maintainer npm credentials. Marked
`in-progress` until the publish completes; `version_shipped` stays empty
until then.

## References

- [Pillar F plan Task 12](../../superpowers/plans/2026-05-28-pillar-f.md)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.0](../../CHANGELOG.md)
