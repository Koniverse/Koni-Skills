---
id: US-4.18
title: "CLI polish — 5 minor fixes from Pillar C code review"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2026-W25
version_shipped: "0.5.0"
prd_ref: FR-15
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Address the 5 Minor polish items surfaced in Pillar C's final code review: `inject-tasks --dry-run` bypass, `sync` warnings on stdout, dead `SyncStats` fields, missing pre-release semver unit test, and `KONI_DOCS_LIB_VERSION` skew.

## Background

Pillar C's final code review (during the merge-to-main step) surfaced 5 Minor issues. None blocked the v0.5.0-dev.0 merge but all warranted resolution before stable v0.5.0 ship. Pillar D plan Tasks 1, 2, 3.

## Acceptance criteria

- [x] **AC-1** — `koni-docs inject-tasks --dry-run` does NOT modify files (regression test in `__tests__/cli/inject-tasks.test.ts`).
- [x] **AC-2** — `koni-docs sync` non-fatal warnings print to stderr (not stdout).
- [x] **AC-3** — `SyncStats` interface contains only `epic`, `prdFr`, `sprint`, `warnings` fields.
- [x] **AC-4** — `parseChangelog` has a unit test asserting it parses pre-release semver entries (`0.5.0-dev.0`).
- [x] **AC-5** — `KONI_DOCS_LIB_VERSION` matches `package.json` version (both `0.5.0` after Task 6).

## Tasks

- [x] **TASK-4.18.1** — Thread `dryRun` through `injectIntoStory` (AC: 1)
- [x] **TASK-4.18.2** — Move sync warnings to stderr; drop dead SyncStats fields (AC: 2, 3)
- [x] **TASK-4.18.3** — Pre-release semver test + version sync (AC: 4, 5)

## Dev notes

### References

- [Pillar C final code review](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-c-cli-subcommands.md#known-issues-to-resolve-in-pillar-d)
- [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `cd packages/koni-docs && npm test 2>&1 \| grep "inject-tasks.*--dry-run"` shows passing test |
| AC-2 | `grep -n "console.error" packages/koni-docs/src/cli/sync.ts` shows warning print line |
| AC-3 | `grep -c "prdStory\|skipped:" packages/koni-docs/src/cli/sync.ts` returns 0 |
| AC-4 | `npm test 2>&1 \| grep "parseChangelog: handles pre-release semver"` shows passing |
| AC-5 | `grep "KONI_DOCS_LIB_VERSION = '0.5.0'" packages/koni-docs/src/lib/index.ts` matches |

## Changelog entry

(See CHANGELOG v0.5.0 entry — these fixes are in the **Fixed** section.)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)
- [CHANGELOG v0.5.0](../../CHANGELOG.md)
