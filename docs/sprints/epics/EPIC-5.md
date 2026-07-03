---
id: EPIC-5
title: "Koniverse QC tooling"
status: done
prd_ref: 'FR-26'
created: 2026-06-28T00:00:00.000Z
updated: 2026-06-28T00:00:00.000Z
---
## Goal

Give the Koniverse catalog a quality-control capability: a skill that turns
koni-docs-standard inputs into Silicon-Valley-grade, fully-traceable test
documentation and drives QC execution — covering every case and edge case so
products ship smoothly. The first delivery is `koni-qc`.

## Overview

### Business context

Koni had the *templates* (koni-docs `test-cases`/`test-report`), the *execution
engine* (gstack `qa`/`investigate`/`browse`), and the *gate* (koni-harness) — but
nothing that derives **exhaustive, traceable coverage from requirements**. The
hand-made QC docs in `koni-docs.backup` were \~70% happy-path with no TC IDs, no
AC↔TC matrix, and <5% non-functional testing; even the deliberately-authored
`Koni-Finance` suite lacked a complete AC↔TC matrix, an env/fixtures playbook,
a11y/i18n, and perf SLAs. EPIC-5 closes that gap with a methodology skill that is
**better than both**.

### Feature pillars

| #  | Pillar                                    | Stories                                                                               | Purpose                                                                                                                                                                                                                                                                                                           |   |
| -- | ----------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| 1  | **QC methodology skill**                  | [US-5.1](../stories/US-5.1-koni-qc.md) ✅                                              | `koni-qc` — test-design techniques + edge taxonomy + mandatory AC↔TC matrix + NFR/security + quality rubric; composes koni-docs/gstack/koni-harness                                                                                                                                                               |   |
| 2  | **Skill-grading capability**              | [US-5.2](../stories/US-5.2-skill-grading.md) ✅                                        | QC for *skill artifacts*: koni-qc's four-dimension skill-grading rubric, invoked by the koni-harness Review stage to build *and verify the building of* new skills                                                                                                                                                |   |
| 3  | **Test-organization standard**            | [US-5.3](../stories/US-5.3-test-organization.md) ✅                                    | One canonical `docs/tests/` taxonomy + by-epic test-code layout + 3-place sync rule; koni-qc owns the standard, koni-setup scaffolds it (synthesized from the Senti-Quant QA reorg)                                                                                                                               |   |
| 4  | **Unit-coverage layer**                   | [US-5.4](../stories/US-5.4-unit-coverage.md) ✅                                        | Per-function unit testing below the AC↔TC matrix — koni-qc owns the standard + coverage bar, harness Execute drives per-function TDD, Self-verify gates it                                                                                                                                                        |   |
| 5  | **Automation spine**                      | [US-5.5](../stories/US-5.5-test-automation.md) ✅                                      | generate → report → sync → CI: spec→runnable test + reporter contract + story write-back + CI-gate/runner bootstrap — makes authored specs run, self-report, and gate (from the koni-erp-02 deployment)                                                                                                           |   |
| 6  | **Standardization (scaffold + enforce)**  | [US-5.3](../stories/US-5.3-test-organization.md) ✅ (round 2; was US-5.6)              | convert the standard from documented → generated + enforced across koni-qc/koni-setup/koni-docs (report-path MUST, STRATEGY.md, tests/epic scaffold, PROPOSED: 3rd state, TC-ID reservation, path reconciliation) — from the ERP-02-vs-Senti-Quant audit                                                          |   |
| 7  | **Whole-project QC (process + done-bar)** | [US-5.7](../stories/US-5.7-whole-project-qc.md) ✅                                     | the layer above the per-epic lifecycle: stand up the QA-tracking epic + author the strategy + artifact-location MUSTs + require ≥1 execution + a Definition-of-Done + a depth bar (no thin stubs) — from the ERP-02 learning note (LESSONS §213)                                                                  |   |
| 8  | **Layered suites + report quality**       | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) ✅                        | authoring + report uplift to the exemplar bar: API/functional split, by-endpoint tables with real actuals, orthogonal coverage matrices, test-data registry, Open Questions, bug-fix retest rounds, honest-actuals report bar with evidence — from the US-001.001 exemplar suites + the backup's checklist rounds |   |
| 9  | **Field-hardening (ERP 100% drive)**      | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) ✅ (round 2; was US-5.9)  | frozen parse contract + reference reporter with the broken-handle enforcer, OPS-DEPLOY 4th form, Band D density gate, design-docs-first Frame mandate, live-harness recipes, CI-with-services, fan-out repoint contract — absorbed from the ERP-02 9.3%→100% drive audits                                         |   |
| 10 | **Field reorg + regression learning**     | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) ✅ (round 3; was US-5.10) | per-US spec split + date-first reports (the ERP-02 reorg, legacy accepted), DESIGN-REVIEW 5th form, lane-aware env-pending enforcement, and the regression-learning harness loop (bug → REG + class sweep; mandatory CHANGELOG/git-log change sweep)                                                              |   |

