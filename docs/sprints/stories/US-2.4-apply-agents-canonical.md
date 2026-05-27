---
id: US-2.4
title: "Apply AGENTS-canonical / CLAUDE-pointer convention to Koni-Skills"
epic: EPIC-2
status: done
priority: P1
points: 1
sprint: sprint-2026-W22
version_shipped: 0.2.0
prd_ref: FR-13
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Apply the AGENTS-canonical convention (documented by
[US-1.4](US-1.4-agents-canonical-convention.md) in
`integration.md` §3.1) to this repo:

- Slim `CLAUDE.md` to a pointer + `Koni-Docs Integration` config +
  Active Context pointer.
- Move the duplicated `Quick start` and `Documentation` sections from
  `CLAUDE.md` into `AGENTS.md`.
- Add the "canonical source of truth" preamble to `AGENTS.md`.

After this story, the repo's two agent guides have zero duplicated
content, AGENTS.md wins on every conflict, and the file-extracted
Active Context pattern (Pattern B) combines naturally with the slim
CLAUDE.md (low merge churn × low duplication).

## Background

This repo originally shipped `CLAUDE.md` with `## Quick start` and
`## Documentation` sections that duplicated content from `AGENTS.md`
(introduced in [US-2.1](US-2.1-bootstrap-docs-structure.md) when
CLAUDE.md was authored without first checking AGENTS.md's existing
scope). The duplication was not load-bearing — every line in CLAUDE.md
outside the Koni-Docs Integration block existed in AGENTS.md too — and
created a recurring drift hazard. The user requested 2026-05-27 PM
that the repo follow the same convention Koni-Finance-Final uses.

US-1.4 (skill side, same sprint) documents the convention in the
`koni-docs` skill template; this story applies it here.

[CONTEXT D9](../../CONTEXT.md) authorizes the convention adoption.

## Acceptance criteria

- [x] **AC-1** — `CLAUDE.md` slimmed to exactly: title, single-paragraph
  pointer to AGENTS.md, line declaring AGENTS.md canonical, Koni-Docs
  Integration config block, Active Context pointer (Pattern B from
  US-1.2). No other content.
- [x] **AC-2** — `CLAUDE.md` `## Quick start` and `## Documentation`
  sections removed (their content lives in AGENTS.md).
- [x] **AC-3** — `AGENTS.md` top has a blockquote preamble: "This file
  is the single source of truth for all AI agent instructions in this
  project. … On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md
  wins."
- [x] **AC-4** — `AGENTS.md` gains a `## Documentation` section listing
  BRIEF / PRD / ARCHITECTURE / CONTEXT / LESSONS / SETUP / sprints /
  VERSION / CHANGELOG with markdown links.
- [x] **AC-5** — `AGENTS.md` `## Koni-Docs` section names both
  conventions adopted by this repo (Active Context Pattern B from
  US-1.2; AGENTS-canonical from US-1.4) with pointers into the skill's
  `integration.md` §2 and §3.1.
- [x] **AC-6** — `AGENTS.md` Project structure diagram updated to
  reflect current shape (adds `VERSION`, `CHANGELOG.md`,
  `.active-context.example.md`, `.active-context.md`, `docs/`).
- [x] **AC-7** — Grep: `CLAUDE.md` no longer contains the strings
  `"Quick start"` or `"Documentation"` as section headers.

## Tasks

- [x] **TASK-2.4.1** — Slim `CLAUDE.md` (AC: 1, 2, 7)
- [x] **TASK-2.4.2** — Add canonical preamble to `AGENTS.md` (AC: 3)
- [x] **TASK-2.4.3** — Add `## Documentation` section to `AGENTS.md` (AC: 4)
- [x] **TASK-2.4.4** — Expand `AGENTS.md` `## Koni-Docs` with the
  two convention pointers (AC: 5)
- [x] **TASK-2.4.5** — Update `AGENTS.md` Project structure diagram
  (AC: 6)

## Dev notes

### Architecture constraints

