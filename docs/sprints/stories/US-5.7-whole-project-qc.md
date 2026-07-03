---
id: US-5.7
title: "whole-project QC — QA-tracking epic + Definition-of-Done + depth bar (from the ERP-02 learning note)"
epic: EPIC-5
status: done
priority: P1
prd_ref:
  - FR-32
arch_ref: []
depends_on:
  - US-5.5
  - US-5.6
assignee: jindo9986
commit: 5b0ed16
points: 3
sprint: sprint-2026-W27
version_shipped: "0.26.0"
created: 2026-07-01
updated: 2026-07-03
---

## Goal

A koni-qc learning note from the Koni-ERP-02 deployment (`docs/tests/audits/
koni-qc-learning-2026-07-01.md`, codified as ERP LESSONS §213) found that running
koni-qc end-to-end still came out **worse than Senti-Quant** on five whole-project
concerns the skill left to operator memory. This story adds the missing **layer above
the per-epic lifecycle**: standing up a QA-tracking epic, authoring the strategy,
enforcing artifact locations, requiring real execution, and a completion gate + depth
bar — so whole-repo QC produces the Senti-grade result by procedure, not diligence.

## Background

Evidence (Koni-ERP-02, 2026-07-01): koni-qc correctly produced the audit, the
`docs/tests/` tree, 12 specs (452 TCs) with AC↔TC matrices, and automation — but
(1) filed QC as 2 stories under a *feature* epic instead of a dedicated QA-tracking
epic (Senti's `EPIC-37` with ~30 `US-37.X`: one coverage story per app epic + infra/
process stories); (2) left `test-plan/`/strategy empty (no "author test-plan" mode);
(3) misplaced `QC-PLAN-BY-US.md` at the tests root and the baseline report at a flat
`test-reports/<date>/`; (4) never ran execution (QC declared done on specs-only);
(5) bulk-generated 21 stories as ~30-line stubs and called them done (had to be
rewritten to 123-140 lines each). Root cause: koni-qc supplies method + templates but
its workflow never *prescribed* these steps or gated on them. CONTEXT D23.

## Acceptance criteria

- [x] **AC-1** — new `references/whole-project-qc.md`: the whole-repo QC layer above
  `qc-workflow.md`, with Load-when + Contents TOC, and §1–§6 below.
- [x] **AC-2 (§1 QA-tracking epic)** — prescribes the Senti `EPIC-37` model: a dedicated
  `EPIC-NN "Test & QA Coverage Tracking"` (no code, no source-of-truth spec) + **one
  coverage story per app epic** (`US-NN.X ↔ EPIC-MM`) + infra/process stories, plus the
  **QA ownership model** (dev authors spec+code; koni-qc AI owns the review side).
- [x] **AC-3 (§2 strategy)** — an author-the-strategy step: `docs/tests/STRATEGY.md`
  (whole-repo) + per-epic `test-plan/EPIC-N-<slug>.md`, so the folder is never empty
  (consistent with the D22 STRATEGY.md home).
- [x] **AC-4 (§3 artifact-location MUSTs)** — `audits/QC-PLAN-BY-US-<date>.md` (never
  root), reports at `test-reports/EPIC-NN/<MMDDYYYY>/report.md`; also enforced in
  `test-organization.md` §0.
- [x] **AC-5 (§4 execution + §5 Definition-of-Done)** — QC is not done on specs alone
  (≥1 execution report required); a 7-item whole-project DoD checklist (QA epic, strategy,
  QC-PLAN + audit, honest `Covered-by`/no phantom automation, ≥1 execution, no TC-ID
  collisions, depth bar).
- [x] **AC-6 (§6 depth bar)** — "creating a file is not authoring it": the per-artifact
  depth bar (full story sections + coverage snapshot), ground-don't-template, refuse to
  close a create step below bar, spot-check 3; cross-linked from `quality-bar.md`.
- [x] **AC-7** — SKILL.md exposes a "QC a whole project" mode + activation + reference
  index + description trigger (856 chars, under 1024); `qc-workflow.md` §Frame points at it.
- [x] **AC-8** — whole koni-qc re-graded ≥95 (CONTEXT D19); koni-docs updated + validate green.

## Tasks

- [x] **TASK-5.7.1** — Read the ERP learning note; map findings 1–5 / recommendations A–E to koni-qc changes.
- [x] **TASK-5.7.2** — Author `references/whole-project-qc.md` (§1 QA epic · §2 strategy · §3 locations · §4 execution · §5 DoD · §6 depth bar · Ownership).
- [x] **TASK-5.7.3** — Wire SKILL.md (mode/activation/index/description) + cross-refs in qc-workflow/test-organization/quality-bar.
- [x] **TASK-5.7.4** — koni-docs layer + whole-skill re-grade (D19) + validate.

## References

- [koni-qc whole-project-qc](../../../skills/koni-qc/references/whole-project-qc.md)
- Learning note: `Koni-ERP-02/docs/tests/audits/koni-qc-learning-2026-07-01.md` (ERP LESSONS §213)
- Reference impl: `Senti-Quant/docs/sprints/epics/EPIC-37.md` + `US-37.1…US-37.30`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D23 — whole-project QC: QA-tracking epic + done-bar + depth bar](../../CONTEXT.md) · [D22 — scaffold + enforce the standard](../../CONTEXT.md) · [D19 — whole-skill re-grade](../../CONTEXT.md)
- [CHANGELOG 0.26.0](../../CHANGELOG.md)