### Out of scope

- A QC execution engine (gstack owns execution; koni-qc drives it).
- New test-doc templates (koni-docs owns them; koni-qc fills them).
- Per-stack QC plugins (e.g. a security-only or perf-only plugin) — future work,
  following the koni-docs `plugin-pattern.md`.

## FR Coverage

| FR    | Story                                                                  | Status              |
| ----- | ---------------------------------------------------------------------- | ------------------- |
| FR-26 | [US-5.1](../stories/US-5.1-koni-qc.md)                                 | ✅ shipped (v0.16.0) |
| FR-27 | [US-5.2](../stories/US-5.2-skill-grading.md)                           | ✅ shipped (v0.18.0) |
| FR-28 | [US-5.3](../stories/US-5.3-test-organization.md)                       | ✅ shipped (v0.19.0) |
| FR-29 | [US-5.4](../stories/US-5.4-unit-coverage.md)                           | ✅ shipped (v0.23.0) |
| FR-30 | [US-5.5](../stories/US-5.5-test-automation.md)                         | ✅ shipped (v0.24.0) |
| FR-31 | [US-5.3](../stories/US-5.3-test-organization.md) (round 2)             | ✅ shipped (v0.25.0) |
| FR-32 | [US-5.7](../stories/US-5.7-whole-project-qc.md)                        | ✅ shipped (v0.26.0) |
| FR-35 | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md)           | ✅ shipped (v0.31.0) |
| FR-36 | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) (round 2) | ✅ shipped (v0.33.0) |
| FR-37 | [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) (round 3) | ✅ shipped (v0.34.0) |

## Stories

| ID                                                           | Title                               | Goal                                                                                                                                                                                      | Status | Version                   |
| ------------------------------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------- |
| [US-5.1](../stories/US-5.1-koni-qc.md)                       | koni-qc                             | Compose-first QC methodology + coverage-intelligence skill; pilot on customize-network proving the uplift over the manual backup suite                                                    | ✅ done | v0.16.0                   |
| [US-5.2](../stories/US-5.2-skill-grading.md)                 | skill-grading                       | QC for skill artifacts: koni-qc's four-dimension rubric + koni-harness Review-stage wiring, so the loop builds and verifies new skills                                                    | ✅ done | v0.18.0                   |
| [US-5.3](../stories/US-5.3-test-organization.md)             | test-organization (2 rounds)        | Standard docs/tests taxonomy + by-epic code layout + 3-place sync; round 2 (v0.25.0, was US-5.6): scaffolded + enforced across koni-qc/koni-setup/koni-docs                               | ✅ done | v0.19.0 + 0.25.0          |
| [US-5.4](../stories/US-5.4-unit-coverage.md)                 | unit-coverage                       | Per-function unit-test process + coverage bar below the AC↔TC matrix; koni-qc owns the standard, harness Execute drives + Self-verify gates                                               | ✅ done | v0.23.0                   |
| [US-5.5](../stories/US-5.5-test-automation.md)               | test-automation                     | Automation spine: spec→runnable test + reporter contract (run→report) + story write-back + CI-gate/runner bootstrap; from the koni-erp-02 deployment gaps                                 | ✅ done | v0.24.0                   |
| [US-5.7](../stories/US-5.7-whole-project-qc.md)              | whole-project QC                    | The layer above the per-epic lifecycle: QA-tracking epic + strategy + artifact-location MUSTs + execution + Definition-of-Done + depth bar (from the ERP-02 learning note)                | ✅ done | v0.26.0                   |
| [US-5.8](../stories/US-5.8-layered-suites-report-quality.md) | koni-qc field absorption (3 rounds) | Exemplar-bar authoring/reports; round 2 (v0.33.0, was US-5.9): frozen contract + enforcer + Band D + live-harness; round 3 (v0.34.0, was US-5.10): field reorg + regression-learning loop | ✅ done | v0.31.0 + 0.33.0 + 0.34.0 |

> **Retired story IDs** (consolidation, [CONTEXT D33](../../CONTEXT.md)): `US-5.6`
> → US-5.3 round 2 · `US-5.9` → US-5.8 round 2 · `US-5.10` → US-5.8 round 3.
> Retired IDs are **never reused**.

## Cross-cutting invariants

- **Compose, never duplicate** (D12/D13/D14): koni-qc invokes koni-docs (templates),
  gstack (execution), koni-harness (gate/loop); it never reproduces them.
- **The AC↔TC coverage matrix is mandatory** — every AC has ≥1 positive, ≥1
  negative, ≥1 boundary test case; no orphan AC, no orphan TC.

## Acceptance criteria (propagated from stories)

- [x] koni-qc ships with 6 methodology references + SKILL.md + a worked pilot (US-5.1)
- [x] The pilot beats the `koni-docs.backup` manual suite on all 12 gaps and matches the `Koni-Finance` strengths (US-5.1)
