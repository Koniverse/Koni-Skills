# koni-harness Phase 2 — Single-story Loop-Runner Design Spec

**Date**: 2026-06-27
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: extend the existing `skills/koni-harness/` skill (additive) — no new skill
**Builds on**: [Phase 1 spec](2026-06-27-koni-harness-agentic-loop-design.md) · [CONTEXT D13](../../CONTEXT.md) · the shipped gate + Standard (v0.10.1)

---

## 1. Purpose

Phase 1 shipped the *Standard* (the six-stage loop) and the *gate* (the
deterministic commit/release backbone). Phase 2 adds the **runner**: a
repeatable way to drive **one story end-to-end** through those six stages, with
the gate enforced at the commit stage and the loop's position tracked as a
checkable artifact.

Concretely, it codifies the exact flow this project just executed by hand
(frame → execute → self-verify → review → doc+version gate → commit) into a
reusable orchestration so it isn't re-improvised per story. It is **tier-aware**:
it runs the right-sizing tiers from the Standard (skip process stages for small
work; the gate always runs).

The runner is **instruction-driven with a deterministic spine** (brainstorm
decision A2): a "brain" (`references/loop-runner.md`) that tells the agent how to
drive the stages, plus a thin tool-neutral `loop.sh` helper that records and
reports where in the loop you are and what the next gate is — so even tools
without Claude's TodoWrite (Gemini / Codex) get the same checkable spine.

### Non-goals (Phase 2)

- **No multi-story / parallel DAG orchestration** (brainstorm scope A — single
  story only; fan-out is a later phase).
- **No executable stage driver.** `loop.sh` never *executes* a stage (it can't
  spawn subagents portably); it tracks state and invokes the Phase-1 gate. Actual
  stage work is agent-driven (Claude via Task/subagents; other tools manually).
- **No hard enforcement of agent behavior.** `loop.sh` records and *warns* on
  out-of-order transitions; the only hard gate remains the commit/push gate from
  Phase 1.
- **No context-loader / multi-tool session adapters** (that is Phase 3).

---

## 2. First principles (inherited from Phase 1, unchanged)

1. **Compose, don't reinvent** — the runner *invokes* BMAD / Superpowers /
   gstack / koni-docs / the Phase-1 gate; it orchestrates, it does not replace.
2. **Portable core, thin adapter** — `loop.sh` is POSIX; "real orchestration"
   (subagent fan-out) is a Claude adapter with a documented manual fallback.
3. **Deterministic spine over vibes** — loop position is a file with a known
   format, queryable by `loop.sh status`, not implicit in the agent's head.
4. **Additive-only / non-destructive** — only new files under
   `skills/koni-harness/`; the installer extension chains/merges, never clobbers;
   `.koni-harness/loop-state` is added to the consumer `.gitignore` behind a
   marker block.
5. **Right-size the loop** — the runner honors the tier model: process stages
   scale to risk × size; the gate runs at every tier.

---

## 3. Deliverable shape & layout (additive)

Extend the existing skill — no new skill directory.

```
skills/koni-harness/
├── SKILL.md                          # + a "Run a story through the loop" section (pointer)
├── references/
│   └── loop-runner.md                # NEW — the orchestration brain (six-stage drive + tiers + fallback)
└── scripts/
    ├── loop.sh                       # NEW — POSIX loop-state helper
    ├── install-gate.sh               # MODIFIED — also vendor loop.sh + gitignore loop-state (marker block)
    └── __tests__/
        └── loop-test.sh              # NEW — self-contained POSIX tests for loop.sh
```

The Phase-1 gate (`gate-runner.sh`, `gates.conf`, `checks/`) is unchanged;
`loop.sh gate` shells out to the existing `gate-runner.sh`.

---

## 4. The loop-state helper (`loop.sh`)

A POSIX shell helper giving the loop a deterministic, tool-neutral spine. State
lives at **`.koni-harness/loop-state`** — **gitignored** (ephemeral live working
state, same rationale as `.active-context.md`).

### 4.1 State file format

Line-oriented `key=value` (grep/sed-parseable, no dependency):

```
story=US-3.4
tier=2
stage=execute
entered=frame,execute
gate_work-commit=pass
updated=2026-06-27
```

`stage` = current stage; `entered` = csv of stages entered so far; `gate_<phase>`
records the last result of that gate phase. (Timestamps are written by the caller
passing `--now <iso>`, since the runner forbids wall-clock in some contexts; if
omitted, the field is left as `-`.)

### 4.2 CLI

```
loop.sh start <story-id> [--tier 0|1|2] [--config <path>]   # init/overwrite loop-state for a story
loop.sh status                                               # print story, tier, current stage, entered, next gate / blockers
loop.sh enter <stage>                                        # record entering a stage; WARN (stderr, exit 0) if the prior stage's exit-gate isn't satisfied
loop.sh gate <work-commit|release-commit|pre-push>          # invoke the Phase-1 gate-runner for that phase; record gate_<phase>=pass|block; pass the exit code through
loop.sh complete                                             # mark the loop done (stage=complete)
```

