# CLAUDE.md — Koni-Skills

This project uses **[AGENTS.md](AGENTS.md)** as the single source of truth
for all AI instructions — project structure, conventions, skill catalog,
documentation map, commit discipline, and behavioral guidelines. On any
conflict between this file and AGENTS.md, AGENTS.md wins.

This file holds only the Claude-Code activation surface for the
`koni-docs` skill (Koni-Docs Integration config + Active Context pointer).

## Koni-Docs Integration

koni-docs:
  plugins: []                        # e.g. [supabase, nextjs] — none in v0.1
  docs_path: docs/                   # where docs live
  active_sprint: sprint-2026-W23     # open 2026-05-27 → 2026-06-03 (EPIC-4 — Docs preview tooling)
  version_file: VERSION              # path to semver file

## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md)
> for the template and the gitignored-on-purpose rationale. The auto-update block
> (sprint / active stories / decisions / lessons) and the per-developer block
> (GitHub login, git name/email, current branch, workspace path) both live there.
>
> When you start working in this repo, copy the example to `.active-context.md`
> and fill in your local-developer details. Koni-docs T1-T7 triggers update the
> sprint block inside `.active-context.md`, not here.
