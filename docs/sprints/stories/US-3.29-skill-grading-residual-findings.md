---
id: US-3.29
title: "Close the residual skill-grading findings — the four skills sit at 80–86/100 against a ≥95 bar"
epic: EPIC-3
status: backlog
priority: P1
points: 8
sprint: ''
due:
prd_ref: [FR-21]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: ''
created: 2026-09-29
updated: 2026-09-29
external_deps:
---

## Goal

Get `koni-harness`, `koni-setup`, `koni-docs`, and `koni-qc` to the ≥95 catalog bar
([CONTEXT D19](../../CONTEXT.md)). A full four-dimension grade in v0.71.0/v0.72.0 put
all four in the low 80s. v0.72.0 fixed the defects that release introduced plus the two
most dangerous pre-existing ones; this story carries what is left.

## Background

The grade was run properly for the first time on these skills: nine agents, one per
dimension per skill, D1 as a single blind router over all six descriptions (near-miss
detection needs the siblings present). D4 was run by the author and is therefore **not
a grade** — recorded `UNGRADED`, per the same rule this round pressure-tested.

**Scores at the point this story was filed** (D4 excluded; the totals are upper bounds,
so all four fail regardless of it):

| Skill | D1 | D2 | D3 | ceiling |
|---|---|---|---|---|
| koni-harness | 24 | 20.5 | 16 | ≤85.5 |
| koni-qc | 21 | 21.9 | 16 | ≤83.9 |
| koni-setup | 24 | 16.7 | 17 | ≤82.7 |
| koni-docs | 20 | 20.0 | 17 | ≤82.0 |

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§8** (grading
is iterative; expect each fix to surface the next finding — which is why this is filed
rather than claimed closed); **§18** (a rule is only enforced where it is read — most
residual findings are one authority stated four ways); **§36** (a guard advertising a
class while implementing an instance).

## Residual findings

### A. Pick one authority and propagate (the largest class)

- **A1 — the Review pass set is numbered four incompatible ways.**
  `agentic-loop-standard.md:33` lists 5 passes; `:83-86` lists 4 (security dropped);
  `review-contract.md:163` calls code-quality "Pass 4 … runs last" while `:213` numbers
  `/design-review` as pass 5 and `:185` says "after all five passes";
  `example-loop.md` / `loop-runner.md` say "four-step"; right-sizing calls the same
  stage "two-stage". `review-contract.md` is also the outlier on *order*.
- **A2 — the tier model contradicts `frame-protocol.md` §1/§5.**
  `agentic-loop-standard.md:57-58` says tier-0/1 "skip Frame"; `frame-protocol.md:35`
  gives tier 1 a two-question budget. Within the file, the money/secrets override
  ("regardless of tier") collides with "tier 0 — ask nothing". §5's author-blind row
  omits tier 1 entirely, the one tier a fresh agent most needs.
- **A3 — tier-1 answers are routed to "the story's Background", but
  `agentic-loop-standard.md:56-58` says tier-0/1 refinements legitimately have no story.**
  No destination is given for that case.

### B. Guards whose behaviour disagrees with their documentation

- **B1 — four of ten shipped checks read the working tree, not the staged state.**
  `changelog-anchor.sh`, `story-lint.sh`, `story-status-consistency.sh`,
  `koni-docs-validate.sh` — zero `--cached` / `git show :` calls. Principle 3 and
  `gate-catalog.md` both instruct the opposite. Two are `block`-severity, so an
  unstaged local edit can block a release commit and a staged fix to a dirty file is
  invisible. Undisclosed anywhere.
- **B2 — `run-all.sh` coverage is a name mention, not proof of an assertion.**
  `grep -rlF "$base"` reports `passthrough.sh` COVERED on a bare mention. The row
  wording is honest ("named by no suite"); the section header "**proves** the set is
  complete" overstates it.
- **B3 — `install-gate.sh`'s gitignore upgrade silently no-ops if the begin marker
  survives but the end marker was hand-removed**: the `awk` insertion point never
  matches, `mv` rewrites the file unchanged, exit 0.

### C. Rules that hold only in a reference a hurried agent will not load

