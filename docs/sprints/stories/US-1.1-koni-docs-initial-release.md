---
id: US-1.1
title: "Koni-docs skill — initial release (v0.1.0)"
epic: EPIC-1
status: done
priority: P0
points: 13
sprint: sprint-2026-W19
version_shipped: 0.1.0
prd_ref: FR-1, FR-2, FR-3, FR-4, FR-5, AD-1, AD-2, AD-3, AD-4, AD-5
assignee: saltict
commit: 0.1.0-release
created: 2026-05-06
updated: 2026-05-27
---

## Goal

Ship the first usable cut of the `koni-docs` skill — instructions,
rules, templates, scripts, and distribution path — so any Koniverse
project can install it via `npx skills add Koniverse/Koni-Skills
--skill koni-docs` and immediately produce documentation in the
canonical structure with the 9-rule pre-commit gate. This story is a
**retroactive consolidation** of all v0.1.0 work that landed between
2026-05-06 and 2026-05-26 across ~24 commits, captured as one story
to anchor EPIC-1's deliverable contract.

## Background

Multiple Koniverse projects (Koni-ERP-02, Koni-Finance-Final)
independently arrived at similar `Docs/` shapes but diverged in
detail. Each had its own copies of agile sync scripts, its own
rule list, and its own STATUS generation. Onboarding a new project
meant copy-pasting the most-mature `Docs/` folder and silently
inheriting whichever bugs had been most recently introduced.

The original design + plan are preserved at:
- [Design spec (2026-05-06)](../../superpowers/specs/2026-05-06-koni-docs-skill-design.md)
- [Implementation plan (2026-05-06)](../../superpowers/plans/2026-05-06-koni-docs-skill-implementation.md)

