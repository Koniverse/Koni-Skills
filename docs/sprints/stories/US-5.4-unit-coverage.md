---
id: US-5.4
title: "unit-coverage — per-function unit-test process + Self-verify gate, below the AC↔TC matrix"
epic: EPIC-5
status: done
priority: P1
points: 3
prd_ref:
  - FR-29
arch_ref: []
depends_on:
  - US-5.1
  - US-3.3
assignee: jindo9986
commit: 8332ec6
sprint: sprint-2026-W27
version_shipped: "0.23.0"
created: 2026-06-30
updated: 2026-07-03
---

## Goal

Close the gap that the harness had **no explicit per-function unit-test process
or gate** — only a TDD *discipline* line in Execute and a "tests green" Self-verify.
koni-qc gains the **unit-coverage standard** (the per-function rule + the coverage
bar, the layer *below* the AC↔TC matrix); koni-harness **drives** it (per-function
TDD in Execute) and **gates** it (Self-verify: new logic has unit tests + meets the
bar). Chosen granularity: **both** — Execute drives, koni-qc gates (CONTEXT D20).

## Background

koni-qc's AC↔TC matrix proves each *user story's* behaviour (functional / e2e /
integration / smoke); nothing proved each *function* in isolation. The
`*.unit.test.ts` TYPE existed but was "Dev owns; QA skips" — no standard, no gate.
This story adds the unit layer without disturbing the US-level layer.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-qc/references/unit-coverage.md`: the two-layer model
  (unit vs AC↔TC), the **per-function rule** (happy + each branch + boundary + error
  path), the RED→GREEN→REFACTOR cycle, the **unit-coverage gate** (new/changed logic
  has unit tests; ≥80% line-and-branch on changed code default), and the exemptions.
- [x] **AC-2** — koni-qc `SKILL.md` (activation + reference-index + description
  trigger) and `test-organization.md` (the `*.unit.test.ts` row → "Dev authors;
  koni-qc gates unit coverage") expose it; boundary intact (koni-qc defines the
  standard + gate; Dev authors; the repo's runner executes).
- [x] **AC-3** — koni-harness wires it: **Execute** does per-function TDD
  (`agentic-loop-standard.md` §Execute note + `loop-runner.md` execute row +
  `example-loop.md`); **Self-verify** is a real gate (stage-table entry gate +
  `loop-runner.md` self-verify row + `example-loop.md`) — "build green" alone no
  longer passes.
- [x] **AC-4** — `gate-catalog.md` documents a **unit-coverage `passthrough`** row
  (repo coverage command with a threshold, warn→block) as the deterministic backing.
- [x] **AC-5** — Both koni-qc and koni-harness **re-graded whole** to ≥95 after the
  change (per CONTEXT D19); koni-docs updated (VERSION/CHANGELOG/PRD/EPIC-5) + validate green.

## Tasks

- [x] **TASK-5.4.1** — Author `references/unit-coverage.md`.
- [x] **TASK-5.4.2** — Wire koni-qc SKILL.md + test-organization row.
- [x] **TASK-5.4.3** — Wire koni-harness Execute + Self-verify + gate-catalog + example.
- [x] **TASK-5.4.4** — koni-docs layer + whole-skill re-grade (D19) + validate.

## References

- [koni-qc unit-coverage](../../../skills/koni-qc/references/unit-coverage.md)
- [koni-harness loop-runner](../../../skills/koni-harness/references/loop-runner.md) · [agentic-loop-standard](../../../skills/koni-harness/references/agentic-loop-standard.md)

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D20 — unit-coverage layer + gate](../../CONTEXT.md) · [D19 — ≥95 re-grade rule](../../CONTEXT.md)
- [CHANGELOG 0.23.0](../../CHANGELOG.md)
