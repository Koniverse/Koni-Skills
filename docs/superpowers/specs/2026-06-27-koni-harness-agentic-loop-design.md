# koni-harness — Koni Agentic Loop + Portable Gate Design Spec

**Date**: 2026-06-27
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: `skills/koni-harness/` (new, additive) — a sibling skill alongside `koni-docs` / `koni-setup`
**Scope of this spec**: **Phase 1 only** — the *Standard* (Koni Agentic Loop) + the *portable pre-commit gate primitive*. Phases 2–3 are sketched for context but are out of scope here.

---

## 1. Purpose

Koni already owns every *stage* of an agentic development loop — BMAD (plan),
Superpowers (execute), gstack (review/QA), koni-docs (doc + version gate),
koni-setup (bootstrap). What it lacks is the **connective tissue**: a portable
definition of the loop and a portable, deterministic **gate** that catches agent
mistakes before they land. Today each repo re-invents this ad-hoc:

- **Senti-Quant** has the richest harness — a `scripts/hooks/pre-commit`
  enforcing 2-phase versioning, `LESSONS.md`/`CONTEXT.md`, an MCP fleet, a CI
  approval gate.
- **Koni-ERP-02** has a single `PreToolUse` hook (`check-gstack.sh`) and the
  `agile-*` scripts.
- **koni-devops** has essentially none — runbook discipline only.

`koni-harness` standardizes this. It is a **hybrid** deliverable: it *composes*
the existing toolchain (no reinvention) and adds a small number of *new
primitives* where there is a real gap. It runs **Claude-Code-first** but its
core is **tool-neutral**, so Gemini / Codex / Cursor can adopt the same loop
when needed.

### Non-goals (Phase 1)

- Not a workflow/DAG orchestrator (that is Phase 2 — `koni-harness` loop-runner).
- Not a replacement for any existing skill — it *invokes* BMAD / Superpowers /
  gstack / koni-docs, never re-implements them.
- Not an MCP server or a context-loader (Phase 3).
- Not a published npm package in Phase 1 — the gate ships as scripts inside the
  skill; extraction to a package is deferred.

---

## 2. First principles

1. **Compose, don't reinvent.** Every loop stage maps to a tool that already
   exists. `koni-harness` is glue + convention + a thin verification backbone.
2. **Portable core, thin tool adapters.** The "brain" (the Standard, the
   gate-runner, the gate config) is tool-neutral — plain Markdown + POSIX shell
   + a YAML config any tool can read or invoke. Claude Code's `settings.json`
   hooks + Task/subagents + Workflow are an *adapter* (the fast path); Gemini /
   Codex get a documented CLI-equivalent. One loop, many activation layers.
3. **Deterministic checks over vibes.** A gate is a script with an exit code,
   not a paragraph of advice. If a rule matters, it is grep-checkable.
4. **Close the loop, fail loud.** The gate's job is to make agent mistakes
   *impossible to miss* at commit/push time, not to advise after the fact.
5. **Additive-only / non-destructive (HARD INVARIANT).** Adopting `koni-harness`
   in any repo MUST NOT overwrite, rewrite, or delete existing data, hooks,
   settings, docs, or configs. It chains, wraps, and merges — never clobbers.
   This invariant governs every install/adopt action in §5.
6. **Idempotent.** Every setup action is safe to re-run; re-running detects what
   exists and no-ops or extends.

---

## 3. Deliverable shape & layout

A single new skill, wired into this repo exactly like `koni-docs` /
`koni-setup` (mirrored `.claude` / `.agents` symlink), touching **no** existing
file except additive registration.

```
skills/koni-harness/
├── SKILL.md                         # orchestrator: explain Standard, drive gate install/verify
├── references/
│   ├── agentic-loop-standard.md     # THE STANDARD (tool-neutral): 6 stages + gates + context layers
│   ├── gate-catalog.md              # built-in check library + severity/phase semantics
│   ├── adapters.md                  # Claude Code hooks ↔ git hooks ↔ Gemini/Codex equivalents
│   └── adoption.md                  # non-destructive install/adopt procedure (chain/wrap/merge)
└── scripts/
    ├── gate-runner.sh               # POSIX gate engine: reads config, runs checks, exit code
    ├── checks/                      # one small script per built-in check (full set in gate-catalog.md §5.3)
    │   ├── version-phase.sh
    │   ├── changelog-anchor.sh
    │   ├── credential-scan.sh
    │   ├── koni-docs-validate.sh    # thin wrapper around `npx koni-docs validate`
    │   ├── story-status-consistency.sh
    │   └── passthrough.sh           # runs a repo-provided cmd (test/typecheck/lint)
    └── install-gate.sh              # non-destructive installer (chains into existing hooks)
```

