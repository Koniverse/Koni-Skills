---
id: US-3.4
title: "koni-harness Phase 2 — single-story loop-runner (loop.sh spine + loop-runner brain)"
epic: EPIC-3
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.11.0"
prd_ref:
  - FR-22
arch_ref: []
depends_on:
  - US-3.3
assignee: jindo9986
commit: pending
created: 2026-06-27
updated: 2026-06-27
---

## Goal

Phase 2 of koni-harness: a **tier-aware, single-story loop-runner** that drives
one story through the six-stage Koni Agentic Loop. It adds a thin POSIX
`loop.sh` state helper — the deterministic, tool-neutral *spine* of the loop —
plus an instruction *brain* (`references/loop-runner.md`) telling the agent how
to drive each stage. Claude-first via Task/subagents, with a portable manual
fallback for Gemini/Codex (which call the same `loop.sh`). The Phase-1 gate is
the commit-stage backbone.

This codifies the exact flow this project ran by hand (frame → execute →
self-verify → review → doc+version gate → commit) into a repeatable, resumable
orchestration that honors the right-sizing tiers (v0.10.1): process stages scale
to risk × size; the gate runs at every tier.

## Background

Builds on US-3.3 (Phase 1: the Standard + the gate). Design + plan:
[spec](../../superpowers/specs/2026-06-27-koni-harness-phase2-loop-runner-design.md)
· [plan](../../superpowers/plans/2026-06-27-koni-harness-phase2.md). The
compose-and-delegate boundary and additive invariant are governed by
[CONTEXT D13](../../CONTEXT.md). Scope is deliberately **single story** —
multi-story fan-out / DAG is deferred (spec §9 roadmap). `loop.sh` never executes
a stage (it can't spawn subagents portably); it tracks state and invokes the
gate, while stage work stays agent-driven.

## Acceptance criteria

- [x] **AC-1** — `scripts/loop.sh` (POSIX, dependency-free) with five
  subcommands: `start <id> [--tier N]`, `status`, `enter <stage>`,
  `gate <phase>`, `complete`, plus a global `--state <path>` override. State in
  `.koni-harness/loop-state` as line `key=value`
  (`story`/`tier`/`stage`/`entered`/`gate_<phase>`/`updated`).
- [x] **AC-2** — Canonical stage order `frame execute self-verify review
  doc-gate commit`. `enter` warns (stderr, exit 0) on a strictly-backward move
  and on entering `commit` at tier ≥ 1 without `self-verify`; forward skips are
  silent (tier 0 legitimately skips). `complete` is **terminal** — a later
  `enter` warns and does not clobber the finished state.
- [x] **AC-3** — `gate <phase>` shells to the Phase-1 `gate-runner.sh`
  (`$SELF_DIR` then `.koni-harness/` fallback), records `gate_<phase>=pass|block`,
  and passes the runner's exit code through.
- [x] **AC-4** — `status` reports story/tier/stage/entered + a derived `next:`
  hint (next stage; at `commit` → gate hint; at `complete` → done).
- [x] **AC-5** — `install-gate.sh` extended **additively**: vendors `loop.sh`
  into `.koni-harness/` and adds `.koni-harness/loop-state` to the consumer
  `.gitignore` behind a marker block (idempotent; newline-safe; never clobbers
  existing `.gitignore` content). Phase-1 installer behavior unchanged.
- [x] **AC-6** — `references/loop-runner.md` brain: six-stage drive table (exact
  `loop.sh` calls), tier-awareness, portable fallback, resumability, command
  reference. `SKILL.md` gains a "Run a story through the loop" section + pointer.
- [x] **AC-7** — Self-contained POSIX `loop-test.sh` (31 assertions) green under
  `sh` and `dash`; Phase-1 `gate-test.sh` still green (no regression);
  author-blind sandbox drive of a tier-1 story VERIFIED.
- [x] **AC-8** — `loop.sh` is dependency-free and portable: `kv_set` is
  delimiter-safe (no sed-metacharacter hazard), `--tier` is validated, the gate
  passthrough preserves the real exit code (`rc=$?` first).

## Tasks

- [x] **TASK-3.4.1** — `loop.sh` core: `start` + `status` + test harness (T1).
- [x] **TASK-3.4.2** — `enter` ordered transitions + warnings (T2).
- [x] **TASK-3.4.3** — `gate` passthrough + `complete` (T3).
- [x] **TASK-3.4.4** — Extend installer: vendor `loop.sh` + gitignore loop-state (T4).
- [x] **TASK-3.4.5** — `loop-runner.md` brain + `SKILL.md` section (T5–T6).
- [x] **TASK-3.4.6** — Two-stage review + fixes (gitignore newline, delimiter-safe
  `kv_set`, `--tier` validation, terminal `complete`) + author-blind verify (T7).
- [x] **TASK-3.4.7** — koni-docs backfill + ship (T8).

## References

- [Skill: skills/koni-harness/references/loop-runner.md](../../../skills/koni-harness/references/loop-runner.md)
- [Spec](../../superpowers/specs/2026-06-27-koni-harness-phase2-loop-runner-design.md) · [Plan](../../superpowers/plans/2026-06-27-koni-harness-phase2.md)
- [US-3.3 — koni-harness Phase 1](US-3.3-koni-harness-agentic-loop.md)
- [The Standard — Right-sizing the loop](../../../skills/koni-harness/references/agentic-loop-standard.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.11.0 (pending)](../../CHANGELOG.md)
