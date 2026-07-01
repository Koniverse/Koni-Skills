---
id: US-3.8
title: "koni-harness parallel orchestration — multi-agent sprint swarm + within-story fan-out"
epic: EPIC-3
status: done
priority: P1
prd_ref:
  - FR-33
arch_ref: []
depends_on:
  - US-3.3
assignee: jindo9986
commit: da0e546
sprint: sprint-2026-W26
version_shipped: "0.27.0"
created: 2026-07-01
updated: 2026-07-01
---

## Goal

koni-harness drove work **single-agent**: `loop.sh` runs one story through the six
stages and `sprint.sh` (read-only) only *suggests* the next dependency-ready story — the
agent then runs them one at a time. This story adds a **multi-agent execution mode** so a
whole wave of dependency-ready stories runs **in parallel** (one worker per story, each
in its own git worktree), plus within-story fan-out of a stage's independent sub-tasks —
without changing the six stages or the gates.

## Background

Observed on real use: the harness is single-agent/sequential even when the sprint has
several independent, dependency-ready stories that could run at once. `sprint.sh` already
computes the ready set over the `depends_on` DAG, and `loop.sh` already takes `--state
PATH` (so N concurrent loops can carry zero shared state) — the missing piece was an
orchestration layer that turns the ready set into a parallel dispatch and defines how the
parallel workers stay isolated and integrate. Two design choices were confirmed with the
user: parallelize at **both** tiers (sprint swarm + within-story fan-out), and isolate
with **one git worktree per story** (matches Claude's native `isolation:'worktree'` and
the harness's additive-only invariant). CONTEXT D24.

## Acceptance criteria

- [x] **AC-1** — `scripts/swarm.sh`: a **read-only** wave planner. `plan` emits the
  current wave (dependency-ready set, priority-ordered, capped by `--cap`, default 4) as
  one worker block per story — `git worktree add` + `loop.sh start <id> --state
  <wt>/.koni-harness/loop-state` — followed by the integrate + re-plan step; `status`
  delegates to `sprint.sh status`. It **never** spawns an agent, adds a worktree, or
  writes state.
- [x] **AC-2** — readiness is **single-sourced from `sprint.sh`** (swarm.sh parses its
  ready list; it does not re-derive the DAG). Blocked stories are excluded; P0 orders
  before P1; `--cap` holds the overflow to the next wave; complete/all-blocked messages
  pass through unchanged.
- [x] **AC-3** — `references/parallel-orchestration.md`: the two-tier standard (Tier A
  sprint swarm wave-by-wave; Tier B within-story fan-out of a stage's independent
  sub-tasks — read-only Review passes, per-function TDD on disjoint files, skill-grading
  dimensions), the **isolation + integration contract** (worktree per story; gate per
  worktree + again at integration; human owns the final merge), orchestrator/worker
  roles, and the portable fallback (tools without parallel agents run the same plan
  sequentially).
- [x] **AC-4** — no stage/gate change: the six stages + gates are unchanged; parallelism
  is orchestration around the loop. `install-gate.sh` vendors `swarm.sh` and gitignores
  `.koni-harness/worktrees/`; SKILL.md + agentic-loop-standard + loop-runner +
  sprint-sequencer + adapters are cross-wired.
- [x] **AC-5** — `scripts/__tests__/swarm-test.sh` (20 deterministic assertions) green;
  the full harness test suite still green. Whole koni-harness re-graded ≥95 (CONTEXT D19).

## Tasks

- [x] **TASK-3.8.1** — `swarm.sh` wave planner over `sprint.sh` (plan/status, `--cap`, worktree + worker-command emission, integrate/re-plan step).
- [x] **TASK-3.8.2** — `parallel-orchestration.md` (two tiers, isolation+integration contract, roles, fallback, ownership).
- [x] **TASK-3.8.3** — Wire SKILL.md / agentic-loop-standard / loop-runner / sprint-sequencer / adapters; `install-gate.sh` vendors swarm.sh + gitignores worktrees.
- [x] **TASK-3.8.4** — `swarm-test.sh` + koni-docs layer + whole-skill re-grade (D19).

## Implementation notes

`swarm.sh` is deliberately a *planner*, not a driver — it keeps the harness's tool-neutral
core / thin-adapter contract: the plan is POSIX and identical everywhere; only *spawning*
(Claude Agent `isolation:'worktree'` / Workflow) is per-tool. It reuses `sprint.sh`'s
readiness output rather than duplicating the DAG logic. Testing caught a real `set -e`
bug: `do_plan`'s trailing `[ test ] && echo` returned non-zero when no stories were held
over, aborting callers under `set -e` — fixed with an explicit `return 0`.

## Files modified

- Create: `skills/koni-harness/scripts/swarm.sh`, `skills/koni-harness/references/parallel-orchestration.md`, `skills/koni-harness/scripts/__tests__/swarm-test.sh`
- Modify: `skills/koni-harness/SKILL.md`, `skills/koni-harness/scripts/install-gate.sh`, `skills/koni-harness/references/{agentic-loop-standard,loop-runner,sprint-sequencer,adapters}.md`

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CONTEXT D24 — multi-agent orchestration (swarm + fan-out, worktree isolation)](../../CONTEXT.md) · [D14 — harness consolidation](../../CONTEXT.md)
- [CHANGELOG 0.27.0](../../CHANGELOG.md)
