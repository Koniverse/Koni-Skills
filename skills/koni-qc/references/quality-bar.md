# quality-bar — the scored rubric ("better than both corpora")

> **Load when**: the **Self-review** stage of [`qc-workflow.md`](qc-workflow.md),
> and again in author-blind review. This is the bar koni-qc must clear: it must
> **beat** the weak manual backup, **match** the Koni-Finance production standard,
> and **close** Koni-Finance's residual gaps. Grade a suite against all three bands.

Score each item as a checkbox. The **Pass rule** at the bottom is the gate.

**Contents**: [Band A — beat the manual backup](#band-a--beat-the-manual-backup-must-clear-all) ·
[Band B — match the Koni-Finance standard](#band-b--match-the-koni-finance-standard) ·
[Band C — close its residual gaps](#band-c--close-its-residual-gaps) ·
[Pass rule](#pass-rule)

---

## Band A — beat the manual backup (must clear ALL)

The 12 gaps of the backup corpus, each closed. Every box must be ticked.

- [ ] **Explicit TC IDs** — every case has a stable `TC-<EPIC>.<TYPE>-<n>` ([`traceability.md`](traceability.md)).
- [ ] **AC↔TC matrix** — present and complete; the mandatory artifact.
- [ ] **≥50% off-path** — not ~70% happy-path; at least half the cases are **off-path = negative (NEG) + boundary (BND) + edge (EDGE)** (the three off-path TYPEs in [`traceability.md`](traceability.md)). NFR types (SEC/PERF/A11Y/UI) and happy-path types (FUNC/SMK/E2E/API) do **not** count toward the 50%.
- [ ] **NFR present** — required [`nfr.md`](nfr.md) sections filled, not <5%.
- [ ] **Coverage % reported** — the *execution* coverage report: % by AC and by type, from a run (distinct from the authoring AC↔TC matrix above; this is an execution item, deferrable on an unrun suite — see the Author-mode carve-out).
- [ ] **Test-data strategy** — concrete, reusable values + named fixtures.
- [ ] **Entry / exit criteria** — written before authoring; checked at the gate.
- [ ] **Test lifecycle** — active / deprecated / archived states applied.
- [ ] **Risk-based order** — Critical/High/Medium/Low priority set by impact × likelihood.
- [ ] **Regression scope** — `RC-` set defined as the per-release regression scope.
- [ ] **Automation linkage** — `Covered-by` filled (`*.spec.ts::name` or `— (manual)`).
- [ ] **Real execution reports** — koni-docs `test-report.md` filled, not empty.

---

## Band B — match the Koni-Finance standard

The production strengths to codify. Must demonstrably match.

- [ ] **Rich per-TC metadata** — the full canonical table (test-data · preconditions · action · expected · actual · status · perf · side-effects · covered-by).
- [ ] **Dedicated security suite** — SEC cases present; standalone `<feature>-security-test-cases.md` when ≥5.
- [ ] **Concrete reusable test data** — every TC carries a real, re-runnable value.
- [ ] **Execution instrumentation** — coverage % by AC/type, pass/fail/blocked, perf vs SLA.

---

## Band C — close its residual gaps

What Koni-Finance lacked; koni-qc must exceed here.

- [ ] **Full AC↔TC matrix** — every AC mapped, no orphans (Koni-Finance had rich TCs but no matrix).
- [ ] **Env / fixtures playbook** — environment + fixtures defined and re-creatable.
- [ ] **A11y / i18n** — accessibility and internationalization sections covered when triggered.
- [ ] **Perf SLA** — explicit latency / throughput budgets asserted, not just measured.
- [ ] **Cadence** — when the suite (smoke / regression / full) runs is defined.

---

## Pass rule

> **A suite passes only if it clears every item of Band A, and demonstrably
> exceeds Band B and Band C.** Any unticked Band-A box is a hard fail — return to
> **Design**. A Band-B/C item that is merely matched, not exceeded, is a finding to
> raise in review.

**Author-mode vs Execute-mode bar.** Two Band-A items — **Real execution reports**
and **Coverage % reported** — depend on the suite having been *run*. An
**authoring** artifact (test cases written, not yet executed: every row `Not
Executed`) legitimately marks those two `N/A — deferred to Execute` rather than
failing them; it must clear every *other* Band-A item. The full Band-A bar
(including the two execution items) applies at the **Execute/Release** stage, once
the koni-docs `test-report.md` is filled. Do not tick an execution item on an
unrun suite — mark it deferred.
