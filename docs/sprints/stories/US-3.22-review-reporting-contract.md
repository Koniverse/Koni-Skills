---
id: US-3.22
title: "Give Review's two in-house passes a reporting contract; stop deleting sub-7 security findings"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W30
due:
version_shipped: 0.66.0
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.18]
assignee: jindo9986
commit: pending
created: 2026-07-22
updated: 2026-07-22
external_deps:
---

## Goal

Two of Review's five passes — **spec-compliance** and **code-quality** — had no
specification anywhere in the repo. Give them a reporting contract, a finding schema,
and a mandatory author-blind requirement. Separately, stop koni-qc's security review
from **deleting** sub-confidence-7 findings: record them instead.

## Background

Found by an audit of the harness's Review prompts, commissioned to test a different
hypothesis. **The hypothesis was wrong and the audit is what found the real defect** —
worth recording, because the wrong hypothesis is what caused the right file to be read.

The audit looked for conservative-reporting language (*"only report high-severity"*,
*"be conservative"*, *"don't nitpick"*) on the theory that current models follow such
instructions literally, depressing measured recall while precision rises. Grep across
`skills/koni-harness` + `skills/koni-qc`: **zero hits**. No such language exists.

What the grep did surface is worse. `spec-compliance` and `code-quality` appear **six
times, every one of them a name in a routing table**. The fullest specification in the
repo was, verbatim: *"**code-quality** subagent."*

| Review pass | Specified where | Contract |
|---|---|---|
| 2 — koni-qc AC↔TC (or skill-grading) | koni-qc | ✅ |
| 3 — koni-qc security-review | `security-review.md` | ✅ schema + severity/confidence + refutation |
| 5 — gstack `/design-review` | gstack | ✅ |
| **1 — spec-compliance** | — | ❌ none |
| **4 — code-quality** | — | ❌ none |

**An unspecified pass does not run without a reporting bar — it runs with an unstated
one**, re-invented per invocation. Absence is not neutrality. And with no schema, two
runs over the same diff are not comparable, so recall can drift with nothing able to
detect it. This is [LESSONS §29](../../LESSONS.md) one level up: the pass *resolves* —
it ran, it returned, the loop advanced — while nothing establishes that what it returned
was complete.

The second finding is in a **well**-specified file. `security-review.md` cuts at
confidence: ≥8 reported, =7 raised as an open question, **<7 "Do not report."** The
threshold is right (post-refutation, severity and confidence filtered independently),
but sub-7 findings were *deleted* — no record, no audit trail. A reviewer scoring 6 for
lack of context the author has produces exactly the same trace as a vuln that never
existed: none.

The tell that this is a class/instance error rather than a disagreement: the `=7` band
already **is** "neither reported nor silently dropped". The principle was understood and
then applied to one value of confidence instead of to the whole cut — [LESSONS
§36](../../LESSONS.md)'s exact shape.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §19 (a check by
the same mind in the same sitting is not an independent check — the direct source of
AC-3); §16 (silence and thoroughness must not look identical — the source of the
no-bare-pass rule and of recording sub-7); §29 (a pointer that resolves is not a pointer
that is true); §36 (a guard advertising a class but implementing an instance);
§38 (recorded this story).

## Acceptance criteria

- [x] **AC-1** — a new `skills/koni-harness/references/review-contract.md` specifies
  **spec-compliance** and **code-quality**: purpose, inputs, method, what each reports,
  and an explicit *does not own* boundary pointing at the owning skill.
- [x] **AC-2** — the reporting contract is stated and argued: report **every** finding
  with confidence + severity, filtering happens at triage, state what was **not**
  examined, and **never return a bare pass**. Writing a severity cut into a finder's
  prompt is explicitly forbidden, with the reason (a cut at the finding stage is
  unrecoverable and invisible).
- [x] **AC-3** — **author-blind is mandatory** for both passes, grounded in LESSONS §19,
  with the negative rule stated: the reviewer gets the story and the diff, never the
  executing context's reasoning about why the diff is correct.
- [x] **AC-4** — a finding schema shaped to match koni-qc's security finding schema, so
  a story's Review output is one comparable set; severity and confidence defined and
  declared independently filtered.
- [x] **AC-5** — triage is specified (fix-now / file / dismiss / defer) and **a
  dismissal must be recorded with its reason** — the property that makes filtering at
  triage acceptable when filtering at the finder is not.
- [x] **AC-6** — every existing route into these passes points at the contract:
  `SKILL.md` (reference table + the Review ownership row), `agentic-loop-standard.md`,
  `loop-runner.md`, `example-loop.md`, and `parallel-orchestration.md` (fan-out
  *satisfies* author-blind rather than bypassing it).
- [x] **AC-7** — `security-review.md`: sub-7 is **recorded in a low-confidence appendix,
  not deleted**; the report structure lists the appendix; the ≥8 reporting threshold is
  unchanged and the **hard class-exclusions still delete outright** (an out-of-scope
  item is not an unproven finding — recording it would reintroduce the noise the
  exclusions exist to remove).
