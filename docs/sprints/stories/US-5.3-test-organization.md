---
id: US-5.3
title: "test-organization — standard docs/tests taxonomy + scaffolding, synthesized from Senti-Quant"
epic: EPIC-5
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.19.0"
prd_ref:
  - FR-28
arch_ref: []
depends_on:
  - US-5.1
assignee: jindo9986
commit: 30111fa
created: 2026-06-30
updated: 2026-06-30
---

## Goal

Codify the matured test-doc/test-code organization (cleaned up in Senti-Quant on
2026-06-30) as a **koni-qc standard**, and wire it into setup so every Koniverse
repo gets the right test folders. koni-qc owns the *standard*; koni-setup
*scaffolds* the tree at bootstrap; koni-qc *self-scaffolds* the tree when a repo
doesn't use koni-setup.

Compose-first (CONTEXT [D12](../../CONTEXT.md)/[D13](../../CONTEXT.md)): the
standard is methodology (koni-qc); the folder skeleton is koni-setup's; the doc
bodies are koni-docs templates. None is reproduced in another.

## Background

Source: the Senti-Quant `docs/tests/` reorg — `test-organization.md` (the QA
compass: by-epic + file-suffix layout, the 3-place sync rule, state-cleanup, the
status legend) + the `TEST-STRUCTURE-PROPOSAL-2026-06-30` audit. Two decisions
were taken before building (recorded in CONTEXT D16): **(a)** keep koni-qc's
existing **TYPE-based** TC-ID (`TC-<EPIC>.<TYPE>-<n>`) — the file suffix carries
run *cadence*, orthogonal to the TC TYPE — rather than Senti-Quant's GROUP-based
codes; **(b)** koni-setup scaffolds when used, koni-qc self-scaffolds otherwise.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-qc/references/test-organization.md`: the standard —
  the `docs/tests/` taxonomy (test-plan / test-cases / test-reports/EPIC-NN/<MMDDYYYY>/
  with report.md+img / report-manual.md+img-manual / bug-bash / audits + standing
  docs), the by-epic + file-suffix test-code layout, the 3-place sync rule,
  state-cleanup/idempotency, the status legend, and the scaffolding rule.
- [x] **AC-2** — TC-ID stays **TYPE-based** (no change to `traceability.md`); the
  standard states the suffix=cadence vs TYPE=category distinction explicitly so
  the two coexist without contradiction.
- [x] **AC-3** — koni-qc `SKILL.md` exposes it: a "Set up / standardize test docs"
  mode, an activation row, a reference-index row, and a koni-setup delegate row.
- [x] **AC-4** — koni-setup `scaffold-checklist.md` creates the new `docs/tests/`
  tree (test-plan / test-cases / bug-bash / audits + README / test-organization.md /
  findings.md stubs; test-reports created on first run) and points at the koni-qc
  standard; koni-qc self-scaffolds the same tree when koni-setup isn't used.
- [x] **AC-5** — koni-docs updated: VERSION 0.19.0, CHANGELOG [0.19.0], PRD FR-28 +
  EPIC-5 row, this story; `validate` green.

## Tasks

- [x] **TASK-5.3.1** — Survey the Senti-Quant reorg; lock the two decisions (CONTEXT D16).
- [x] **TASK-5.3.2** — Author `references/test-organization.md`.
- [x] **TASK-5.3.3** — Wire koni-qc SKILL.md (mode / activation / index / delegate).
- [x] **TASK-5.3.4** — Update koni-setup scaffold to the new tree.
- [x] **TASK-5.3.5** — koni-docs layer + author-blind review + validate.

## References

- [koni-qc test-organization](../../../skills/koni-qc/references/test-organization.md)
- [koni-setup scaffold-checklist](../../../skills/koni-setup/references/scaffold-checklist.md)
- Source: Senti-Quant `docs/tests/test-organization.md` + `audits/TEST-STRUCTURE-PROPOSAL-2026-06-30.md`

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D16 — test-org standard + ownership split](../../CONTEXT.md)
- [CHANGELOG 0.19.0](../../CHANGELOG.md)
