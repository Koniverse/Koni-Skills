---
name: koni-qc
description: >
  Turns koni-docs-standard inputs (PRD FRs, stories + acceptance criteria,
  ARCHITECTURE, epics) into Silicon-Valley-grade, fully-traceable test
  documentation and drives quality-control execution — covering every case and
  edge case so a product ships smoothly. Use this whenever the user says "write
  test cases", "build a test plan", "QC / QA this", "cover the edge cases",
  "coverage matrix", "test this epic / feature / product", "QA the release", or
  asks how thorough the testing is — even if they don't name koni-qc. It owns the
  QC METHODOLOGY (test-design techniques, the edge-case taxonomy, the mandatory
  AC↔TC coverage matrix, non-functional + security testing, risk-based
  prioritization, and a quality rubric); it DELEGATES the doc templates to
  koni-docs, execution to gstack, and the commit/release gate + loop to
  koni-harness — it composes them, it never reproduces them.
---
# koni-qc — QC methodology & coverage intelligence

> **What this skill adds, and what it doesn't.** Koni already has the *templates*
> (koni-docs `test-cases.md` / `test-report.md` + the `docs/tests/` tree), the
> *execution engine* (gstack `qa` / `investigate` / `browse`), and the *gate*
> (koni-harness). What none of them has is the **intelligence to derive
> exhaustive, traceable coverage from requirements** — that is koni-qc. It is a
> methodology layer that fills the existing templates with far better content and
> drives the existing engine. The day it would copy a koni-docs template or a
> gstack procedure, it's doing the wrong thing.

---

## 1. What this owns vs. delegates

| Concern | Owner |
|---|---|
| Test-design techniques, edge taxonomy, AC↔TC matrix, NFR/security, risk priority, the quality rubric | **koni-qc** (this) |
| Test-doc templates / structure / `docs/tests/` layout | **koni-docs** — `references/templates/test-cases.md`, `test-report.md` (invoke; fill, don't redefine) |
| Execution (browser / systematic QA, bug reports) | **gstack** — `qa` / `qa-only` / `investigate` / `browse` (invoke) |
| Commit/release gate, loop, epic selection | **koni-harness** — `gate-runner.sh`, `loop.sh`, `sprint.sh` (invoke) |
| Plan artifacts (brief → PRD → story) | **BMAD** (invoke) |

koni-qc is the **Review / QA stage** of the koni-harness loop, made rigorous. It
never re-implements the right-column owners.

---

## 2. Modes

| Mode | What it does | Uses |
|---|---|---|
| **Author test-cases for EPIC-N** | Read the epic's koni-docs inputs (PRD/stories/AC/ARCH) → produce a complete `docs/tests/test-cases/EPIC-N.md` with the canonical rich-TC table + the AC↔TC coverage matrix + edge + NFR/security cases, risk-ordered | `test-design.md` · `edge-coverage.md` · `nfr.md` · `traceability.md` + koni-docs template |
| **Run QC execution for EPIC-N** | Drive gstack per test case; record results into koni-docs `test-report.md` run files with execution instrumentation (coverage % by AC/type, pass/fail, perf vs SLA) | `qc-workflow.md` §Execute + gstack + koni-docs |
| **Release gate for vX.Y.Z** | Check entry/exit criteria; produce the koni-docs release report + ship decision; run the koni-harness gate | `qc-workflow.md` §Release + `quality-bar.md` + koni-harness |

---

## 3. Activation — intent → reference

| User intent | Load |
|---|---|
| "how do I turn this AC into test cases?" | `references/test-design.md` |
| "am I missing edge cases?" / "make coverage thorough" | `references/edge-coverage.md` |
| "trace AC to tests" / "TC IDs" / "coverage matrix" | `references/traceability.md` |
| "security / performance / accessibility / i18n testing" | `references/nfr.md` |
| "run the whole QC process for an epic / release" | `references/qc-workflow.md` |
| "is this test doc good enough?" / "grade it" | `references/quality-bar.md` |
| "show me a worked example" | `references/customize-network-test-cases.example.md` |

---

## 4. The quality bar

koni-qc's promise is **test docs that are better than both** the hand-made
Koniverse suites *and* the best deliberately-authored ones. The rubric in
[`references/quality-bar.md`](references/quality-bar.md) makes that concrete in
three bands: (A) beat the weak manual baseline's gaps — explicit TC IDs, the
AC↔TC matrix, ≥50% negative/boundary, NFR present, real reports; (B) match the
production standard — rich per-TC metadata, a dedicated security suite, concrete
reusable test data, execution instrumentation; (C) close even *its* gaps — a
*complete* AC↔TC matrix, an env/fixtures playbook, a11y/i18n, perf SLAs, cadence.
A test doc passes only when it clears all of Band A and demonstrably exceeds B
and C. Self-grade against it before review.

---

## 5. Reference index

| File | When to load |
|---|---|
| [`references/qc-workflow.md`](references/qc-workflow.md) | Running the QC lifecycle end-to-end (frame → design → review → execute → release gate); how it composes koni-docs / gstack / koni-harness |
| [`references/test-design.md`](references/test-design.md) | Deriving positive/negative/boundary cases from an AC (partitioning, BVA, decision tables, state-transition, pairwise, error-guessing) |
| [`references/edge-coverage.md`](references/edge-coverage.md) | The edge-case taxonomy applied to every feature so coverage stops at thorough, not happy-path |
| [`references/traceability.md`](references/traceability.md) | The TC-ID scheme, the canonical rich-TC table, and the **mandatory AC↔TC coverage matrix** + risk/regression tagging |
| [`references/nfr.md`](references/nfr.md) | Non-functional coverage — security (lead), performance/SLA, accessibility, i18n, reliability, compatibility, observability |
| [`references/quality-bar.md`](references/quality-bar.md) | Grading a test doc against the three-band "better than both" rubric |
| [`references/customize-network-test-cases.example.md`](references/customize-network-test-cases.example.md) | A worked pilot showing the standard + the uplift over a manual suite |

**Boundary reminder**: anything about the *doc template shape* is koni-docs';
anything about *running* a test is gstack's; the *gate* is koni-harness'. koni-qc
brings the method and the coverage — invoke the others, don't reproduce them.
