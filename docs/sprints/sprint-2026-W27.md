---
id: sprint-2026-W27
status: in-progress
start: 2026-06-29T00:00:00.000Z
end: 2026-07-05T00:00:00.000Z
goal: >-
  The QC-intelligence drive: stand up koni-qc end-to-end (US-5.1 → US-5.10,
  v0.16.0 → v0.34.0 — methodology, skill-grading, test organization,
  unit-coverage, automation spine, whole-project QC, layered suites,
  field-hardening from the ERP 100% drive, field reorg + the regression-learning
  harness loop), plus koni-harness parallel orchestration (US-3.8) and the first
  product/client skill koni-agent-monitoring (US-6.1). 12 stories / 42 pts / 1
  contributor. Ships FR-26 → FR-37.
---
## Sprint scope

Opened retroactively on 2026-07-03 (correction, [CONTEXT D32](CONTEXT.md)): the
work below executed 06-29 → 07-05 but had been appended to the already-ended
[sprint-2026-W26](sprint-2026-W26.md) instead of opening this file — see
[LESSONS §12](LESSONS.md). Rows are ordered by ship date.

| US     | Title                                                                                                        | Epic   | Pri | Points | Status | Ship                        | Story file                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------ | ------ | --- | ------ | ------ | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| US-5.1 | koni-qc — QC methodology & coverage-intelligence skill                                                       | EPIC-5 | P1  | 5      | ✅ done | v0.16.0                     | [stories/US-5.1-koni-qc.md](stories/US-5.1-koni-qc.md)                                               |
| US-5.2 | skill-grading — QC for skill artifacts, wired into the loop                                                  | EPIC-5 | P1  | 3      | ✅ done | v0.18.0                     | [stories/US-5.2-skill-grading.md](stories/US-5.2-skill-grading.md)                                   |
| US-5.3 | test-organization — taxonomy + scaffolding; round 2: standardize + enforce (absorbs US-5.6)                  | EPIC-5 | P1  | 6      | ✅ done | v0.19.0 + v0.25.0           | [stories/US-5.3-test-organization.md](stories/US-5.3-test-organization.md)                           |
| US-5.4 | unit-coverage — per-function unit-test process + Self-verify gate                                            | EPIC-5 | P1  | 3      | ✅ done | v0.23.0                     | [stories/US-5.4-unit-coverage.md](stories/US-5.4-unit-coverage.md)                                   |
| US-5.5 | test-automation — spec→test→run→report→sync→CI spine                                                         | EPIC-5 | P1  | 3      | ✅ done | v0.24.0                     | [stories/US-5.5-test-automation.md](stories/US-5.5-test-automation.md)                               |
| US-5.7 | whole-project QC — QA-tracking epic + DoD + depth bar (ERP learning)                                         | EPIC-5 | P1  | 3      | ✅ done | v0.26.0                     | [stories/US-5.7-whole-project-qc.md](stories/US-5.7-whole-project-qc.md)                             |
| US-3.8 | koni-harness parallel orchestration — multi-agent swarm + fan-out                                            | EPIC-3 | P1  | 3      | ✅ done | v0.27.0                     | [stories/US-3.8-harness-parallel-orchestration.md](stories/US-3.8-harness-parallel-orchestration.md) |
| US-6.1 | koni-agent-monitoring — content-free Claude Code usage reporter                                              | EPIC-6 | P1  | 5      | ✅ done | v0.28.0                     | [stories/US-6.1-koni-agent-monitoring.md](stories/US-6.1-koni-agent-monitoring.md)                   |
| US-5.8 | koni-qc field absorption — exemplar bar + ERP hardening + reorg/learning (3 rounds; absorbs US-5.9, US-5.10) | EPIC-5 | P1  | 11     | ✅ done | v0.31.0 + v0.33.0 + v0.34.0 | [stories/US-5.8-layered-suites-report-quality.md](stories/US-5.8-layered-suites-report-quality.md)   |

