---
id: US-4.29
title: "Label-only PRD heading convention + legacy-number fallback in sync"
epic: EPIC-4
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: "0.7.2"
assignee: saltict
commit: a1ffc77
created: 2026-05-28
updated: 2026-05-28
---

## Goal

Drop numeric prefixes from PRD H2 headings (canonical form is now
`## Functional Requirements`, not `## 8. Functional Requirements (FR)`)
and teach `koni-docs sync` / `validateFrRefs` to find PRD sections by
their clean label. Provide a legacy numeric fallback so older PRDs
keep working without forced migration. Standardize the rule across
docs, templates, and cross-references.

## Acceptance criteria

- [x] **AC-1** — **Given** `docs/PRD.md` rewritten without numeric H2
  prefixes (e.g. `## Functional Requirements`), **When**
  `npx koni-docs sync --docs-path docs/` runs, **Then** zero
  "section not found" warnings appear for FR rows that exist in the
  table.
- [x] **AC-2** — **Given** a legacy PRD that still uses
  `## 8. Functional Requirements (FR)`, **When** sync runs, **Then**
  the section is still located via the legacy-number fallback
  (`findSectionByLabel(..., { legacyNumber: 8 })`).
- [x] **AC-3** — **Given** the canonical PRD template
  (`skills/koni-docs/references/templates/prd.md`), **When** a new
  project is scaffolded, **Then** the template emits label-only H2
  headings and documents the migration path for numbered legacy PRDs.
- [x] **AC-4** — **Given** active cross-references in `AGENTS.md`,
  `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`,
  `docs/LESSONS.md`, `docs/sprints/README.md`,
  `skills/koni-docs/SKILL.md`, and
  `skills/koni-docs/references/sprint-system.md`, **When** the user
  reads them, **Then** every `PRD §N` reference is rewritten as
  `PRD <SectionLabel>` (e.g. `PRD Functional Requirements`).
- [x] **AC-5** — **Given** the koni-docs unit tests, **When** they
  run, **Then** new `findSectionByLabel` coverage (4 cases:
  exact-match, legacy fallback, no-match, opt-in fallback) all pass,
  plus the existing `findSectionStartingWith` tests continue to pass.

## Tasks

- [x] **TASK-4.29.1** — Add `findSectionByLabel(doc, label, { level?, legacyNumber? })` to `packages/koni-docs/src/lib/markdown/sections.ts` (AC: 2, 5)
- [x] **TASK-4.29.2** — Add `packages/koni-docs/src/lib/prd-constants.ts` exporting `PRD_FUNCTIONAL_REQUIREMENTS_LABEL` + legacy number (AC: 2)
- [x] **TASK-4.29.3** — Switch `cli/sync.ts` from `findSectionStartingWith('## 8.')` to `findSectionByLabel(..., { legacyNumber })` (AC: 1, 2)
- [x] **TASK-4.29.4** — Same switch in `lib/refs.ts` `validateFrRefs` (AC: 2)
- [x] **TASK-4.29.5** — Update `cli/validate.ts` help text + output wording (AC: 4)
- [x] **TASK-4.29.6** — Strip numeric prefixes from `docs/PRD.md` H2 headings + fix internal `§-refs` (AC: 1)
- [x] **TASK-4.29.7** — Rewrite `skills/koni-docs/references/templates/prd.md` (heading convention section + skeleton + filled example + migration steps) (AC: 3)
- [x] **TASK-4.29.8** — Update active cross-refs (AGENTS.md, docs/README.md, ARCHITECTURE.md, SETUP.md, LESSONS.md, sprints/README.md) (AC: 4)
- [x] **TASK-4.29.9** — Update `skills/koni-docs/SKILL.md` activation table + troubleshooting; fix `sprint-system.md` PRD refs (also fixes pre-existing `PRD §7`/`PRD §4` typos) (AC: 4)
- [x] **TASK-4.29.10** — Update `__tests__/lib/_fixtures/build-fixture.ts` + `__tests__/lib/refs.test.ts` wording + add `findSectionByLabel` tests in `sections.test.ts` (AC: 5)
- [x] **TASK-4.29.11** — Build + run full test suite (100/100); dry-run `sync` on real `docs/` and confirm 0 FR-section-not-found warnings

## References

- Reference PRD (canonical label form): `/Volumes/MacData/Workspace/AI/Koni-Finance-Final/docs/PRD.md`
- Original warning report that triggered this work (conversation 2026-05-28)

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md)
- [CHANGELOG v0.7.2](../../CHANGELOG.md)
- [US-4.23 — section-prefix helper (now superseded by `findSectionByLabel`)](US-4.23-section-prefix.md)
