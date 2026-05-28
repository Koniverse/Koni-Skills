---
id: EPIC-2
title: "Dogfood koni-docs on Koni-Skills repo"
status: done
prd_ref: 'FR-6, FR-7, FR-8, FR-13'
created: 2026-05-27T00:00:00.000Z
updated: 2026-05-27T00:00:00.000Z
---
## Goal

Apply the `koni-docs` skill to this repo (its own home) end-to-end:
full `docs/` scaffolding, VERSION + CHANGELOG seeded from git history,
and the Koni-Docs Integration block wired into `CLAUDE.md` +
`AGENTS.md`. The deliverable is *not* a feature — it is the proof that
the skill works on its own source repo. After this epic, every
consumer-facing rule, template, and script has been exercised at least
once on this repo.

## Overview

### Business context

EPIC-1 shipped `koni-docs` v0.1.0, but the skill's home repo
(Koni-Skills itself) did not yet consume it. The `docs/` folder
contained only superpowers planning artifacts; there was no VERSION, no
CHANGELOG, no PRD, no sprint discipline, no Active Context block in
CLAUDE.md. Two risks were accumulating:

1. **Untested gaps.** Any gap in the skill (missing template guidance,
   awkward integration block, broken sync script) would land in a
   consumer project first, costing the consumer's team time.
2. **Lack of worked example.** A new engineer cloning Koni-Skills had no
   reference for what a "fully scaffolded Koni-Skills consumer" looks like.

EPIC-2 closes both risks before v0.2.0 ships.

### Feature pillars

| # | Pillar                       | Stories                                                 | Purpose                                                                |
| - | ---------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 | **Docs scaffolding**         | [US-2.1](../stories/US-2.1-bootstrap-docs-structure.md) | Full `docs/` tree per koni-docs §0 orientation                         |
| 2 | **Integration wiring**       | [US-2.2](../stories/US-2.2-wire-integration-blocks.md)  | Koni-Docs Integration + Active Context blocks in CLAUDE.md + AGENTS.md |
| 3 | **Version + changelog seed** | [US-2.3](../stories/US-2.3-version-changelog-seed.md)   | VERSION file + initial CHANGELOG entry covering all of EPIC-1's work   |

### Out of scope

- **New `koni-docs` features.** EPIC-2 only consumes; any feature gaps it
  surfaces are recorded in [LESSONS.md](../../LESSONS.md) and turn into
  separate stories under EPIC-1 or EPIC-3 in a later sprint.
- **Plugin skill development.** Owned by [EPIC-3](EPIC-3.md).
- **DEPLOY.md / .env.example creation.** Not applicable — see
  [docs/README.md](../../README.md) §"Why no DEPLOY.md".

## FR Coverage

| FR                         | Story                                                   | Status          |
| -------------------------- | ------------------------------------------------------- | --------------- |
| FR-6                       | [US-2.1](../stories/US-2.1-bootstrap-docs-structure.md) | ✅ done (v0.2.0) |
| FR-7                       | [US-2.2](../stories/US-2.2-wire-integration-blocks.md)  | ✅ done (v0.2.0) |
| FR-8                       | [US-2.3](../stories/US-2.3-version-changelog-seed.md)   | ✅ done (v0.2.0) |
| FR-13 (shared with EPIC-1) | [US-2.4](../stories/US-2.4-apply-agents-canonical.md)   | ✅ done (v0.2.0) |

## AD Coverage

| AD   | Title                                   | Story                                                   |
| ---- | --------------------------------------- | ------------------------------------------------------- |
| AD-6 | Dogfood `koni-docs` on this repo itself | [US-2.1](../stories/US-2.1-bootstrap-docs-structure.md) |

## Stories

| ID                                                      | Title                                         | Goal                                                                                                | Status | Version |
| ------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ | ------- |
| [US-2.1](../stories/US-2.1-bootstrap-docs-structure.md) | Bootstrap `docs/` scaffolding                 | Create all canonical files under `docs/` + sprint discipline directories                            | ✅ done | v0.2.0  |
| [US-2.2](../stories/US-2.2-wire-integration-blocks.md)  | Wire CLAUDE.md + AGENTS.md integration blocks | Add Koni-Docs Integration + Active Context to project agent guides                                  | ✅ done | v0.2.0  |
| [US-2.3](../stories/US-2.3-version-changelog-seed.md)   | Seed VERSION + CHANGELOG                      | Add `VERSION` (`0.1.0`) and CHANGELOG.md initial release entry                                      | ✅ done | v0.2.0  |
| [US-2.4](../stories/US-2.4-apply-agents-canonical.md)   | Apply AGENTS-canonical convention             | Slim CLAUDE.md to pointer + integration block; beef AGENTS.md with preamble + Documentation section | ✅ done | v0.2.0  |

## Cross-cutting invariants

- **Self-test:** after EPIC-2 closes, `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/` AND `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` BOTH run clean (exit 0, no drift) against this repo. Enforced as the close criterion.
- **No new `koni-docs` features within EPIC-2:** if a gap surfaces, log a LESSONS entry and create a new EPIC-1 story for the next sprint — do not silently extend EPIC-2's scope.

## Cross-story testing requirements

| Pattern                                | Stories                | Shared infra                                                       |
| -------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| **5-layer consistency check on close** | US-2.1, US-2.2, US-2.3 | Manual: `agile-sync-up.mjs` exit 0 against this repo's own `docs/` |

## Acceptance criteria (propagated from stories)

- [x] Full `docs/` directory exists with README, BRIEF, PRD, ARCH, CONTEXT, LESSONS, SETUP, sprints subtree (US-2.1)
- [x] `CLAUDE.md` + `AGENTS.md` contain the Koni-Docs Integration block + Active Context (US-2.2)
- [x] `VERSION` file exists with `0.2.0`; `docs/CHANGELOG.md` has `[Unreleased]` + `[0.2.0]` + `[0.1.0]` entries (US-2.3)
- [x] `agile-sync-up.mjs --docs-path docs/` runs clean against this repo (US-2.1 / US-2.2 / US-2.3 — all sync runs return `0 skipped`)
- [x] `generate-status.mjs --docs-path docs/` produces STATUS.md with 9 stories (1 backlog + 8 done) (US-2.1)
