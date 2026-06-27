---
name: koni-harness
description: >
  Owns the Koni Agentic Loop standard and the portable, dependency-free
  pre-commit/pre-push gate that catches agent mistakes (bad version bumps,
  missing changelog anchor, leaked secrets, broken doc refs) before they land.
  Use this whenever the user says "set up the harness", "install the gate into
  this repo", "add the gate", "wire verification gates", "pre-commit gate",
  "agentic loop", "harness engineering", or "make the loop portable" — even if
  they don't name koni-harness. It owns only the loop standard + the gate; it
  DELEGATES doc bodies to koni-docs, scaffold to koni-setup, plan to BMAD,
  execute to Superpowers, and review/QA to gstack — it references and invokes
  them, never reproduces them.
---
# koni-harness — Koni Agentic Loop + portable gate

## What this owns vs. delegates

This skill owns exactly two things: **the Koni Agentic Loop standard** (the
tool-neutral definition of the six-stage loop and the gates between its stages)
and **the gate** (the POSIX `gate-runner.sh` + `gates.conf` + checks that
enforce the commit/release stage). It is glue + convention + a thin verification
backbone — it *composes* the existing toolchain and never re-implements it.

| Concern | Owner |
|---|---|
| Loop definition, gates, gate-runner | **koni-harness** (this) |
| Doc bodies, 12 rules, `validate` CLI | koni-docs (invoked) |
| Repo scaffold, skill wiring | koni-setup (invoked) |
| Plan artifacts (brief→PRD→story) | BMAD (invoked) |
| Execute (plan→code→test, TDD) | Superpowers (invoked) |
| Review / QA / ship | gstack (invoked) |

Anything in the right column is referenced and called, never reproduced here.

## The standard

The **Koni Agentic Loop** names the six stages (Plan → Execute → Self-verify →
Review → Doc/Version gate → Commit/Release), the *gates between* them, the
context load order (`AGENTS.md` → `CLAUDE.md` → `LESSONS.md` → `CONTEXT.md` →
`.active-context.md`), and a portability contract (a capability is "in the
harness" only if its core is tool-neutral and its adapter is thin). Full text:
[`references/agentic-loop-standard.md`](references/agentic-loop-standard.md).

## Install the gate

Stand in the **target repo root** (cwd = the repo you're installing into), then
invoke the installer by its real path. It defaults `--source` to its own
directory, so no `--source` is needed when called by that path:
Passing `--source <path-to>/skills/koni-harness/scripts` explicitly is
equivalent to the default, so the no-arg form and that explicit `--source`
produce the same install.

```sh
# cwd = the TARGET repo root
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

**Additive-only / non-destructive.** Adopting the harness MUST NOT overwrite,
rewrite, or delete an existing hook, setting, doc, or config. Every edit to a
shared file is bounded by reversible `# >>> koni-harness >>>` /
`# <<< koni-harness <<<` markers; existing hooks are chained (POSIX) or skipped
with a warning (non-POSIX), Claude `settings.json` is merged not replaced, and
an existing `gates.conf` is left untouched. Every action is idempotent.

## Reference table

Load on demand based on what you're doing:

| File | When to load |
|---|---|
| [`references/agentic-loop-standard.md`](references/agentic-loop-standard.md) | Explaining the loop, the gates between stages, the context load order, or the portability contract |
| [`references/loop-runner.md`](references/loop-runner.md) | Driving one story through the six stages with `loop.sh` (stage-by-stage drive, tiers, portable fallback, resumability, command reference) |
| [`references/gate-catalog.md`](references/gate-catalog.md) | Understanding the six built-in checks, the `gates.conf` grammar, or adding a custom check |
| [`references/adapters.md`](references/adapters.md) | Wiring the runner into git / Claude Code / Gemini / Codex / Cursor |
| [`references/adoption.md`](references/adoption.md) | Installing/adopting the gate non-destructively into an existing repo (chain/wrap/merge/skip rules) |
| [`references/sprint-sequencer.md`](references/sprint-sequencer.md) | Picking the next dependency-ready story or reading sprint status with `sprint.sh` (`next`/`status`, readiness + ordering, CLI flags/defaults, exit codes, limits) |
| [`references/context-load.md`](references/context-load.md) | Emitting the session-context digest with `context-load.sh` (what it emits, CLI flags/defaults, graceful degradation, P3b wiring) |
| [`references/session-adapters.md`](references/session-adapters.md) | Wiring the session briefing (`session-start.sh`) into a tool's session start (what the briefing contains, Claude `SessionStart` merge snippet, Gemini/Codex/Cursor, composition) |