- [x] **AC-8** — all 8 skills 0 dangling; the three verification suites and the coverage
  gate stay green; intra-file anchors in both changed files resolve, **verified by
  script** (LESSONS §19 — not by reading).

## Tasks

- [x] **TASK-3.22.1** — audit Review prompts for filter language; record that the
  hypothesis failed and what the audit found instead (AC: background)
- [x] **TASK-3.22.2** — write `review-contract.md` (AC: 1–5)
- [x] **TASK-3.22.3** — wire every route into the two passes to the contract (AC: 6)
- [x] **TASK-3.22.4** — sub-7 recorded, not deleted (AC: 7)
- [x] **TASK-3.22.5** — verify: sweep, suites, anchors (AC: 8)

## Dev notes

### The review of this story was NOT author-blind — stated, not hidden

This story adds a rule that Review passes must run author-blind, and **its own Review
did not**. The session is configured not to spawn subagents, so the review was a
self-review by the context that wrote the diff — precisely the thing LESSONS §19 says is
not an independent check.

Recording it rather than quietly claiming a clean Review is the contract this story
introduces, applied to itself: *state what was not examined; never return a bare pass.*
The mechanical checks that do not depend on judgement (reference sweep, three suites,
coverage gate, anchor verification) all ran and passed — those are independent. The
**judgement** layer is unverified, so the honest verdict on this story is *mechanically
verified, not independently reviewed*.

**What that leaves open**: the contract's own content — whether the schema is right,
whether the triage table has a gap, whether the spec-compliance/code-quality boundary is
drawn in the right place — has had exactly one reader. Per [LESSONS §8](../../LESSONS.md)
(each fix surfaces the next) and §34 (graders rotate the nomination), expect a
skill-grading pass to find something here.

### Deliberately not done

- **No gate check.** `gate-runner.sh` cannot see which model or context ran a review
  pass, so it cannot verify author-blindness or reporting completeness. Adding a check
  that *looks* like it enforces this would be [LESSONS §36](../../LESSONS.md)'s false
  green — a guard advertising a class it does not implement. The contract is a standard
  the loop follows, and it says so.
- **No re-grade of koni-harness.** [LESSONS §8](../../LESSONS.md) requires re-grading the
  *whole* skill after any change, against the ≥95 catalog bar. That is a four-dimension
  koni-qc pass needing independent graders — same blocker as above. **Filed as
  [US-3.23](US-3.23-regrade-harness-after-review-contract.md)**, not skipped.
- **No model-tier policy.** The token-cost work that prompted this audit is deliberately
  still unstarted: you cannot measure a pass's recall before the pass has a definition of
  "report". This story is that definition; the tier work is
  [US-3.24](US-3.24-model-tier-policy.md).

### References

- [Source: LESSONS §19](../../LESSONS.md) — the repo's own worked author-blind case
- [Source: koni-qc `security-review.md`](../../../skills/koni-qc/references/security-review.md) — the finding schema this one mirrors

## Verification commands

| AC | Command |
|---|---|
| AC-6 | `grep -rn "review-contract" skills/koni-harness` → SKILL.md + 4 references |
| AC-7 | `grep -n "low-confidence appendix" skills/koni-qc/references/security-review.md` → 2 hits |
| AC-8 | `check-references.py` on every `skills/*/` → 0 dangling; the three suites → 38 classes / 21 mutants / coverage green; anchor script → 0 broken in both files |

## Changelog entry

### Added
- **`koni-harness/references/review-contract.md`** — Review's two in-house passes (**spec-compliance**, **code-quality**) had no specification anywhere; the fullest was the string *"code-quality subagent."* They now have a reporting contract (**report every finding** with confidence + severity, filter at triage, state what was not examined, **never a bare pass**), a finding schema mirroring koni-qc's, **mandatory author-blind** execution (LESSONS §19), a triage table where **dismissals are recorded with a reason**, and explicit boundaries to the three passes owned by koni-qc and gstack. Writing a severity cut into a finder's prompt is forbidden, with the reason. An unspecified pass runs with an *unstated* bar, not none — and loses recall as a green.

### Changed
- **`koni-qc/references/security-review.md`** — sub-confidence-7 findings are **recorded in a low-confidence appendix, not deleted**. The ≥8 reporting threshold and the report's precision are unchanged; the hard class-exclusions still delete outright. The `=7` band already meant "neither reported nor silently dropped" — this applies that principle to the whole cut instead of one value of it (LESSONS §36).

## Implementation notes

The audit that produced this ran on a **failed hypothesis** — it went looking for
conservative-reporting language that turned out not to exist. Recorded that way in the
Background rather than rewritten to look like the defect was predicted, per
[LESSONS §12](../../LESSONS.md).

Lessons: §38 recorded — an unspecified step is not an unconstrained step; it is a step
whose constraint you cannot see.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.66.0](../../CHANGELOG.md)
- [US-3.23](US-3.23-regrade-harness-after-review-contract.md) · [US-3.24](US-3.24-model-tier-policy.md)
