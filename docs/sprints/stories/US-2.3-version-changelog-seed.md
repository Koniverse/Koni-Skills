---
id: US-2.3
title: "Seed VERSION + CHANGELOG.md from git history"
epic: EPIC-2
status: done
priority: P1
points: 2
sprint: sprint-2026-W21
version_shipped: 0.2.0
prd_ref: FR-8
assignee: saltict
commit: 2aff2fe
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Add the `VERSION` file at repo root with `0.1.0`, and seed
`docs/CHANGELOG.md` (per skill SKILL.md §0 — canonical home is
`docs/`, not repo root) with `[Unreleased]` + a single retroactive
`[0.1.0]` entry that consolidates the work of all 22 commits shipped
between 2026-05-06 and 2026-05-26. Future versions get appended in
the standard way (RULE-1 + RULE-2).

## Background

Up to v0.1.0, the repo had no `VERSION` file and no `CHANGELOG.md`.
The koni-docs RULE-1 requires VERSION + CHANGELOG to bump in the
same commit going forward. To start that discipline, the
foundational state of the repo at the close of EPIC-1 needs to be
captured as `0.1.0` — a single retroactive entry that names what
shipped, rather than 22 micro-entries that don't add value.

**Mid-sprint correction**: the first draft of this story shipped
`CHANGELOG.md` at repo root. Per SKILL.md §0 orientation the canonical
location is `docs/CHANGELOG.md` — the file was relocated as part of
this same story. See [CONTEXT D10](../../CONTEXT.md).

## Acceptance criteria

- [x] **AC-1** — `VERSION` exists at repo root with content `0.1.0\n`.
- [x] **AC-2** — `docs/CHANGELOG.md` exists (NOT repo root) with header,
  RULE-1/RULE-2 reminder, `[Unreleased]` section, and `[0.1.0]` entry
  dated `2026-05-27`. No `CHANGELOG.md` survives at repo root.
- [x] **AC-3** — The `[0.1.0]` entry has `### Added`, `### Changed`,
  `### Fixed`, and `### Contributors` subsections. The Contributors
  section reflects actual git data (22 commits, 2 contributors with
  RULE-15 GitHub-login attribution: `saltict` 20 commits, `bluezdot`
  2 commits) and lists commit ranges by area.
- [ ] **AC-4** — After this story lands and the close-of-sprint commit
  is created, `node skills/koni-docs/scripts/changelog-backfill-commits.mjs
  --docs-path docs/` replaces the `0.1.0 release commit` placeholder
  with a real SHA (no `pending` survives in CHANGELOG — RULE-2).
- [x] **AC-5** — All cross-references to CHANGELOG (in docs/README.md,
  AGENTS.md, story files, archived sprint files, PRD) updated to point
  at `docs/CHANGELOG.md`. No dangling links to `CHANGELOG.md` at root.

## Tasks

- [x] **TASK-2.3.1** — Create `VERSION` (AC: 1)
- [x] **TASK-2.3.2** — Create `docs/CHANGELOG.md` with header + Unreleased + v0.1.0 (AC: 2, 3)
- [x] **TASK-2.3.3** — Backfill Contributors from real git history
  (AC: 3) — `git shortlog -sn` + `git log --pretty=format:'%h|%an|%s'`,
  grouped by area, attributed via RULE-15 GitHub logins
- [x] **TASK-2.3.4** — Relocate (originally drafted at root, moved to
  docs/) + update all cross-references in docs/, AGENTS.md, story
  files, archived sprint (AC: 2, 5). Record decision as
  [CONTEXT D10](../../CONTEXT.md)
- [ ] **TASK-2.3.5** — At sprint close, run
  `changelog-backfill-commits.mjs --docs-path docs/` to replace
  placeholder SHA (AC: 4)

## Dev notes

### Architecture constraints

- RULE-1: VERSION + CHANGELOG bump in same commit going forward.
- RULE-2: CHANGELOG commit hash mandatory; never `pending` at the
  point of merge to main.
- RULE-14: this story's landing commit prefix should be `docs:` (no
  code shipped) or `chore:` (release scaffolding) — not `feat:`.

### Cross-story dependencies

- Sibling [US-2.1](US-2.1-bootstrap-docs-structure.md) — the docs
  README pre-commit checklist references VERSION + CHANGELOG; both
  must land together.
- Sibling [US-2.2](US-2.2-wire-integration-blocks.md) — Active
  Context block references `Last Version: v0.1.0` which this story
  creates the source-of-truth for.

### References

- [Source: changelog template](../../../skills/koni-docs/references/templates/changelog.md)
- [Source: SKILL.md RULE-1, RULE-2](../../../skills/koni-docs/SKILL.md)
- [Source: PRD FR-8](../../PRD.md#8-functional-requirements)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `test -f VERSION && [ "$(cat VERSION)" = "0.1.0" ]` |
| AC-2 | `test -f docs/CHANGELOG.md && ! test -f CHANGELOG.md && grep -q "^## \[0.1.0\]" docs/CHANGELOG.md && grep -q "^## \[Unreleased\]" docs/CHANGELOG.md` |
| AC-3 | `grep -E "^### (Added\|Changed\|Fixed\|Contributors)" docs/CHANGELOG.md \| wc -l` returns ≥ 4 |
| AC-4 | `grep -q "pending" docs/CHANGELOG.md` returns no match after sprint close |
| AC-5 | `grep -rn "CHANGELOG\.md\b" docs/ AGENTS.md CLAUDE.md \| grep -v "docs/CHANGELOG" \| grep -v "skills/" \| wc -l` returns 0 (no dangling root references) |

## Changelog entry

### Added
- `VERSION` at repo root with content `0.1.0`.
- `docs/CHANGELOG.md` (per SKILL.md §0 — canonical home is `docs/`): header, RULE-1/2 reminder,
  `[Unreleased]` section, retroactive `[0.1.0]` entry covering the
  full koni-docs v0.1.0 release.

**Commit**: pending

## Implementation notes

(filled during implementation)

## Files modified

**Created (repo root):**
- `VERSION` — `0.1.0`
- `docs/CHANGELOG.md` — retroactive v0.1.0 + Unreleased scaffolding (relocated from root mid-sprint per CONTEXT D10)

## Cross-references

- [PRD FR-8](../../PRD.md#8-functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [Changelog template](../../../skills/koni-docs/references/templates/changelog.md)
