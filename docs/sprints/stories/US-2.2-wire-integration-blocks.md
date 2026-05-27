---
id: US-2.2
title: "Wire koni-docs integration into CLAUDE.md + AGENTS.md (Pattern B)"
epic: EPIC-2
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: 0.2.0
prd_ref: FR-7
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Wire `koni-docs` into this repo's agent guides using the
**file-extracted Active Context pattern (Pattern B)** — recommended
for multi-developer teams: `CLAUDE.md` holds only the static
`Koni-Docs Integration` config + a pointer; the live snapshot moves
into `.active-context.md` (gitignored) with `.active-context.example.md`
committed as the team template. Also adds the `Koni-Docs` reference
section to `AGENTS.md`. After this story, the repo is exercising
exactly the same Pattern B layout the skill recommends in
[`templates/integration.md`](../../../skills/koni-docs/references/templates/integration.md) §2.

## Background

The original scope of this story (planned 2026-05-27 morning) was to
install the **inline** Active Context block (Pattern A) directly into
`CLAUDE.md`. After the first draft, the team referenced
[Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md)
which had moved Active Context out of `CLAUDE.md` precisely to avoid
multi-developer merge conflicts — a recurring papercut on every PR
that opened/closed a story in parallel with someone else's branch.

[CONTEXT D7](../../CONTEXT.md) authorizes Pattern B for this repo;
[US-1.2](US-1.2-active-context-split-pattern.md) (sibling story in
this sprint) ports the pattern into the `koni-docs` skill itself so
future consumer projects inherit it. This story applies the pattern
to the Koni-Skills meta-repo.

## Acceptance criteria

- [x] **AC-1** — `CLAUDE.md` contains the `## Koni-Docs Integration`
  config block with `plugins: []`, `docs_path: docs/`,
  `active_sprint: sprint-2026-W22`, `version_file: VERSION`.
- [x] **AC-2** — `CLAUDE.md` contains an `## Active Context` section
  that is a **pointer**, not an inline block — references
  `.active-context.md` (live snapshot) and `.active-context.example.md`
  (template), with the gitignored-on-purpose rationale.
- [x] **AC-3** — `AGENTS.md` contains the `## Koni-Docs` section
  (short pointer to `docs/README.md` + the skill).
- [x] **AC-4** — `CLAUDE.md` still routes to `AGENTS.md` (existing
  Quick start section preserved).
- [x] **AC-5** — `.active-context.example.md` exists at repo root with
  the `Local developer` block + `Project sprint context` block
  (between `koni-docs:auto-update` markers), filled with placeholders
  matching `skills/koni-docs/references/templates/integration.md` §2.
- [x] **AC-6** — `.active-context.md` exists at repo root with the
  current author's local-developer details and the current
  sprint-2026-W22 sprint-context snapshot.
- [x] **AC-7** — `.gitignore` lists `.active-context.md` with a
  comment explaining why.

## Tasks

- [x] **TASK-2.2.1** — Edit `CLAUDE.md` (AC: 1, 2, 4)
  - [x] Append `Koni-Docs Integration` config block after Quick start
  - [x] Replace inline Active Context block (initially drafted as
    Pattern A) with the Pattern B pointer paragraph
- [x] **TASK-2.2.2** — Edit `AGENTS.md` (AC: 3)
  - [x] Append `## Koni-Docs` section
- [x] **TASK-2.2.3** — Create active-context files (AC: 5, 6, 7)
  - [x] `.active-context.example.md` — committed template
  - [x] `.active-context.md` — gitignored local snapshot
  - [x] `.gitignore` — append `.active-context.md` with comment

## Dev notes

### Architecture constraints

- Uses Pattern B (file-extracted) per `koni-docs` integration template
  §2. Pattern A (inline) is documented as a fallback for solo dev.
- The `<!-- koni-docs:auto-update -->` markers must be on their own
  line. Future agent T1–T7 edits target this block inside
  `.active-context.md`, NOT `CLAUDE.md`.
- `plugins: []` stays empty in v0.1 — plugin skills come in EPIC-3.

### Cross-story dependencies

- Builds on [US-1.2](US-1.2-active-context-split-pattern.md) — that
  story documents Pattern B in the skill; this story consumes it.
- Builds on [US-2.1](US-2.1-bootstrap-docs-structure.md) — the Active
  Context references `sprint-2026-W22` which US-2.1 creates.
- Builds on [US-2.3](US-2.3-version-changelog-seed.md) — `Last
  Version: v0.1.0` references the VERSION file US-2.3 introduces.

### References

- [Source: integration template](../../../skills/koni-docs/references/templates/integration.md)
- [Source: SKILL.md §4 CLAUDE.md auto-update](../../../skills/koni-docs/SKILL.md)
- [Source: PRD §11 EPIC-2 / FR-7](../../PRD.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -q "^## Koni-Docs Integration" CLAUDE.md` |
| AC-2 | `grep -q "Moved to .active-context.md" CLAUDE.md` AND `! grep -q "koni-docs:auto-update" CLAUDE.md` |
| AC-3 | `grep -q "^## Koni-Docs$" AGENTS.md` |
| AC-4 | `grep -q "AGENTS.md" CLAUDE.md` |
| AC-5 | `test -f .active-context.example.md && grep -q "koni-docs:auto-update" .active-context.example.md` |
| AC-6 | `test -f .active-context.md && grep -q "koni-docs:auto-update" .active-context.md` |
| AC-7 | `grep -q "^\.active-context\.md$" .gitignore` |

## Changelog entry

### Added
- `CLAUDE.md`: `Koni-Docs Integration` config block + Active Context
  pointer (Pattern B — moved live snapshot out of CLAUDE.md).
- `AGENTS.md`: `Koni-Docs` reference section.
- `.active-context.example.md` (committed template, mirrors
  `koni-docs/references/templates/integration.md` §2).
- `.active-context.md` (gitignored, current local snapshot).
- `.gitignore`: `.active-context.md` entry with explanatory comment.

### Changed
- This repo adopted Pattern B (file-extracted Active Context) over
  Pattern A (inline). Decision recorded in [CONTEXT D7](../../CONTEXT.md).

**Commit**: pending

## Implementation notes

Initially drafted with Pattern A (inline Active Context inside
`CLAUDE.md`). Mid-sprint, referenced Koni-Finance-Final's `CLAUDE.md`
and switched to Pattern B before the first commit landed. The switch
itself was small: ~10-line change in `CLAUDE.md`, 2 new files at
repo root, 1 line in `.gitignore`. Pattern B's payoff is durable —
zero merge conflicts on Active Context going forward across parallel
branches.

## Files modified

**Modified (repo root):**
- `CLAUDE.md` — Koni-Docs Integration config block + Active Context pointer
- `AGENTS.md` — Koni-Docs reference section
- `.gitignore` — append `.active-context.md`

**Created (repo root):**
- `.active-context.example.md` — committed template
- `.active-context.md` — gitignored local snapshot

## Cross-references

- [PRD FR-7](../../PRD.md#8-functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [Integration template](../../../skills/koni-docs/references/templates/integration.md)
