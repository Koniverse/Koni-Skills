---
id: US-1.7
title: "Close the open skill-grading findings on koni-docs (the ≥95 bar)"
epic: EPIC-1
status: backlog
priority: P2
points: 5
sprint:
due:
version_shipped:
prd_ref: []
arch_ref: []
depends_on: [US-1.6]
assignee:
commit:
created: 2026-07-13
updated: 2026-07-13
external_deps:
---

## Goal

US-1.6 shipped story deadlines (`due`) and then ran koni-qc's skill-grading rubric on
koni-docs across 14 rounds (v0.39.0 → v0.52.0). The skill's **content** passed: the CLI
does what the docs say, every rule holds under adversarial pressure, every reference
resolves. What did not converge is the **verification apparatus** the rounds built around
it — and a handful of content items nobody has picked up.

This story closes those. It is filed separately because the remaining work is **shared
infrastructure** (a reference checker used by all six skills) plus loose ends — not the
deadline feature US-1.6 delivered. Keeping them in US-1.6 would be story sprawl in the
other direction: a single story that never ends.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §13 (one story =
one deliverable: US-1.6's deliverable shipped; this is a different one), §26 (verify the
output, not the apparatus — which is exactly the trap most of these findings sit in), §28
(mechanize the enumeration rather than patching what the last reviewer found).

## Background

Where the score stood when the work paused (round 10, v0.52.0):

| Dimension | Score | State |
|---|---|---|
| D1 — Discoverability / triggering | **25/25** | Maxed, stable across 4 rounds |
| D2 — Rule-robustness under pressure | **25/25** | Maxed, stable across 3 rounds. All 9 rules held |
| D3 — Content (author-blind) | 5/25 → fixed | Collapsed on the escape-hatch bug; the fix landed but was **never re-graded** |
| D4 — Best-practices (×2 avg) | **23/25** | Highest of the run |

Total at last full measurement: **~92/100**. Bar is ≥95. **D3 has not been re-graded since
the round-14 fixes landed** — the grading agents were cut off by a session limit
mid-review. The first task below is simply to finish that measurement; the score may
already clear.

## Acceptance criteria

- [ ] **AC-1** — D3 is re-graded author-blind against v0.52.0 (the escape-hatch fix, the
  branch-coverage gate, the path-qualified script check). A score is recorded, not
  assumed.
- [ ] **AC-2** — All four dimensions are re-graded in the same round (RULE: the rubric
  forbids inferring "still ≥95" from a review of the fix alone — LESSONS §8).
- [ ] **AC-3** — The reference checker's **exemption list** is audited. The coverage gate
  excludes 7 bare `continue`/`break` jumps on the ground that "CPython attributes the line
  event to the guarding `if`". **A reviewer was mid-way through challenging this when the
  session ended**: the claim is about the guard *line*, not the guard's *true branch*. If
  a guard's true branch is never taken by any fixture, the gate is exempting a real hole.
  Instrument it and prove each `continue` is actually *taken*, or plant a fixture that
  takes it.
- [ ] **AC-4** — Coverage ≠ correctness: a branch can be executed by a fixture without the
  fixture *asserting* anything about it. Cross-check that every covered branch also has a
  `MUST_CATCH` needle or a clean-control expectation behind it.
- [ ] **AC-5** — The four remaining evals (1, 3, 4, 5) are **run** and their results
  recorded. Two of six have been run (both PASS). Per `evals/README.md`'s own rule, an
  eval with an empty `## Runs` table is a specification, not a test.
- [ ] **AC-6** — Evals are run on more than one model tier. A rule that holds only on the
  strongest model will break in production; the cheaper tiers are where rationalizations
  happen.
- [ ] **AC-7** — The 7 pre-existing `story-status` warnings are resolved (stories marked
  `done` with unchecked AC/task boxes — US-1.2, US-1.3, US-1.5, US-2.1, US-2.3, US-4.17,
  US-4.28). Either tick the boxes because the work is done, or say plainly that it isn't.

## Tasks

- [ ] **TASK-1.7.1** — Re-grade all four dimensions against v0.52.0 (AC: 1, 2)
- [ ] **TASK-1.7.2** — Audit the coverage gate's exemption list; prove each `continue` is
  taken, or fixture it (AC: 3)
- [ ] **TASK-1.7.3** — Cross-check coverage against assertion: a covered branch with no
  needle behind it is an unpinned claim wearing a green light (AC: 4)
