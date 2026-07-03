---
id: US-5.5
title: "test-automation — the spec→test→run→report→sync→CI loop that makes koni-qc self-running"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-30
arch_ref: []
depends_on:
  - US-5.1
  - US-5.3
  - US-5.4
assignee: jindo9986
commit: bd3985e
points: 3
sprint: sprint-2026-W27
version_shipped: "0.24.0"
created: 2026-07-01
updated: 2026-07-03
---

## Goal

Close the gaps a **real koni-qc deployment on koni-erp-02** exposed: the agent could
author specs + run a coverage audit, but **could not automate the test workflow** —
`test-reports/` stayed empty, stories were never synced, no CI. koni-qc was complete
on *authoring* but delegated running/gating to tooling ("gstack `qa`", "a repo
`/run-test`", "the run/report tooling") it **never defined or shipped**. This story
supplies the missing automation spine.

## Background

Evidence (koni-erp-02, 2026-07-01): 12 `test-cases/EPIC-*.md` specs authored + a
whole-project coverage audit — but every TC `— (manual)`, no `tests/epic/` tree,
`test-reports/` empty, 0 story write-back, no `.github/workflows`. A human then
hand-built a *fragment* (a `ci.yml`, two flat test files) outside the skill — proof
the automation steps were missing, not impossible. Gaps ranked by an author-blind
analyst: (1) no spec→runnable-test generation, (2) `tests/epic/` never materialised,
(3) no reporter contract, (4) no code→story sync mechanism, (5) no CI-gate/runner
bootstrap. CONTEXT D21.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-qc/references/test-automation.md`: the **automation
  spine** (generate → report → sync → CI) with concrete contracts —
  §1 spec→runnable TC-ID-named test (+ materialise `tests/epic/EPIC-NN/`),
  §2 the **reporter contract** (runner JSON → parse TC-ID → `report.md`),
  §3 story write-back (Status + coverage% + link), §4 CI gate + runner bootstrap
  (`test:cov` + `.github/workflows` + `gates.conf` rows). Portable across
  vitest/jest/pytest/playwright.
- [x] **AC-2** — the phantom-tooling assertions are removed: `test-organization.md`
  §3 sync no longer claims "automated by gstack `qa` or a repo `/run-test`" but
  points at the reporter contract; `qc-workflow.md` §Execute runs code tests via the
  runner+reporter (gstack `/design-review` scoped to UI).
- [x] **AC-3** — a **§3b Generate** stage added to `qc-workflow.md` (spec→test before
  Execute) + Generation/Execution/CI-gate exit criteria; **"a CI test gate exists"**
  is a Release exit criterion. `unit-coverage.md` points its coverage/CI bootstrap at
  §4. SKILL.md exposes an "Automate the test loop" mode + activation + index +
  description trigger.
- [x] **AC-4** — the ownership boundary holds: koni-qc defines the **contracts +
  procedure** (portable); the repo's runner executes; koni-harness/CI enforces; no
  vendored reporter binary is shipped, and koni-qc no longer claims gstack automates
  unit/integration reports.
- [x] **AC-5** — koni-qc re-graded **whole** to ≥95 after the change (CONTEXT D19);
  koni-docs updated (VERSION/CHANGELOG/PRD/EPIC-5/CONTEXT) + validate green.

## Tasks

- [x] **TASK-5.5.1** — Investigate the koni-erp-02 deployment; rank the automation gaps (author-blind analyst).
- [x] **TASK-5.5.2** — Author `references/test-automation.md` (the 5-gap spine).
- [x] **TASK-5.5.3** — Rewire test-organization §3 + qc-workflow §3b/§4/§5 + unit-coverage + SKILL.md; remove phantom-tooling assertions.
- [x] **TASK-5.5.4** — koni-docs layer + whole-skill re-grade (D19) + validate.

## References

- [koni-qc test-automation](../../../skills/koni-qc/references/test-automation.md)
- Deployment evidence: `Koni-ERP-02/docs/tests/audits/qc-audit-2026-07-01.md`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D21 — the automation spine](../../CONTEXT.md) · [D19 — whole-skill re-grade](../../CONTEXT.md) · [D20 — unit layer](../../CONTEXT.md)
- [CHANGELOG 0.24.0](../../CHANGELOG.md)
