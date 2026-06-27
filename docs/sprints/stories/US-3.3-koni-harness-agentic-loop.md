---
id: US-3.3
title: "koni-harness — Koni Agentic Loop standard + portable pre-commit gate (Phase 1)"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W26
version_shipped: "0.10.0"
prd_ref:
  - FR-21
arch_ref: []
depends_on:
  - US-3.2
assignee: jindo9986
commit: 09e3839
created: 2026-06-27
updated: 2026-06-27
---

## Goal

Ship `skills/koni-harness/` (Phase 1) — the second non-docs Koniverse skill and
the **connective tissue** of the agentic loop. It does two things: (1) defines
the tool-neutral **"Koni Agentic Loop" standard** (the six loop stages, the
gates between them, the context layers, and the portability contract), and (2)
ships a **portable, dependency-free POSIX pre-commit gate** that deterministically
catches agent mistakes — bad version bumps, missing changelog, leaked secrets,
broken doc refs, done-stories with unchecked AC — before they land.

The skill is **hybrid**: it *composes* the existing Koni toolchain (BMAD plan →
Superpowers execute → gstack review → koni-docs doc/version gate) without
reinventing any of it, and adds one new primitive (the gate). It runs
Claude-Code-first but its core is tool-neutral, so Gemini / Codex / Cursor can
adopt the same loop. Its hard invariant is **additive-only**: adopting it never
overwrites existing hooks, settings, configs, or docs — it chains, wraps, and
merges behind reversible marker blocks.

## Background

Audit of three live repos (`Koni-ERP-02`, `Senti-Quant`, `koni-devops`) showed
each re-invents harness machinery ad-hoc: Senti-Quant has a 2-phase versioning
pre-commit hook + MCP fleet + LESSONS/CONTEXT; Koni-ERP-02 has a single
gstack-enforcement `PreToolUse` hook; koni-devops has none. The gate generalizes
the best of these (notably Senti-Quant's 2-phase versioning + credential
discipline) into one portable, installable primitive.

Design + plan: [spec](../../superpowers/specs/2026-06-27-koni-harness-agentic-loop-design.md)
· [plan](../../superpowers/plans/2026-06-27-koni-harness-phase1.md). Decision
boundary logged as [CONTEXT D13](../../CONTEXT.md). This is Phase 1 of a 3-phase
roadmap (Phase 2: loop orchestrator; Phase 3: context-loader + multi-tool
adapters + DAG).

## Acceptance criteria

- [x] **AC-1** — `skills/koni-harness/scripts/gate-runner.sh`: POSIX engine with
  `--phase {work-commit|release-commit|pre-push}`, `--config`, `--dry-run`;
  line-format `gates.conf` (no YAML/`yq` dependency, tolerates a missing trailing
  newline); phase filtering + `block`/`warn` severity (block → non-zero exit,
  warn → never blocks); ASCII `PASS:/BLOCK:/WARN:` output.
- [x] **AC-2** — Six built-in checks, each < 40 lines, judging the **staged**
  state: `version-phase` (2-phase versioning, fixed-string version match),
  `changelog-anchor`, `credential-scan` (PEM/AWS/quoted-secret in added lines,
  honors `.koni-harness/secret-allow`), `koni-docs-validate` (skip-pass when
  koni-docs unresolvable, never network-installs), `story-status-consistency`
  (POSIX-safe pattern, no `\b`), `passthrough`.
- [x] **AC-3** — `install-gate.sh` is **non-destructive**: vendors runner+checks
  into `.koni-harness/`; chains git `pre-commit`/`pre-push` behind
  `# >>> koni-harness >>>` marker blocks preserving any existing hook; idempotent
  (no duplicate markers on re-run); **skips a non-POSIX-shell existing hook** with
  a manual-chain warning rather than corrupting it; never overwrites an existing
  `gates.conf`; worktree/submodule-safe (`git rev-parse --git-path hooks`).
- [x] **AC-4** — The tool-neutral Standard
  (`references/agentic-loop-standard.md`): six stages + entry gates, context-layer
  load order, portability contract, harness-engineering principles.
- [x] **AC-5** — Reference trio: `gate-catalog.md` (per-check + config grammar +
  how the release-commit phase is invoked), `adapters.md` (git / Claude Code
  settings.json merge / Gemini-Codex one-liner — same runner), `adoption.md`
  (non-destructive adopt checklist).
- [x] **AC-6** — `SKILL.md` orchestrator: owns-vs-delegates boundary (delegates
  doc bodies → koni-docs, scaffold → koni-setup, plan → BMAD, execute →
  Superpowers, review → gstack), install/verify instructions, additive invariant,
  reference table. Never reproduces a sibling skill's content.
- [x] **AC-7** — Self-contained POSIX test harness (`__tests__/gate-test.sh`,
  34 discriminating assertions) green; two author-blind sandbox verifications
  (bootstrap: 4 gate scenarios + dry-run; adopt: A–E non-destructive guarantees
  incl. byte-intact foreign hook) both VERIFIED.
- [x] **AC-8** — Wired into this repo at `.claude/skills/koni-harness` +
  `.agents/skills/koni-harness` (mirrors koni-docs / koni-setup); resolves.

## Tasks

- [x] **TASK-3.3.1** — Brainstorm → spec → plan (spec + plan committed).
- [x] **TASK-3.3.2** — gate-runner + line-format config + test harness (T1).
- [x] **TASK-3.3.3** — Six checks via TDD (T2–T7).
- [x] **TASK-3.3.4** — Non-destructive installer (T8).
- [x] **TASK-3.3.5** — Standard + reference trio + SKILL.md (T9–T11).
- [x] **TASK-3.3.6** — Two-stage review (spec + code-quality) + fix findings
  (config-newline, version fixed-string, foreign-hook safety, koni-docs-validate
  robustness, POSIX status pattern) + author-blind sandbox verification (T12).
- [x] **TASK-3.3.7** — Wire symlinks + koni-docs ship/backfill (T13).

## References

- [Skill: skills/koni-harness/SKILL.md](../../../skills/koni-harness/SKILL.md)
- [Spec](../../superpowers/specs/2026-06-27-koni-harness-agentic-loop-design.md) · [Plan](../../superpowers/plans/2026-06-27-koni-harness-phase1.md)
- [US-3.2 — koni-setup](US-3.2-koni-setup-bootstrapper.md) — the sibling skill this builds on
- [CONTEXT D13 — koni-harness composes + delegates](../../CONTEXT.md)

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.10.0 (pending)](../../CHANGELOG.md)