A sample `koni-harness.gates.yml` lives in `references/` as a template; the
installer copies it into a consumer repo only if absent.

### Boundary with sibling skills

| Concern | Owner |
|---|---|
| Loop definition, gates, gate-runner | **koni-harness** (this) |
| Doc bodies, 12 rules, `validate` CLI | koni-docs (invoked) |
| Repo scaffold, skill wiring | koni-setup (invoked) |
| Plan artifacts (brief→PRD→story) | BMAD (invoked) |
| Execute (plan→code→test, TDD) | Superpowers (invoked) |
| Review / QA / ship | gstack (invoked) |

`koni-harness` never reproduces any of the right-column content; it references
and calls it.

---

## 4. The Standard — "Koni Agentic Loop" (`references/agentic-loop-standard.md`)

The portable, tool-neutral definition. Four parts:

### 4.1 The six stages

| # | Stage | Owned by | Entry gate (must be true to enter) |
|---|---|---|---|
| 1 | **Frame / Plan** | BMAD | A story exists in `docs/sprints/stories/` with status `in-progress` |
| 2 | **Execute** | Superpowers (TDD) | Plan approved; LESSONS skimmed; DESIGN read if UI |
| 3 | **Self-verify** | the agent | Code compiles; new tests written and green |
| 4 | **Review / QA** | gstack | Self-verify passed; diff is reviewable |
| 5 | **Doc + Version gate** | koni-docs | Review clean; story AC all `[x]` |
| 6 | **Commit / Release** | git + gate-runner | The gate (§4.x) passes |

The value is naming the **gates between** stages — the entry/exit criteria that
decide when work may advance. Stages are existing tools; the *gates* are the new
standard.

### 4.2 Context layers + load order

`AGENTS.md` (canonical) → `CLAUDE.md` (pointer + integration block) → `LESSONS.md`
→ `CONTEXT.md` → `.active-context.md`. The Standard documents what each layer is
authoritative for and the order an agent should read them at session start.
(Automating this load is Phase 3; Phase 1 only *documents* it.)

### 4.3 Portability contract

A table partitioning every harness element into **portable core** (Markdown /
shell / YAML) vs **tool adapter** (Claude `settings.json`, Gemini/Codex configs).
The rule: a capability is only "in the harness" if its core is tool-neutral and
its adapter is thin.

### 4.4 Harness Engineering principles

The §2 principles, written for a practitioner — when to add a gate, how to keep
a check deterministic, why additive-only matters, how to degrade Claude-first
features to a portable fallback.

---

## 5. The Gate primitive

### 5.1 `gate-runner.sh`

A POSIX-sh engine (no Node required for the engine itself, though individual
checks may shell out to `node` / `npx koni-docs`). Contract:

```
gate-runner.sh --phase <work-commit|release-commit|pre-push> [--config <path>] [--dry-run]
```

- Loads `koni-harness.gates.yml` (default: repo root).
- Runs the checks whose `phase` matches, in declared order.
- A `block` check that fails → non-zero exit, loop stops, message names the check
  and how to fix. A `warn` check that fails → printed, exit unaffected.
- `--dry-run` reports what would run without executing side-effectful checks.

### 5.2 Gate config (`koni-harness.gates.yml`)

```yaml
# new file; installer never overwrites an existing one
version: 1
checks:
  - name: version-phase
    run: scripts/checks/version-phase.sh
    phase: [work-commit, release-commit]
    severity: block
  - name: changelog-anchor
    run: scripts/checks/changelog-anchor.sh
    phase: [release-commit]
    severity: block
  - name: credential-scan
    run: scripts/checks/credential-scan.sh
    phase: [work-commit, pre-push]
    severity: block
  - name: koni-docs-validate
    run: scripts/checks/koni-docs-validate.sh
    phase: [release-commit]
    severity: warn        # warn first; repos opt into block once clean
  - name: tests
    run: scripts/checks/passthrough.sh
    with: "npm test"
    phase: [pre-push]
    severity: block
```

### 5.3 Built-in check library (`references/gate-catalog.md`)

Generalized from the three repos:

| Check | What it asserts | Generalized from |
|---|---|---|
| `version-phase` | Work commit touches CHANGELOG but not VERSION; release commit bumps both with a matching new version block | Senti-Quant `scripts/hooks/pre-commit` 2-phase gate |
| `changelog-anchor` | `docs/CHANGELOG.md` has a `## [Unreleased]` (or new-version) anchor; no `pending` SHA on a release | koni-docs RULE-1/RULE-2 |
| `credential-scan` | Staged diff has no obvious secret (API key / private key / `.env` value patterns) | Senti-Quant credential-isolation discipline |
| `koni-docs-validate` | `npx koni-docs validate` exits clean (ID graph + FR refs) | koni-docs CLI |
| `passthrough` | A repo-provided command (test / typecheck / lint) exits 0 | Senti-Quant CI `tsc --noEmit` / `npm test` |
| `story-status-consistency` | No story is `done` with unchecked AC; active sprint matches CLAUDE.md | koni-docs sprint model |

