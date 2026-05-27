---
id: US-2.1
title: "Bootstrap docs/ scaffolding on Koni-Skills"
epic: EPIC-2
status: done
priority: P0
points: 5
sprint: sprint-2026-W22
version_shipped: 0.2.0
prd_ref: FR-6, AD-6
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Stand up the full `docs/` directory on the Koni-Skills repo per the
`koni-docs` §0 orientation: README (doc hub), BRIEF, PRD, ARCHITECTURE,
CONTEXT, LESSONS, SETUP, and the `sprints/` subtree with epics,
stories, an archived sprint, and an active sprint. This is the
**dogfood**: every artifact this skill claims to manage must exist on
its own home repo before v0.2.0 ships.

## Background

Up to v0.1.0, this repo's `docs/` folder contained only
`docs/superpowers/` (preserved planning artifacts) and nothing
matching the koni-docs orientation. A consumer project asking "what
does a fully scaffolded Koni-Skills consumer look like?" had no
answer they could read.

[CONTEXT D6](../../CONTEXT.md) authorized EPIC-2 — dogfood before
shipping v0.2.0 — for two reasons: catch gaps before consumers pay
for them, and provide a worked example.

## Acceptance criteria

- [x] **AC-1** — `docs/README.md` exists with doc hub layout, pipeline
  diagram, pre-commit checklist, conventions, and cross-references.
- [x] **AC-2** — `docs/BRIEF.md` exists with all 8 brief sections
  (Exec / Problem / Solution / Differentiator / Persona / Success /
  Scope / Vision) per the koni-docs brief template.
- [x] **AC-3** — `docs/PRD.md` exists with §1–§11 populated (excluding
  optional §7 domain requirements and §10 glossary if minimal).
- [x] **AC-4** — `docs/ARCHITECTURE.md` exists with System overview,
  Tech stack, Component architecture, Skill anatomy, Data
  architecture, AD table, Open questions.
- [x] **AC-5** — `docs/CONTEXT.md` exists with Phase 0 + Phase 1
  headers and decision entries D1..D6.
- [x] **AC-6** — `docs/LESSONS.md` exists with at least the 3 lessons
  surfaced during EPIC-1 work.
- [x] **AC-7** — `docs/SETUP.md` exists documenting prerequisites,
  initial setup, day-to-day workflows, no env vars needed,
  troubleshooting.
- [x] **AC-8** — `docs/sprints/` subtree exists: `README.md`,
  `epics/EPIC-1.md`, `EPIC-2.md`, `EPIC-3.md`, this story's file +
  4 other story files, an active sprint file
  (`sprint-2026-W22.md`), and at least one archived sprint
  (`archive/sprint-2026-W19.md`).
- [ ] **AC-9** — After running
  `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/`,
  `docs/sprints/STATUS.md` exists and is non-empty.
- [ ] **AC-10** — After running
  `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/`,
  no propagation errors are emitted and the 5 doc layers stay
  consistent (story → epic → PRD §11 → PRD §8 FR → sprint).

## Tasks

- [x] **TASK-2.1.1** — Create root files (AC: 1)
  - [x] `docs/README.md` — doc hub
- [x] **TASK-2.1.2** — Author product brief + PRD + architecture (AC: 2, 3, 4)
  - [x] `docs/BRIEF.md`
  - [x] `docs/PRD.md` §1–§11
  - [x] `docs/ARCHITECTURE.md`
- [x] **TASK-2.1.3** — Author context + lessons + setup (AC: 5, 6, 7)
  - [x] `docs/CONTEXT.md` with D1..D6
  - [x] `docs/LESSONS.md` with §1..§3
  - [x] `docs/SETUP.md`
- [x] **TASK-2.1.4** — Author sprint subtree (AC: 8)
  - [x] `docs/sprints/README.md`
  - [x] Epics 1, 2, 3
  - [x] Stories US-1.1, US-2.1, US-2.2, US-2.3, US-3.1
  - [x] `docs/sprints/sprint-2026-W22.md` (active)
  - [x] `docs/sprints/archive/sprint-2026-W19.md` (closed retroactively for v0.1.0)
