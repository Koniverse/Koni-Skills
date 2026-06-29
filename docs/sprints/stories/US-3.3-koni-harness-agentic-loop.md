---
id: US-3.3
title: "koni-harness — portable agentic-loop harness (gate + loop-runner + context-loader + sprint-sequencer + session-adapters)"
epic: EPIC-3
status: done
priority: P1
points: 16
sprint: sprint-2026-W26
version_shipped: "0.14.0"
prd_ref:
  - FR-21
  - FR-22
  - FR-23
  - FR-24
  - FR-25
arch_ref: []
depends_on:
  - US-3.2
assignee: jindo9986
commit: 2ff5ad5
created: 2026-06-27
updated: 2026-06-28
---

## Goal

Ship `skills/koni-harness/` — the second non-docs Koniverse skill and the
**connective tissue** of the agentic loop. It composes the existing Koni
toolchain (BMAD plan → Superpowers execute → gstack review → koni-docs doc/
version gate) into one portable, standardized loop, adding the deterministic
verification + orchestration the toolchain lacked. Claude-Code-first with a
tool-neutral POSIX core portable to Gemini / Codex / Cursor; **additive-only**
adoption (vendored `.koni-harness/`, never clobbers existing hooks/settings).

This is **one story shipped in five incremental phases** (a single skill, built
phase-by-phase — tracked as one story rather than five to avoid story sprawl;
see [CONTEXT D14](../../CONTEXT.md)). Each phase shipped its own version:

| Phase | What | Version | Commit |
|---|---|---|---|
| **P1** — gate + standard | Koni Agentic Loop standard + portable POSIX pre-commit/pre-push gate (`gate-runner.sh` + line-format `gates.conf` + 6 checks) | v0.10.0 | `09e3839` |
| **P2** — loop-runner | Tier-aware single-story `loop.sh` (start/status/enter/gate/complete) + `loop-runner.md` brain | v0.11.0 | `0685f42` |
| **P3a** — context-loader | `context-load.sh` — read-only session digest of the context layers | v0.12.0 | `5dc2b76` |
| **P2.5** — sprint-sequencer | `sprint.sh next/status` — dependency-ready story selection over koni-docs frontmatter | v0.13.0 | `4689db5` |
| **P3b** — session-adapters | `session-start.sh` briefing + `session-adapters.md` per-tool wiring | v0.14.0 | `2ff5ad5` |

A v0.10.1 patch added the "Right-sizing the loop" tier model to the standard.

## Background

Reverse-engineered from auditing three live repos (`Koni-ERP-02`, `Senti-Quant`,
`koni-devops`), each of which re-invented harness machinery ad-hoc. Design + plan
artifacts (one set per phase) live under `docs/superpowers/`:
[P1 spec](../../superpowers/specs/2026-06-27-koni-harness-agentic-loop-design.md) ·
[P2 spec](../../superpowers/specs/2026-06-27-koni-harness-phase2-loop-runner-design.md) ·
[P3a spec](../../superpowers/specs/2026-06-27-koni-harness-phase3a-context-loader-design.md) ·
[P2.5 spec](../../superpowers/specs/2026-06-27-koni-harness-phase2.5-sprint-sequencer-design.md) ·
[P3b spec](../../superpowers/specs/2026-06-28-koni-harness-phase3b-session-adapters-design.md).
The compose-and-delegate boundary + additive invariant are governed by
[CONTEXT D13](../../CONTEXT.md).

## Acceptance criteria

### P1 — gate + standard (v0.10.0)
- [x] **AC-1** — Tool-neutral Standard (`references/agentic-loop-standard.md`):
  six loop stages + entry gates, context-layer load order, portability contract,
  harness-engineering principles (+ the v0.10.1 "Right-sizing the loop" tiers).
- [x] **AC-2** — `gate-runner.sh` (POSIX, dependency-free): `--phase`
  (work-commit/release-commit/pre-push) + `--config` + `--dry-run`; line-format
  `gates.conf`; `block`/`warn` severity; ASCII output.
- [x] **AC-3** — Six checks judging the staged state: version-phase,
  changelog-anchor, credential-scan, koni-docs-validate, story-status, passthrough.
- [x] **AC-4** — `install-gate.sh` additive: vendors runner+checks into
  `.koni-harness/`, chains git hooks behind marker blocks (preserves existing,
  idempotent, skips a non-sh hook), worktree-safe.

### P2 — loop-runner (v0.11.0)
- [x] **AC-5** — `loop.sh` (POSIX) `start`/`status`/`enter`/`gate`/`complete` +
  `--state`; gitignored `.koni-harness/loop-state`; warns on backward / commit-
  without-self-verify (tier ≥ 1); `complete` is terminal; `gate` passes the
  Phase-1 runner's exit code through.
- [x] **AC-6** — `loop-runner.md` brain: tier-aware six-stage drive, Claude-first
  + portable fallback, resumability.

### P3a — context-loader (v0.12.0)
- [x] **AC-7** — `context-load.sh` (POSIX, read-only): a concise session digest
  (verbatim `.active-context` snapshot + VERSION/active_sprint + decision/lesson
  title indexes + canonical pointers); digest-not-dump; graceful on missing layers.

### P2.5 — sprint-sequencer (v0.13.0)
- [x] **AC-8** — `sprint.sh next/status` (POSIX, read-only) over koni-docs story
  frontmatter: `next` = dependency-ready selection ordered by priority
  (complete-vs-blocked), `status` = counts/points/blocked-with-reasons.

### P3b — session-adapters (v0.14.0)
- [x] **AC-9** — `session-start.sh` briefing (composes the digest + `sprint.sh
  next`, space-safe flag forwarding) + `session-adapters.md` per-tool wiring
  (Claude `SessionStart` hook as a manual-merge JSON snippet; Gemini/Codex/Cursor
  equivalents).

### Cross-phase
- [x] **AC-10** — Every script POSIX + dependency-free, green under `sh` and
  `dash`; five self-contained test suites (gate 34 / loop 31 / context 15 /
  sprint 18 / session 12 = 110+ assertions). Each phase passed a two-stage
  review (spec + code-quality) + author-blind sandbox verification.
- [x] **AC-11** — Additive-only throughout; composes BMAD/Superpowers/gstack/
  koni-docs and never reproduces them; wired into this repo at
  `.claude/skills/koni-harness` + `.agents/skills/koni-harness`.

## Tasks

- [x] **TASK-3.3.P1** — gate + standard (spec → plan → build → review → ship v0.10.0).
- [x] **TASK-3.3.P2** — loop-runner (… ship v0.11.0).
- [x] **TASK-3.3.P3a** — context-loader (… ship v0.12.0).
- [x] **TASK-3.3.P2.5** — sprint-sequencer (… ship v0.13.0).
- [x] **TASK-3.3.P3b** — session-adapters (… ship v0.14.0).

## References

- [Skill: skills/koni-harness/SKILL.md](../../../skills/koni-harness/SKILL.md)
- Specs + plans (per phase) under [docs/superpowers/](../../superpowers/)
- [US-3.2 — koni-setup](US-3.2-koni-setup-bootstrapper.md) (depends on)
- [CONTEXT D13 — compose + delegate](../../CONTEXT.md) · [D14 — phase-work = one story](../../CONTEXT.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.10.0–v0.14.0](../../CHANGELOG.md) — per-phase release history
