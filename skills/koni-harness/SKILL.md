---
name: koni-harness
description: >
  Use when setting up or running a Koniverse repo's development loop or its
  commit/release safety net — e.g. the user says "set up the harness", "install
  the gate", "add the gate", "wire verification gates", "pre-commit gate",
  "pre-push gate", "agentic loop", "harness engineering", "right-size the
  process", or "make the loop portable across Claude / Cursor / Codex / Gemini" —
  even if they don't name koni-harness. Also use when a change risks a bad
  version bump, a missing changelog anchor, leaked secrets, or broken doc
  references, when deciding how much process a change needs, or when picking the
  next dependency-ready story to work on. Also use to run work **multi-agent / in
  parallel** — "run the sprint in parallel", "swarm the ready stories", "run
  multiple stories at once", "fan out the review/tests across agents", or "the loop
  only runs one thing at a time — parallelize it" (the swarm planner + worktree-per-story).
---
# koni-harness — Koni Agentic Loop + portable gate

## What this owns vs. delegates

This skill owns exactly two things — **the Koni Agentic Loop standard** (the
tool-neutral six-stage loop + the gates between stages) and **the gate** (the
POSIX `gate-runner.sh` + `gates.conf` + checks). Everything else it *invokes*,
never reproduces:

| Concern | Owner |
|---|---|
| Loop definition, gates, gate-runner, parallel-swarm orchestration (`swarm.sh` planner) | **koni-harness** (this) |
| Spawning the parallel agents themselves (worktree isolation) | the tool runtime (invoked — Claude Agent/Workflow; koni-harness only *plans* the wave) |
| Doc bodies, 12 rules, `validate` CLI | koni-docs (invoked) |
| Repo scaffold, skill wiring | koni-setup (invoked) |
| Plan / brainstorm | BMAD + Superpowers + gstack (invoked — **brainstorm/plan only**) |
| Implement (plan→code→test) | **Anthropic Skills only** — `frontend-design` for UI (invoked) |
| Review / QA | gstack `/design-review` (UI vs `DESIGN.md`) + **koni-qc** (test coverage — or its **skill-grading** rubric, **≥95 to pass**, when the deliverable is a skill) + code review (invoked) |

**Tool rule (the one non-obvious invariant):** Superpowers + gstack are for
brainstorm/plan/review only; implementation is Anthropic Skills only. The Review
stage adds `/design-review` (UI vs `DESIGN.md`) and koni-qc (the AC↔TC gate).

## The standard