- **C1 — sprint backdating.** koni-docs `SKILL.md` is silent; the only statement is a
  parenthetical in `sprint-system.md:134-136`, with no RULE-n, no severity, no grep
  check. Empirical evidence it does not hold: this very sprint was first opened from an
  inferred date (see [W40](../sprint-2026-W40.md) notes).
- **C2 — composition/duplication.** SKILL.md forbids *replacing* the core rules, never
  *copying* them; the "self-contained (AD-1)" clause in `plugin-pattern.md:59-64` is the
  hook a "paste RULE-1 in for convenience" request quotes back.
- **C3 — the design-first trio has no tier floor.** Nothing raises a UI change above
  tier 1, so `/design-review` drops out legitimately; and the honest
  "the gate is a presence-check, a grep cannot see a rendered breakpoint" disclosure
  reads under deadline as instructions for passing green without building mobile.

### D. The one-agent-per-dimension rule folds under a foreclosing request

Under a phrasing that pre-refuses a process reply ("I need actual numbers, not a
process proposal"), an agent scored all four dimensions itself and emitted
`Total 87/100 · FAIL`, disclosing the violation only as a caveat. Three holes: the rule
governs an *arrangement* not an *artifact*; the Scorecard has no provenance column; and
no fallback output is defined for "graders unavailable". Proposed fix (from the D2 run)
is in the grading agent's report — add the `UNGRADED — <dimension>: grader not
dispatched` output and a Grader column whose empty/duplicate cell invalidates the total.

### E. koni-qc's worked example self-certifies against a retired rule

`customize-network-test-cases.example.md:207` grades itself `✅ PASS` with Band A/B/C
blocks and no Band D — 25 cases where Band D expects 40–150, and its own header says the
manual suite it beats had 58. `SKILL.md` routes "show me a worked example" here. Band D's
*wording* was propagated in v0.72.0; the exemplar itself was not regraded.

### F. Behavioural evals are unrun — ✅ CLOSED by [US-3.30](US-3.30-continuous-evals-in-ci.md), and the finding as written was partly wrong

**Corrected**: this finding claimed **every** `## Runs` table was empty. Two of six (02 and
06) already carried a 2026-07-13 run. The claim came from an author-blind reviewer's report
and was propagated into the program plan and the v0.72.0 CHANGELOG without being checked;
the freshness script written for US-3.30 disproved it on its first execution.

All six now have recorded runs (5 PASS / 1 FAIL), the corpus is frozen and reproducible,
and CI gates freshness. **A new finding replaces it** — eval 01's FAIL is a cross-skill gap:
**koni-docs never mentions `Lessons applied:` while `story-lint` requires it on every story
created after 2026-07-04.** The skill that authors the artifact does not teach a field
another skill gates. That belongs to class A above.

## Acceptance criteria

- [ ] AC-1 — Each finding in A is resolved by naming one authority file per rule and
  propagating it; every other locus references rather than restates.
- [ ] AC-2 — B1 resolved: the four checks read staged state, **or** the divergence is
  disclosed in `gate-catalog.md` with the reason. Either is acceptable; silence is not.
- [ ] AC-3 — B2/B3 fixed, each with a planted-defect assertion proving the fix can fail.
- [ ] AC-4 — Each C finding is stated in the SKILL.md an agent loads, not only in a
  reference.
- [ ] AC-5 — D resolved in `skill-grading.md` with the provenance column and the
  `UNGRADED` fallback.
- [ ] AC-6 — E resolved: the exemplar is regraded against four bands, or explicitly
  downgraded from `✅ PASS` and labelled an abridged shape demo.
- [ ] AC-7 — F: the six evals are run and their `## Runs` tables filled, or the suite is
  marked unrun in `evals/README.md` so its status is not ambiguous.
- [ ] AC-8 — All four skills re-graded on **all four dimensions** (D4 by an agent that
  did not write the skill, ×2 averaged) and each clears **≥95**.

## Implementation notes

**Not started.** Filed with full evidence at the point the v0.72.0 fix round closed, so
the next session starts from findings rather than from a re-grade. Expect 2–3 fix rounds
(LESSONS §8) and a full nine-agent re-grade after each — a fix in one dimension routinely
lowers another.

**Sequencing hint**: class A first. Several D3 findings are the same contradiction seen
from different files, so picking the authority once collapses more than it looks like.
