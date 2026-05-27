---
id: US-1.4
title: "Document AGENTS-canonical / CLAUDE-pointer convention in skill"
epic: EPIC-1
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

Document in the `koni-docs` skill the recommended **project file
architecture convention**: `AGENTS.md` is the single source of truth
for all AI instructions; `CLAUDE.md` is a thin pointer plus only the
Claude-Code activation surface (Koni-Docs Integration config + Active
Context). Same content lives once, not twice.

After this story ships, the `integration.md` template tells consumer
projects exactly what stays in each file, with a filled example for
both shapes.

## Background

Koni-Finance-Final's
[`CLAUDE.md`](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md)
line 3 demonstrates the convention plainly: *"This project uses
**[AGENTS.md](AGENTS.md)** as the single source of truth for all AI
instructions…"*. The rationale: Cursor, Gemini, Codex CLI, Copilot CLI
all read `AGENTS.md` natively; Claude Code reads both. Putting durable
content in AGENTS.md reaches every agent. Putting it in CLAUDE.md
reaches only Claude Code AND creates a duplicate that drifts.

This repo originally shipped CLAUDE.md with `## Quick start` and
`## Documentation` sections duplicating content from AGENTS.md (a
papercut introduced when [US-2.1](US-2.1-bootstrap-docs-structure.md)
authored CLAUDE.md without first checking AGENTS.md's existing scope).
The user requested 2026-05-27 PM that the skill formalize the
convention so future consumer projects don't repeat the duplication.

[CONTEXT D9](../../CONTEXT.md) authorizes the convention. Sibling
[US-2.4](US-2.4-apply-agents-canonical.md) applies it to this repo.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/references/templates/integration.md`
  §3 grew a new subsection **§3.1 Convention: AGENTS.md is canonical,
  CLAUDE.md is pointer** with: "What stays in CLAUDE.md" list, "What
  goes in AGENTS.md" list, rationale bullets ("Multi-agent reach",
  "Single source of truth", "Smaller CLAUDE.md = less merge churn"),
  and two filled examples (CLAUDE.md thin pointer + AGENTS.md preamble).
- [x] **AC-2** — Existing §3 content (AGENTS.md Koni-Docs Reference
  Block) moved into §3.2 — no info loss; §4 / §5 / §6 keep their
  numbering so prior story cross-refs don't break.
- [x] **AC-3** — `skills/koni-docs/SKILL.md` §5 activation table adds
  a row routing "make AGENTS.md canonical / slim CLAUDE.md /
  AGENTS-canonical convention" to `integration.md` §3.1.

## Tasks

- [x] **TASK-1.4.1** — Add §3.1 to `integration.md` (AC: 1)
  - [x] "What stays in CLAUDE.md" — 4-item list
  - [x] "What goes in AGENTS.md" — 6-item list
  - [x] Rationale — 3 bullets
  - [x] Filled `CLAUDE.md` thin-pointer example
  - [x] Filled `AGENTS.md` preamble example
- [x] **TASK-1.4.2** — Rename current §3 body → §3.2 (AC: 2)
- [x] **TASK-1.4.3** — Add activation row in `SKILL.md` §5 (AC: 3)

## Dev notes

### Architecture constraints

- [AD-4](../../ARCHITECTURE.md#architecture-decisions) — keep
  one-file-per-template-type. The convention is one section in
  `integration.md`, not a new top-level template file. Reason: this
  isn't a new artifact type, it's a recommended sub-pattern for the
  AGENTS.md / CLAUDE.md surface that `integration.md` already covers.
- Numbering preservation: prior stories cite specific sections of
  `integration.md` (`§2`, `§5`, `§6`). Adding §3.1 inside §3 keeps
  §4 / §5 / §6 untouched.
- Skill body NFR-1 (≤ 500 lines): one row added to SKILL.md §5
  activation table; body stays well under cap.

### Cross-story dependencies

- Builds on [US-1.2](US-1.2-active-context-split-pattern.md) — Pattern B
  in §2 of `integration.md` is referenced from the new §3.1 rationale
  ("Smaller CLAUDE.md = less merge churn — with Active Context already
  moved to `.active-context.md`…").
- Sibling [US-2.4](US-2.4-apply-agents-canonical.md) — applies the
  convention to this repo. Both must ship in the same sprint for the
  filled example in §3.1 to reflect actual practice.

### What we explicitly did NOT do

- **No new RULE-N for this convention.** It is project-level guidance,
  not a BLOCKER-severity invariant like RULE-15. Some Koniverse
  projects may legitimately prefer CLAUDE.md primary (e.g. a
  Claude-Code-only internal tool). The convention is documented and
  recommended, not enforced.

### References

- [Source: Koni-Finance-Final CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md) — the line-3 statement that motivated this convention
- [Source: integration.md §3.1](../../../skills/koni-docs/references/templates/integration.md)
- [Source: SKILL.md §5 activation table](../../../skills/koni-docs/SKILL.md)
- [Source: PRD FR-13, AD-9](../../PRD.md)
- [Source: CONTEXT D9](../../CONTEXT.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -q "^### 3.1 Convention" skills/koni-docs/references/templates/integration.md` |
| AC-2 | `grep -q "^### 3.2 AGENTS.md" skills/koni-docs/references/templates/integration.md` |
| AC-3 | `grep -q "AGENTS-canonical convention" skills/koni-docs/SKILL.md` |

## Changelog entry

### Added
- `koni-docs` skill: §3.1 of `references/templates/integration.md`
  documents the **AGENTS-canonical / CLAUDE-pointer convention** —
  AGENTS.md is the single source of truth; CLAUDE.md is a thin pointer
  that holds only the Koni-Docs Integration config + Active Context
  pointer (+ optional Claude-Code-only routing blocks).
- `SKILL.md` §5 activation table routes "make AGENTS.md canonical" /
  "slim CLAUDE.md" / "AGENTS-canonical convention" to
  `integration.md` §3.1.

### Changed
- `references/templates/integration.md` §3 split into §3.1 (new
  convention) and §3.2 (existing AGENTS.md Koni-Docs Reference Block).
  No info loss; §4 / §5 / §6 keep their numbering.

**Commit**: pending

## Implementation notes

The convention was lifted from Koni-Finance-Final's line-3 CLAUDE.md
statement, then expanded into the koni-docs template shape (what stays
where, rationale, filled examples). Kept it as a documented convention,
not a numbered RULE — some projects may have legitimate reasons to
prefer CLAUDE.md primary, so this is recommendation, not enforcement.

## Files modified

**Modified (skills/koni-docs/):**
- `references/templates/integration.md` — §3 expanded with §3.1 convention + §3.2 (existing content)
- `SKILL.md` — §5 activation table row added

## Cross-references

- [PRD FR-13, AD-9](../../PRD.md)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CONTEXT D9](../../CONTEXT.md)
- [Sibling US-2.4](US-2.4-apply-agents-canonical.md) — applies convention to this repo
- [Builds on US-1.2](US-1.2-active-context-split-pattern.md) — Pattern B referenced from §3.1 rationale