- [ ] **TASK-1.7.4** — Run evals 1, 3, 4, 5; record results honestly, including failures
  and any false claims the agents make (AC: 5)
- [ ] **TASK-1.7.5** — Run the eval suite on a second model tier (AC: 6)
- [ ] **TASK-1.7.6** — Clear the 7 `story-status` warnings (AC: 7)

## Dev notes

### The open findings, in priority order

**1. The coverage gate's exemptions are unproven (Important).**
`scripts/__tests__/test-coverage.py` excludes bare `continue`/`break` lines because
CPython attributes the line event to the guarding `if`. That is true — but the exemption
claims *"each of these sits under a guard the fixtures do reach"*, and **reaching a guard
is not the same as taking its true branch**. A reviewer was instrumenting exactly this
when the session was cut. If any of those 7 guards is never *taken*, the gate is currently
green over a real hole. This is the highest-value item: it is the keystone of the whole
verification tower, and it is the one part nobody has independently confirmed.

**2. Coverage is not correctness (Important).**
The gate proves every branch *executes* under the fixture corpus. It does not prove any
fixture *asserts* on the branch's behaviour. A line can be exercised by the clean control
and asserted by nothing. The honest check is a join: every branch that can append a
problem must have a `MUST_CATCH` needle; every branch that can *skip* must have a
clean-control line that would fail if it stopped skipping.

**3. Four of six evals have never been run (Important).**
`evals/README.md` states the rule and then breaks it. Evals 2 and 6 ran and both passed —
and both exceeded their criteria, which is itself evidence the instrument is well-built.
Evals 1, 3, 4, 5 are unrun. Until they are, the skill cannot claim it *causes* the
behaviour it documents; it can only claim it describes it.

**4. Single-model evidence (Minor, but it hides the real risk).**
Everything was measured on one model tier. LESSONS §26's whole point is that the skill's
product is behaviour in *another* agent — and cheaper models are precisely where a rule
folds. A GREEN on Opus is weak evidence about Haiku.

**5. Seven pre-existing `story-status` warnings (Minor).**
Stories marked `done` with unchecked AC/task boxes. Pre-dates this work; the gate warns
and does not block. They are either finished (tick them) or they are not (say so). Leaving
them is the "completeness theatre" LESSONS §12 warns about, in miniature.

**6. The checker is shared infrastructure living in one skill's directory (Minor).**
`skills/koni-docs/scripts/check-references.py` is now run by the harness gate against **all
six skills**, and it found real defects in koni-qc, koni-setup, koni-harness, and
koni-agent-monitoring. It is not koni-docs' tool any more. Consider whether it belongs in
koni-harness (which owns the gate) — with the caveat that moving it is a cross-skill change
and needs its own story, not a drive-by.

### What is explicitly NOT in scope

- **Re-litigating the deadline feature.** `due` shipped, works, is documented, and holds
  under pressure. Every finding above is about the machinery built *around* the review, not
  about the field.
- **Adding a fifth verification tier.** Four (checker → self-test → mutation test →
  coverage gate) is already at the edge of what a documentation skill should carry. The
  next move is to *prove the existing four*, not to stack another.

### References

- [US-1.6](US-1.6-story-deadlines.md) — the anchor story; 14 rounds of grading recorded in its round notes
- [LESSONS §19-§28](../../LESSONS.md) — every verification failure this work uncovered, in order
- [CONTEXT D37](../../CONTEXT.md) — the deadline design decision
- `skills/koni-qc/references/skill-grading.md` — the rubric and the ≥95 bar

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | Re-run the four-dimension grade; record the scorecard in this story |
| AC-3 | `python3 skills/koni-docs/scripts/__tests__/test-coverage.py` after removing each exemption in turn — the gate must fail |
| AC-4 | Manual join: every `problems.append` branch ↔ a `MUST_CATCH` needle |
| AC-5 | Every `## Runs` table in `skills/koni-docs/evals/*.md` has ≥1 row |
| AC-7 | `sh .koni-harness/gate-runner.sh --phase release-commit` → zero `story-status` warnings |

## Changelog entry

### Fixed
- (fill on ship)

## Implementation notes

(empty — filled during implementation)

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md)
- [US-1.6](US-1.6-story-deadlines.md)
- [LESSONS](../../LESSONS.md)
