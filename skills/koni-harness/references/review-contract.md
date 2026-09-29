# review-contract — what the two in-house Review passes must report

> **Load when**: you are running (or specifying) Review stage 4's **spec-compliance**
> or **code-quality** pass, or you need to know what a Review pass owes the loop —
> the reporting bar, the finding schema, and why the reviewer must not be the author.
> The *order* of the five passes lives in
> [`agentic-loop-standard.md`](agentic-loop-standard.md); this file is the *contract*
> for the two the harness owns in-house. The other three are owned elsewhere and
> already specified: AC↔TC coverage and security-review by **koni-qc**, `/design-review`
> by **gstack**.

**Contents**: [Why an unspecified pass is not a neutral pass](#why-an-unspecified-pass-is-not-a-neutral-pass) ·
[The reporting contract](#the-reporting-contract) ·
[The finding schema](#the-finding-schema) ·
[Author-blind is mandatory](#author-blind-is-mandatory) ·
[Pass 1: spec-compliance](#pass-1-spec-compliance) ·
[Pass 5: code-quality](#pass-5-code-quality) ·
[Triage: what the loop does with findings](#triage-what-the-loop-does-with-findings) ·
[Composes, never reproduces](#composes-never-reproduces)

---

## Why an unspecified pass is not a neutral pass

A pass with no stated reporting bar does not run without one — it runs with an
**unstated** one, chosen per invocation by whatever is executing it. Two consequences,
both silent:

- **Recall drifts and nothing detects it.** Current models follow a stated bar
  faithfully; absent a bar they default to caution under uncertainty. The pass
  investigates just as hard, finds the same defects, then declines to report the ones it
  judges below its own invented threshold. Precision looks fine. Recall falls. The
  output is a green.
- **Runs are not comparable.** With no schema, two runs of the same pass over the same
  diff produce differently-shaped output, so you cannot diff them, cannot measure the
  pass, and cannot tell a quiet pass from a thorough one.

This is [LESSONS §29](../../../docs/LESSONS.md)'s shape one level up: the pass
*resolves* — it ran, it returned, the loop advanced — but nothing establishes that what
it returned is true or complete. A Review pass that cannot be measured is not a gate;
it is a ritual.

The rule this file exists to state: **a Review pass is defined by its reporting
contract, not by its name in a routing table.**

---

## The reporting contract

**Report everything you find. Filtering is a later step, and it is not yours.**

The finder's job is *coverage*; ranking and triage happen downstream, with the author's
context available. This split is the whole point: a reviewer who filters at the finding
stage discards a candidate defect **before anyone else can weigh it**, and the discard
leaves no trace. A finding that is surfaced and then dismissed costs one line of triage.
A finding that is never surfaced costs a shipped bug.

Concretely, every pass under this contract:

1. **Reports every issue found**, including ones it is unsure about and ones it judges
   minor. It does **not** apply a severity or importance cut of its own.
2. **Attaches confidence (1–10) and severity to each finding** so the downstream step
   can rank without re-deriving the judgement.
3. **States its scope and what it did not examine.** "I did not review the migration
   files" is part of the report. An unstated gap reads as a clean bill.
4. **Never returns a bare pass.** A clean pass returns the scope it covered and the
   basis for the verdict — "all four AC traced to the diff; no gap found" — not the
   single word *pass*. Silence and thoroughness must not look identical
   ([LESSONS §16](../../../docs/LESSONS.md)).

**Do not write a threshold into the pass's prompt.** Instructions of the form *"only
report high-severity issues"*, *"be conservative"*, or *"don't nitpick"* are followed
literally, and they convert a recall problem into an invisible one. If the loop wants a
quieter report, filter the finding list — do not ask the finder to un-find things.

> **The one exception, and why it is different.** koni-qc's
> [`security-review.md`](../../koni-qc/references/security-review.md) *does* apply a
> reporting cut (confidence ≥ 8 reported; 7 raised as an open question; below 7 recorded
> but not reported). That is legitimate because it is applied **after an adversarial
> refutation round by a second reviewer**, and because nothing is deleted — the
> low-confidence band is written down. A cut applied by the finder, in the same pass,
> with no record of what it dropped, has neither property.

---

## The finding schema

Every finding carries all of these. The shape deliberately mirrors koni-qc's
[security finding schema](../../koni-qc/references/security-review.md) so a story's
Review output is one comparable set regardless of which pass produced it.

| Field | Content |
|---|---|
| **Title** | `<category>: <file>:<line>` — e.g. `ac-gap: checkout.ts:142`, `dead-branch: orders.route.ts:88` |
| **Severity** | HIGH / MEDIUM / LOW — impact if real (see below) |
| **Confidence** | 1–10 — how sure the finding is real, **before** any triage |
| **Category** | a slug: `ac-gap`, `contract-drift`, `dead-code`, `error-swallow`, `naming`, `duplication`, … |
| **Description** | the defect in one sentence — what is wrong, not what to do about it |
| **Failure scenario** | concrete inputs or state → the wrong outcome. This is what separates a finding from an opinion, and a finding without one is downgraded, not dropped |
| **Recommendation** | the specific change — not "improve error handling" |

**Severity** for these two passes:

- **HIGH** — the story's stated behaviour is not delivered, or the change breaks
  something that worked. Blocks Review.
- **MEDIUM** — correct today but load-bearing and fragile: an unhandled path, a silent
  failure mode, a contract only upheld by coincidence.
- **LOW** — clarity, naming, duplication, structure. Real, reported, rarely blocking.

Severity and confidence are **independent** and are filtered independently. A
HIGH-severity finding at confidence 4 is still reported — as a HIGH at confidence 4.
Downgrading confidence into severity (or the reverse) destroys the signal triage needs.

---

## Author-blind is mandatory

**Both passes run in a context that did not write the diff.** In practice: a subagent
spawned for the review, with the story and the diff as inputs, not the executing
context continuing into a review of its own work.

This is not ceremony. [LESSONS §19](../../../docs/LESSONS.md) is the repo's own
worked case: a generator and its audit, written by the same mind in the same sitting,
shared one blind spot — the audit printed `broken anchors: 0` over 150 dead anchors,
and destroyed a skill's frontmatter without noticing. Every defect was caught by an
author-blind grader, after the work had been declared done.

**A check written by the same mind, in the same sitting, with the same mental model as
the thing it checks is not an independent check.** It reproduces the misconception
faithfully in both directions and returns green.

The harness already applies this where it is written down — skill-grading's D3 runs
`superpowers:code-reviewer` precisely to get an outside reader. The product-code path
inherits the same requirement here.

**What the reviewer gets**: the story (AC + Tasks), the diff, and the repo. **What it
must not get**: the executing context's reasoning about why the diff is correct. The
rationale is what you are testing, so handing it over defeats the test.

---

## Pass 1: spec-compliance

**Question**: does the diff deliver what the story says it delivers?

This is the *first* pass for a reason — it is the only one that can fail the story on
its own terms. A perfectly-written, well-factored diff that implements the wrong thing
passes every other pass in the stage.

| | |
|---|---|
| **Inputs** | the story file (AC + Tasks + Dev notes), the diff, the repo |
| **Method** | trace **each AC** to the lines that satisfy it, and each changed hunk back to an AC or an explicit non-AC justification |
| **Reports** | AC with no implementing change · AC whose implementation does not match its wording · changes with no AC (scope creep, or a missing AC) · AC marked `[x]` that the diff does not support |
| **Does not own** | whether the AC are *tested* — that is koni-qc's AC↔TC gate, pass 2. This pass reads the code, not the test matrix |

**The `[x]` check is the load-bearing one.** A ticked AC is a claim to the doc gate,
the sprint table, and the reader. This pass is the only thing standing between a
premature tick and a `done` story. Verify the claim; do not take it.

---

## Pass 5: code-quality

**Question**: will the next person to touch this be misled by it?

Numbered 5 because it runs last — the earlier passes can send the story back to Execute, and there is
no point polishing a diff that is about to change.

| | |
|---|---|
| **Inputs** | the diff, plus the surrounding code it must live with |
| **In scope** | correctness risks the tests do not cover (unhandled path, swallowed error, off-by-one, resource left open) · reuse missed (this repo already has this helper) · structure that will mislead (misleading name, dead branch, comment contradicting code) · duplication introduced |
| **Out of scope** | security (pass 3, koni-qc) · UI against `DESIGN.md` (pass 4, gstack `/design-review`) · test coverage (pass 2, koni-qc) · pure style a formatter owns |
| **House rule** | match the surrounding code's idiom, comment density, and naming. A diff that is individually elegant and locally alien is a finding |

**Do not report absence of speculative generality.** Missing abstraction for a
requirement nobody has is not a defect; adding it is. The bar is *misleading*, not
*imperfect*.

---

## Triage: what the loop does with findings

Findings are ranked and triaged by the loop **after** all five passes have returned
(Review's join semantics; see
[`parallel-orchestration.md`](parallel-orchestration.md) when the passes are fanned out).

| Outcome | Applies to | Effect |
|---|---|---|
| **Fix now** | any HIGH · any MEDIUM the author agrees with | Review fails; back to **Execute**, then re-run the passes the fix touches |
| **Fix now or file** | LOW | author's call; filing means a story, not a comment |
| **Dismissed** | anything triage rejects | **Record the dismissal and the reason** in the story's Dev notes |
| **Deferred** | real but out of this story's scope | file it — a deferred finding with no story is a dropped finding |

**Dismissal is a decision, so it leaves a record.** This is the whole reason the finder
does not filter: dismissal at triage is visible, reviewable, and re-openable; dismissal
at the finding stage is none of those. One line in Dev notes is the price of keeping
recall auditable.

A pass that returns findings has not failed — it has worked. Review fails only on the
triage outcomes above.

---

## Composes, never reproduces

This file specifies **two** passes. It does not restate, override, or duplicate the
other three:

| Pass | Owner | Where specified |
|---|---|---|
| 2 — AC↔TC coverage (or **skill-grading** when the deliverable is a skill) | koni-qc | koni-qc `references/` |
| 3 — security-review *(trust-boundary changes only)* | koni-qc | koni-qc [`security-review.md`](../../koni-qc/references/security-review.md) |
| 5 — `/design-review` *(UI only)* | gstack | gstack |

If a finding from pass 1 or 5 belongs to one of those — a missing test, a potential
injection, a `DESIGN.md` deviation — **report it and name the owner**; do not adopt the
other pass's method. The tool invariant holds here as everywhere in the loop: gstack
and Superpowers review, Anthropic Skills implement, and no pass silently grows into
another's job.
