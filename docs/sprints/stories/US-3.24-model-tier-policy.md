---
id: US-3.24
title: "Model + effort tier policy for the harness fan-out — gated on a measured recall floor"
epic: EPIC-3
status: backlog
priority: P3
points: 8
sprint:
due:
version_shipped:
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.22, US-3.23]
assignee: jindo9986
commit:
created: 2026-07-22
updated: 2026-07-22
external_deps:
---

## Goal

Decide, **from measurement rather than intuition**, whether koni-harness should assign a
model tier and `effort` level per fan-out pass — and if so, encode the policy.

## Background

Prompted by two published patterns for cutting agent cost: a cheap-model **orchestrator**
delegating to stronger models, and a cheap **executor** consulting a stronger **advisor**
on demand. The second is sound and has a first-class API implementation (the beta advisor
tool, executor + advisor in one server-side call). The first is economically backwards as
drawn — the orchestrator holds the most context, so putting the most expensive model
there maximises spend on the highest-volume role.

Neither transfers directly. koni-harness is a markdown standard plus a POSIX gate; it does
not call the Messages API, so the advisor tool is unavailable. What *is* available in the
tool runtime: a per-subagent `model` and `effort` override.

**The economics, which are not intuitive:**

- Delegation **increases** total tokens — every subagent re-establishes context cold. It
  reduces *cost* only when the displaced tokens land on a cheaper model by more than the
  re-establishment costs.
- Prompt cache dominates. A cached read on the main-loop model is ~0.1× input; a
  subagent's cold context write is ~1.25×. **A cached read on the expensive model is
  several times cheaper than a cold context load on the cheap one.** Switching models
  mid-session also invalidates the cache outright.
- Therefore the rule is a ratio, not a difficulty judgement: **delegate output-heavy,
  context-light work; never delegate context-heavy, output-light work.**
- `effort` is the safer lever — it does not touch the cache, and on current models it
  moves quality more than tier does.

## Why it is gated, not just implemented

Cost saving that buys a **false green** has negative value. Review passes fail *silently*:
a reviewer that misses a defect returns the same green as one that found nothing to find.
So the policy cannot ship on a plausibility argument.

The repo already owns the instrument: the verification tower is a **known-answer corpus**
(38 planted defect classes, 21 mutants). Recall per tier is measurable against it, exactly
as [US-3.19](US-3.19-mechanize-check-count-drift.md) proved its guard by reverting each
defect and observing the failure.

**Blocked on [US-3.22](US-3.22-review-reporting-contract.md)** (shipped) and
[US-3.23](US-3.23-regrade-harness-after-review-contract.md): you cannot measure a pass's
recall before the pass has a definition of what "report" means.

## Acceptance criteria (draft)

- [ ] **AC-1** — a measured recall floor per candidate tier, run against the planted-defect
  corpus. A tier is approved for a pass class **only** if recall ≥ the current baseline.
  No tier ships on argument.
- [ ] **AC-2** — the policy attaches to the fan-out points **already defined** in
  `parallel-orchestration.md` Tier B, where the context-establishment cost is already
  paid. It does **not** introduce an orchestrator tier or any mid-session model switch.
- [ ] **AC-3** — `effort` is specified before `model`, with the reason (no cache
  invalidation; larger quality effect on current models).
- [ ] **AC-4** — **out of scope, stated in-source**: skill-grading (the ≥95 bar has 5
  points of headroom and D4 already needs 2 runs averaged for same-model variance —
  adding a tier variance source to a known-noisy metric on a known-tight threshold),
  security-review, and author-blind content review.
- [ ] **AC-5** — the price basis carries its **date**. The Sonnet 5 introductory rate ends
  **2026-08-31**; a ratio written without a date is a stale claim waiting to happen
  ([LESSONS §28](../../LESSONS.md)).
- [ ] **AC-6** — the policy states plainly that the gate **cannot** enforce it —
  `gate-runner.sh` cannot see which model ran a pass. Guidance, not a check
  ([LESSONS §36](../../LESSONS.md)).

## Dev notes

If AC-1's measurement shows no tier clears the floor on judgement passes, **the correct
outcome is to ship nothing and record that** — a negative result is a result, and this
story is written so that outcome closes it rather than failing it.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §28 (a stated
number drifts; date it or de-number it), §29 (a check that resolves is not a check that is
true), §36 (do not advertise a class the guard does not implement).

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
