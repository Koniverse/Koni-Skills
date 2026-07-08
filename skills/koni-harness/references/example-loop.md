# Worked example — one story through the loop

A single concrete run of the [Koni Agentic Loop](agentic-loop-standard.md),
end-to-end, for a **tier-2** UI story. This is the example to copy; adapt the
commands to your repo. Everything in `>` is illustrative tool output.

**Story**: `US-7.3 — Add a "Custom RPC" settings panel` (a new UI feature →
tier 2: many decisions, touches state). Acceptance criteria AC-1…AC-4 already
written in `docs/sprints/stories/US-7.3-custom-rpc-panel.md`.

**Contents**: [1. frame](#1-frame--pick-the-work-open-the-loop) ·
[2. execute](#2-execute--implement-with-anthropic-skills-only) ·
[3. self-verify](#3-self-verify--green-before-advancing) ·
[4. review](#4-review--the-fixed-four-step-order) ·
[5. doc-gate](#5-doc-gate--docs--version-then-validate) ·
[6. commit](#6-commit--the-gate-decides) ·
[The same story at tier 0](#the-same-story-at-tier-0)

---

## 1. `frame` — pick the work, open the loop

```sh
sh .koni-harness/sprint.sh next          # confirm the story is dependency-ready
# → Ready stories in sprint-2026-W30 (priority order):
# → - US-7.3  —  Add a "Custom RPC" settings panel
# →
# →   → start: loop.sh start US-7.3
sh .koni-harness/loop.sh start US-7.3 --tier 2
sh .koni-harness/loop.sh enter frame
```

Flip the story to `in-progress` (koni-docs). **Read `LESSONS.md` and cite it** —
add `Lessons applied: §<n> — <how>` (or `none — <why>`) to the story; story-lint
checks the line on new stories. Because this is
UI, **read `DESIGN.md`** now (and build on **shadcn** primitives + the repo's
tokens — the review will enforce both) — it is the Execute entry gate for UI work. If the
shape is unclear, *brainstorm* with Superpowers / *plan* with BMAD here — this is
the only place those tools are used.

## 2. `execute` — implement with Anthropic Skills only

```sh
sh .koni-harness/loop.sh enter execute
```

Implement the panel with the **`frontend-design`** Anthropic Skill (UI). Keep TDD
as the discipline **per function** — for each new/changed function + branch, write
the failing unit test first, then the minimal code to pass it (RED→GREEN→REFACTOR,
per koni-qc `unit-coverage.md`). For tier ≥ 1, delegate the implementation to a
fresh subagent.

**Do NOT** reach for `superpowers:executing-plans` or gstack `qa` to *write the
code* — they are brainstorm/plan/review only. That line does not move for a
deadline.

## 3. `self-verify` — green **and unit-covered** before advancing

```sh
sh .koni-harness/loop.sh enter self-verify
npm run test:cov && npm run build   # tests green + unit-coverage bar met (≥80% on changed code)
```

Each new/changed function got its unit tests in Execute (RED→GREEN→REFACTOR, per
koni-qc `unit-coverage.md`). "Build green" alone does not pass — the unit-coverage
gate must pass too.

## 4. `review` — the fixed four-step order

```sh
sh .koni-harness/loop.sh enter review
```

1. **spec-compliance** subagent — does the diff satisfy AC-1…AC-4?
2. **koni-qc** — every AC has positive + negative + boundary tests (the AC↔TC gate).
3. **gstack `/design-review`** — the panel matches `DESIGN.md` **and the shadcn standard** (UI; both mandatory — shadcn primitives + design tokens, not a hand-rolled panel).
4. **code-quality** subagent.

Fix findings and re-run the relevant step until clean.

## 5. `doc-gate` — docs + version, then validate

```sh
sh .koni-harness/loop.sh enter doc-gate
# story AC all [x]; bump VERSION; add the CHANGELOG entry; backfill the story SHA later
# review surfaced a trap (the RPC probe hung with no timeout) → capture it as a lesson:
#   append "## <n>. Always timeout an external RPC probe" to docs/LESSONS.md
#   (koni-docs templates/lessons.md, same commit). Had NOTHING been learned, you
#   would instead add the honest verdict line to the story/sprint note:
#   "Lessons: none new — routine wiring, no trap surfaced" — the lesson-capture
#   gate blocks a task-bearing release commit that records neither.
npx koni-docs validate --docs-path docs/
# → ✓ all references resolve
```

Entry requires review clean **and** every story AC checked `[x]`. Capturing a `LESSONS.md`
entry is part of this gate **when** a trap/pattern surfaced (append-only, same commit) — it
mirrors the CONTEXT "new entry if a decision was made" rule; here the timeout trap earns one.

## 6. `commit` — the gate decides

```sh
sh .koni-harness/loop.sh enter commit
sh .koni-harness/loop.sh gate work-commit
# → PASS: version-phase
# → PASS: credential-scan        → gate PASS
git commit -m "feat(settings): add Custom RPC panel (US-7.3)"
sh .koni-harness/loop.sh complete
```

The `work-commit` phase runs only the two checks wired to it in the default
`gates.conf` (`version-phase`, `credential-scan`). The release-only checks
(`changelog-anchor`, `story-status`, `koni-docs-validate`) fire on
`release-commit`, and `tests` fires on `pre-push` — see
[`gate-catalog.md`](gate-catalog.md). If any `block` check fails the commit is
stopped — fix and re-run the gate. Never `git commit --no-verify`.

---

## The same story at tier 0

A one-line copy tweak in that panel later is **tier 0**: `frame` (light) →
`execute` → `commit` + gate. You skip the process steps (no brainstorm, no
subagent review, no koni-qc) — those skips are allowed and silent — but the gate
still runs. The gate is never skipped at any tier; that is the whole point of a
cheap deterministic backbone.