**Total**: **9 stories / 42 points** — seven EPIC-5 (the koni-qc drive,
v0.16.0 → v0.34.0), one EPIC-3 post-completion enhancement (US-3.8 parallel
orchestration), one EPIC-6 (US-6.1, the first product/client skill).
Ships **FR-26 → FR-37**. (Consolidated 2026-07-03 per the story-granularity
rule, [CONTEXT D33](CONTEXT.md): US-5.6 → US-5.3, US-5.9 + US-5.10 → US-5.8 —
retired IDs are never reused. Points preserved: 42.)

**Post-ship refinements shipped in-window, no new story (story-sprawl rule,
[CONTEXT D14](CONTEXT.md)):**

- **v0.17.0–0.17.2** (06-30, refine FR-21 + FR-26): the loop's tool-split rule +
  fixed review order (`/design-review` + koni-qc) — [CONTEXT D15](CONTEXT.md) —
  then a multi-skill grading pass hardening koni-harness to 96/100 and koni-qc
  to 97/100 ([LESSONS §8](LESSONS.md); CHANGELOG \[0.17.0]–\[0.17.2]).
- **v0.20.0–v0.20.1** (06-30, refine FR-10): koni-setup installs the Koniverse
  core trio + harness gate at setup; graded hardening to 96/100.
- **v0.21.0–v0.22.0** (06-30, refine FR-26/FR-27): coverage organized by user
  story, not epic; **≥95/100 becomes the catalog skill-grading standard**,
  enforced at Review ([CONTEXT D19](CONTEXT.md)).
- **v0.29.0** (07-01, refine FR-21): koni-harness explicit **lesson-capture
  step** at the Doc + Version gate — [CONTEXT D26](CONTEXT.md).
- **v0.30.0** (07-01, refine FR-26 + FR-21): UI design-review must pass
  **DESIGN.md + the shadcn standard** (mandatory) — [CONTEXT D27](CONTEXT.md).
- **v0.32.0** (07-03, refine FR-26 + FR-35): the 10× case-volume gap closed —
  step-9 cross-multiplication + atomicity + density sanity —
  [CONTEXT D29](CONTEXT.md).
- **v0.35.0** (07-03, refine FR-21): the **story-granularity rule** in koni-harness
  (one story = one deliverable; rounds extend the anchor) + the D33 consolidation
  of this very sprint's board (12 → 9 rows, points preserved) —
  [CONTEXT D33](CONTEXT.md).
- **v0.36.0** (07-03, refine FR-21 + FR-22): **`story-lint`** — US field
  completeness becomes a blocking release-commit gate (13-assertion self-test);
  first run caught the W21→W22 drift from 2026-05 — [CONTEXT D34](CONTEXT.md).
- **v0.37.0** (07-04, refine FR-21 + FR-22): the **lessons loop always-on** —
  read-with-citation at entry (`Lessons applied:`, story-lint rule 6) +
  write-with-verdict at exit (`lesson-capture` gate: a LESSONS entry or
  `Lessons: none new — <reason>` in the release commit) — [CONTEXT D35](CONTEXT.md).
- **v0.38.0** (07-04, refine FR-21 + FR-26): **design-first UI** (`Design applied:`
  citation gated by `design-first`; review confirms, never discovers) + the
  **doc-completeness bar** at the Doc gate (diff → mandatory doc surface; depth =
  act-without-the-diff) — [CONTEXT D36](CONTEXT.md).

## Sprint goal recap

W26 delivered EPIC-3 (the catalog can grow beyond koni-docs). W27 answers the
next question — *can the catalog guarantee quality?* — by building koni-qc from
zero to a learning harness, fed twice by real field evidence from the ERP-02
adoption (the 9.3%→100% automation drive and the test-doc reorg). The sprint's
through-line: every standard hardened this week came back from the field, not
from theory ([LESSONS §10](LESSONS.md), [§11](LESSONS.md)).

## Carry / next

- Sprint is **in progress** (ends 2026-07-05). Retro at close.
- Candidate next: dogfood the new `test-cases/EPIC-N/` + date-first layout on a
  fresh koni-qc run in a Koniverse product repo; koni-docs template
  reconciliation to the date-first report path (tracked follow-up in
  [test-organization.md](../../skills/koni-qc/references/test-organization.md) §1).
