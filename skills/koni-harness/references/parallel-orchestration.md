# parallel-orchestration — running the loop multi-agent (sprint swarm + within-story fan-out)

> **Load when**: you want to run work **multi-agent / in parallel** rather than one
> story at a time — "run the sprint in parallel", "swarm this", "dispatch the ready
> stories to N agents", "parallelize the review". The single-agent spine is
> [`loop-runner.md`](loop-runner.md) (`loop.sh` drives *one* story); **this file is the
> orchestration *around* that spine** — it does not change the six stages or the gates,
> it runs many loops (and many sub-tasks within a loop) at once.

**Contents**: [Two tiers of parallelism](#two-tiers-of-parallelism) ·
[Tier A — sprint swarm](#tier-a--sprint-swarm-many-stories-at-once) ·
[Tier B — within-story fan-out](#tier-b--within-story-fan-out) ·
[Isolation + integration contract](#isolation--integration-contract) ·
[The planner: swarm.sh](#the-planner-swarmsh) ·
[Roles: orchestrator vs worker](#roles-orchestrator-vs-worker) ·
[Portability + fallback](#portability--fallback) · [Ownership](#ownership)

---

## Two tiers of parallelism

The loop parallelizes at two independent altitudes; use either or both:

| Tier | Unit that runs in parallel | Bounded by | Isolation |
|---|---|---|---|
| **A — sprint swarm** | whole **stories** (each runs the full frame→commit loop) | the dependency DAG — only *ready* stories in a wave | **one git worktree per story** |
| **B — within-story fan-out** | independent **sub-tasks of one stage** inside a single story | the stage's join (all sub-tasks done before the stage exits) | shares that story's one worktree |

Neither changes the loop: the six stages + the gates between them
([`agentic-loop-standard.md`](agentic-loop-standard.md)) run per story exactly as before.
Parallelism is orchestration, not a new loop.

---

## Tier A — sprint swarm (many stories at once)

Run the sprint **wave by wave** over the dependency graph:

1. **Compute the wave.** `swarm.sh plan` (below) asks `sprint.sh` for the
   dependency-ready set (status ≠ done, all `depends_on` done), priority-ordered, and
   caps it to the concurrency limit. That capped set is **this wave**.
2. **One worker per story, each in its own worktree.** For each story in the wave the
   orchestrator spawns a worker agent in a fresh `git worktree` on a `loop/<id>` branch;
   the worker runs the **full loop** (`loop.sh start <id> --state <wt>/.koni-harness/loop-state`
   → enter execute … → gate work-commit) entirely inside its worktree. Workers never
   share a working tree, so their edits cannot collide.
3. **Join + integrate.** When the wave's workers have each passed their in-worktree
   `work-commit` gate, integrate every `loop/<id>` branch onto a single **integration
   branch** and **re-run the gate there** — integration is where cross-story conflicts
   (that no per-worktree gate can see) surface. A human approves the final merge of the
   integration branch to the default branch (the one outward-facing step the swarm does
   not automate).
4. **Re-plan.** Mark the merged stories `done`; run `swarm.sh plan` again. Stories the
   wave unblocked become the next wave. Repeat until the sprint is complete.

**Failure isolation.** A worker that fails its gate does **not** sink its wave-mates —
their independent worktrees still integrate. Only stories that `depends_on` the failed
one wait; they simply don't become ready until it lands. Fix the failed story in its
worktree (or defer it) and re-plan.

---

## Tier B — within-story fan-out

Inside one story's loop, fan out the **independent sub-tasks of a stage**, then join
before the stage's exit gate. The safe, high-value fan-out points:

- **Review (stage 4)** — its four passes are independent and **read-only**, so run them
  concurrently: spec-compliance · **koni-qc** (AC↔TC coverage) · gstack `/design-review`
  (UI vs `DESIGN.md`) · code-quality. Fan-out **preserves the fixed-order join semantics**
  (agentic-loop-standard): all four must return before Review exits, and a fail in *any*
  sends the story back to Execute — running them in parallel changes only wall-clock, not
  the "all-must-pass" gate or the spec-compliance→koni-qc precedence when triaging fails.
  (Read-only fan-out is always safe to parallelize.)
- **Execute (stage 2)** — per-function TDD across **independent functions** can run in
  parallel **only if each sub-task writes disjoint files** (same rule as Tier A, scoped
  to this one worktree). Overlapping files → keep sequential.
- **koni-qc skill-grading** — the four dimensions (triggering · rule-robustness ·
  author-blind content · best-practices) are independent graders; run them concurrently
  and average (koni-qc `skill-grading.md` already prescribes this).
- **koni-qc whole-project QC** — one coverage agent per app epic, concurrently
  (koni-qc `whole-project-qc.md` §1).

Rule of thumb: **read-only sub-tasks fan out freely; writing sub-tasks fan out only when
their file sets are provably disjoint.** Everything else stays sequential.

> **One loop-state per worktree — the worker owns stage transitions.** Tier-B sub-tasks
> share the story's single `.koni-harness/loop-state`, so they must **not** each call
> `loop.sh enter/gate` (that would race the state file). The worker drives the stage
> boundaries once (one `enter execute`, one join, one `enter review` …); the fanned-out
> sub-tasks only do the *work* inside a stage and return their result to the worker. State
> transitions are single-writer; only the in-stage labor is parallel.

---

## Isolation + integration contract

The harness is **additive-only / non-destructive**; parallel writers make that a hard
requirement, met by worktrees. `swarm.sh plan` **emits every command below**, filled in
for the current wave — this is the contract it operationalizes:

- **One worktree per story, off a defined base.** `BASE` = the branch the orchestrator is
  on (the integration base); each worker is
  `git worktree add .koni-harness/worktrees/<id> -b loop/<id> "$BASE"`. Each worker's
  edits, `loop-state` (`--state` per worktree), and in-worktree gate are its own — exactly
  Claude Code's native `isolation:'worktree'`.
- **Idempotent (re-plan safe).** Re-planning + retries mean a worktree/branch can already
  exist, so the add is preceded by
  `git worktree remove --force .koni-harness/worktrees/<id> 2>/dev/null || true;
  git branch -D loop/<id> 2>/dev/null || true`. Without this the second wave's
  `worktree add` fails — so it is part of the emitted plan, not an afterthought.
- **The gate runs twice**: once per worktree at `work-commit` (fast, local), then again on
  the **integration branch** after the wave merges.
- **Integration is a named, concrete step** (`INTEGRATION = koni/integration`):
  `git branch -f koni/integration "$BASE" && git switch koni/integration`, then
  `git merge --no-ff loop/<id>` for each wave story, then re-run the gate
  (`gate-runner.sh --phase pre-push`) on the merged result. The re-gate catches
  cross-story *semantic* breakage; a **textual merge conflict** halts `git merge` first —
  on conflict, either resolve it on `koni/integration` and re-gate, or `git merge --abort`
  and **defer that story to a later wave** (its wave-mates still integrate).
- **Human owns the final merge** of `koni/integration` → the default branch. The swarm
  stops at integration for approval; it never auto-pushes `main`.
- **Cleanup after the human merge lands** (not before — the worktree + `loop/<id>` are the
  recovery point if integration is rejected): `git worktree remove --force
  .koni-harness/worktrees/<id>; git branch -d loop/<id>`. Then mark the stories `done` and
  re-plan the next wave.

---

## The planner: swarm.sh

`swarm.sh` is the **deterministic, read-only planner** — it turns the ready set into a
dispatch plan; it never spawns an agent, adds a worktree, or writes state (the adapter
does that). Readiness is **single-sourced from `sprint.sh`** (swarm.sh parses its
ready list; it does not re-derive the DAG).

```sh
sh .koni-harness/swarm.sh plan            # emit the current wave: per-worker worktree + loop.sh cmd + integrate/re-plan step
sh .koni-harness/swarm.sh plan --cap 3    # limit concurrency to 3 workers this wave (default 4)
sh .koni-harness/swarm.sh status          # wave view (delegates to sprint.sh status: done / blocked-by)
```

**Why `--cap` (default 4).** Concurrency is bounded by three things, whichever is
smallest: the tool's parallel-agent limit (e.g. Claude's Agent/Workflow fan-out cap), the
**merge-conflict blast radius** (more workers touching nearby code = more integration
conflicts), and cost. 4 is a safe default for a mixed sprint; raise it for many small,
independent stories, lower it for a few large ones that touch shared code. The cap only
sizes the *current* wave — held-over ready stories lead the next wave.

Defaults: sprint from `CLAUDE.md` `active_sprint`, root = git toplevel, docs = `docs/`
(same resolution as `sprint.sh`; `--sprint`/`--root`/`--docs` override). `plan` emits, for
each ready story in the capped wave, the `git worktree add` line and the
`loop.sh start <id> --state …` worker command, then the integrate-and-re-plan step. When
the sprint is complete or all-blocked, it passes `sprint.sh`'s message through unchanged.

---

## Roles: orchestrator vs worker

- **Orchestrator** (one lead agent) — runs `swarm.sh plan`, spawns one worker per wave
  story, monitors them, integrates the wave, re-plans. It does **not** implement stories
  itself; it dispatches and integrates.
- **Worker** (one per story) — runs the full six-stage loop for its story inside its
  worktree via `loop.sh`, exactly as a single agent would. A worker may itself use Tier-B
  fan-out for its own Review/Execute.

The orchestrator holds only the conclusions (each worker's gate result + integration
outcome), not the workers' file-by-file transcripts — the same "return the result, not
the dump" discipline the review subagents use.

---

## Portability + fallback

Per the [portability contract](agentic-loop-standard.md#portability-contract): the
**planner is the tool-neutral core** (`swarm.sh` — POSIX, emits a plain plan); **spawning
is the thin adapter**.

- **Claude Code** — the orchestrator spawns workers with the **Agent tool
  (`isolation:'worktree'`)** or a **Workflow** (fan-out over the wave); Tier-B review
  fan-out is parallel Agent calls in one message. This is the fast path.
- **Gemini / Codex / Cursor (no parallel-agent primitive)** — run the **same plan
  sequentially**: `swarm.sh plan` still lists the wave in priority order; execute each
  worker's block (worktree add → drive the loop → `work-commit` gate) fully, one story at
  a time, then run the single shared integrate step once at the end. (Running worktrees
  serially on one machine is fine — they share nothing; the emitted cleanup removes each
  after integration.) Identical loop, identical gate, identical integration — only the
  wall-clock differs. The plan is the contract; parallelism is an optimization, never a
  correctness requirement.

---

## Ownership

koni-harness owns the **orchestration standard + the deterministic planner** (`swarm.sh`,
read-only, single-sourcing `sprint.sh`'s DAG). It **invokes**, never reproduces, the
per-tool agent runtime (Claude Agent/Workflow) that does the actual spawning, and the
per-story loop is still [`loop.sh`](loop-runner.md). Git worktrees are the isolation
primitive; the gate ([`gate-catalog.md`](gate-catalog.md)) is unchanged and simply runs
per worktree + once at integration. This is orchestration *around* the loop — it adds no
new stage and weakens no gate.
