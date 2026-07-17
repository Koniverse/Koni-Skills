---
id: US-3.18
title: "koni-harness skill-grading pass — verify the design-trio change, fix surfaced drift to ≥95"
epic: EPIC-3
status: done
priority: P2
points: 2
sprint: sprint-2026-W29
due:
version_shipped: 0.64.0
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.17]
assignee: jindo9986
commit: pending
created: 2026-07-17
updated: 2026-07-17
external_deps:
---

## Goal

Use koni-harness's own Review-stage discipline — koni-qc **skill-grading** (4
dimensions, ≥95 bar, re-grade the *whole* skill after any change) — to verify the
US-3.17 design-trio change to koni-harness, and fix everything the grade surfaced
until the skill clears 95. Requested: "verify the recent improvements to itself."

## Background

US-3.17 (v0.63.0) shipped the design-trio with only a focused change-review, not a
full re-grade. The full grade (round 1) scored **83.9/100 → FAIL** — and it earned
its keep: it caught real drift the diff-only review missed, none of it the trio
itself (which graded clean):

- **D3 = 14 (two Important):** (I1) `gate-catalog.md` presented `skill-references` as
  a default-shipped check, but US-3.10 established it is **monorepo-only** — not in the
  vendored `scripts/gates.conf`; a consumer install would get a catalog promising a
  gate the installer never delivers. (I2) count-staleness (LESSONS §28): "eight
  built-in checks" (SKILL.md ×2) and "six release-commit-only checks"
  (gate-catalog + example-loop) omitted `security-review`, drift left by US-3.9.
- **D4 = 22.9:** same count-staleness.
- **D1 = 22:** the bare "building a UI feature" trigger could soft-dual-fire with
  `frontend-design`.
- **D2 = 25** (pass), with two hardening ideas for the design-first rule.

## Final scorecard (≥95 = PASS) — round 2, after fixes

| Dimension | round 1 | round 2 |
|---|---|---|
| D1 Triggering (blind router) | 22 | **24** |
| D2 Rule-robustness (pressure) | 25 | **25** (carried; hardening strengthened it) |
| D3 Content (author-blind vs shipped source) | 14 | **23** |
| D4 Best-practices (Anthropic ×2 avg) | 22.9 | **24.25** |
| **Total** | **83.9 → FAIL** | **96.25 → PASS** |

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §8 (re-grade the
*whole* skill after any change, never infer "still ≥95" from a diff-only review — exactly
what caught the 83.9); §28 (a count stated in prose drifts — de-number it); §19 (author-blind
graders, one per dimension, found the drift the change-author missed).

## Acceptance criteria

- [x] **AC-1** — koni-harness graded across all four skill-grading dimensions by
  **separate** agents (D4 ×2), round 1 recorded; the change re-graded whole, not diff.
- [x] **AC-2** — both Important resolved: `skill-references` flagged **monorepo-only /
  not vendored** in `gate-catalog.md` (preamble + section + no table/count implies it
  ships); the stale counts corrected — no "eight built-in" survives, "seven
  release-commit-only checks" incl. `security-review` in `gate-catalog.md` +
  `example-loop.md`, matching the shipped `scripts/gates.conf`.
- [x] **AC-3** — the Minors resolved: the release-commit phase table lists
  `security-review` (+ `tests`); the gstack-role enumerations name `/design-consultation`
  at Frame; `parallel-orchestration.md` Review passes reconcile the conditional
  `security-review`.
- [x] **AC-4** — D1: the UI trigger bound to "a **story's UI work in the loop**" (closes
  the `frontend-design` over-reach; precision 1.00 / recall 1.00 on re-grade). D2
  hardening applied: an **objective `/design-consultation` skip test** and an
  **enforcement-boundary** note (the gate is a presence-check; `/design-review` judges
  whether mobile truly conforms).
- [x] **AC-5** — final total **≥95** (96.25); `check-references.py` → 0 dangling on
  koni-harness and all skills; `description` ≤ 1024 bytes (1023).

## Tasks

- [x] **TASK-3.18.1** — full 4-dim grade round 1; triage findings (AC: 1)
- [x] **TASK-3.18.2** — fix I1 (skill-references monorepo-only) + I2 (counts) + Minors (AC: 2, 3)
- [x] **TASK-3.18.3** — fix D1 (loop-bind) + D2 hardening; add the `adapters.md` TOC (AC: 4, 5)
- [x] **TASK-3.18.4** — re-grade D1/D3/D4 (carry D2); confirm ≥95 (AC: 1, 5)

## Dev notes

### What we explicitly did NOT do

- **Did not re-litigate the design-trio itself.** All three graders confirmed the trio
  (stage mapping, citation, tool invariant) was already clean; the fixes were peripheral
  drift the change left unreconciled.
- **Did not make the gate verify the trio or mobile.** A grep cannot see a rendered
  breakpoint; the gate stays a presence-check and the docs now say so explicitly
  (enforcement boundary), with `/design-review` as the human judge.
- **Did not lower the bar.** koni-harness cleared 95 on merit after the fixes.

### References

- [Source: PRD FR-21](../../PRD.md#functional-requirements)
- [Source: US-3.17](US-3.17-harness-design-trio.md) — the change this verifies
- [Source: US-3.10](US-3.10-koni-setup-security-review-sync.md) — established skill-references is monorepo-only
- [Source: skill-grading.md](../../../skills/koni-qc/references/skill-grading.md), [LESSONS §8, §28](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-2 | `grep -rniE 'eight built-in\|six release' skills/koni-harness` → nothing; `grep -c skill-references skills/koni-harness/scripts/gates.conf` → 0 |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-harness` → 0 dangling |

## Changelog entry

### Fixed
- koni-harness (verification of the v0.63.0 design-trio via koni-qc skill-grading): `gate-catalog.md` now flags `skill-references` as **monorepo-only / not vendored** (it was documented as a default-shipped check but isn't in `scripts/gates.conf`); corrected the stale check counts ("eight built-in" de-numbered; "six release-commit-only" → **seven**, incl. `security-review`) in gate-catalog + example-loop; named `/design-consultation` in the gstack-role enumerations; reconciled the parallel-orchestration Review passes; bound the UI trigger to "a story's UI work in the loop" (D1 over-reach); added an objective `/design-consultation` skip test + an enforcement-boundary note (gate = presence-check, `/design-review` judges mobile); added the `adapters.md` Contents TOC. Re-graded **96.25/100 → PASS** (was 83.9).

## Implementation notes

The full re-grade (not diff-only) is the point: round 1 = 83.9 (FAIL) surfaced two
Important content defects — inventory drift from earlier stories (US-3.9 counts, US-3.10
skill-references vendoring) — that a change-only review had missed. After the fix round,
96.25 (D1 24 / D2 25 / D3 23 / D4 24.25). LESSONS §8 (re-grade the whole skill) and §28
(a count in prose drifts) both in evidence.

Lessons: none new — this applied §8 (re-grade whole, not diff) and §28 (de-number a
drifting count); no new principle to record.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.17](US-3.17-harness-design-trio.md)
- [CHANGELOG v0.64.0](../../CHANGELOG.md)