The **Koni Agentic Loop** names the six stages (Plan → Execute → Self-verify →
Review → Doc/Version gate → Commit/Release), the *gates between* them, the
context load order (`AGENTS.md` → `CLAUDE.md` → `LESSONS.md` → `CONTEXT.md` →
`.active-context.md`), and a portability contract (a capability is "in the
harness" only if its core is tool-neutral and its adapter is thin). Full text:
[`references/agentic-loop-standard.md`](references/agentic-loop-standard.md).
The loop **reads** `LESSONS.md` at Execute and **writes** one back at the Doc/Version
gate when a trap/pattern surfaces (via koni-docs `templates/lessons.md`, same commit) —
a conditional process step, not a gate.

The loop runs in **two execution modes** over the *same* stages and gates:
**single-agent** (one story at a time — [`loop-runner.md`](references/loop-runner.md))
and **parallel swarm** (many stories/sub-tasks at once, worktree per story —
[`parallel-orchestration.md`](references/parallel-orchestration.md)). Parallelism is
orchestration *around* the loop; it adds no stage and weakens no gate.

## Install the gate

Run the installer from **anywhere inside the target repo** (it `cd`s to the repo
root itself) by its real path. `--source` defaults to the installer's own
directory, so the no-arg form and an explicit `--source <that-dir>` are
equivalent; pass `--source` only to vendor from a different location.

```sh
# run from inside the TARGET repo (any subdir is fine)
sh /path/to/Koni-Skills/skills/koni-harness/scripts/install-gate.sh
# override the vendored source only if needed:
sh /path/to/Koni-Skills/skills/koni-harness/scripts/install-gate.sh --source <dir>
```

It is **additive**: it vendors `gate-runner.sh` + checks + `gates.conf` into the
repo's `.koni-harness/` (never overwriting an existing `gates.conf`) and chains
the runner into the `pre-commit` / `pre-push` hooks behind a marker block,
preserving any existing hook. It skips a non-`sh` existing hook with a warning,
and re-running is idempotent. Full procedure:
[`references/adoption.md`](references/adoption.md).

## Run / verify the gate

Invoke the runner directly for any phase; add `--dry-run` to see what would run
without executing the checks:

```sh
sh .koni-harness/gate-runner.sh --phase work-commit
sh .koni-harness/gate-runner.sh --phase release-commit --dry-run
sh .koni-harness/gate-runner.sh --phase pre-push
```

A failing `block` check exits non-zero (stop and fix); a failing `warn` check
prints `WARN:` and lets the commit through. The six built-in checks, the config
grammar, and how to add your own are in
[`references/gate-catalog.md`](references/gate-catalog.md); how to wire the
runner into git / Claude Code / Gemini / Codex / Cursor is in
[`references/adapters.md`](references/adapters.md).

## Run a story through the loop

The **loop-runner** drives a single story end-to-end through the six stages
(`frame → execute → self-verify → review → doc-gate → commit`). It is
tier-aware (process stages scale to risk × size; the gate runs at every tier),
with `loop.sh` as the deterministic, tool-neutral spine that tracks loop
position in a gitignored `.koni-harness/loop-state`, and the Phase-1 gate as the
commit backbone:

```sh
sh .koni-harness/loop.sh start US-X.Y --tier 2
sh .koni-harness/loop.sh status
sh .koni-harness/loop.sh enter execute      # …self-verify, review, doc-gate, commit
sh .koni-harness/loop.sh gate work-commit
sh .koni-harness/loop.sh complete
```

The full stage-by-stage drive, the per-tier stage sets, the portable
(Gemini/Codex/Cursor) fallback, resumability, and the `loop.sh` command
reference are in [`references/loop-runner.md`](references/loop-runner.md).

## Pick the next story

The **sprint-sequencer** answers, read-only, which story to start next and where
the sprint stands — `next` lists the dependency-ready stories in priority order
and suggests `loop.sh start <id>`; `status` shows counts, points, and the
dependency-blocked list. It reads koni-docs story frontmatter and never writes:

```sh
sh .koni-harness/sprint.sh next
sh .koni-harness/sprint.sh status
```

Defaults sprint from `CLAUDE.md` `active_sprint`, root to the git toplevel, docs
to `docs/`. Full behavior, flags, and limits in
[`references/sprint-sequencer.md`](references/sprint-sequencer.md).

## Run a sprint in parallel (multi-agent swarm)

The default loop is single-agent (one story at a time). To run **multi-agent**, the
**swarm planner** turns the dependency-ready set into a parallel dispatch plan — one
worker per ready story, each in its own **git worktree**, all running the full loop
concurrently — then an integrate + re-plan step for the next wave. It is **read-only**
(it plans; it never spawns an agent or adds a worktree) and single-sources readiness
from `sprint.sh`:

```sh
sh .koni-harness/swarm.sh plan            # current wave: per-worker worktree + loop.sh cmd + integrate/re-plan
sh .koni-harness/swarm.sh plan --cap 3    # cap concurrency at 3 workers (default 4)
sh .koni-harness/swarm.sh status          # wave view (done / ready / blocked-by)
```

The six stages + gates are unchanged — parallelism is orchestration *around* the loop,
and spawning is the thin per-tool adapter (Claude **Agent `isolation:'worktree'`** /
**Workflow**; other tools run the same plan sequentially). The full standard — the two
tiers (sprint swarm + within-story fan-out), the isolation + integration contract,
orchestrator/worker roles, and the portable fallback — is in
[`references/parallel-orchestration.md`](references/parallel-orchestration.md).

## Load session context

The **context-loader** emits a concise, deterministic digest of the repo's
context layers (VERSION + active_sprint, the live `.active-context` snapshot,
decision/lesson title indexes, canonical pointers) to stdout — a digest, not a
dump. Reads only; missing layers become graceful notes:

```sh
sh .koni-harness/context-load.sh
```

Defaults to the git toplevel and `docs/`; override with `--root` / `--docs`.
Full details in [`references/context-load.md`](references/context-load.md).

## Brief a new session

The **session briefing** composes the context digest and the next-story
suggestion into one read-only command to run at the start of a session — the
P3a digest followed by a `## Next` section:

```sh
sh .koni-harness/session-start.sh
```

Per-tool wiring (Claude `SessionStart` merge snippet; Gemini/Codex/Cursor) is in
[`references/session-adapters.md`](references/session-adapters.md).

## Hard invariant

**Additive-only / non-destructive.** Adopting the harness never overwrites your
own files (hooks, docs, `gates.conf`) — shared-file edits are bounded by reversible
`# >>> koni-harness >>>` markers and every action is idempotent (full rules:
[`references/adoption.md`](references/adoption.md)). Two non-obvious points: Claude
`settings.json` is merged **manually** — the installer never edits it (see
[`references/session-adapters.md`](references/session-adapters.md)); and the
vendored harness files (`gate-runner.sh`, the helpers, `checks/*.sh`) are
**refreshed in place** on re-install, so don't hand-edit them — put local rules in
`gates.conf`.

## Reference table

Load on demand based on what you're doing:

| File | When to load |
|---|---|
| [`references/agentic-loop-standard.md`](references/agentic-loop-standard.md) | Explaining the loop, the gates between stages, the context load order, or the portability contract |
| [`references/loop-runner.md`](references/loop-runner.md) | Driving one story through the six stages with `loop.sh` (stage-by-stage drive, tiers, portable fallback, resumability, command reference) |
| [`references/parallel-orchestration.md`](references/parallel-orchestration.md) | Running the loop **multi-agent / in parallel** — the sprint swarm (worktree per story, wave-by-wave over the DAG) + within-story fan-out, the isolation + integration contract, and `swarm.sh`. Load when you want to run many stories/sub-tasks at once |
| [`references/example-loop.md`](references/example-loop.md) | A full worked example — one tier-2 UI story run end-to-end (frame→commit) with the exact commands, tool choices, and gate output; plus the same story at tier 0 |
| [`references/gate-catalog.md`](references/gate-catalog.md) | Understanding the six built-in checks, the `gates.conf` grammar, or adding a custom check |
| [`references/adapters.md`](references/adapters.md) | Wiring the runner into git / Claude Code / Gemini / Codex / Cursor |
| [`references/adoption.md`](references/adoption.md) | Installing/adopting the gate non-destructively into an existing repo (chain/wrap/merge/skip rules) |
| [`references/sprint-sequencer.md`](references/sprint-sequencer.md) | Picking the next dependency-ready story or reading sprint status with `sprint.sh` (`next`/`status`, readiness + ordering, CLI flags/defaults, exit codes, limits) |
| [`references/context-load.md`](references/context-load.md) | Emitting the session-context digest with `context-load.sh` (what it emits, CLI flags/defaults, graceful degradation, P3b wiring) |
| [`references/session-adapters.md`](references/session-adapters.md) | Wiring the session briefing (`session-start.sh`) into a tool's session start (what the briefing contains, Claude `SessionStart` merge snippet, Gemini/Codex/Cursor, composition) |
