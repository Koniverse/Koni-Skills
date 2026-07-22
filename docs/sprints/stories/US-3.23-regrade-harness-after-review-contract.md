---
id: US-3.23
title: "Re-grade koni-harness after the review contract — the whole skill, author-blind"
epic: EPIC-3
status: backlog
priority: P1
points: 3
sprint:
due:
version_shipped:
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.22]
assignee: jindo9986
commit:
created: 2026-07-22
updated: 2026-07-22
external_deps:
---

## Goal

Run koni-qc **skill-grading** over the *whole* of koni-harness after
[US-3.22](US-3.22-review-reporting-contract.md) added `review-contract.md` and touched
five existing files. Bar: **≥95/100**, the Koniverse catalog standard
([CONTEXT D19](../../CONTEXT.md)).

## Why this is a separate story, not part of US-3.22

US-3.22's own Review could not run author-blind — the session that wrote it was
configured not to spawn subagents, so the judgement layer of that change is currently
**unverified**. Its mechanical layer (reference sweep, three suites, coverage gate,
anchor script) passed independently; nothing else did.

Grading requires four independent graders and D4 run ≥2× and averaged. That is not
something the authoring context can do for itself — it is the same defect the contract
it just wrote exists to prevent. Filing it is the honest move; folding it into US-3.22
and self-declaring a score would be exactly [LESSONS §19](../../LESSONS.md).

## Acceptance criteria (draft)

- [ ] **AC-1** — all four dimensions graded by **separate** agents (no halo): triggering
  (skill-creator) · rule-robustness under pressure (writing-skills) · author-blind
  content (`superpowers:code-reviewer`) · Anthropic best-practices. D4 run **≥2× and
  averaged** ([LESSONS §34](../../LESSONS.md) — grader variance rotates the nomination).
- [ ] **AC-2** — the **whole skill** is graded, not the diff ([LESSONS §8](../../LESSONS.md)).
  A change to Review's contract can invalidate prose elsewhere that describes Review.
- [ ] **AC-3** — score ≥95. Below that, fix and **re-grade the whole skill again** — each
  round re-verified, not spot-checked.
- [ ] **AC-4** — the contract's *content* is specifically probed, since it has had one
  reader: is the finding schema right, does the triage table have a gap, is the
  spec-compliance / code-quality boundary drawn in the right place, does "never a bare
  pass" survive an adversarial reading?
- [ ] **AC-5** — koni-qc is re-graded too, or the change to `security-review.md` is
  argued to be below the re-grade threshold — decided, not assumed.

## Dev notes

Expect this to find something. [LESSONS §8](../../LESSONS.md) (each fix surfaces the
next) and [§34](../../LESSONS.md) (graders rotate the nominated weak item, so you must
harden the whole set) both predict it. A first-round pass would be the surprising result.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §8, §19, §34.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
