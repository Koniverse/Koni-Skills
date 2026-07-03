---
id: US-5.8
title: "koni-qc field absorption — exemplar bar, ERP 100%-drive hardening, field reorg + regression-learning loop (3 rounds; absorbs US-5.9 + US-5.10)"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-35
  - FR-36
  - FR-37
arch_ref: []
depends_on:
  - US-5.1
  - US-5.3
  - US-5.5
assignee: jindo9986
commit: e169603 + 286a107 + 0414183
points: 11
sprint: sprint-2026-W27
version_shipped: "0.31.0 + 0.33.0 + 0.34.0"
created: 2026-07-02
updated: 2026-07-03
---

## Goal

Lift koni-qc's **test-case authoring** and **execution-report** quality to the bar set by
two exemplar suites (US-001.001 API + functional test cases) and the matured SubWallet
checklist-round practice in `koni-docs.backup` — so a koni-qc-authored suite is layered,
surface-cross-checked, evidence-linked, and its report is decision-grade rather than a
pass/fail tally.

## Background

Reviewed via koni-harness: (a) `koni-docs.backup` `BA & QC Document/Checklist - Test case`
(107-entry Notion DB + row pages) — the real practice is **round-based bug-fix retest**
([Round 1]→[Round 2], each bug an Actual/Expect pair + screenshot/GIF/build-link evidence)
plus Checklist↔Testcase pairing and a test-data acquisition guideline; (b) two exemplar
suite files supplied by the user — API cases organized **by endpoint** with real Actual
Responses, Response Time, and DB Changes columns, **orthogonal coverage matrices**
(endpoint / HTTP status-code / error-code), a named test-data registry with Used-In
back-refs, Open Questions; functional cases with **[Happy Path]/[Error]/[Validation]/
[Verification]** prefixes, UI-component traceability, pages/components/validation/a11y
rollups, and per-failure evidence (spec `file:line` + video); both with execution
summaries carrying skipped/blocked **reason + action**, failed-by-category root cause,
perf min/max/avg, implementation status, and recommendations. Current koni-qc had none of
the layer-split, orthogonal-matrix, evidence, registry, or report-content standards.
CONTEXT D28.

## Acceptance criteria

- [x] **AC-1 (`references/layered-suites.md`)** — the suite-structure standard: API/
  functional layer split with mutual scope contracts; API by-endpoint tables (Request
  Headers/Payload, real Actual Response, Response Time, DB Changes) + required API
  classes (auth guard, RLS isolation incl. write-rejection, events + idempotency,
  audit); functional category prefixes + UI-component traceability + evidence per
  executed case; the orthogonal coverage matrices; the named test-data registry with
  Used-In + acquisition notes; `## Open Questions`; round-based bug-fix retest (rounds →
  clean → graduate to `RC-`).
- [x] **AC-2 (`references/report-quality.md`)** — the execution-report content bar:
  **honest actuals** (real output, never a copy of Expected); 9 required sections
  (overview %, results-by-group, skipped/blocked reason+action, failed-by-category root
  cause, contract-coverage verification, perf stats, implementation status,
  recommendations, command reference); the evidence rule; applies to auto `report.md` +
  manual `report-manual.md` without hand-editing reporter rows.
- [x] **AC-3 (wiring, single-source)** — SKILL.md (Author mode + 2 activation rows + 2
  index rows); `test-design.md` output → layered shape; `traceability.md` pairs the
  AC↔TC matrix with the orthogonal matrices; `qc-workflow.md` §Design shapes by layer +
  §Execute exits only with a bar-meeting report; `test-automation.md` §2 output points at
  the content bar; `quality-bar.md` "Real execution reports" graded against it. Criteria
  live once; everything else points.
- [x] **AC-4** — koni-docs layer (VERSION 0.31.0, CHANGELOG, CONTEXT D28, PRD FR-35,
  EPIC-5, sprint) + validate green; whole koni-qc re-graded ≥95 (D19).

## Tasks

