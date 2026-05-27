---
id: US-3.1
title: "Define plugin-skill pattern (Supabase, Next.js)"
epic: EPIC-3
status: backlog
priority: P1
points: 8
sprint:
version_shipped:
prd_ref: FR-9
assignee:
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Document how a plugin skill (e.g. `koni-supabase`, `koni-nextjs`)
extends `koni-docs` for a specific tech stack, and ship at least one
reference implementation. After this story, a Koniverse project on
Supabase can `npx skills add Koniverse/Koni-Skills --skill koni-docs
--skill koni-supabase` and pick up both the core 9 rules and the
Supabase-specific rules (RLS guards, migration safety, etc.) without
forking the core skill.

## Background

The v0.1.0 integration block reserves a `koni-docs-plugins:` slot
([SKILL.md §2](../../../skills/koni-docs/SKILL.md)). No plugin skill
has been written yet — and the exact mechanism by which the agent
discovers, loads, and composes plugin rules is sketched but not
specified. This story turns the sketch into a contract.

Open questions surfaced in ARCHITECTURE.md "Open architecture
questions" that this story must answer:
- How does a consumer project declare which plugin skills to load?
- Where do plugin skills live in this repo? (Presumably
  `skills/koni-supabase/`.)
- How does the agent compose `koni-docs` core rules with a plugin's
  additional rules without conflict or duplication?
- What is the migration story for a project that adds a plugin later?

## Acceptance criteria

- [ ] **AC-1** — A new reference document
  `skills/koni-docs/references/plugin-pattern.md` (or equivalent)
  describes: plugin directory shape, declaration mechanism in
  CLAUDE.md `koni-docs-plugins:`, rule-composition contract, and
  conflict-resolution rules.
- [ ] **AC-2** — At least one plugin skill ships in `skills/`
  (candidates: `koni-supabase` — RLS guards, migration safety
  rules; or `koni-nextjs` — RSC/client component boundary rules,
  `next build` vs `tsc --noEmit` lesson).
- [ ] **AC-3** — The plugin's `SKILL.md` declares its dependency on
  `koni-docs` and lists the additional rules it introduces (`PLG-N` or
  similar prefix to disambiguate from core RULE-N).
- [ ] **AC-4** — A consumer project (synthetic test fixture) installs
  both `koni-docs` and the plugin via `npx skills add` and the agent
  correctly loads both rule sets on session start.

## Tasks

(to be detailed during sprint planning — this story is currently backlog)

- [ ] **TASK-3.1.1** — Brainstorm + design plugin pattern (`/office-hours` + `/plan-eng-review`)
- [ ] **TASK-3.1.2** — Write `plugin-pattern.md` reference document
- [ ] **TASK-3.1.3** — Implement first plugin skill (Supabase or Next.js)
- [ ] **TASK-3.1.4** — Synthetic-consumer test fixture demonstrating composition

## Dev notes

### Architecture constraints

- [AD-1](../../ARCHITECTURE.md#architecture-decisions) — plugin skills are
  self-contained directories; no cross-skill imports. Composition happens
  at the agent's activation step, not at skill-build time.
- [AD-3](../../ARCHITECTURE.md#architecture-decisions) — plugin rules
  EXTEND, never REPLACE, core RULE-N. Numbering scheme TBD (proposal:
  `<PLUGIN>-N`, e.g. `SUPA-1`).

### What we explicitly did NOT do

(scope TBD — this story is currently backlog)

### References

- [Source: PRD FR-9](../../PRD.md#8-functional-requirements)
- [Source: ARCHITECTURE Open questions](../../ARCHITECTURE.md)
- [Source: SKILL.md §2 plugin slot](../../../skills/koni-docs/SKILL.md)

## Verification commands

(to be filled during sprint planning)

## Changelog entry

(to be drafted near completion)

## Implementation notes

(empty until sprint pickup)

## Files modified

(empty until sprint pickup)

## Cross-references

- [PRD FR-9](../../PRD.md#8-functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
