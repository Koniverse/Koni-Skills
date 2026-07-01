---
id: US-5.6
title: "test-doc standardization — close the ERP-02 drift so future runs auto-generate the Senti-Quant-grade structure"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-31
arch_ref: []
depends_on:
  - US-5.3
  - US-5.5
assignee: jindo9986
commit: 16392cd
sprint: sprint-2026-W26
version_shipped: "0.25.0"
created: 2026-07-01
updated: 2026-07-01
---

## Goal

A second real deployment (Koni-ERP-02) adopted the koni-qc test-doc standard but
**drifted from the reference repo (Senti-Quant)** that the standard was synthesized
from. An author-blind audit compared both `docs/tests/` trees + test-code layouts
against the koni-qc yardstick and found 10 deviations. This story feeds those
learnings back into the three skills that *generate* the structure — **koni-qc**
(the standard), **koni-setup** (the scaffold), **koni-docs** (the report-body
template) — so a future run produces the standardized system automatically instead
of drifting.

## Background

Evidence (2026-07-01): ERP-02 put run output at a flat `test-reports/<YYYY-MM-DD>/`
(no `EPIC-NN` level, ISO date) vs the standard `test-reports/EPIC-NN/<MMDDYYYY>/`;
kept all suites flat at `tests/*.test.ts` with **no** `tests/epic/` tree; overloaded
`test-plan/README.md` as the whole-repo strategy (no `STRATEGY.md`); invented an
ad-hoc `PROPOSED:` `Covered-by` value; and collided spec TC-IDs with Dev-authored
unit-file IDs (F-12). Root cause in every case: the skills *stated* the standard in
prose but **nothing scaffolded the shape or rejected the drift at bootstrap/first
run** — koni-setup only scaffolded the `docs/tests/` doc tree, never the
`<app>/tests/epic/` code root, and the report path was a diagram, not a MUST.
CONTEXT D22. Two design calls were confirmed with the user: a dedicated
`docs/tests/STRATEGY.md`, and blessing `PROPOSED:` as a legitimate third state.

## Acceptance criteria

- [x] **AC-1 (koni-qc)** — the report path is a **MUST** with a validator regex
  (`EPIC-NN` grouping mandatory, `MMDDYYYY` not ISO, no flat `<date>/`) in
  `test-automation.md` §2 + `test-organization.md` §1; `MMDDYYYY` rationale stated.
- [x] **AC-2 (koni-qc)** — `docs/tests/STRATEGY.md` is the defined home for whole-repo
  strategy; `test-plan/` is per-epic only (`test-organization.md` §1).
- [x] **AC-3 (koni-qc)** — the `<app>/tests/epic/` migration is a real adoption **step**
  (flat `tests/*.test.ts` = non-conformant; reporter flags off-tree suites), not a
  "migrate as you go"; self-scaffold snippet creates the code root too
  (`test-organization.md` §2/§6).
- [x] **AC-4 (koni-qc)** — `PROPOSED:<path>::name` blessed as the third `Covered-by`
  state (planned, counts uncovered) in `traceability.md`; the reporter treats it as
  `not-written`. A TC-ID reservation rule makes the spec the sole authority (no
  Dev-authored unit-file ID collisions — the F-12 bug); orphan/collision flagged.
- [x] **AC-5 (koni-qc)** — the CI step matches the repo's CI (a non-GitHub-Actions /
  Dockerfile branch added) so a container-built repo like ERP gets a blessed gate
  (`test-automation.md` §4).
- [x] **AC-6 (koni-setup)** — bootstrap scaffolds **both** trees (`docs/tests/` +
  `<app>/tests/epic/`) + `STRATEGY.md` + `test-cases/README`; onboarding-audit gains
  drift checks (flat report path, flat test layout, strategy home, Covered-by vocab).
- [x] **AC-7 (koni-docs)** — the report-body template + all location references point
  at the unified `test-reports/EPIC-NN/<MMDDYYYY>/report.md` layout (legacy
  `runs/YYYY-MM-DD-EPIC-N-runN.md` superseded); ownership note: koni-qc owns the
  *path*, koni-docs owns the *body*. (The pervasive `Docs/`→`docs/` casing is logged
  as a separate follow-up, out of scope here.)
- [x] **AC-8** — each changed skill (koni-qc, koni-setup, koni-docs) re-graded **whole**
  to ≥95 (CONTEXT D19); koni-docs updated + validate green.

## Tasks

- [x] **TASK-5.6.1** — Author-blind audit: ERP-02 vs Senti-Quant `docs/tests/` + code layout, 10-item delta mapped to owners.
- [x] **TASK-5.6.2** — koni-qc: report-path MUST+validator, STRATEGY.md, tests/epic migration step, PROPOSED: 3rd state, TC-ID reservation, non-GHA CI branch.
- [x] **TASK-5.6.3** — koni-setup: scaffold both trees + STRATEGY.md + test-cases/README; onboarding-audit drift checks.
- [x] **TASK-5.6.4** — koni-docs: reconcile report path to the unified layout (body/path ownership).
- [x] **TASK-5.6.5** — koni-docs layer + whole-skill re-grade (D19) of all three + validate.

## References

- [koni-qc test-organization](../../../skills/koni-qc/references/test-organization.md) · [test-automation](../../../skills/koni-qc/references/test-automation.md) · [traceability](../../../skills/koni-qc/references/traceability.md)
- [koni-setup scaffold-checklist](../../../skills/koni-setup/references/scaffold-checklist.md) · [onboarding-audit](../../../skills/koni-setup/references/onboarding-audit.md)
- [koni-docs test-report template](../../../skills/koni-docs/references/templates/test-report.md)
- Audit evidence: `Senti-Quant/docs/tests/audits/TEST-DOC-AUDIT-2026-06-30.md`, `Koni-ERP-02/docs/tests/audits/qc-audit-2026-07-01.md`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D22 — ERP-vs-Senti drift → scaffold + enforce the standard](../../CONTEXT.md) · [D21 — automation spine](../../CONTEXT.md) · [D19 — whole-skill re-grade](../../CONTEXT.md)
- [CHANGELOG 0.25.0](../../CHANGELOG.md)
