# quality-bar — the scored rubric ("better than both corpora")

> **Load when**: the **Self-review** stage of [`qc-workflow.md`](qc-workflow.md),
> and again in author-blind review. This is the bar koni-qc must clear: it must
> **beat** the weak manual backup, **match** the Koni-Finance production standard,
> and **close** Koni-Finance's residual gaps. Grade a suite against all three bands.

Score each item as a checkbox. The **Pass rule** at the bottom is the gate.

---

## Band A — beat the manual backup (must clear ALL)

The 12 gaps of the backup corpus, each closed. Every box must be ticked.

- [ ] **Explicit TC IDs** — every case has a stable `TC-<EPIC>.<TYPE>-<n>` ([`traceability.md`](traceability.md)).
- [ ] **AC↔TC matrix** — present and complete; the mandatory artifact.
- [ ] **≥50% negative + boundary** — not ~70% happy-path; at least half the cases are negative or boundary.
- [ ] **NFR present** — required [`nfr.md`](nfr.md) sections filled, not <5%.
- [ ] **Coverage matrix** — coverage % by AC and by type is reported.
- [ ] **Test-data strategy** — concrete, reusable values + named fixtures.
- [ ] **Entry / exit criteria** — written before authoring; checked at the gate.
- [ ] **Test lifecycle** — active / deprecated / archived states applied.
- [ ] **Risk-based order** — P0..P3 priority set by impact × likelihood.
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
