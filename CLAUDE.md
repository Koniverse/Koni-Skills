# CLAUDE.md — Koni-Skills

This project uses **[AGENTS.md](AGENTS.md)** as the single source of truth
for all AI instructions — project structure, conventions, skill catalog,
documentation map, commit discipline, and behavioral guidelines. On any
conflict between this file and AGENTS.md, AGENTS.md wins.

This file holds only the Claude-Code activation surface for the
`koni-docs` skill (Koni-Docs Integration config + Active Context pointer).

## Koni-Docs Integration

koni-docs:
  plugins: []                        # BUILT WITH — e.g. [supabase, nextjs]; none, this is a skills repo
  concerns: []                       # MUST GUARANTEE — e.g. [security]; none: no trust boundary ships here
  docs_path: docs/                   # where docs live
  active_sprint: sprint-2026-W36     # active 2026-08-31 → 2026-09-06 (absorb five AI-DLC patterns: US-3.25–US-3.28, FR-43–FR-46, v0.70.0). W30 closed 2026-09-04 at 4 stories/13 pts, five weeks after its real end date; W31–W35 not opened (nothing shipped). Sprint dates come from `date`, never inferred — this release hit CONTEXT D40 a second time and corrected before commit
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
