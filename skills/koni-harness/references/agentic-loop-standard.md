# The Koni Agentic Loop — Standard (tool-neutral)

This is the portable, tool-neutral definition of how a Koniverse repo runs an
agentic development loop. It is plain Markdown describing a loop, a set of
gates, a context-load order, and a portability contract. Nothing here is
specific to Claude Code, Gemini, Codex, or Cursor — the adapter that wires this
into a given tool is documented separately in
[`adapters.md`](adapters.md), and the gate that enforces it is documented in
[`gate-catalog.md`](gate-catalog.md).

Koni already owns every *stage* of the loop (BMAD + Superpowers + gstack plan and
review, Anthropic Skills implement, koni-qc gates test coverage, koni-docs gates
docs + version, koni-setup bootstraps). What this Standard adds is the
**connective tissue**: a shared name for the loop and a deterministic gate
between its stages.

**Contents**: [The six stages](#the-six-stages) ·
[Right-sizing the loop](#right-sizing-the-loop) ·
[Context layers and load order](#context-layers-and-load-order) ·
[Portability contract](#portability-contract) ·
[Harness engineering principles](#harness-engineering-principles)

---

## The six stages

| # | Stage | Owned by | Entry gate (must be true to enter) |
|---|---|---|---|
| 1 | **Frame / Plan** | BMAD (+ Superpowers / gstack for brainstorm) | A story exists in `docs/sprints/stories/` with status `in-progress` |
| 2 | **Execute** | **Anthropic Skills only** (e.g. `frontend-design` for UI) | Plan approved; LESSONS skimmed; DESIGN read if UI |
| 3 | **Self-verify** | the agent | Code compiles; new tests written and green |
| 4 | **Review / QA** | in order: spec-compliance review → **koni-qc** (AC↔TC coverage) → gstack `/design-review` (UI vs DESIGN.md) → code-quality review | Self-verify passed; diff is reviewable |
| 5 | **Doc + Version gate** | koni-docs | Review clean; story AC all `[x]` |
| 6 | **Commit / Release** | git + gate-runner | The gate passes |

> **Tool split — brainstorm vs implement vs review (a hard rule).**
> *Brainstorm / plan* uses **Superpowers** (brainstorming, writing-plans) and
> **gstack** (plan-reviews, office-hours). *Implement* uses **Anthropic Skills
> only** (`frontend-design` for UI, and the other Anthropic implementation
> skills) — **never** Superpowers or gstack to write feature code. *Review* uses
> gstack `/design-review` (UI conformance to the repo's `DESIGN.md`), **koni-qc**
> (test coverage), and code review. The one place gstack appears outside
> brainstorm is the review stage (`/design-review`); it still never implements.
>
> **Execute keeps TDD as a discipline** (write the failing test first), but TDD
> is the *practice* — the implementation tool is an Anthropic Skill, **not** the
> Superpowers TDD skill. **Review runs in a fixed order**: (1) spec-compliance
> (does the diff meet the story AC?) → (2) **koni-qc** (does every AC have
> covering tests? the AC↔TC gate) → (3) gstack `/design-review` for UI → (4)
> code-quality. So the only thing *before* koni-qc is the spec-compliance pass.
>
> **When the deliverable is a *skill*** (a `SKILL.md` + references/scripts), the
> koni-qc review step runs **skill-grading** (koni-qc `references/skill-grading.md`)
> instead of the product AC↔TC gate: score the skill /100 across four independent
> dimensions — triggering (skill-creator), rule-robustness under pressure
> (writing-skills), author-blind content (`superpowers:code-reviewer`), and
> Anthropic best-practices. **The pass bar is ≥95/100 — the Koniverse catalog
> standard ([CONTEXT D19](../../../docs/CONTEXT.md)); a skill below 95 does not pass
> Review.** Re-grade the *whole* skill after any change (not just the diff), and
> re-verify every fix round. This is how the harness builds *and verifies the
> building of* new skills.

The stages themselves are not the contribution — they are existing tools that
every Koni repo already runs. **The value is the gates *between* the stages**:
the entry/exit criteria that decide when work may advance from one stage to the
next. Naming those gates, and making the commit/release gate a deterministic
script with an exit code, is what this Standard adds.

---

## Right-sizing the loop

Running all six stages in full for every change is an anti-pattern — "full SOP
for a typo" wastes more than it protects. Scale the loop to **risk × size**.
The trick is to separate two kinds of step:

- **Gate steps are deterministic and cheap** (`version-phase`, `credential-scan`,
  `changelog-anchor`, `koni-docs validate`, tests). They cost seconds and are the
  safety net — **they run at every tier, always on.** This is the whole point of
  a deterministic backbone: it's too cheap to skip.
- **Process steps cost judgment** (brainstorm → spec → plan, BMAD planning,
  two-stage subagent review). These are the expensive part — **scale them to the
  work.**

| Tier | When | Process steps | Gate |
|---|---|---|---|
| **0 — Trivial / mechanical** | typo, copy tweak, config bump | none — edit → self-verify → commit | always runs |
| **1 — Small feature / bugfix** | 1–3 files, clear scope | a light TodoWrite instead of spec/plan; execute (TDD) → quick 1-pass review → doc gate | always runs |
| **2 — Substantial / many decisions** | new skill, architecture, cross-cutting, anything touching money / secrets / migrations | full SOP: brainstorm → spec → plan → subagent-driven + two-stage review → verify → koni-docs backfill → ship | always runs |

**Choosing a tier:** risk (money, secrets, migrations, multi-person blast radius)
pushes you up; when in doubt, go one tier heavier. The failure modes are
symmetric — *full SOP for tier-0 work* burns time, *tier-0 treatment for tier-2
work* ships architecture nobody reviewed. The gate makes the cheap tiers safe to
take: even a tier-0 commit can't leak a secret or bump a version without a
changelog, because the gate is non-negotiable.

This Standard, and the koni-harness skill that ships it, were built at **tier 2**
(foundational, many architectural decisions, reused everywhere). A landing-page
copy fix is **tier 0**. Both run the same gate.

---

## Context layers and load order

At session start an agent should read the repo's context layers in this order,
each one narrowing from project-canonical down to the live working state:

`AGENTS.md` → `CLAUDE.md` → `LESSONS.md` → `CONTEXT.md` → `.active-context.md`

- **`AGENTS.md`** — the single canonical source of truth for project structure,
  conventions, skill catalog, commit discipline, and behavioral guidelines.
- **`CLAUDE.md`** — a thin pointer to AGENTS.md plus the Koni-Docs Integration
  config block (`docs_path` / `active_sprint` / `version_file`) and the Active
  Context pointer. Authoritative only for the Claude-Code activation surface.
- **`LESSONS.md`** — accumulated, hard-won lessons; authoritative for "mistakes
  we already made, don't repeat them."
- **`CONTEXT.md`** — durable architectural/decision context (the D-numbered
  decisions); authoritative for *why* the system is shaped the way it is.
- **`.active-context.md`** — the live working state: active sprint, in-progress
  stories, recent decisions, and the per-developer block. Authoritative for
  "what is happening right now." Gitignored on purpose.

Phase 1 only **documents** this order; *automating* the load (assembling these
layers into the agent's session context at startup) is Phase 3 and out of scope
for the current harness.

---

## Portability contract

A capability is only "in the harness" if its **core is tool-neutral** and its
**adapter is thin**. The core is plain Markdown + POSIX shell; the adapter is
the small amount of per-tool glue that invokes that core. If a capability can
only run inside one tool, it is not yet in the harness.

| Element | Portable core | Tool adapter |
|---|---|---|
| **Loop definition** | This document (Markdown) — the six stages, gates, and context order | — (no adapter; agents read it directly) |
| **The gate** | `gate-runner.sh` + `gates.conf` (POSIX shell + a line-format config any tool can read or invoke) | git `pre-commit` / `pre-push` hook · Claude Code `settings.json` hook · Gemini / Codex / Cursor one-liner `sh .koni-harness/gate-runner.sh --phase <phase>` |
| **Context load** | The layer files themselves (`AGENTS.md` → … → `.active-context.md`) | Each tool's session-start mechanism that reads them (Phase 3) |

The rule restated: the gate's brain (`gate-runner.sh` + the checks + the
config) is identical everywhere; the only thing that changes per tool is the
thin shim that calls it. The runner is the contract; the adapter is replaceable.

---

## Harness engineering principles

Practitioner guidance, derived from the harness's first principles:

1. **Compose, don't reinvent.** Every loop stage maps to a tool that already
   exists. The harness is glue + convention + a thin verification backbone — it
   *invokes* BMAD / Superpowers / gstack / koni-docs, it never re-implements
   them.

2. **Add a gate only for a mistake that has actually bitten you.** A gate earns
   its place by catching a class of agent error before it lands (a bad version
   bump, a missing changelog anchor, a leaked secret, a broken doc ref). Don't
   add speculative checks; generalize a real failure from a real repo.

3. **Keep checks deterministic and grep-able.** A gate is a script with an exit
   code, not a paragraph of advice. If a rule matters, make it grep-checkable:
   read the staged state (`git diff --cached` / `git show :<path>`), exit `0`
   for pass and `1` for fail, and print a one-line message naming the check and
   how to fix it. No vibes, no LLM-in-the-loop for a deterministic rule.

4. **Fail loud, at commit/push time.** The gate's job is to make agent mistakes
   *impossible to miss* at the moment of committing or pushing — not to advise
   after the fact. A `block` check that fails stops the commit; a `warn` check
   prints and lets it through (repos opt into `block` once they are clean).

5. **Additive-only / non-destructive.** Adopting the harness in any repo MUST
   NOT overwrite, rewrite, or delete existing hooks, settings, docs, or configs.
   It chains, wraps, and merges behind reversible
   `# >>> koni-harness >>>` / `# <<< koni-harness <<<` marker blocks. Every
   install action is idempotent — safe to re-run, detects what exists, and
   no-ops or extends. (See [`adoption.md`](adoption.md).)

6. **Degrade Claude-first features to a portable fallback.** Claude Code's
   `settings.json` hooks are the *fast path*, not the only path. Anything that
   runs as a Claude hook must also be invokable as the bare POSIX one-liner so
   Gemini / Codex / Cursor (which share no hook spec) get the same gate. If a
   feature can't degrade to the portable core, it isn't in the harness yet.

7. **Implement with Anthropic Skills; brainstorm/review with Superpowers &
   gstack.** Each tool family has one job. **Superpowers + gstack are for
   brainstorming and planning** (and gstack `/design-review` for the review
   stage) — they **must never write feature code**. **Implementation is Anthropic
   Skills only** (`frontend-design` for UI, plus the other Anthropic
   implementation skills). This keeps planning rigor and execution craft in the
   tools each is best at, and it makes "who built this" unambiguous. The Review
   stage adds gstack `/design-review` (UI must track the repo's `DESIGN.md`) and
   **koni-qc** (the test-coverage gate) on top of code review.
