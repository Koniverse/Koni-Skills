---
id: US-1.2
title: "Add file-extracted active-context pattern to koni-docs"
epic: EPIC-1
status: done
priority: P0
points: 3
sprint: sprint-2026-W22
version_shipped: 0.2.0
prd_ref: FR-11
assignee: saltict
commit: 2aff2fe
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Extend the `koni-docs` skill so consumer projects can adopt a
**file-extracted Active Context pattern** — moving the volatile sprint
snapshot out of `CLAUDE.md` and into a gitignored `.active-context.md`
(with a committed `.active-context.example.md` template). The goal is
to eliminate the recurring merge-conflict friction every multi-developer
Koniverse project hits when two branches both touch the inline
`CLAUDE.md` Active Context block.

After this story ships, the skill documents **two valid patterns**:
- **Pattern A** (inline in `CLAUDE.md`) — solo dev, low merge churn.
- **Pattern B** (file-extracted) — recommended for teams.

## Background

[Koni-Finance-Final](https://github.com/Koniverse/Koni-Finance-Final)
adopted the file-extracted pattern in May 2026 after the inline
`CLAUDE.md` Active Context block became a recurring merge-conflict
source on every PR that opened or closed a story in parallel with
another developer's branch. The pattern proved out:

- `.active-context.md` is gitignored — local changes never touch the
  shared `CLAUDE.md`.
- `.active-context.example.md` is committed — defines the team
  template so new contributors know the shape.
- `CLAUDE.md` keeps only the static `Koni-Docs Integration` config
  block + a one-paragraph pointer to `.active-context.md`.
- Durable record stays in `docs/sprints/`, `CHANGELOG.md`, `CONTEXT.md`,
  `LESSONS.md` — the gitignored file is just a fast session-start
  snapshot, not the source of truth.

This story ports the pattern into the `koni-docs` skill so any
Koniverse project consuming the skill via `npx skills add` inherits
the option. Koni-Finance-Final's source files were used verbatim as
the reference shape; the rationale is recorded in [CONTEXT D7](../../CONTEXT.md).

**Out of scope for this story**: RULE-16 (bare semver
`version_shipped`). Visible in Koni-Finance-Final's `CLAUDE.md` and
would close [LESSONS §4](../../LESSONS.md), but needs template
touch-ups across epic / sprint / PRD frontmatter. Filed as follow-up.

> **Note**: RULE-15 (`assignee:` = GitHub login) was originally
> deferred here too. The user picked it up on the same day; shipping
> in this sprint as [US-1.3](US-1.3-rule-15-assignee-github-login.md).
> RULE-16 remains the only deferred companion convention.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/references/templates/integration.md`
  documents both patterns: §0 picks one, §1 inline Pattern A, §2
  file-extracted Pattern B with full step-by-step (CLAUDE.md pointer,
  `.active-context.example.md` template, gitignore, copy step), §5
  filled `.active-context.md` example, §6 filled inline example.
- [x] **AC-2** — `skills/koni-docs/SKILL.md` §4 describes both patterns
  in summary, with a table contrasting "when to use" + link to
  `integration.md` for the full template. SKILL.md body stays ≤ 500
  lines (NFR-1).
- [x] **AC-3** — `skills/koni-docs/SKILL.md` §5 activation table adds a
  row for "adopt active-context split" routing to `integration.md` §2.
- [ ] **AC-4** — Consumer projects on Pattern B can run a `grep -q
  "koni-docs:auto-update" .active-context.md` and find the auto-update
  markers in the file-extracted snapshot (not in `CLAUDE.md`).

## Tasks

- [x] **TASK-1.2.1** — Rewrite `references/templates/integration.md` to
  cover both patterns (AC: 1)
  - [x] §0 pattern-picker table + rationale
  - [x] §1 Pattern A (inline) — preserved
  - [x] §2 Pattern B (file-extracted) — step 1 CLAUDE.md pointer, step
    2 example template, step 3 gitignore line, step 4 copy command
  - [x] §3 AGENTS.md block (same for both)
  - [x] §4 trigger points (same for both)
  - [x] §5 / §6 filled examples for both
- [x] **TASK-1.2.2** — Update `SKILL.md` §4 (AC: 2)
  - [x] Add pattern-picker table at the top of §4
  - [x] Keep the inline integration block as Pattern A
  - [x] Add Pattern B summary + pointer to `integration.md` §2
  - [x] Preserve T1–T7 trigger points (apply to both patterns)
- [x] **TASK-1.2.3** — Update `SKILL.md` §5 activation table (AC: 3)
  - [x] Add row for "adopt active-context split"
- [ ] **TASK-1.2.4** — Verify on a downstream project (AC: 4) — deferred
  until a consumer repo upgrades

## Dev notes

### Architecture constraints

- [AD-4](../../ARCHITECTURE.md#architecture-decisions) — templates split
  one-file-per-type. The new Pattern B content lives inside
  `integration.md`, NOT a separate `active-context.md` template, because
  Pattern A and B share Trigger points and AGENTS.md block; co-locating
  preserves the "one template per request-type" principle.
- SKILL.md NFR-1 (≤ 500 lines) — pattern-picker added to §4 added ~25
  lines; SKILL.md currently 314 lines, well under cap.

### Cross-story dependencies

- Required by [US-2.2](US-2.2-wire-integration-blocks.md) — that
  story (in this sprint) actually applies Pattern B to this repo.
  Both must land in the same sprint for consistency.
- Builds on [US-1.1](US-1.1-koni-docs-initial-release.md) — uses the
  integration template that v0.1.0 shipped as the canonical
  authoring surface.

### What we explicitly did NOT do

- **No RULE-16 added** (bare-semver `version_shipped`). Visible in
  Koni-Finance-Final's CLAUDE.md alongside RULE-15; would close
  [LESSONS §4](../../LESSONS.md) but needs template touch-ups across
  story / epic / sprint / PRD frontmatter and a sweep of this repo's
  existing `version_shipped: v0.1.0` value. Filed as follow-up under
  EPIC-1.
- **RULE-15 was originally deferred here** but the user picked it up
  the same day; shipping in this sprint as
  [US-1.3](US-1.3-rule-15-assignee-github-login.md).
- **No `.agents/skills/koni-docs/` mirror update.** That copy is
  refreshed by `npx skills update` after this commit is pushed to
  GitHub. Per AGENTS.md, agents must not hand-edit files under
  `.agents/`.

### References

- [Reference impl: Koni-Finance-Final CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md) — the lines that announce Active Context moved to `.active-context.md`.
- [Source: integration template](../../../skills/koni-docs/references/templates/integration.md)
- [Source: SKILL.md §4](../../../skills/koni-docs/SKILL.md)
- [Source: CONTEXT D7](../../CONTEXT.md)
- [Source: PRD FR-11](../../PRD.md#8-functional-requirements)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -c "^## 0\|^## 1\|^## 2\|^## 3\|^## 4\|^## 5\|^## 6" skills/koni-docs/references/templates/integration.md` returns ≥ 7 |
| AC-2 | `wc -l skills/koni-docs/SKILL.md` returns ≤ 500 AND `grep -q "Pattern B" skills/koni-docs/SKILL.md` |
| AC-3 | `grep -q "adopt active-context split" skills/koni-docs/SKILL.md` |
| AC-4 | `grep -q "koni-docs:auto-update" .active-context.md` (in any consumer repo on Pattern B) |

## Changelog entry

### Added
- `koni-docs` skill: documented file-extracted Active Context pattern
  (Pattern B) in `references/templates/integration.md` §0/§2/§5.
  Recommended for multi-developer teams to eliminate `CLAUDE.md`
  merge churn.
- `SKILL.md` §4 grew a pattern-picker table contrasting inline
  (Pattern A) vs file-extracted (Pattern B); activation table §5
  routes "adopt active-context split" to `integration.md` §2.

### Changed
- `CLAUDE.md` integration template now distinguishes the static
  `Koni-Docs Integration` config block (always inline) from the
  Active Context block (either inline OR pointer-to-`.active-context.md`).

**Commit**: pending

## Implementation notes

The pattern was lifted from Koni-Finance-Final verbatim, then
generalized in template form. The single biggest reviewer surprise
was that AGENTS.md stays unchanged across both patterns — only the
*location* of the Active Context block differs, and AGENTS.md was
always a pointer anyway.

## Files modified

**Modified (skills/koni-docs/):**
- `references/templates/integration.md` — full rewrite, both patterns + filled examples
- `SKILL.md` §4 — pattern-picker table + Pattern B summary + activation row

## Cross-references

- [PRD FR-11](../../PRD.md#8-functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CONTEXT D7](../../CONTEXT.md)
- [Sibling US-2.2](US-2.2-wire-integration-blocks.md) — applies the pattern to this repo