This story consolidates the actual landed work. Five strategic decisions
shaped v0.1.0 — see [CONTEXT D1..D5](../../CONTEXT.md).

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/SKILL.md` exists with: YAML
  frontmatter (name, description), Quick orientation, Pipeline
  integration, 9 core rules, Workflow (3a/3b/3c), CLAUDE.md trigger
  points T1..T7, Activation table, Reference-file index, Bundled scripts
  inventory. Body ≤ 500 lines.
- [x] **AC-2** — `skills/koni-docs/references/rules.md` documents 9
  project-agnostic rules (RULE-1, 2, 5, 6, 7, 10, 11, 13, 14) each
  with severity, compliance step, and grep-style verification.
- [x] **AC-3** — `skills/koni-docs/references/templates/` contains one
  file per document type: brief, prd, architecture, changelog, context,
  lessons, setup, epic, story, sprint, design-spec, okr, integration
  (13 files), each with section index, per-section guidance, and a
  filled mini-example.
- [x] **AC-4** — `skills/koni-docs/scripts/` ships 5 working scripts:
  `generate-status.mjs`, `agile-sync-up.mjs`,
  `agile-inject-tasks.mjs`, `agile-backfill-fields.mjs`,
  `changelog-backfill-commits.mjs`. Each accepts `--docs-path` and
  `--dry-run`.
- [x] **AC-5** — `skills/koni-docs/scripts/__tests__/sync-test.mjs`
  builds its own fixture in tmpdir, exercises all 5 sync scripts
  against mixed old/new template shapes, asserts cell-by-cell, exits 0.
- [x] **AC-6** — `README.md` documents the install path
  (`npx skills add Koniverse/Koni-Skills --skill koni-docs`) and
  the fresh-clone restore path (`npx skills experimental_install`).
- [x] **AC-7** — `skills-lock.json` exists and tracks installed skills
  (`koni-docs` + `skill-creator`) with `source`, `sourceType`,
  `skillPath`, `computedHash`.

## Tasks

- [x] **TASK-1.1.1** — Author core skill body (AC: 1)
  - [x] Draft `SKILL.md` §0 orientation + §1 pipeline + §2 rules summary + §3 workflow + §4 CLAUDE.md updates
  - [x] Add §5 activation table + §6 reference index + §7 bundled scripts
- [x] **TASK-1.1.2** — Author 9 core rules (AC: 2)
  - [x] `references/rules.md` with severity, compliance, grep check per rule
- [x] **TASK-1.1.3** — Author template library (AC: 3)
  - [x] Single `references/templates.md` index file
  - [x] One file per template type under `references/templates/`
  - [x] BMad template analysis (`references/bmad-template-analysis.md`)
- [x] **TASK-1.1.4** — Author + bundle automation scripts (AC: 4)
  - [x] `generate-status.mjs`, `agile-sync-up.mjs`, `agile-inject-tasks.mjs`, `agile-backfill-fields.mjs`, `changelog-backfill-commits.mjs`
  - [x] Common helpers + frontmatter parser
- [x] **TASK-1.1.5** — Author regression test (AC: 5)
  - [x] `scripts/__tests__/sync-test.mjs` — self-contained tmpdir fixture
  - [x] Exercises all 5 scripts + asserts cell-by-cell
  - [x] Refine `epicStoryRowMatcher` to use word-boundary matching (commit `29898ca`)
- [x] **TASK-1.1.6** — Document install + distribution (AC: 6, 7)
  - [x] README.md install / list / experimental_install sections
  - [x] AGENTS.md project guide
  - [x] Initial CLAUDE.md entry point
  - [x] `skills-lock.json` schema + restore on clone

## Dev notes

### Architecture constraints

- [AD-1](../../ARCHITECTURE.md#architecture-decisions) — each skill is
  self-contained; no cross-skill imports. SKILL.md / references /
  scripts all live under `skills/koni-docs/`.
- [AD-2](../../ARCHITECTURE.md#architecture-decisions) — distribution
  via `npx skills add` + `skills-lock.json`. No npm publish step.
- [AD-3](../../ARCHITECTURE.md#architecture-decisions) — 9
  project-agnostic rules only; tech-stack rules ship as plugin skills
  in EPIC-3, with a slot reserved in the CLAUDE.md integration block
  in v0.1.0.
- [AD-4](../../ARCHITECTURE.md#architecture-decisions) — templates
  split one-file-per-type for on-demand activation (token efficiency).

### Cross-story dependencies

- Required by [US-2.1](US-2.1-bootstrap-docs-structure.md) — dogfood on
  this repo uses every artifact this story shipped.
- Required by [US-3.1](US-3.1-plugin-skill-pattern.md) — plugin pattern
  extends the rule set this story defined.

### References

- [Design spec](../../superpowers/specs/2026-05-06-koni-docs-skill-design.md)
- [Implementation plan](../../superpowers/plans/2026-05-06-koni-docs-skill-implementation.md)
- [Source: PRD §8 FR-1..FR-5](../../PRD.md#8-functional-requirements)
- [Source: ARCHITECTURE §Skill anatomy](../../ARCHITECTURE.md)
- [Source: CONTEXT D1..D5](../../CONTEXT.md)
- BMad pipeline upstream — see `skills/koni-docs/references/bmad-template-analysis.md`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `wc -l skills/koni-docs/SKILL.md` returns ≤ 500 |
| AC-2 | `grep -c "^### RULE-" skills/koni-docs/references/rules.md` returns 9 |
| AC-3 | `ls skills/koni-docs/references/templates/ \| wc -l` returns 13 |
| AC-4 | `ls skills/koni-docs/scripts/*.mjs \| wc -l` returns ≥ 5 |
| AC-5 | `node skills/koni-docs/scripts/__tests__/sync-test.mjs` exits 0 |
| AC-6 | `grep -q "npx skills add Koniverse/Koni-Skills" README.md` |
| AC-7 | `node -e "JSON.parse(require('fs').readFileSync('skills-lock.json'))"` exits 0 |

## Changelog entry

See [CHANGELOG.md §0.1.0](../../CHANGELOG.md) — the v0.1.0 release
entry is the canonical record. This story is the planning-side anchor;
the CHANGELOG is the shipping-side record.

**Commit**: 0.1.0 release commit — see git tag `v0.1.0`.

## Implementation notes

Shipped as a **22-commit sequence** between 2026-05-06 and 2026-05-26
across **2 contributors**, not a single PR. Per
[RULE-15](../../../skills/koni-docs/references/rules.md), the
contributor table uses GitHub logins:

| GitHub login | Git name | Commits | Areas |
|---|---|---|---|
| `saltict` | AnhMTV | 20 | Skill core + templates + automation + tests |
| `bluezdot` | bluezdot | 2 | Template robustness + script story-parsing fix |

Full commit breakdown by phase lives in the archived sprint:
[archive/sprint-2026-W19.md §Contributors](../archive/sprint-2026-W19.md).

Three traps surfaced and were codified into
[LESSONS.md](../../LESSONS.md):
1. Story-row regex needed word-boundary matching (§1) — fixed in `29898ca` (saltict).
2. Sync scripts needed to skip files lacking `id:` instead of crashing (§2) — fixed in `44f9c01` (bluezdot).
3. Fresh clones must run `experimental_install` (§3) — documented in SETUP.

A late-cycle audit against Koni-ERP-02 practice confirmed that the
templates produced by this skill match the shape Koni-ERP-02 arrived
at organically — i.e. the skill captures real, used patterns rather
than aspirational ones.

## Files modified

**Created (skills/koni-docs):**
- `SKILL.md` — core skill body
- `references/rules.md` — 9 rules
- `references/sprint-system.md` — agile conventions + 5-layer check
- `references/templates.md` — template index
- `references/templates/{brief,prd,architecture,changelog,context,lessons,setup,epic,story,sprint,design-spec,okr,integration}.md` — 13 per-type templates
- `references/bmad-template-analysis.md` — BMad → koni-docs mapping
- `scripts/{generate-status,agile-sync-up,agile-inject-tasks,agile-backfill-fields,changelog-backfill-commits}.mjs` — 5 sync scripts
- `scripts/__tests__/sync-test.mjs` — self-contained regression test

**Created (repo root):**
- `README.md`, `AGENTS.md`, `CLAUDE.md` — project guides
- `skills-lock.json` — installed-skill manifest
- `docs/superpowers/specs/2026-05-06-koni-docs-skill-design.md`
- `docs/superpowers/plans/2026-05-06-koni-docs-skill-implementation.md`

## Cross-references

- [PRD FR-1..FR-5](../../PRD.md#8-functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CHANGELOG v0.1.0](../../CHANGELOG.md)
- [CONTEXT D1..D5](../../CONTEXT.md)
- [LESSONS §1, §2, §3](../../LESSONS.md)