The six stages, in order: `frame`, `execute`, `self-verify`, `review`,
`doc-gate`, `commit`. `enter` validates order against this sequence and the
tier (tiers 0/1 legitimately skip stages — skipping is allowed and not warned;
*going backward* or entering `commit` before `self-verify` for the tier IS
warned). `status` is the single source of truth a human or any tool can read.

### 4.3 Exit codes

`start`/`enter`/`complete`/`status` → 0 on success, 2 on usage error.
`gate` → passes through the gate-runner's exit code (0 pass, 1 block) so a
caller/hook can branch on it.

---

## 5. The orchestration brain (`references/loop-runner.md`)

Prose that teaches the agent to drive one story through the six stages. Contents:

### 5.1 Stage-by-stage drive (Claude-first)

| Stage | What the runner does | Tool |
|---|---|---|
| `frame` | Find/flip the story to `in-progress`; pick tier; `loop.sh start <id> --tier N` | koni-docs / BMAD |
| `execute` | `loop.sh enter execute`; implement via Superpowers TDD (subagent for tier ≥ 1) | Superpowers |
| `self-verify` | `loop.sh enter self-verify`; run tests/build; must be green | the agent |
| `review` | `loop.sh enter review`; spec-compliance subagent then code-quality subagent (the two-stage review used in Phase 1) | gstack / subagents |
| `doc-gate` | `loop.sh enter doc-gate`; koni-docs backfill (story/CHANGELOG/VERSION) + `koni-docs validate` | koni-docs |
| `commit` | `loop.sh enter commit`; `loop.sh gate work-commit` (or `release-commit`); commit only if it passes | git + Phase-1 gate |

### 5.2 Tier-awareness

Read the tier; apply the Standard's right-sizing table. Tier 0: `frame`(light) →
`execute` → `commit` (+gate). Tier 1: add `self-verify` + a single-pass review.
Tier 2: the full table including two-stage review + koni-docs backfill. The gate
stage runs at every tier. The brain states exactly which stages each tier runs.

### 5.3 Portable fallback

Claude drives stages with Task/subagents; **Gemini / Codex / Cursor run each
stage manually but call the same `loop.sh enter` / `loop.sh gate`** so the spine
and the gate are identical across tools. Subagent fan-out is a Claude
optimization, never a requirement. This is the §2 portability contract applied
to orchestration.

### 5.4 Resumability

Because position lives in `loop-state`, an interrupted loop resumes from
`loop.sh status` rather than the agent's memory — the practical payoff of the
deterministic spine, and what a pure instruction-only skill (A1) could not offer.

---

## 6. Installer extension (`install-gate.sh`, additive)

Extend the existing installer (do not add a second one):

1. Also `cp` `loop.sh` into the consumer's `.koni-harness/` (alongside the
   vendored `gate-runner.sh` + `checks/`). Re-vendoring refreshes it, same as the
   gate scripts.
2. Add `.koni-harness/loop-state` to the consumer repo's `.gitignore` behind a
   `# >>> koni-harness >>>` / `# <<< koni-harness <<<` marker block — created if
   absent, idempotent if present, never rewriting existing `.gitignore` content.
3. Everything else (hook chaining, foreign-hook skip, gates.conf preservation,
   worktree-safety) is unchanged from Phase 1.

---

## 7. Verification (Phase 2)

Mirror Phase 1's discipline:

- **`loop-test.sh`** (self-contained POSIX, runs under `sh` and `dash`): `start`
  writes a well-formed state file; `status` reports the current stage + next
  gate; `enter` in correct order is silent, out-of-order/backward warns (stderr)
  but exits 0; `gate` shells to a stub gate-runner and passes its exit code
  through; `complete` sets `stage=complete`; re-`start` overwrites cleanly.
- **Installer regression**: extend the existing non-destructive install test —
  after install, `.koni-harness/loop.sh` is vendored AND `.gitignore` contains
  the `loop-state` marker block; an existing `.gitignore` keeps all prior lines;
  re-run is idempotent (single marker block).
- **Author-blind sandbox**: a fresh subagent follows `loop-runner.md` to drive a
  throwaway tier-1 story through the loop in a scratch repo, confirming
  `loop.sh status` tracks progress and the commit gate fires. Report ambiguities.

---

## 8. Open questions (resolve during planning)

- **`enter` order-validation strictness**: exact rule for which transitions warn
  vs. are silent given a tier (the plan pins the per-tier allowed stage set).
- **`status` "next gate" derivation**: computed from current stage + tier, or
  read from a static stage→gate map in `loop.sh`. Lean: static map in `loop.sh`.
- **Timestamp source**: `loop.sh` takes `--now <iso>` from the caller (no
  wall-clock in the script) vs. allowing `date` in this non-resumable context.
  Lean: allow `date` here (loop-state is ephemeral/gitignored, not a workflow
  journal), but keep it optional.

---

## 9. Roadmap after Phase 2

- **Phase 2.5 (optional)** — multi-story fan-out / dependency ordering (scope B),
  Claude-Task-based, building on the single-story runner.
- **Phase 3** — context-loader (assemble the §Context-layers at session start) +
  first-class Gemini/Codex session adapters + DAG orchestration.