- [ ] **TASK-2.1.5** — Run sync scripts + verify (AC: 9, 10)
  - [ ] `generate-status.mjs --docs-path docs/`
  - [ ] `agile-sync-up.mjs --docs-path docs/`
  - [ ] Inspect STATUS.md + 5-layer consistency

## Dev notes

### Architecture constraints

- [AD-6](../../ARCHITECTURE.md#architecture-decisions) — this repo
  must dogfood `koni-docs` before v0.2.0 ships.
- No DEPLOY.md or `.env.example` — Koni-Skills has no runtime; see
  `docs/README.md` §"Why no DEPLOY.md".
- No `docs/design/` folder — Koni-Skills has no UI; no story has
  visual or interaction complexity warranting a design spec.

### Cross-story dependencies

- Builds on [US-1.1](US-1.1-koni-docs-initial-release.md) — uses every
  template + script shipped by the skill itself.
- Sibling [US-2.2](US-2.2-wire-integration-blocks.md) — that story
  updates CLAUDE.md to point at this doc structure; both must land
  in the same sprint for the integration block to make sense.
- Sibling [US-2.3](US-2.3-version-changelog-seed.md) — that story
  seeds VERSION + CHANGELOG which `docs/README.md` pre-commit
  checklist references.

### References

- [Source: SKILL.md §0 orientation](../../../skills/koni-docs/SKILL.md)
- [Source: PRD §3 Phase 2](../../PRD.md#3-product-scope)
- [Source: CONTEXT D6](../../CONTEXT.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 to AC-7 | `ls docs/{README,BRIEF,PRD,ARCHITECTURE,CONTEXT,LESSONS,SETUP}.md` returns 7 files |
| AC-8 | `ls docs/sprints/{README,sprint-2026-W22}.md docs/sprints/epics/EPIC-{1,2,3}.md docs/sprints/stories/US-{1.1,2.1,2.2,2.3,3.1}-*.md docs/sprints/archive/sprint-2026-W19.md` returns all expected files |
| AC-9 | `test -s docs/sprints/STATUS.md && echo OK` |
| AC-10 | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/` exits 0 |

## Changelog entry

### Added
- Full `docs/` scaffolding on the Koni-Skills repo: README, BRIEF,
  PRD, ARCHITECTURE, CONTEXT, LESSONS, SETUP.
- `docs/sprints/` subtree with EPIC-1/2/3, 5 stories, active sprint
  (sprint-2026-W22), and one archived sprint (sprint-2026-W19).
- Auto-generated `docs/sprints/STATUS.md` kanban (RULE-5).

### Changed
- `docs/` is no longer a parking lot for `superpowers/` planning
  artifacts only — it is now the canonical home for all project
  documentation under the koni-docs framework.

**Commit**: pending (will be backfilled to real SHA by
`changelog-backfill-commits.mjs` at pre-commit).

## Implementation notes

Scaffolding was generated in one session against template files at
`skills/koni-docs/references/templates/`. Total docs/ word count after
this story lands: approximately 12k words.

## Files modified

**Created (docs/):**
- `README.md`, `BRIEF.md`, `PRD.md`, `ARCHITECTURE.md`, `CONTEXT.md`,
  `LESSONS.md`, `SETUP.md`
- `sprints/README.md`, `sprints/sprint-2026-W22.md`
- `sprints/epics/EPIC-1.md`, `EPIC-2.md`, `EPIC-3.md`
- `sprints/stories/US-1.1-koni-docs-initial-release.md`,
  `US-2.1-bootstrap-docs-structure.md`,
  `US-2.2-wire-integration-blocks.md`,
  `US-2.3-version-changelog-seed.md`,
  `US-3.1-plugin-skill-pattern.md`
- `sprints/archive/sprint-2026-W19.md`
- `sprints/STATUS.md` (auto-generated)

## Cross-references

- [PRD FR-6](../../PRD.md#8-functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [CONTEXT D6](../../CONTEXT.md)
- [Active sprint](../sprint-2026-W22.md)
