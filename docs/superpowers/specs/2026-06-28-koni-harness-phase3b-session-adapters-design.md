# koni-harness P3b — Multi-tool Session Adapters Design Spec

**Date**: 2026-06-28
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: extend the existing `skills/koni-harness/` skill (additive) — no new skill
**Builds on**: [P3a context-loader](2026-06-27-koni-harness-phase3a-context-loader-design.md) · [P2.5 sprint-sequencer](2026-06-27-koni-harness-phase2.5-sprint-sequencer-design.md) · [Phase 1 adapters](2026-06-27-koni-harness-agentic-loop-design.md) · [CONTEXT D13](../../CONTEXT.md)

> **Roadmap note.** This is the last piece of the koni-harness roadmap (P3a →
> P2.5 → **P3b**). P3a produces a context digest, P2.5 picks the next story —
> P3b wires them into a tool's session start so a fresh session is *briefed*
> automatically, and documents the per-tool adapters (Claude / Gemini / Codex /
> Cursor).

---

## 1. Purpose

P3a's `context-load.sh` and P2.5's `sprint.sh next` are useful but, until now,
must be run by hand. P3b adds the **session adapter** layer: a single
`session-start.sh` "briefing" command (digest + next-story suggestion) plus
documentation for wiring it into each tool's session-start mechanism.

The win is the portability contract realized end-to-end: one portable briefing
script, and each tool's adapter is a thin one-liner that calls it. Claude Code
gets a `SessionStart` hook (fast path); Gemini / Codex / Cursor get a documented
equivalent or a "run this at session start" one-liner.

### Non-goals (P3b)

- **No automatic editing of `settings.json`** — wiring a Claude hook is a
  documented *manual merge* (a non-destructive JSON merge needs `jq`, which would
  break the zero-dependency rule; consistent with the Phase-1 `adapters.md`
  treatment of settings).
- **No new analysis** — `session-start.sh` only composes `context-load.sh` and
  `sprint.sh next`; it adds no extraction of its own.
- **No tool-specific runtime code** — adapters are configuration/documentation,
  not per-tool scripts.

---

## 2. First principles (inherited, unchanged)

1. **Compose, don't reinvent** — `session-start.sh` calls `context-load.sh` then
   `sprint.sh next`; it implements no parsing itself.
2. **Portable core, thin adapter** — one POSIX briefing script is the core; each
   tool's session-start wiring is the thin, replaceable adapter. This is the
   contract P3b completes.
3. **Additive-only / non-destructive** — only new files under
   `skills/koni-harness/`; the installer is extended to vendor one more script;
   `settings.json` is never auto-edited (documented manual merge).
4. **Read-only** — `session-start.sh` writes only stdout.

---

## 3. Deliverable shape & layout (additive)

```
skills/koni-harness/
├── SKILL.md                          # + a "Brief a new session" pointer
├── references/
│   └── session-adapters.md           # NEW — per-tool session-start wiring + gate-hook recap
└── scripts/
    ├── session-start.sh              # NEW — POSIX briefing: context-load.sh + sprint.sh next
    ├── install-gate.sh               # MODIFIED — also vendor session-start.sh
    └── __tests__/
        └── session-test.sh           # NEW — self-contained POSIX tests
```

The gate, `loop.sh`, `context-load.sh`, and `sprint.sh` are untouched.

---

## 4. `session-start.sh` — the briefing

A POSIX script that prints a session briefing to stdout by composing the two
existing helpers, resolving them from its own directory (vendored alongside in
`.koni-harness/`) with a fallback to the same directory the script lives in.

### 4.1 Output

```
<context-load.sh output — the digest>

## Next
<sprint.sh next output — ready stories / suggested loop.sh start, or complete/blocked>
```

i.e. the full P3a digest, then a `## Next` section with the P2.5 `next` result.

### 4.2 CLI

```
session-start.sh [--root <dir>] [--docs <dir>] [--sprint <id>]
```

Flags are passed through to the underlying scripts (`--root`/`--docs` to both;
`--sprint` to `sprint.sh`). Defaults match the sub-scripts (root via
`git rev-parse --show-toplevel` else cwd; docs `docs/`; sprint from
`CLAUDE.md active_sprint:`). Exit `0` on success; `2` on usage error. If a
sub-script is missing, print a one-line note for that section and continue
(graceful, never crashes).

### 4.3 Resolution

`session-start.sh` finds `context-load.sh` and `sprint.sh` next to itself
(`$SELF_DIR`), else in `.koni-harness/`. (Identical pattern to `loop.sh gate`'s
runner resolution.)

---

## 5. `references/session-adapters.md`

Documents how to wire the briefing into each tool, all calling the **same**
vendored `.koni-harness/session-start.sh`:

- **`### Claude Code`** — a `settings.json` `SessionStart` hook entry that runs
  `sh .koni-harness/session-start.sh`; shown as JSON to **merge manually** into
  existing settings (never auto-written). Plus a one-line recap that the *gate*
  hooks (PreToolUse/Stop) are covered in `adapters.md` (Phase 1).
- **`### Gemini / Codex / Cursor`** — each tool's session-start equivalent if it
  has one; otherwise the documented manual one-liner
  `sh .koni-harness/session-start.sh` to run at the start of a session. The
  script is the contract; the adapter is whatever each tool offers.
- **`### What the briefing contains`** — one paragraph: the P3a digest + the
  P2.5 `## Next` section, and that it is read-only.

---

## 6. Verification (P3b)

`session-test.sh` (self-contained POSIX, `sh` + `dash`):

- **Briefing composition**: a fixture repo (VERSION + CLAUDE.md koni-docs block +
  `.active-context.md` + a sprint of stories) → `session-start.sh` output
  contains both a digest marker (e.g. the `VERSION:` line / `## Decisions`) AND a
  `## Next` section with the sprint's ready/complete result. Exit 0.
- **Flag pass-through**: `--root` is honored (run against the fixture, not cwd).
- **Graceful**: with `context-load.sh` or `sprint.sh` absent from the resolution
  dir, the matching section prints a note and the script still exits 0.
- **Installer**: extend the install test — `.koni-harness/session-start.sh`
  vendored + executable.

Plus an author-blind sandbox: install into a throwaway repo, run
`session-start.sh`, confirm the briefing reads well and the documented Claude
`SessionStart` snippet is valid JSON.

---

## 7. Open questions (resolve during planning)

- **Sub-script resolution when run from the source tree vs vendored**: mirror
  `loop.sh gate` — try `$SELF_DIR/<script>` first, then `.koni-harness/<script>`.
  Pin in the plan.
- **Flag forwarding**: `session-start.sh` forwards `--root`/`--docs` to both
  sub-scripts and `--sprint` to `sprint.sh` only; `context-load.sh` ignores
  `--sprint` (it has no such flag), so forward `--sprint` solely to `sprint.sh`.

---

## 8. After P3b

The koni-harness roadmap is complete: gate (P1) + loop-runner (P2) +
context-loader (P3a) + sprint-sequencer (P2.5) + session adapters (P3b). The
only open EPIC-3 item is the unrelated US-3.1 plugin-skill pattern (still
backlog). A future pass could add real Gemini/Codex hook automation if those
tools gain a stable hook spec.
