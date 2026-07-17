---
id: US-3.17
title: "koni-harness — UI features always run the design-skill trio, desktop + mobile"
epic: EPIC-3
status: done
priority: P2
points: 2
sprint: sprint-2026-W29
due:
version_shipped: 0.63.0
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.3]
assignee: jindo9986
commit: 02bc06c
created: 2026-07-17
updated: 2026-07-17
external_deps:
---

## Goal

Make the koni-harness loop, whenever a feature has a user-facing surface, **always
invoke the three popular design skills — gstack `/design-consultation`, Anthropic
`frontend-design`, gstack `/design-review` — one per stage, and optimise for desktop
**and** mobile**, in compliance with the repo's `DESIGN.md` and its design LESSONS.

## Background

The harness already wired `frontend-design` (Execute) and `/design-review` (Review) and
the `design-first` gate, but the **design phase was implicit**: `/design-consultation`
(the gstack skill that establishes a design system) was named nowhere, "desktop AND
mobile" was not a first-class requirement, and the design **LESSONS** were not cited
alongside `DESIGN.md`. This closes those gaps by formalising the loop's design step as a
**trio, one skill per stage**:

| Stage | Skill | Job |
|---|---|---|
| Frame / Design | gstack `/design-consultation` | establish/confirm the design system vs `DESIGN.md` + design LESSONS |
| Execute / Build | Anthropic `frontend-design` | build it, desktop **and** mobile, tokens + shadcn primitives |
| Review / QA | gstack `/design-review` | designer's-eye QA on both breakpoints; confirm, never discover |

The mapping respects the harness's core tool invariant (gstack = brainstorm/plan/review
only; implementation = Anthropic Skills only): the two gstack skills sit at Frame and
Review, `frontend-design` is the sole implementer.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §15 (a
design-rule violation found at review is rework — comply at write time; the trio makes
"comply" a concrete three-step act); §19 (author-blind review confirmed the stage mapping
and that the tool invariant held). Extends CONTEXT D36 (design-first at Execute entry).

## Acceptance criteria

- [x] **AC-1** — `agentic-loop-standard.md`'s design-first callout is the **trio**: Frame
  → `/design-consultation`, Execute → `frontend-design`, Review → `/design-review`, each
  with its job; the stage table names `/design-consultation` at Frame and "desktop AND
  mobile" at Execute.
- [x] **AC-2** — "**desktop AND mobile**" (both breakpoints; honor a `DESIGN-MOBILE.md`
  if present) and "**`DESIGN.md` + design LESSONS**" are stated at Execute and Review.
- [x] **AC-3** — the `design-first` citation format records the trio:
  `Design applied: /design-consultation → DESIGN.md §… + LESSONS §…; frontend-design
  (desktop+mobile, shadcn primitives/tokens); /design-review pass`.
- [x] **AC-4** — the trio is described **consistently** across `SKILL.md` (description +
  owner table + tool-rule), `agentic-loop-standard.md`, `loop-runner.md`, and
  `example-loop.md`; the tool invariant (implement = Anthropic only) is not violated.
- [x] **AC-5** — `SKILL.md` description stays under the 1024-byte cap (1020);
  `check-references.py` → 0 dangling on koni-harness and all skills.
- [x] **AC-6** — the `design-first` **gate is not over-claimed**: it remains a
  presence-check for an added `Design applied:` line, not a verifier of the trio/mobile.

## Tasks

- [x] **TASK-3.17.1** — rewrite the design-first callout as the trio + stage table rows (AC: 1, 2, 3)
- [x] **TASK-3.17.2** — thread the trio through SKILL.md, loop-runner.md, example-loop.md (AC: 4)
- [x] **TASK-3.17.3** — trim the description under cap; check-references; author-blind review (AC: 5, 6)

## Dev notes

### What we explicitly did NOT do

- **Did not make `/design-consultation` blanket-mandatory.** It is skipped when `DESIGN.md`
  already covers the surface and you are *extending* an existing pattern, not introducing
  one — running a full design consultation to re-derive a settled system is waste.
- **Did not strengthen the `design-first` gate to verify the trio or mobile.** A grep
  cannot judge "did you actually build mobile" — the gate stays a presence-check for the
  citation; `/design-review` is the judge of what a grep cannot see.
- **Did not touch the implement-only invariant.** gstack stays brainstorm/plan/review.

### References

- [Source: PRD FR-21](../../PRD.md#functional-requirements) — koni-harness Agentic Loop standard
- [Source: agentic-loop-standard.md](../../../skills/koni-harness/references/agentic-loop-standard.md) — the design-first / trio callout
- [Source: CONTEXT D36](../../CONTEXT.md), [LESSONS §15](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1..4 | `rg -n 'design-consultation\|desktop AND mobile\|design LESSONS\|design-skill trio' skills/koni-harness` returns hits in SKILL.md + agentic-loop-standard.md + loop-runner.md + example-loop.md |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-harness` → 0 dangling |

## Changelog entry

### Changed
- koni-harness: a UI feature now **always runs the design-skill trio** — gstack `/design-consultation` (Frame) → Anthropic `frontend-design` (Execute) → gstack `/design-review` (Review) — built for **desktop AND mobile** and to `DESIGN.md` + the repo's design LESSONS. Formalises the previously-implicit design phase across SKILL.md + agentic-loop-standard + loop-runner + example-loop; the `design-first` citation now records the trio. Gate mechanics unchanged (presence-check).

## Implementation notes

Doc/process change to the harness loop — no code, no gate change. Author-blind review
confirmed the three skills map to the right stages, the trio is consistent across all four
files, and the implement-only tool invariant is preserved (SHIP, no fixes).

Lessons: none new — this extends the existing design-first standard (CONTEXT D36 /
LESSONS §15) with the specific skill trio and the desktop+mobile requirement; no new
principle to record.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.3](US-3.3-koni-harness-agentic-loop.md) — the harness this refines
- [CHANGELOG v0.63.0](../../CHANGELOG.md)
