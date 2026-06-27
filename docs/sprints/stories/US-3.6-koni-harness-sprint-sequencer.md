---
id: US-3.6
title: "koni-harness P2.5 — sprint-sequencer (dependency-ready story selection)"
epic: EPIC-3
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.13.0"
prd_ref:
  - FR-24
arch_ref: []
depends_on:
  - US-3.5
assignee: jindo9986
commit: 4689db5
created: 2026-06-27
updated: 2026-06-27
---

## Goal

P2.5 of koni-harness: a portable, read-only `sprint.sh` that answers the
cross-story sprint questions the per-story `loop.sh` can't — **"which story is
ready to start next?"** (`sprint.sh next`, dependency-ready + priority-ordered)
and **"where is the sprint?"** (`sprint.sh status`, counts / points /
blocked-with-reasons). It reads koni-docs story frontmatter
(`status`/`depends_on`/`priority`/`points`/`sprint`) and **never writes** —
koni-docs owns status. `sprint.sh next` → pick a story → `loop.sh start <id>`.

Scope is deliberately a single sprint; the non-portable parallel fan-out from the
original Phase 2.5 sketch was dropped (YAGNI). Readiness is deterministic: a
not-`done` story is ready iff every `depends_on` id resolves to a `done` story
(an unresolvable dep counts as unmet and is reported as blocked).

## Background

Decomposed from the Phase 2.5/3 brainstorm (P3a → P2.5 → P3b). Design + plan:
[spec](../../superpowers/specs/2026-06-27-koni-harness-phase2.5-sprint-sequencer-design.md)
· [plan](../../superpowers/plans/2026-06-27-koni-harness-phase2.5.md). Boundary +
additive invariants per [CONTEXT D13](../../CONTEXT.md).

## Acceptance criteria

- [x] **AC-1** — `scripts/sprint.sh` (POSIX, dependency-free, **read-only**) with
  `next` and `status` subcommands; flags `--sprint` / `--docs` / `--root`; active
  sprint resolved from `CLAUDE.md active_sprint:` when `--sprint` is omitted.
- [x] **AC-2** — `next`: lists not-`done` stories in the sprint whose every
  `depends_on` resolves to a `done` story, ordered by priority (P0→P3, missing
  last) then id; marks the first as `→ start: loop.sh start <id>`. Distinguishes
  **sprint complete** (no not-done stories) from **all remaining blocked**.
- [x] **AC-3** — `status`: counts by status, points done/total, and a blocked
  list naming each not-done story's unmet dependency ids.
- [x] **AC-4** — Frontmatter extraction is deterministic and `set -e`-safe: a
  `grep|head|sed` `field()` pipeline; a `depends_on` awk that stops at the next
  top-level key (handles multi-line lists and inline `[]`); priority rank map.
- [x] **AC-5** — Read-only (writes only stdout; never repo files); space-safe
  story iteration (globs directly, no `$()` word-split). Exit 0 on success incl.
  none-ready / complete; 2 on usage error or unresolvable sprint.
- [x] **AC-6** — `install-gate.sh` additively vendors `sprint.sh` into
  `.koni-harness/` (executable), without disturbing the gate / `loop.sh` /
  `context-load.sh` vendoring; idempotent.
- [x] **AC-7** — `references/sprint-sequencer.md` (what it computes + usage + how
  it fits the loop + limits) + a `SKILL.md` "Pick the next story" pointer.
- [x] **AC-8** — Self-contained POSIX `sprint-test.sh` (13 assertions) green under
  `sh` and `dash`; the other three suites still green (no regression). Combined
  spec + code-quality review APPROVED; the three plan-vs-impl fixes (test arity,
  command-substitution newline loss ×2) verified correct; validated on this repo.

## Tasks

- [x] **TASK-3.6.1** — `sprint.sh next` + test harness (T1).
- [x] **TASK-3.6.2** — `sprint.sh status` + none-ready/complete (T2).
- [x] **TASK-3.6.3** — extend installer to vendor `sprint.sh` (T3).
- [x] **TASK-3.6.4** — `sprint-sequencer.md` + `SKILL.md` pointer (T4).
- [x] **TASK-3.6.5** — combined spec+quality review (APPROVED) + fixes
  (space-safe iteration, complete-vs-blocked wording) + real-repo verify (T5).
- [x] **TASK-3.6.6** — koni-docs backfill + ship (T6).

## References

- [Skill: skills/koni-harness/references/sprint-sequencer.md](../../../skills/koni-harness/references/sprint-sequencer.md)
- [Spec](../../superpowers/specs/2026-06-27-koni-harness-phase2.5-sprint-sequencer-design.md) · [Plan](../../superpowers/plans/2026-06-27-koni-harness-phase2.5.md)
- [US-3.4 — loop-runner](US-3.4-koni-harness-loop-runner.md) · [US-3.5 — context-loader](US-3.5-koni-harness-context-loader.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.13.0 (pending)](../../CHANGELOG.md)
