---
id: US-3.14
title: "koni-ea-dev + koni-ea-ops skill-grading pass — clear the ≥95 catalog bar"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W29
due:
version_shipped: 0.60.0
prd_ref: [FR-41, FR-42]
arch_ref: []
depends_on: [US-3.13]
assignee: jindo9986
commit: pending
created: 2026-07-15
updated: 2026-07-15
external_deps:
---

## Goal

Run koni-qc's **skill-grading** rubric (four independent dimensions, `/25` each, the
≥95/100 catalog bar) on the two new EA skills and fix every finding until both clear
95. Requested as a quality check on the freshly-split skills.

## Background

koni-ea-dev and koni-ea-ops shipped (US-3.11–3.13) but had never been graded against
the catalog bar. Grading used the [`skill-grading.md`](../../../skills/koni-qc/references/skill-grading.md)
method — one **separate** agent per dimension (no halo effect), re-graded whole after
every fix round (LESSONS §8).

**Round 1** — both below the bar: koni-ea-dev **91.2**, koni-ea-ops **90.5**. The
ops skill carried an author-blind **Important**: it called `registry.yaml` "the source
of truth", but Trading-Resources CONTEXT D9 retired that role and LESSONS §3 makes
Notion authoritative — the framing was backwards.

Fixes then triggered the expected cascades (LESSONS §8): hardening one D2 rule
surfaced another; reframing the registry (D3) dropped a D2 rule; a lot-normalizer fix
(D3) introduced a sizing contradiction; a "no live before committed" rule (D2) created
a lifecycle-ordering contradiction (D3). Three rounds resolved them. D2-ops also
exhibited **grader variance** — a flat 21.9 while the *named* weak rule rotated across
graders — closed by hardening all eight rules to carry a named failure mode
([LESSONS §34](../../LESSONS.md), documented here).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §19 (author-blind
graders caught the registry source-of-truth reversal and every content defect); §8 (each fix
surfaces the next; re-grade the whole skill); §34 (documented here — on a uniform-criterion
axis, harden every item, not the one nominated); §29 (a reference checker proves structure,
never that a claim is true — every real defect was semantic).

## Final scorecards (≥95 = PASS)

**koni-ea-dev — 96.9–97.9 / 100 → PASS**

| Dimension | /25 |
|---|---|
| D1 Triggering (blind router) | 24 |
| D2 Rule-robustness (pressure) | 25 |
| D3 Content (author-blind vs corpora) | 24–25 |
| D4 Best-practices (Anthropic ×2 avg) | 23.9 |

**koni-ea-ops — 96.4 / 100 → PASS**

| Dimension | /25 |
|---|---|
| D1 Triggering (blind router) | 24 |
| D2 Rule-robustness (pressure) | 25 |
| D3 Content (author-blind vs SOPs) | 23 |
| D4 Best-practices (Anthropic ×2 avg) | 24.4 |

## Acceptance criteria

- [x] **AC-1** — both skills graded across all four skill-grading dimensions by
  **separate** agents, ≥2× on the subjective D4; scorecards recorded above.
- [x] **AC-2** — every author-blind **Critical/Important** finding is resolved (ops:
  the `registry.yaml`-source-of-truth reversal → Notion authoritative, D9 mirror; the
  Deploy-before-Commit lifecycle ordering; dev: the sub-min-lot risk-contract break;
  the stale "VOLUME_MAX clamped at the order call" claim).
- [x] **AC-3** — both skills total **≥95/100** on the final round; every dimension
  re-graded after the last fix (D1 unchanged descriptions carried from a prior round).
- [x] **AC-4** — `check-references.py` → 0 dangling on both skills and all skills; the
  shared checker's self-test / mutation / coverage suites pass; both `description`
  frontmatters stay under the 1024-byte cap.
- [x] **AC-5** — LESSONS §34 records the grader-variance convergence pattern.

## Tasks

- [x] **TASK-3.14.1** — round-1 grade (7 agents); triage findings (AC: 1)
- [x] **TASK-3.14.2** — fix rounds 1–3 across D2/D3/D4 for both skills (AC: 2)
- [x] **TASK-3.14.3** — re-grade to convergence; confirm ≥95 (AC: 1, 3)
- [x] **TASK-3.14.4** — verify guards; record LESSONS §34 (AC: 4, 5)

## Dev notes

### Findings fixed (by dimension)

- **koni-ea-dev** — D2: hardened CTrade-vs-raw-`OrderSend` and elevated the
  `ResultRetcode`-not-just-bool rule to the Non-negotiables, each with a named failure
  mode. D3: `CalcLotSize` now skips (returns 0) below `VOLUME_MIN` before `NormLot`
  (was silently forcing min-lot, breaking the risk contract — matches STP corpus);
  added `NormLotNoMax` for the DCA path; a worked new-bar example that commits only
  after `CopyBuffer` succeeds; `EMAValue` returns bool+out-param; SL/TP example bases
  a buy on `ask`; removed a residual false "VOLUME_MAX clamped at the order call" claim
  (an over-max lot is *rejected*, not clamped). D4: shortened the CTrade non-negotiable
  to a pointer, cutting cross-file duplication.
- **koni-ea-ops** — D3: reframed `registry.yaml` as Notion's git-tracked mirror
  (Notion authoritative post-D9), reordered the lifecycle so **Commit precedes
  Deploy**, cited the *live* LESSONS §4 for the `.set`-bump rule, made the registry
  example illustrative. D2: gave every one of the eight rules an explicit named failure
  mode (the Notion-vs-mirror inversion, the undocumented-version harm, the
  deprecated-SOP breakage). D4: rewrote the description from a coverage summary into a
  `Triggers:` form (606 bytes).

### What we explicitly did NOT do

- **Did not lower the bar.** Both cleared 95 on merit; no dimension was waved through.
- **Did not keep patching the single nominated D2-ops rule.** Recognised the flat-score /
  moving-nomination signature and swept all eight rules at once (LESSONS §34).

## Verification commands

| AC | Command |
|---|---|
| AC-4 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea-dev` and `… skills/koni-ea-ops` → 0 dangling |
| AC-4 | the checker's self-test / mutation / coverage suites under `skills/koni-docs/scripts/__tests__/` pass |

## Changelog entry

### Changed
- **koni-ea-dev** and **koni-ea-ops** hardened through a koni-qc skill-grading pass to clear the ≥95 catalog bar (dev ~97, ops 96.4). Fixes span all four dimensions; the load-bearing correctness fixes were the ops `registry.yaml`-vs-Notion source-of-truth reversal, the ops Commit-before-Deploy lifecycle order, and the dev sub-min-lot risk-contract break.

## Implementation notes

Three grading rounds. The recurring shape was LESSONS §8 (each fix surfaces the next)
plus, on the subjective D2 axis, LESSONS §34 (grader variance rotating the nominated
weak rule). Every real defect was semantic — invisible to the reference checker (§29),
caught only by author-blind graders reading the skill against MQL5 reality and the
source SOPs.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.13](US-3.13-koni-ea-split-dev-ops.md)
- [skill-grading.md](../../../skills/koni-qc/references/skill-grading.md)
- [CHANGELOG v0.60.0](../../CHANGELOG.md)