- The convention is **recommendation**, not a numbered RULE — some
  Koniverse projects may legitimately prefer CLAUDE.md primary. This
  story adopts it for this repo because dogfooding [AD-6](../../ARCHITECTURE.md#architecture-decisions)
  means matching the convention the skill recommends.
- `CLAUDE.md` after this story holds ONLY content that is either (a)
  Claude-Code-specific or (b) the koni-docs activation surface. Future
  agentcohort-style Claude-Code-only routing blocks would be additive
  here (don't go in AGENTS.md).

### Cross-story dependencies

- Builds on [US-1.4](US-1.4-agents-canonical-convention.md) — that
  story documents the convention in the skill template; this one
  applies it.
- Builds on [US-2.2](US-2.2-wire-integration-blocks.md) — the Active
  Context pointer in CLAUDE.md was already in Pattern B shape from
  that story; this story preserves that and removes the surrounding
  duplication.

### What we explicitly did NOT do

- **No symlink between CLAUDE.md and AGENTS.md.** Some projects symlink
  them to keep content identical, but our convention specifically wants
  them to differ (CLAUDE.md = pointer + activation surface; AGENTS.md =
  everything else). Symlinking would defeat the slim-CLAUDE.md goal.
- **No Claude-Code-specific routing blocks added.** The repo doesn't
  currently use agentcohort or custom slash-command routing. If it
  adopts one later, it lands inside `CLAUDE.md` BELOW the Koni-Docs
  Integration block — not in AGENTS.md.

### References

- [Source: integration.md §3.1](../../../skills/koni-docs/references/templates/integration.md)
- [Source: PRD FR-13, AD-9](../../PRD.md)
- [Source: CONTEXT D9](../../CONTEXT.md)
- [Sibling US-1.4](US-1.4-agents-canonical-convention.md) — skill-side change

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `wc -l CLAUDE.md` returns < 30 |
| AC-2, AC-7 | `! grep -E "^## (Quick start\|Documentation)$" CLAUDE.md` |
| AC-3 | `grep -q "single source of truth for all AI agent instructions" AGENTS.md` |
| AC-4 | `grep -q "^## Documentation$" AGENTS.md` |
| AC-5 | `grep -q "AGENTS-canonical" AGENTS.md` AND `grep -q "Pattern B" AGENTS.md` |
| AC-6 | `grep -q "\.active-context\.example\.md" AGENTS.md` |

## Changelog entry

### Changed
- `CLAUDE.md` slimmed from 40 → ~27 lines: kept only the title, the
  AGENTS.md-is-canonical pointer paragraph, the `Koni-Docs Integration`
  config block, and the Active Context pointer. Removed the
  `Quick start` and `Documentation` sections (duplicates of AGENTS.md).
- `AGENTS.md` grew a canonical-source-of-truth preamble at the top, a
  consolidated `## Documentation` section listing every docs/ artifact
  + VERSION + CHANGELOG, an updated Project structure diagram reflecting
  current repo shape, and a `## Koni-Docs` section that now names both
  conventions adopted by this repo (Active Context Pattern B,
  AGENTS-canonical) with pointers into the skill's `integration.md`.

**Commit**: pending

## Implementation notes

CLAUDE.md before this story: 40 lines, ~5 sections (Title pointer +
Quick start + Documentation + Koni-Docs Integration + Active Context).
After: 27 lines, 3 sections (Title pointer + Koni-Docs Integration +
Active Context). Every removed section had a 1:1 (or better)
equivalent in AGENTS.md, so no information was lost — only de-duped.

## Files modified

**Modified (repo root):**
- `CLAUDE.md` — slimmed
- `AGENTS.md` — preamble + Documentation + Koni-Docs expansion + structure-diagram update

## Cross-references

- [PRD FR-13, AD-9](../../PRD.md)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [CONTEXT D9](../../CONTEXT.md)
- [Sibling US-1.4](US-1.4-agents-canonical-convention.md) — skill-side
- [Builds on US-2.2](US-2.2-wire-integration-blocks.md) — Active Context Pattern B
