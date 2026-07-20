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
  active_sprint: sprint-2026-W30     # active 2026-07-20 → 2026-07-26 (mechanize the check-count drift class: US-3.19 ships FR-21 at v0.65.0). W29 closed 07-19 at 11 stories/27 pts; W28 not opened (nothing shipped); W27 closed 07-05 at 12 stories/42 pts. Story dates come from `date`, never inferred from a gate rejection — CONTEXT D40
  version_file: VERSION              # path to semver file

> **CLI**: install `@koniverse/koni-docs` (v0.5.0+) for the typed CLI binary. All sync / status / etc. operations described in this skill run via `npx koni-docs <subcommand>`.

## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md)
> for the template and the gitignored-on-purpose rationale. The auto-update block
> (sprint / active stories / decisions / lessons) and the per-developer block
> (GitHub login, git name/email, current branch, workspace path) both live there.
>
> When you start working in this repo, copy the example to `.active-context.md`
> and fill in your local-developer details. Koni-docs T1-T7 triggers update the
> sprint block inside `.active-context.md`, not here.
