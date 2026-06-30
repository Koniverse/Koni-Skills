# The loop-runner — driving one story through the loop

The **loop-runner** is the orchestration brain that drives a *single* story
end-to-end through the six stages of the [Koni Agentic Loop](agentic-loop-standard.md):
`frame → execute → self-verify → review → doc-gate → commit`. It is the runner
half of Phase 2 — paired with the thin POSIX `loop.sh` helper that records and
reports loop position so the spine is deterministic and tool-neutral.

`loop.sh` never *executes* a stage (it can't portably spawn subagents); it tracks
state in a gitignored `.koni-harness/loop-state` file, warns on out-of-order
transitions, and shells out to the Phase-1 gate-runner for the commit gate. The
actual stage work stays agent-driven — this document tells the agent how.

**Contents**: [Driving a story through the loop](#driving-a-story-through-the-loop) ·
[Tier-awareness](#tier-awareness) · [Portable fallback](#portable-fallback) ·
[Resumability](#resumability) · [Command reference](#command-reference)

## Driving a story through the loop

Run one stage at a time, recording each transition with `loop.sh enter` so the
position stays checkable. The exact `loop.sh` calls are Claude-first but
tool-neutral — any agent runs the same commands (see [Portable fallback](#portable-fallback)).

| Stage | What the runner does (incl. the exact `loop.sh` command) | Tool |
|---|---|---|
| `frame` | Find the story and flip it to `in-progress`; pick the tier; initialise the loop: `sh .koni-harness/loop.sh start <id> --tier N` | koni-docs / BMAD |
| `execute` | `sh .koni-harness/loop.sh enter execute`; implement with **Anthropic Skills only** (`frontend-design` for UI; delegate to a subagent for tier ≥ 1) — **never Superpowers or gstack to write code** (those are brainstorm-only). **TDD stays the discipline** (write the failing test first), but the *implementation tool* is an Anthropic Skill, not the Superpowers TDD skill | Anthropic Skills |
| `self-verify` | `sh .koni-harness/loop.sh enter self-verify`; run tests + build — must be green before advancing | the agent |
| `review` | `sh .koni-harness/loop.sh enter review`; run **in this order**: **(1) spec-compliance** subagent — the diff meets the story AC; **(2) koni-qc** — the AC↔TC coverage gate (**or koni-qc skill-grading if the deliverable is a skill** — score /100 across triggering/rule-robustness/content/best-practices; **must clear ≥95 to pass** (re-grade the whole skill after any change, not just the diff)); **(3)** for UI, gstack `/design-review` vs the repo's `DESIGN.md`; **(4) code-quality** subagent | subagents · koni-qc · gstack `/design-review` |
| `doc-gate` | `sh .koni-harness/loop.sh enter doc-gate`; koni-docs backfill (story / CHANGELOG / VERSION) + `npx koni-docs validate` | koni-docs |
| `commit` | `sh .koni-harness/loop.sh enter commit`; then `sh .koni-harness/loop.sh gate work-commit` (or `release-commit`); commit **only if the gate passes** | git + Phase-1 gate |

When the commit lands, close the loop with `sh .koni-harness/loop.sh complete`.

## Tier-awareness

Read the tier from the loop-state and apply the Standard's right-sizing table
(see ["Right-sizing the loop"](agentic-loop-standard.md#right-sizing-the-loop) —
process steps scale to risk × size, the gate runs at every tier). Each tier runs
a different subset of the six stages:

| Tier | Stages run |
|---|---|
| **0 — trivial / mechanical** | `frame` (light) → `execute` → `commit` + gate |
| **1 — small feature / bugfix** | tier 0 + `self-verify` + a single-pass `review` + `doc-gate` |
| **2 — substantial / many decisions** | the full table, incl. the four-step `review` (spec-compliance → koni-qc → `/design-review` for UI → code-quality) + koni-docs backfill at `doc-gate` |

**The gate stage runs at every tier** — that is the whole point of a cheap
deterministic backbone: even a tier-0 commit cannot leak a secret or bump a
version without a changelog. Forward *skips* (tier 0 legitimately skipping
`self-verify` / `review`) are allowed and silent; `loop.sh` only warns when you
go *backward* or enter `commit` without `self-verify` at tier ≥ 1.

## Portable fallback

Claude drives the stages with `Task`/subagents — fanning out the execute and
review work — which is the fast path, never the requirement. **Gemini, Codex, and
Cursor run each stage manually** but call the *same* `loop.sh enter` and
`loop.sh gate` commands, so the deterministic spine and the commit gate are
identical across every tool. Subagent fan-out is a Claude optimisation; the
loop-state file and the gate are the portable contract. This is the Standard's
[portability contract](agentic-loop-standard.md#portability-contract) applied to
orchestration: portable core, thin per-tool adapter.

## Resumability

Loop position lives in `.koni-harness/loop-state`, not in the agent's memory. An
interrupted loop — context lost, session restarted, handed to a different tool —
resumes from:

```sh
sh .koni-harness/loop.sh status
```

`status` prints the story, tier, current stage, the stages entered so far, and
the next action (`enter <stage>`, or run the gate at `commit`). Pick up from the
`next:` line; nothing about where you are is implicit. This is the practical
payoff of the deterministic spine over a pure instruction-only skill.

## Command reference

The five `loop.sh` subcommands, exactly as implemented. Every subcommand accepts
the global `--state <path>` override (default: `.koni-harness/loop-state`).

```
loop.sh start <story-id> [--tier N] [--state <path>]
        Initialise/overwrite loop-state for a story. --tier defaults to 2.
        Sets stage=frame, entered=frame.

loop.sh status [--state <path>]
        Print story, tier, current stage, entered (csv), and the next action.

loop.sh enter <stage> [--state <path>]
        Record entering a stage; updates stage + appends to entered.
        <stage> is one of: frame execute self-verify review doc-gate commit.

loop.sh gate <phase> [--state <path>]
        Shell out to the Phase-1 gate-runner for <phase>
        (work-commit | release-commit | pre-push); record gate_<phase>=pass|block;
        pass the runner's exit code through (0 pass, 1 block).

loop.sh complete [--state <path>]
        Mark the loop done (stage=complete).
```

**Exit codes:** `start` / `status` / `enter` / `complete` return `0` on success,
`2` on usage error. `gate` passes through the gate-runner's exit code (`0` pass,
`1` block) so a caller or hook can branch on it.

**Warnings `enter` emits** (to stderr, but still exits `0` — these are advisory,
not blocking):

- **Backward move** — entering a stage *before* the current one in canonical
  order: `loop WARN: entering '<stage>' is before current '<cur>' (going backward)`.
- **Commit without self-verify at tier ≥ 1** — entering `commit` when
  `self-verify` was never entered: `loop WARN: entering 'commit' without 'self-verify' (tier <N>)`.
  (At tier 0 this is silent — tier 0 legitimately skips `self-verify`.)

The only *hard* gate in the loop remains the commit/push gate (`loop.sh gate`),
which exits non-zero on a `block` check; everything else is tracked and warned,
never enforced.
