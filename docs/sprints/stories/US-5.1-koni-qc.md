---
id: US-5.1
title: "koni-qc — QC methodology & coverage-intelligence skill"
epic: EPIC-5
status: done
priority: P1
points: 5
sprint: sprint-2026-W27
version_shipped: "0.16.0"
prd_ref:
  - FR-26
arch_ref: []
depends_on:
  - US-3.3
assignee: jindo9986
commit: 01138e9
created: 2026-06-28
updated: 2026-07-03
---

## Goal

Ship `skills/koni-qc/` — a **compose-first** QC skill that turns koni-docs-standard
inputs (PRD FRs, stories + AC, ARCHITECTURE, epics) into Silicon-Valley-grade,
fully-traceable test documentation and drives quality-control execution, covering
every case and edge case. It contributes the one thing the catalog lacked — the
**methodology + coverage intelligence** to derive exhaustive, traceable coverage —
and delegates the rest: templates → koni-docs, execution → gstack, gate/loop →
koni-harness, plan → BMAD.

Built by **dogfooding the koni-harness loop** (US-5.1 tracked via `loop.sh` at
tier 2). Synthesizes two surveyed corpora: `koni-docs.backup` (the weak manual
baseline — 12 gaps to beat) and `Koni-Finance` (the production standard to
codify — rich per-TC table + dedicated security). Target: **better than both**.

## Background

Design + plan:
[spec](../../superpowers/specs/2026-06-28-koni-qc-design.md) ·
[plan](../../superpowers/plans/2026-06-28-koni-qc.md). Boundary invariants per
[CONTEXT D12/D13](../../CONTEXT.md); single-deliverable-one-story per
[D14](../../CONTEXT.md).

## Acceptance criteria

- [x] **AC-1** — Six methodology references under `skills/koni-qc/references/`:
  `test-design.md` (partitioning/BVA/decision-tables/state-transition/pairwise/
  error-guessing), `edge-coverage.md` (the edge-case taxonomy), `traceability.md`
  (TC-ID scheme `TC-<EPIC>.<TYPE>-<n>` + the canonical rich-TC table + the
  **mandatory AC↔TC coverage matrix**), `nfr.md` (security-led: security/perf-SLA/
  a11y/i18n/reliability/compatibility/observability), `qc-workflow.md` (the
  5-stage lifecycle naming each delegate), `quality-bar.md` (3-band rubric).
- [x] **AC-2** — `SKILL.md` orchestrator: frontmatter (name + pushy description),
  owns-vs-delegates table, 3 modes (author / execute / release-gate), activation
  table, reference index, compose-not-reproduce boundary.
- [x] **AC-3** — Compose, not duplicate: koni-qc references koni-docs templates,
  gstack execution, and koni-harness gate/loop **by name** and reproduces none of
  them (review-verified).
- [x] **AC-4** — A worked pilot
  (`references/customize-network-test-cases.example.md`) in the koni-docs
  test-cases shape, using the canonical rich-TC table, with a **complete AC↔TC
  coverage matrix** (every AC: positive + negative + boundary) and the
  edge/injection/concurrency/network-failure/NFR/security cases the manual backup
  lacked, plus a before/after delta.
- [x] **AC-5** — `quality-bar.md` rubric (Band A: beat the backup's 12 gaps · Band
  B: match Koni-Finance strengths · Band C: close its residual gaps), with a pass
  rule; the pilot self-grades against it and an author-blind review confirms it.
- [x] **AC-6** — Wired into this repo at `.claude/skills/koni-qc` +
  `.agents/skills/koni-qc` (mirrored symlinks); resolves.

## Tasks

- [x] **TASK-5.1.1** — Survey both corpora (backup + koni-finance) → synthesis.
- [x] **TASK-5.1.2** — Spec + plan (dogfood koni-harness loop).
- [x] **TASK-5.1.3** — Six methodology references.
- [x] **TASK-5.1.4** — SKILL.md orchestrator.
- [x] **TASK-5.1.5** — customize-network pilot.
- [x] **TASK-5.1.6** — Author-blind review + fixes; wire + koni-docs ship.

## Post-ship refinements

No scope change to FR-26 (see [CONTEXT D15](../../CONTEXT.md)):

| Refinement | What | Version | Commit |
|---|---|---|---|
| `/design-review` for UI | UI cases delegate to gstack `/design-review` vs the repo's `DESIGN.md`; new `UI` TC-type; koni-qc wired into the harness review stage | v0.17.0 | `a4bcd05` |
| Graded hardening | AC↔TC rule made airtight (boundary-or-edge + no-double-counting + BND-vs-NEG doctrine); pilot recut to strictly comply (25 cases, 52% off-path, truthful self-grade); priority/vocab unified → **koni-qc 97/100** | v0.17.2 | `2d519dd` |

Grading method: [LESSONS §8](../../LESSONS.md); per-version detail: [CHANGELOG](../../CHANGELOG.md) [0.17.0]–[0.17.2].

## References

- [Skill: skills/koni-qc/SKILL.md](../../../skills/koni-qc/SKILL.md)
- [Spec](../../superpowers/specs/2026-06-28-koni-qc-design.md) · [Plan](../../superpowers/plans/2026-06-28-koni-qc.md)
- [Pilot](../../../skills/koni-qc/references/customize-network-test-cases.example.md)
- [US-3.3 — koni-harness](US-3.3-koni-harness-agentic-loop.md) (the loop this was built with)

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CHANGELOG v0.16.0](../../CHANGELOG.md) (ship) + [0.17.0]–[0.17.2] (refinements)