Each check is a < 40-line script reading the staged diff / files and exiting
0/1, so it works identically under any tool or a bare `git` hook.

### 5.4 Adapters (`references/adapters.md`)

All three call the *same* `gate-runner.sh`:

- **git**: a `pre-commit` → `gate-runner.sh --phase work-commit`, `pre-push` →
  `--phase pre-push`. Installed by chaining (see §6).
- **Claude Code**: `settings.json` `PreToolUse` (matcher on `Bash(git commit*)`)
  or `Stop` hook → `gate-runner.sh`. Documented JSON snippet to **merge**, not
  replace.
- **Gemini / Codex / Cursor**: invoke `gate-runner.sh` directly (documented
  one-liner) since there is no shared hook spec; the runner is the contract.

---

## 6. Non-destructive adoption (`references/adoption.md`, `install-gate.sh`)

The §2.5 invariant made concrete. `install-gate.sh` in a consumer repo:

1. **Detect** existing harness: `.git/hooks/pre-commit`, `scripts/hooks/pre-commit`
   (Senti-Quant), `.claude/settings.json` hooks, an existing `koni-harness.gates.yml`.
2. **Chain, don't replace**:
   - Existing git hook → rename/preserve it and call it from the new hook (or
     append the runner call to the existing script behind a guarded marker block);
     never truncate.
   - Existing `settings.json` → **merge** the hook entry into the JSON (preserve
     all current keys); if a conflicting hook exists, print the snippet and ask
     rather than overwrite.
   - Existing gate config → leave untouched; print a diff of suggested additions.
3. **Recognize prior gates**: if a repo already enforces 2-phase versioning
   (Senti-Quant), `koni-harness` adopts/wraps it instead of adding a duplicate
   check.
4. **Marker-block discipline**: any edit to a shared file is bounded by
   `# >>> koni-harness >>>` / `# <<< koni-harness <<<` markers so it is
   reversible and re-runnable.
5. In **this** repo, registration is additive only: new skill dir + mirrored
   symlinks; doc updates go through koni-docs as new story/CHANGELOG entries,
   never rewriting existing docs.

---

## 7. Verification (how we test Phase 1)

Mirror the koni-setup sanity-test discipline:

- **Sandbox dry-run**: a throwaway git repo with fixtures — (a) a clean commit
  (gate passes), (b) a work commit that bumps VERSION (version-phase blocks),
  (c) a staged diff containing a fake API key (credential-scan blocks), (d) a
  release commit missing a CHANGELOG anchor (changelog-anchor blocks). Assert
  exit codes.
- **Non-destructive install test**: seed a repo that *already* has a
  `scripts/hooks/pre-commit` (Senti-Quant shape) and a populated
  `.claude/settings.json`; run `install-gate.sh`; assert the original hook still
  runs, the settings JSON kept all prior keys, and the koni-harness additions sit
  inside marker blocks.
- Run via independent subagents (one bootstrap-the-gate, one adopt-into-existing)
  so an author-blind executor surfaces gaps — the same method that caught the
  koni-setup defects.

---

## 8. Roadmap (Phases 2–3, out of scope here)

- **Phase 2 — Loop-orchestration skill**: `koni-harness` drives the full
  stage 1→6 loop, Claude-first via Task/subagents (parallel where independent),
  with a documented manual fallback. Consumes the Phase 1 gate as its commit
  stage.
- **Phase 3 — Context-loader + multi-tool adapters + DAG**: session-start
  context assembly (AGENTS/LESSONS/CONTEXT/active-context), first-class
  Gemini/Codex adapters, and dependency-graph orchestration for parallel work.

---

## 9. Open questions (resolve during planning)

- **Gate config format**: YAML (chosen) needs a parser in POSIX sh (yq vs a tiny
  grep-based reader). Decide: depend on `yq`, or constrain the config to a
  grep-parseable subset, or use a `.gates` line-format instead of YAML.
- **`credential-scan` ruleset**: start with a conservative built-in pattern set;
  allow a repo to extend via a `.koni-harness/secret-patterns` allow/deny file.
- **Where `koni-harness` registers in koni-docs**: likely a new story under
  EPIC-3 (catalog expansion) like koni-setup, plus FR-21. Confirm at ship time.