- [x] **TASK-5.8.1** — Read `koni-docs.backup` checklist-testcase DB + row pages; analyze the two exemplar suites; gap analysis vs koni-qc.
- [x] **TASK-5.8.2** — Author `layered-suites.md` (structure + matrices + registry + questions + rounds).
- [x] **TASK-5.8.3** — Author `report-quality.md` (content bar + honest actuals + evidence).
- [x] **TASK-5.8.4** — Wire SKILL/test-design/traceability/qc-workflow/test-automation/quality-bar; koni-docs layer; re-grade (D19).

## Implementation notes

- The two references **compose** the existing method (test-design derives, traceability
  owns IDs/matrix, test-organization owns layout, test-automation owns reporter
  mechanics, koni-docs owns templates) — they add the *document structure* and *report
  content* layers that were unowned.
- The orthogonal matrices are deliberately framed as *surface* coverage vs the AC↔TC
  matrix's *requirements* coverage — enumerate the full set (endpoints, status codes,
  error codes, pages) and any member with zero TCs is a visible gap.
- Round-based retest is scoped as bug-fix verification (distinct from `RC-` release
  regression); rounds run until clean, survivors graduate to `RC-`.

## Files modified

- Create: `skills/koni-qc/references/layered-suites.md`, `skills/koni-qc/references/report-quality.md`
- Modify: `skills/koni-qc/SKILL.md`, `references/{test-design,traceability,qc-workflow,test-automation,quality-bar}.md`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [CONTEXT D28](../../CONTEXT.md) · [CHANGELOG 0.31.0](../../CHANGELOG.md)
- Sources: `koni-docs.backup` `converted/notion/10-product/product-management/ba-qc-document/checklist-test-case/` · exemplar suites `US-001.001-api-test-cases.md` + `US-001.001-functional-test-cases.md` (user-supplied)

## Round 2 — field-hardening from the ERP 100% drive (v0.33.0, FR-36 — absorbs US-5.9)

Consolidated here 2026-07-03 per [CONTEXT D33](../../CONTEXT.md) (5 pts, commit
`286a107`). Absorbed the five ERP-02 audit docs from the real 9.3%→100% automation
drive — including **two real parse bugs in our own reporter contract**: the frozen
TC-token regex + header-skip scan + shipped reference reporter `scripts/qc-report.mjs`
with the **broken-handle enforcer** (supersedes D21's no-vendored-reporter clause,
D30); `OPS-DEPLOY:` as the 4th Covered-by form; **Band D** density gate;
**design-docs-first** Frame mandate (the user's standing directive); live-harness
recipes (2-credential RLS-as-user, tenant isolation, self-seed e2e); CI-with-services
+ typecheck gate; fan-out repoint contract. Re-graded ≥95 (4 graders + adversarial
re-verify). Details: CHANGELOG [0.33.0], CONTEXT D30, LESSONS §10.

## Round 3 — field reorg + the regression-learning harness loop (v0.34.0, FR-37 — absorbs US-5.10)

(3 pts, commit `0414183`.) Three user directives: **(1)** the ERP-02 test-doc reorg
absorbed as canonical (per-US spec split `test-cases/EPIC-N/`, date-first
`test-reports/YYYY-MM-DD/` + `summary/` rollups, no `test-plan/`; legacy accepted
everywhere); **(2)** koni-qc as a **learning harness** — `regression-learning.md`:
every escaped bug becomes a red-first REG TC + a class-named finding + a step-9
generalization sweep, with the four-mode miss post-mortem; **(3)** the **mandatory
CHANGELOG + git-log change sweep** every QC round (a fix with no REG TC = a confirmed
miss) + the change-coverage ledger. Plus `DESIGN-REVIEW:` as the 5th Covered-by form
and lane-aware `env-pending` enforcement (fails closed); qc-report self-test 42 → 61
assertions; re-graded ≥95 after 2 RED anti-laundering bugs were probe-found and
fixed. Details: CHANGELOG [0.34.0], CONTEXT D31, LESSONS §11.

The IDs **US-5.9 and US-5.10 are retired — never reuse them.**
