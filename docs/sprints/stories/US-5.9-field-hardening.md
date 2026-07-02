---
id: US-5.9
title: "field-hardening from the ERP 100% drive — frozen parse contract, broken-handle enforcer, ops-deploy, Band D, design-docs-first, live-harness"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-36
arch_ref: []
depends_on:
  - US-5.5
  - US-5.8
assignee: jindo9986
commit: pending
sprint: sprint-2026-W26
version_shipped: "0.33.0"
created: 2026-07-03
updated: 2026-07-03
---

## Goal

Absorb the field evidence from ERP-02's real 9.3%→100% automation drive (five audit
docs, incl. the improvement spec written *against koni-qc's own reference files*) into
the skill — fixing two real parse bugs in our own contract, making "100%" honest
(broken-handle enforcer + ops-deploy class + denominator honesty), gating density
(Band D), mandating design-docs-first per the user's directive, and shipping the
live-stack harness recipes + the reference reporter.

## Background

Sources (Koni-ERP-02 `docs/tests/audits/`): `koni-qc-improvement-spec-2026-07-02.md`
(Track A: true-100% automation; Track B: 10× density — written against koni-qc as of
2026-07-02, so pre-v0.31/0.32), `qc-density-gap-retrospective-2026-07-02.md` (3-layer
root cause: skill 40% / execution 35% / docs 25%), `qc-journey-to-100` +
`qc-automation-journey` (chronicles: 217→794 tests, 6 product bugs, the 2-JWT harness,
the enforcer, the fan-out rounds), `koni-qc-learning-2026-07-01.md` (already absorbed
as D23). Diff vs v0.32 found already-shipped items (layered suites, orthogonal
matrices, cross-multiplication, honest actuals) and the NEW set below. The user added a
standing requirement: **koni-qc always reads the system-design docs in detail before
designing tests**. CONTEXT D30.

## Acceptance criteria

- [x] **AC-1 (frozen parse contract)** — `test-automation.md` §2 specifies the exact
  TC-token regex (`TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+`, digits allowed in TYPE — the
  `[A-Z]+` variant silently dropped E2E/A11Y) + the spec-scan rule (only first-cell
  TC-ID rows count; headers skipped) + a required self-test fixture.
- [x] **AC-2 (reference reporter shipped)** — `scripts/qc-report.mjs` (node stdlib):
  spec scan, runner-JSON fold, the **broken-handle enforcer** (automated Covered-by must
  resolve to a passing test; broken = 0 or exit non-zero), duplicate-ID guard, 4-class
  counters, density telemetry, denominator-honesty line; +
  `scripts/__tests__/qc-report-test.mjs` (42 assertions, green) freezing both field
  bugs. Explicitly supersedes D21's no-vendored-reporter clause.
- [x] **AC-3 (ops-deploy)** — `OPS-DEPLOY:<runbook>` is the 4th fixed Covered-by form
  (traceability): deploy-verified, own column, never lumped with manual, only after
  exhausting the locally-testable core; wired through status mapping, US legend,
  quality-bar Automation-linkage, koni-setup vocab check.
- [x] **AC-4 (Band D)** — quality-bar gains **Band D — density & exhaustiveness** (gate):
  step-9 cross-multiplication done, matrix completeness 100% (incl. new field×validation
  + state-transition matrices in layered-suites), full BVA discrete rows, full
  error/status coverage, one-row-per-scenario (N TC-IDs may share one test handle —
  traceability), density plausible. Pass rule: Band A green + Band D red = thin → Design.
- [x] **AC-5 (design-docs-first, the user's directive)** — qc-workflow §Frame: read the
  system-design docs **in full** before test design + secure the two enumeration inputs
  (technical-design contract with an error-code table; UI-state inventory), **authoring
  them from code if absent**; Design may not start without them (Frame exit gate).
- [x] **AC-6 (live-harness + CI + fan-out)** — new `references/live-harness.md`
  (2-credential RLS-as-user, per-test tenant isolation, self-seeding e2e, boot
  exclusions, prod-safety); test-automation §4: live suites in a CI job with services +
  a `typecheck` passthrough gate; qc-workflow §Execute: per-epic fan-out with the JSON
  **repoint contract** (`{tcId → handle, deferred[], prodBugs[]}`; orchestrator-only
  spec edits).
- [x] **AC-7** — report-quality: density telemetry (10th section) + denominator honesty
  in §1; LESSONS §10 captured (parse contracts = regex + self-test); koni-docs layer +
  validate green; whole koni-qc re-graded ≥95 (D19).

## Tasks

- [x] **TASK-5.9.1** — Read the 5 ERP audit docs; diff vs v0.32 (done vs new).
- [x] **TASK-5.9.2** — Ship `qc-report.mjs` + contract self-test (42 green) TDD-first.
- [x] **TASK-5.9.3** — test-automation §2/§4 hardening; traceability 4th form + N-TC rule; quality-bar Band D; layered-suites +2 matrices; test-design full-BVA/transitions; report-quality density+denominator.
- [x] **TASK-5.9.4** — qc-workflow design-docs-first + fan-out; live-harness.md; SKILL wiring; LESSONS §10; doc layer; re-grade.

## Implementation notes

- The two parse bugs were **in our contract, not just their code** — prose allowed a
  wrong implementation to look right. Hence LESSONS §10: machine-parse contracts ship as
  exact regex + self-test, and the reference implementation ships with the skill (the
  D21 clause reversal is deliberate, evidence-driven, and recorded in D30).
- Band D turns D29's advisory density warn into a gate where checkable (matrices,
  BVA rows, one-row-per-scenario), keeping the numeric floor reviewer-justifiable.
- live-harness is written stack-neutral (4 properties) with the Koniverse default stack
  as the worked example; deeper stack detail belongs to plugin skills.
- **Re-grade round (D19)**: 4 graders (D1 19 → description/activation vocab fixed;
  D2 18 → 4 code REDs + 2 doc REDs fixed, self-test 25→42; D3 21 → 7 findings fixed
  incl. the §Ownership self-contradiction; D4 23.25 → Band-D de-dup, vocab
  reconciliation, NFR triggers). All findings closed + adversarially re-verified.

## Files modified

- Create: `skills/koni-qc/scripts/qc-report.mjs`, `skills/koni-qc/scripts/__tests__/qc-report-test.mjs`, `skills/koni-qc/references/live-harness.md`
- Modify: `skills/koni-qc/SKILL.md`, `references/{test-automation,traceability,test-design,layered-suites,quality-bar,qc-workflow,report-quality,test-organization}.md`, `skills/koni-setup/references/onboarding-audit.md` (vocab), `docs/LESSONS.md`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [CONTEXT D30](../../CONTEXT.md) · [LESSONS §10](../../LESSONS.md) · [CHANGELOG 0.33.0](../../CHANGELOG.md)
- Sources: `Koni-ERP-02/docs/tests/audits/{koni-qc-improvement-spec,qc-density-gap-retrospective,qc-journey-to-100,qc-automation-journey}-2026-07-02.md`
