---
id: US-3.5
title: "koni-harness P3a — context-loader (session digest of the context layers)"
epic: EPIC-3
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.12.0"
prd_ref:
  - FR-23
arch_ref: []
depends_on:
  - US-3.4
assignee: jindo9986
commit: pending
created: 2026-06-27
updated: 2026-06-27
---

## Goal

P3a of koni-harness: a portable `context-load.sh` that emits a **concise session
digest** of the project's context layers to stdout, automating the load order the
Standard documents (`AGENTS.md → CLAUDE.md → LESSONS.md → CONTEXT.md →
.active-context.md`). An agent (or any tool) starting a session learns "where the
project is" without opening five files and skimming hundreds of lines.

It is a **digest, not a dump**: the live `.active-context.md` snapshot verbatim,
plus VERSION + active_sprint, plus the *titles* (not bodies) of the decision and
lesson indexes, plus pointers to the canonical files. The big bodies are
referenced, never inlined. Extraction is deterministic (grep/sed), not
LLM-summarized. P3a only *produces* the digest; wiring it into a tool's session
start is P3b.

## Background

Decomposed from the original Phase 3 (brainstorm): P3a (this) → P2.5
(sprint-sequencer) → P3b (multi-tool adapters); the non-portable parallel
fan-out was dropped (YAGNI). Design + plan:
[spec](../../superpowers/specs/2026-06-27-koni-harness-phase3a-context-loader-design.md)
· [plan](../../superpowers/plans/2026-06-27-koni-harness-phase3a.md). Boundary +
additive invariants per [CONTEXT D13](../../CONTEXT.md).

## Acceptance criteria

- [x] **AC-1** — `scripts/context-load.sh` (POSIX, dependency-free, **read-only**)
  emits a Markdown digest to stdout with five sections in the Standard's layer
  order: header (VERSION + `active_sprint` parsed from the CLAUDE.md koni-docs
  block, trailing comment stripped); **Live state** (the `.active-context.md`
  `koni-docs:auto-update` block verbatim, markers stripped); **Decisions**
  (`### D<n>.` titles); **Lessons** (`## <n>.` titles); **Canonical references**.
- [x] **AC-2** — CLI `context-load.sh [--root <dir>] [--docs <dir>]`; root
  defaults to `git rev-parse --show-toplevel` else cwd; docs defaults to
  `<root>/docs`. Exit 0 on a readable repo, 2 on a usage error.
- [x] **AC-3** — **Graceful degradation**: any missing layer prints a
  `_(... not found)_` note and the script still emits the rest (never crashes).
  A fresh clone without the gitignored `.active-context.md` falls back to the
  CLAUDE.md Pattern-A block, else a `_(no active-context snapshot)_` note.
- [x] **AC-4** — Digest-not-dump: bodies are referenced via pointers, never
  inlined; marker lines never leak into the output.
- [x] **AC-5** — `install-gate.sh` additively vendors `context-load.sh` into
  `.koni-harness/` (executable), without disturbing the gate / `loop.sh`
  vendoring or hook chaining; idempotent.
- [x] **AC-6** — `references/context-load.md` (what it emits + usage + graceful
  degradation + P3b wiring note) + a `SKILL.md` "Load session context" pointer.
- [x] **AC-7** — Self-contained POSIX `context-test.sh` (15 assertions) green
  under `sh` and `dash`; `loop-test.sh` (31) + `gate-test.sh` (34) still green
  (no regression). Code review APPROVED (read-only invariant, POSIX correctness,
  set-e grep guards, marker-strip all verified); digest validated against this
  repo.

## Tasks

- [x] **TASK-3.5.1** — `context-load.sh` + test harness (full-repo digest) (T1).
- [x] **TASK-3.5.2** — fallback + missing-layer graceful tests (T2).
- [x] **TASK-3.5.3** — extend installer to vendor `context-load.sh` (T3).
- [x] **TASK-3.5.4** — `context-load.md` + `SKILL.md` pointer (T4).
- [x] **TASK-3.5.5** — combined spec+quality review (APPROVED) + real-repo verify (T5).
- [x] **TASK-3.5.6** — koni-docs backfill + ship (T6).

## References

- [Skill: skills/koni-harness/references/context-load.md](../../../skills/koni-harness/references/context-load.md)
- [Spec](../../superpowers/specs/2026-06-27-koni-harness-phase3a-context-loader-design.md) · [Plan](../../superpowers/plans/2026-06-27-koni-harness-phase3a.md)
- [US-3.4 — koni-harness Phase 2 (loop-runner)](US-3.4-koni-harness-loop-runner.md)
- [The Standard — Context layers and load order](../../../skills/koni-harness/references/agentic-loop-standard.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.12.0 (pending)](../../CHANGELOG.md)
