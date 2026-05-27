---
id: US-4.16
title: "Migration docs — rewrite agent-facing docs to point at CLI"
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

Rewrite agent-facing documentation to point at the `@koniverse/koni-docs` CLI instead of the deleted `.mjs` scripts. SKILL.md / sprint-system.md / CLAUDE.md / AGENTS.md / SETUP.md are the touched files.

## Background

Pillar B and C deleted all 5 `.mjs` scripts under `skills/koni-docs/scripts/`. This story closes the documentation gap so agents and consumers reading the skill find CLI references instead of dead paths. Pillar D plan Tasks 4 and 5.

## Acceptance criteria

- [x] **AC-1** — `rg "skills/koni-docs/scripts/" skills/ CLAUDE.md AGENTS.md docs/SETUP.md` returns zero results (CHANGELOG migration table excluded).
- [x] **AC-2** — SKILL.md §7 documents the CLI (install, subcommands, lib subpath imports).
- [x] **AC-3** — CHANGELOG `[0.5.0-dev.0]` entry has a consumer migration table with old-vs-new path mappings for all 5 scripts.

## Tasks

- [x] **TASK-4.16.1** — Rewrite SKILL.md §7 + sprint-system.md (AC: 1, 2)
- [x] **TASK-4.16.2** — Update CLAUDE.md/AGENTS.md/SETUP.md + add CHANGELOG migration table (AC: 1, 3)

## Dev notes

### References

- [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `rg "skills/koni-docs/scripts/" skills/ CLAUDE.md AGENTS.md docs/SETUP.md` returns empty |
| AC-2 | `grep "@koniverse/koni-docs" skills/koni-docs/SKILL.md` shows install + CLI usage |
| AC-3 | `grep -c "Migration table" docs/CHANGELOG.md` returns ≥ 1 |

## Changelog entry

(See CHANGELOG v0.5.0 entry — this story slice is in the **Documentation** section.)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [Pillar D plan](../../superpowers/plans/2026-05-27-koni-docs-cli-pillar-d-polish-migration-publish.md)
- [CHANGELOG v0.5.0](../../CHANGELOG.md)
