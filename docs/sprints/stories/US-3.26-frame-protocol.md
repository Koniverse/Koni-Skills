---
id: US-3.26
title: "Frame protocol + stage-applicability table — give the front half of the loop the specification the back half already has"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W36
due:
version_shipped: 0.70.0
prd_ref: [FR-44]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: c62be91
created: 2026-09-04
updated: 2026-09-04
external_deps:
---

## Goal

Make Frame as specified as Review, the Doc gate, and Commit. Those three have a contract,
a completeness bar, and an exit code. Frame had a tier number and good intentions — so two
opposite failures were both possible and neither was visible: a fork resolved by silent
assumption, and a user interrogated with six questions already answered in `AGENTS.md`.

## Background

The comparison against `awslabs/aidlc-workflows` was lopsided: Koni leads decisively on the
back half of the loop and trails on the front, where AI-DLC carries per-stage applicability
criteria and a file-based structured question protocol. Two of the five borrowed items are
that front half, and they land in one story because they are one deliverable — Frame stops
making unrecorded decisions. Splitting them would be the sprawl [D33](../../CONTEXT.md)
forbids: they share a Goal sentence.

The reasoning that shaped the borrow:

- **Tiers are a bulk dial, not a decision.** Tier 2 cannot tell you whether *this* change
  needs a security review or an ADR. Leaving that to judgement means a skipped step and a
  forgotten step are indistinguishable in the story — and to the reviewer.
- **The question bar was the missing half.** AI-DLC says "detect ambiguities". That is the
  instruction that produces interrogation. The bar that actually filters is *different
  answers must produce different work*, plus: not answerable from the repo, not answerable
  by `grep`, and not something you could reasonably just decide.
- **Answers must outlive the file.** AI-DLC persists its whole question-and-approval history
  into `aidlc-docs/`. Koni routes instead: an architectural fork with real rejected
  alternatives becomes a `CONTEXT.md` D-entry, which is what stops the next agent
  re-litigating it. The questions file is gitignored scratch.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§38** (an
unspecified step is not unconstrained, it is one whose constraint you cannot see — the
direct warrant for this story: a stage that returns green with nothing establishing what it
returned); **§15** (a contract discovered at review is rework — a silent Frame assumption
surfaces at Review, one stage late); **§21** (a convenience copy of a contract is a second
contract — hence *no* `aidlc-docs/`-style parallel tree, and the questions file is scratch);
**§10** (a machine-read format stated only in prose loses data silently — hence the frozen
regex table for the question format); **§9** (`for f in $unquoted_var` breaks under zsh —
applied in the sibling `install-gate.sh` change).

## What ships

- **`skills/koni-harness/references/frame-protocol.md`** (new) — when to ask at all
  (tier-keyed, with an upward-only override for money / secrets / auth / migrations /
  public contracts), the four filters a question must survive, the frozen question/answer
  format with its exact regexes, the answer-routing table, the **stage-applicability
  table**, and a worked example.
- **`skills/koni-harness/references/agentic-loop-standard.md`** — stage-1 entry gate now
  names the protocol; a callout under Right-sizing introduces the per-element override and
  the `Applied:` / `Skipped:` lines.
- **`skills/koni-harness/SKILL.md`** — reference-table row + Frame triggers in the
  description.
- **`skills/koni-harness/scripts/install-gate.sh`** — gitignores `.koni-harness/frame/`,
  and (the real fix) **upgrades an existing marker block** instead of short-circuiting on
  it. Covered by 6 new assertions in `gate-test.sh`.

The applicability table's two rules are what keep it from being decoration: **skipping is a
claim, so it is stated**, and **when two conditions disagree, run the step** — the failure
modes are not symmetric (a needless design consultation costs an hour; a skipped security
review costs an incident).

## Acceptance criteria

- [x] AC-1 — There is a stated bar for what counts as a question worth asking, and it
  rejects both silent assumption and interrogation.
- [x] AC-2 — The question/answer file format is frozen as an exact regex table, not
  described in prose (§10).
- [x] AC-3 — Every answer has a named durable destination; an architectural fork with
  rejected alternatives lands as a `CONTEXT.md` D-entry.
- [x] AC-4 — Each process element has a named run/skip condition, so a skipped step is
  skipped by a condition rather than by silence.
- [x] AC-5 — The story records which elements fired and which were skipped, in a form a
  reviewer can read without reconstructing it.
- [x] AC-6 — The questions file is working state, not a doc: gitignored, with the durable
  record in the story and CONTEXT.
- [x] AC-7 — Enforcement status is stated honestly — documented, not gated, with the reason.
- [x] AC-8 — `install-gate.sh` adds the new ignore path to repos installed *before* it
  existed, without touching any other line, idempotently.
- [x] AC-9 — `check-references.py` reports 0 dangling references for `skills/koni-harness`.

## Implementation notes

**Frame decisions for this story itself** (dogfooding the thing being shipped):

```
Frame: 0 questions — the deliverable was specified by the comparison; no surviving fork
Applied: written plan (9 files across 3 skills), CONTEXT D-entry (D43), LESSONS §41
Skipped: /design-consultation — no UI surface
         NFR pass — no stated target for a markdown reference
         security-review — no trust boundary in the diff
         frame questions file — tier 2 but zero questions survived the §2 filters
```

**Verification evidence:**

```
$ sh skills/koni-harness/scripts/__tests__/gate-test.sh | tail -2
PASS=44 FAIL=0
$ dash skills/koni-harness/scripts/__tests__/gate-test.sh | tail -2
PASS=44 FAIL=0
$ python3 skills/koni-docs/scripts/check-references.py skills/koni-harness
0 dangling reference(s)
```

**The installer defect was found by writing the test, not by reading the code.** Adding
`.koni-harness/frame/` to the ignore set exposed that `install-gate.sh` treated "marker
block present" as "nothing left to do" — so every repo installed before a path joined the
set was frozen at its install-day config, silently, forever. The guard was proven to speak
before being trusted: reverting the fix to the old short-circuit makes exactly the two new
assertions fail (LESSONS §20/§22). The general shape is recorded as
[LESSONS §41](../../LESSONS.md).

**Enforcement boundary, stated rather than assumed.** The answer-routing in §4 is
documented and ungated. Harness principle 2 earns a gate with a mistake that has actually
bitten this repo, and this class has not yet escaped it. What is mechanically visible is
the *destination* — a D-entry, a story Background, a `DESIGN.md` section — all surfaces
Review already reads.
