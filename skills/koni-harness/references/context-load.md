# context-load — the session-context digest

`context-load.sh` is a portable, dependency-free POSIX script that emits a
concise, deterministic Markdown digest of a repo's context layers to stdout.
It reads only; it never writes a file. Every missing layer becomes a graceful
note, so it always exits `0` on a readable repo.

It is a **digest, not a dump**: titles and the live snapshot are inlined; the
full bodies are *referenced*, not reproduced — open the named files for detail.

## What it emits

Five sections, in order:

1. **Header** — `# Session context — <repo>` plus two facts: `VERSION` (from
   `VERSION`, whitespace stripped) and `active_sprint` (the `active_sprint:`
   line in `CLAUDE.md`, with any trailing `#`-comment stripped and trimmed).
   Either falls back to `-` when its source file is absent.
2. **Live state** — the verbatim live snapshot: the lines *between* the
   `<!-- koni-docs:auto-update -->` … `<!-- /koni-docs:auto-update -->` markers,
   with the two marker lines themselves dropped. Read from `.active-context.md`
   when present, otherwise from the CLAUDE.md Pattern-A block (see below).
3. **Decisions** — the `### D<n>.` decision titles from `docs/CONTEXT.md`
   (titles only), followed by a pointer to the full bodies.
4. **Lessons** — the `## <n>.` lesson titles from `docs/LESSONS.md`
   (titles only), followed by a pointer to the full bodies.
5. **Canonical references** — fixed pointers to `AGENTS.md`, the
   `skills/koni-harness` standard, and a reminder that the digest is a summary.

## Usage

```sh
sh .koni-harness/context-load.sh [--root <dir>] [--docs <dir>]
```

- `--root <dir>` — repo root to digest. Default: `git rev-parse --show-toplevel`,
  falling back to the current working directory when not inside a git repo.
- `--docs <dir>` — where `CONTEXT.md` / `LESSONS.md` live. Default: `<root>/docs`.
- Output is Markdown to **stdout only**; the script writes nothing.
- Exit code: `0` on a readable repo (missing layers become notes), `2` on a
  usage error (an unknown argument).

## Graceful degradation

Each missing layer degrades to an italic note rather than an error:

- No live snapshot in either `.active-context.md` or `CLAUDE.md` →
  `_(no active-context snapshot)_`.
- No `docs/CONTEXT.md` → `_(docs/CONTEXT.md not found)_`.
- No `docs/LESSONS.md` → `_(docs/LESSONS.md not found)_`.

A fresh clone will not have the gitignored `.active-context.md`. In that case the
Live state falls back to the **CLAUDE.md Pattern-A block** — the same
`<!-- koni-docs:auto-update -->`-bounded block embedded directly in `CLAUDE.md`
— so the digest still carries a live snapshot.

## Wiring (P3b)

P3a only *produces* the digest — runnable manually or by any adapter. Wiring it
into a tool's session start (a Claude `SessionStart` hook, the Gemini/Codex
equivalents) is **P3b**.
