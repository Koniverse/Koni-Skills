# Session adapters — wiring `session-start.sh` into a tool

`session-start.sh` is the **session briefing**: one portable, read-only command
that every tool can run at the start of a session. It composes the existing
core — it has one job and delegates the bodies to the vendored sub-scripts. Pick
the adapter(s) for the tools your repo uses, or run the command by hand.

For the *gate* hooks (PreToolUse / Stop) see [`adapters.md`](adapters.md).

---

## What the briefing contains

`sh .koni-harness/session-start.sh` prints, in order:

1. The **P3a context digest** (`context-load.sh`) — VERSION + active_sprint, the
   live `.active-context` snapshot, and the decision/lesson title indexes.
2. A **`## Next` section** (`sprint.sh next`) — the P2.5 ready-story suggestion
   (dependency-ready stories in priority order + `→ start: loop.sh start <id>`).

It is **read-only** (stdout only; it never writes). It forwards `--root`/`--docs`
to both sub-scripts and `--sprint` to the next-story lookup; with no flags it
defaults root to the git toplevel, docs to `docs/`, and sprint to `CLAUDE.md`'s
`active_sprint`. Missing sub-scripts degrade to a graceful
`_(… not found)_` note rather than failing.

---

## Claude Code

Claude Code runs the briefing via a `settings.json` `SessionStart` hook, so the
digest + `## Next` print automatically when a session begins.

**Merge** this into the repo's existing `.claude/settings.json` — preserve every
existing key, never replace the file, and this is **never auto-written**. If a
`SessionStart` array already exists, append the entry to it rather than
overwriting the array:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "sh .koni-harness/session-start.sh" } ] }
    ]
  }
}
```

The *gate* hooks (`PreToolUse` / `Stop`) are a separate concern and live in
[`adapters.md`](adapters.md).

---

## Gemini / Codex / Cursor

These tools share no common session-start spec, so there is nothing to merge
into — the **script is the contract**. If the tool offers a session-start or
on-open mechanism, point it at the same command; otherwise run it by hand at the
start of a session from the repo root:

```sh
sh .koni-harness/session-start.sh
```

The adapter is whatever each tool offers; the briefing it produces is identical.

---

## Composition

This is the thin adapter layer over the portable core (gate + loop-runner +
context-loader + sprint-sequencer): `session-start.sh` just composes
`context-load.sh` and `sprint.sh next`, so every tool gets the same briefing.
