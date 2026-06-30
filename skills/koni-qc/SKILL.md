---
name: koni-qc
description: >
  Use when building test documentation or running quality control on a feature,
  epic, or release — e.g. the user says "write test cases", "build a test plan",
  "QC / QA this", "cover the edge cases", "coverage matrix", "traceability",
  "test this epic / feature / product", "QA the release", "is our testing
  thorough enough", or "grade the test suite" — even if they don't name koni-qc.
  Also use when checking that every acceptance criterion is covered by positive,
  negative, and boundary tests, when hunting missing edge cases, or when
  verifying a UI against DESIGN.md before shipping.
---
# koni-qc — QC methodology & coverage intelligence

> koni-qc is the **intelligence to derive exhaustive, traceable coverage from
> requirements** — the one thing koni-docs (templates), gstack (execution), and
> koni-harness (gate) don't provide. It *fills* those templates and *drives* that
> engine; it never reproduces them (the ownership split is §1).

---

## 1. What this owns vs. delegates

| Concern | Owner |
|---|---|
| Test-design techniques, edge taxonomy, AC↔TC matrix, NFR/security, risk priority, the quality rubric | **koni-qc** (this) |
| Test-doc templates / structure / `docs/tests/` layout | **koni-docs** — `references/templates/test-cases.md`, `test-report.md` (invoke; fill, don't redefine) |
| Execution (browser / systematic QA, bug reports) | **gstack** — `qa` / `qa-only` / `investigate` / `browse` (invoke) |
| UI verification against the repo's design | **gstack** `/design-review` — for any UI-bearing case, check it tracks the repo's `DESIGN.md` (invoke) |
| Commit/release gate, loop, epic selection | **koni-harness** — `gate-runner.sh`, `loop.sh`, `sprint.sh` (invoke) |
| Plan artifacts (brief → PRD → story) | **BMAD** (invoke) |

koni-qc is the **Review / QA stage** of the koni-harness loop, made rigorous. It
never re-implements the right-column owners.

---

## 2. Modes

| Mode | What it does | Uses |
|---|---|---|
| **Author test-cases for EPIC-N** | Read the epic's koni-docs inputs (PRD/stories/AC/ARCH) → produce a complete `docs/tests/test-cases/EPIC-N.md` with the canonical rich-TC table + the AC↔TC coverage matrix + edge + NFR/security cases, risk-ordered | `test-design.md` · `edge-coverage.md` · `nfr.md` · `traceability.md` + koni-docs template |
| **Run QC execution for EPIC-N** | Drive gstack per test case (for UI cases, run `/design-review` against the repo's `DESIGN.md`); record results into koni-docs `test-report.md` run files with execution instrumentation (coverage % by AC/type, pass/fail, perf vs SLA) | `qc-workflow.md` §Execute + gstack (`qa`/`/design-review`) + koni-docs |
| **Release gate for vX.Y.Z** | Check entry/exit criteria; produce the koni-docs release report + ship decision; run the koni-harness gate | `qc-workflow.md` §Release + `quality-bar.md` + koni-harness |

---

## 3. Activation — intent → reference

| User intent | Load |
|---|---|
| "how do I turn this AC into test cases?" | `references/test-design.md` |
| "am I missing edge cases?" / "make coverage thorough" | `references/edge-coverage.md` |
| "trace AC to tests" / "TC IDs" / "coverage matrix" | `references/traceability.md` |
| "security / performance / accessibility / i18n testing" | `references/nfr.md` |
| "does the UI match the design?" / "check against DESIGN.md" | `references/nfr.md` §UI / visual conformance → gstack `/design-review` |
| "run the whole QC process for an epic / release" | `references/qc-workflow.md` |
| "is this test doc good enough?" / "grade it" | `references/quality-bar.md` |
| "show me a worked example" | `references/customize-network-test-cases.example.md` |

---

## 4. The quality bar

koni-qc's promise is **test docs better than both** the weak hand-made Koniverse
suites *and* the best deliberately-authored ones. A suite is graded in three
bands (A beat the manual baseline · B match the production standard · C close
even its residual gaps) and passes only when it clears all of Band A and
demonstrably exceeds B and C. The bands, their items, and the pass rule live in
[`references/quality-bar.md`](references/quality-bar.md) — self-grade against it
before review; do not restate the bands here.

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
