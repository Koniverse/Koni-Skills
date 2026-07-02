---
id: US-5.10
title: "field reorg + regression learning — ERP-02 layout absorbed, 5th Covered-by form, lane-aware env-pending, the QC harness loop + mandatory change sweep"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-37
arch_ref: []
depends_on:
  - US-5.9
assignee: jindo9986
commit: 0414183
sprint: sprint-2026-W26
version_shipped: "0.34.0"
created: 2026-07-03
updated: 2026-07-03
---

## Goal

Three user directives, one round: (1) absorb the **ERP-02 test-doc reorg** into the
koni-qc standard; (2) make koni-qc operate as a **harness that learns from real
bugs** and generates new cases from them; (3) a standing rule to **read CHANGELOG +
git log every QC round** so shipped changes never outrun the suite.

## Background

ERP-02 (the flagship adopter, 452 authored TCs / 794 tests) reorganized its test docs
under real load (their commits v1.114.57–67): per-US spec files under
`test-cases/EPIC-N/` with an `index.md` frame; date-first `test-reports/YYYY-MM-DD/`
with `auto-coverage.md` + `summary/` latest-state rollups; `test-plan/` removed; a
`design` coverage class (free-text `/design-review` markers) and a lane-aware
`env-pending` status; the coverage formula
`covered = automated + env-pending + design + ops-deploy`. Our v0.33.0 validator
would have called the *better* layout non-conformant → LESSONS §11. CONTEXT D31.

## Acceptance criteria

- [x] **AC-1 (layout absorbed)** — `test-organization.md` §1 adopts the field layout
  as canonical (per-US split, date-first reports, `summary/`, `bug-bash/`, no
  `test-plan/` — per-epic framing in `index.md`); old shapes legacy-accepted; §5
  legend gains ⏳ env-pending + 🎨 design + the coverage formula; scaffold updated.
- [x] **AC-2 (five forms)** — `DESIGN-REVIEW:<ref>` is the 5th fixed Covered-by form
  (traceability; "do not invent a sixth"; legacy free text containing
  `design-review` reads as form 5); five-form set propagated to quality-bar,
  whole-project-qc DoD, layered-suites, koni-setup vocab check.
- [x] **AC-3 (lane-aware enforcer)** — test-automation §2: a live-cadence automated
  handle missing in an env-less lane folds to `env-pending` (covered — verified in
  its own CI lane), never broken; the full lane enforces everything. `qc-report.mjs`
  gains `--lane`, recursive spec scan, the design class, the `env-pending` bucket,
  the coverage-formula line, and the date-first path validator (legacy accepted);
  self-test **42 → 61 assertions**, green (incl. the anti-laundering probes:
  classify precedence, lane fail-closed, cadence-from-path, malformed-TC flagging).
- [x] **AC-4 (the learning loop)** — new `references/regression-learning.md`:
  Observe → Capture → Derive → Generate → Enforce; every escaped bug becomes THREE
  things (red-first `REG` TC + class-named finding + step-9 generalization sweep);
  four-mode miss post-mortem (enumeration/density/layer/execution) that fixes the
  class, not the instance; bug-bash intake.
- [x] **AC-5 (the change sweep, the user's standing rule)** — CHANGELOG **and**
  `git log` diffed at every Frame (mandatory input + exit item) and at the Release
  gate ("close the learning loop" exit item): every feat has covering TCs, every
  fix has a REG TC (a fix with no REG TC = a **confirmed miss** → post-mortem),
  recorded in the change-coverage ledger in `findings.md`.
- [x] **AC-6 (routing + docs)** — SKILL.md learning-loop mode + activation/index
  rows, description 1023/1024; qc-workflow Design authors into `EPIC-N/`
  (index vs US files); koni-docs layer green; whole koni-qc re-graded ≥95 (D19).

## Tasks

- [x] **TASK-5.10.1** — Read the ERP-02 reorg (tree + test-organization.md + README +
  auto-coverage + reorg commits); diff vs the v0.33.0 standard.
- [x] **TASK-5.10.2** — test-organization §1/§5 rewrite + five-form propagation +
  qc-report.mjs lane/recursive/design/path work, TDD (61/61).
- [x] **TASK-5.10.3** — regression-learning.md + qc-workflow wiring (Frame sweep,
  Release loop-close) + layered-suites placement + SKILL.md routing.
- [x] **TASK-5.10.4** — Doc layer (FR-37, D31, LESSONS §11, sprint/epic rows) +
  validate + re-grade + ship.

## Implementation notes

- The reorg is absorbed **with legacy acceptance everywhere** (scanner recursive over
  both layouts; validator accepts both path shapes) — an adopted repo is never
  stranded (LESSONS §11).
- `env-pending` is a **derived lane status**, not a sixth form — the closed set grows
  only when the field needs a genuinely new *authoring* vocabulary (design-review
  did; env-pending didn't).
- The change sweep caps a long window at the top-20 riskiest changes and records the
  cut in the ledger — denominator honesty applied to change coverage.
- **Re-grade round (D19)**: D1 22 (5 routing fixes applied), D2 16 (2 RED
  anti-laundering code bugs found by probe — design-review substring precedence +
  lane failing open — both fixed + frozen in the self-test), D3 17 (stale-path/
  four-form sweep completed, nfr §UI design-lint half added, retro-REG revert-proof
  rule), D4 20.5 (whole-project-qc reorg reconciliation + formula canonical home).
  All findings closed + adversarially re-verified.

## Files modified

- Create: `skills/koni-qc/references/regression-learning.md`,
  `docs/sprints/stories/US-5.10-field-org-learning.md`
- Modify: `skills/koni-qc/SKILL.md`,
  `references/{test-organization,traceability,test-automation,qc-workflow,layered-suites,quality-bar,whole-project-qc}.md`,
  `scripts/qc-report.mjs` + `scripts/__tests__/qc-report-test.mjs`,
  `skills/koni-setup/references/onboarding-audit.md`, `docs/LESSONS.md` (§11)

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [CONTEXT D31](../../CONTEXT.md) ·
  [LESSONS §11](../../LESSONS.md) · [CHANGELOG 0.34.0](../../CHANGELOG.md)
- Source: `Koni-ERP-02/docs/tests/` (tree + `test-organization.md` + `README.md` +
  `test-reports/2026-07-02/auto-coverage.md`; reorg commits v1.114.57–67)
