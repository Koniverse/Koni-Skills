---
id: US-3.7
title: "koni-harness P3b — multi-tool session adapters (briefing + per-tool wiring)"
epic: EPIC-3
status: done
priority: P1
points: 2
sprint: sprint-2026-W26
version_shipped: "0.14.0"
prd_ref:
  - FR-25
arch_ref: []
depends_on:
  - US-3.5
  - US-3.6
assignee: jindo9986
commit: 2ff5ad5
created: 2026-06-28
updated: 2026-06-28
---

## Goal

P3b — the final koni-harness roadmap piece: the **session-adapter** layer. A
portable `session-start.sh` "briefing" composes the P3a context digest with the
P2.5 `sprint.sh next` suggestion into one command, and `references/session-adapters.md`
documents how to wire it into each tool's session start. The portability contract
is realized end-to-end: one portable briefing script, and each tool's adapter is
a thin one-liner that calls it (Claude Code via a `SessionStart` hook; Gemini /
Codex / Cursor via their equivalent or a manual one-liner).

`settings.json` is **never auto-edited** — the Claude hook is a documented
manual-merge JSON snippet (a non-destructive JSON merge would need `jq`, breaking
the zero-dependency rule). `session-start.sh` is read-only (stdout only).

## Background

Last of the P3a → P2.5 → P3b decomposition. Design + plan:
[spec](../../superpowers/specs/2026-06-28-koni-harness-phase3b-session-adapters-design.md)
· [plan](../../superpowers/plans/2026-06-28-koni-harness-phase3b.md). Boundary +
additive invariants per [CONTEXT D13](../../CONTEXT.md). Building P3b's test
fixtures surfaced and fixed a latent correctness bug in the P2.5 `sprint.sh`
`deps_of()` parser (see AC-5).

## Acceptance criteria

- [x] **AC-1** — `scripts/session-start.sh` (POSIX, dependency-free, **read-only**)
  prints the P3a digest followed by a `## Next` section from `sprint.sh next`,
  resolving both sub-scripts from `$SELF_DIR` then `.koni-harness/`; graceful
  `_(... not found)_` note per missing sub-script; exit 0, or 2 on usage error.
- [x] **AC-2** — Flags `--root` / `--docs` forwarded to both sub-scripts and
  `--sprint` to `sprint.sh` only, via **space-safe** positional pass-through
  (`set --` + quoted `"$@"`) — works under repo paths containing spaces.
- [x] **AC-3** — `references/session-adapters.md`: what the briefing contains;
  Claude Code `SessionStart` hook as a **valid, manual-merge** `settings.json`
  JSON snippet; Gemini / Codex / Cursor equivalents / manual one-liner;
  composition note. `SKILL.md` "Brief a new session" pointer + reference row.
- [x] **AC-4** — `install-gate.sh` additively vendors `session-start.sh` into
  `.koni-harness/` (executable), without disturbing the gate / loop / context /
  sprint vendoring; idempotent.
- [x] **AC-5** — Fixed a latent `sprint.sh` `deps_of()` bug found via P3b
  fixtures: a story with inline `depends_on: []`, or a multiline list terminated
  directly by the closing `---`, no longer emits a phantom `--` dependency (the
  awk now enters collection only on an empty `depends_on:` value and ends the
  block on YAML doc markers `---` / `...`).
- [x] **AC-6** — Self-contained POSIX `session-test.sh` (12 assertions incl. a
  space-path fixture) green under `sh` and `dash`; the other four suites still
  green (sprint now 18 incl. the two new `deps_of` cases); combined spec +
  code-quality review APPROVED after the two blocking fixes (space-safe
  forwarding, `deps_of`); briefing validated against this repo + the Claude JSON
  snippet parses.

## Tasks

- [x] **TASK-3.7.1** — `session-start.sh` briefing + test harness (T1).
- [x] **TASK-3.7.2** — extend installer to vendor `session-start.sh` (T2).
- [x] **TASK-3.7.3** — `session-adapters.md` + `SKILL.md` pointer (T3).
- [x] **TASK-3.7.4** — combined review (APPROVED) + blocking fixes (space-safe
  forwarding; `sprint.sh deps_of` phantom-`--`) + real-repo verify (T4).
- [x] **TASK-3.7.5** — koni-docs backfill + ship (T5).

## References

- [Skill: skills/koni-harness/references/session-adapters.md](../../../skills/koni-harness/references/session-adapters.md)
- [Spec](../../superpowers/specs/2026-06-28-koni-harness-phase3b-session-adapters-design.md) · [Plan](../../superpowers/plans/2026-06-28-koni-harness-phase3b.md)
- [US-3.5 — context-loader](US-3.5-koni-harness-context-loader.md) · [US-3.6 — sprint-sequencer](US-3.6-koni-harness-sprint-sequencer.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.14.0 (pending)](../../CHANGELOG.md)
