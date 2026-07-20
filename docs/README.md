# docs/ — Koni-Skills Documentation Hub

This folder is the canonical home for **Koni-Skills** documentation,
managed under the [`koni-docs`](../skills/koni-docs/SKILL.md) framework
that this repo also builds. Every code-shipping commit updates docs in
the SAME commit (`koni-docs` RULE-1 / RULE-11) — there is no
"docs follow-up" branch.

---

## What lives where

```
docs/
├── README.md            ← you are here (doc hub + pre-commit checklist)
├── SETUP.md             ← dev environment (clone → run tests)
├── BRIEF.md             ← product brief: vision, problem, solution, scope
├── PRD.md               ← product spec (label-only H2 sections, FR table + epic index)
├── ARCHITECTURE.md      ← system architecture: skill anatomy, distribution
├── CHANGELOG.md         ← full release history (every version)
├── CONTEXT.md           ← decision log (append-only, never rewrite)
├── LESSONS.md           ← recurring traps + reusable patterns
├── superpowers/         ← preserved planning artifacts (specs, plans)
└── sprints/
    ├── README.md        ← sprint schema + agile workflow
    ├── STATUS.md        ← AUTO-GENERATED kanban (never hand-edit — RULE-5)
    ├── epics/           ← EPIC-N.md (one per epic)
    ├── stories/         ← US-X.Y-<slug>.md (canonical AC + Tasks source)
    ├── sprint-YYYY-WNN.md  ← active sprint
    └── archive/         ← closed sprints

Repo-root:
  VERSION                  ← current semver string
  CLAUDE.md / AGENTS.md    ← project guides with koni-docs integration block
  .active-context.example.md  ← committed template (per-developer snapshot)
  .active-context.md       ← gitignored local snapshot
```

> **Why no `DEPLOY.md` / `.env.example`?** Koni-Skills is a *source repo*
> for distributable skills — it has no runtime to deploy and no env
> variables. If a future skill adds a server/CLI surface, RULE-11 kicks
> in and all three files (`SETUP.md` + `DEPLOY.md` + `.env.example`) land
> together.
>
> **Why no `DESIGN.md`?** Koni-Skills has no UI. Skill output formatting
> conventions live inside each skill's own `SKILL.md` body, not in a
> top-level design system.

---

## Where the docs come from (pipeline)

```
BRAINSTORM → BRIEF → PRD → ARCH → EPIC/US → REVIEW → IMPLEMENT → COMMIT/DOCS
   BMad/      BMad   BMad  BMad     BMad     GStack    Superpowers   Koni-docs
   GStack
```

Each upstream tool produces content in its own format; `koni-docs` is the
**final stage** that maps everything into this canonical structure. See
[skills/koni-docs/SKILL.md §1](../skills/koni-docs/SKILL.md) for the full
pipeline integration map.

---

## Pre-commit checklist

Run through every item before pushing a commit that changes code or scope:

```
[ ] VERSION bumped per semver rule
[ ] docs/CHANGELOG.md — new entry, real SHA, never "pending" (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] BRIEF.md updated if vision / scope / success criteria changed
[ ] CONTEXT.md has new entry if a decision was made (RULE-7 append-only)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x] (RULE-10)
[ ] npx koni-docs status --docs-path docs/      — regenerate STATUS.md (RULE-5)
[ ] npx koni-docs validate --docs-path docs/    — ID graph + FR refs resolve
[ ] Touched a skill? python3 skills/koni-docs/scripts/check-references.py <skill-dir>
[ ] CLAUDE.md `Active Context` block updated (T1–T7 as applicable)
[ ] English-only for code, comments, UI, errors, commits, docs (RULE-13)
[ ] Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: (RULE-14)
```

> **`npx koni-docs sync` is deliberately absent from this list.** At CLI 0.10.0 it
> over-aggregates the PRD/EPIC "Ship" column, corrupting curated `version_shipped`
> narrative — so this repo runs `status` only and hand-maintains the FR tables. See
> [CONTEXT D39](CONTEXT.md). Revisit if a newer CLI fixes the aggregation.

For env-var changes (RULE-11), additionally:

```
[ ] docs/SETUP.md — add env block + 1-line description
[ ] DEPLOY.md (or this file with a redirect note) — add to production env table
[ ] .env.example — add the key with placeholder value
```

---

## Conventions

- **English-only** across code, comments, UI, error messages, commits, and
  docs (RULE-13). Vietnamese chat and brainstorming is fine; the artifacts
  are English.
- **Frontmatter `id` MUST match the filename** for stories, epics, and
  sprints (RULE-6).
- **Status emojis** are stable across the whole system:
  `📋 backlog / 🚧 in-progress / ✅ done / ⏪ reverted / 🗑️ deprecated`.
- **Cross-references use markdown links**, not bare paths.
- **CONTEXT.md is append-only** (RULE-7) — corrections land as a new
  revision entry referencing the original by `D<N>`.

---

## Cross-references

- [BRIEF.md](BRIEF.md) — product brief
- [PRD.md](PRD.md) — product spec
- [ARCHITECTURE.md](ARCHITECTURE.md) — skill repo + distribution architecture
- [CONTEXT.md](CONTEXT.md) — decision log
- [LESSONS.md](LESSONS.md) — recurring traps + patterns
- [sprints/README.md](sprints/README.md) — sprint schema + scripts
- [sprints/STATUS.md](sprints/STATUS.md) — current kanban (auto-generated)
- [skills/koni-docs/SKILL.md](../skills/koni-docs/SKILL.md) — the skill this repo builds
- [AGENTS.md](../AGENTS.md) / [CLAUDE.md](../CLAUDE.md) — agent guides
