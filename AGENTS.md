# AGENTS.md — Koni-Skills Project

> **This file is the single source of truth for all AI agent instructions in this project.**
> Cursor, Gemini, Codex CLI, Copilot CLI, and Claude Code all read it.
> [`CLAUDE.md`](CLAUDE.md) is a thin pointer back to this file plus the
> Koni-Docs Integration block and an Active Context pointer.
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

## Project purpose

This repository builds and maintains **skills for the Koniverse ecosystem**. Each skill is a packaged set of instructions, scripts, references, and assets that extend AI agent capabilities for specific Koniverse workflows.

## Documentation

This repo dogfoods its own `koni-docs` skill. Project documentation lives in [`docs/`](docs/):

- [BRIEF.md](docs/BRIEF.md) — product brief
- [PRD.md](docs/PRD.md) — product spec (label-only H2 sections, FR table, epic/story index)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — skill repo + distribution architecture
- [CONTEXT.md](docs/CONTEXT.md) — append-only decision log
- [LESSONS.md](docs/LESSONS.md) — recurring traps + reusable patterns
- [SETUP.md](docs/SETUP.md) — local dev environment
- [sprints/](docs/sprints/) — agile workflow, with [STATUS.md](docs/sprints/STATUS.md) auto-generated kanban
- [VERSION](VERSION) + [docs/CHANGELOG.md](docs/CHANGELOG.md) — semver + release history (RULE-1, RULE-2)

Walk the [doc hub](docs/README.md) for the full pre-commit checklist and pipeline map.

## Project structure

```
Koni-Skills/
├── AGENTS.md              ← You are here — CANONICAL guide for AI agents
├── CLAUDE.md              ← Thin pointer to this file + Koni-Docs Integration
├── README.md              ← Human-facing project overview
├── VERSION                ← Current semver string (repo root per skill canon)
├── .active-context.example.md  ← Per-developer template (committed)
├── .active-context.md     ← Per-developer snapshot (gitignored)
├── skills-lock.json       ← Tracks installed skills (auto-generated)
├── skills/                ← Custom skills built for Koniverse
│   └── <skill-name>/
│       └── SKILL.md       ← Skill definition + instructions
├── docs/                  ← Project documentation (managed by koni-docs)
│   ├── CHANGELOG.md       ← Full release history (canonical, per skill §0)
│   └── ...                ← BRIEF / PRD / ARCH / CONTEXT / LESSONS / SETUP / sprints/
└── .agents/               ← Managed skill installations (do not hand-edit)
    └── skills/
        └── <installed-skill>/
            ├── SKILL.md
            ├── scripts/
            ├── references/
            └── assets/
```

**Key directories:**

- **`skills/`** — Where you create and edit Koniverse skills. Each skill lives in its own directory with a `SKILL.md` file (or `README.md` during development). These are the **output** of this repository.
- **`.agents/`** — Managed by the skill installer. Contains installed third-party skills (like `skill-creator`). Never hand-edit files here; use the skill management commands instead.
- **`skills-lock.json`** — Lockfile tracking installed skills, their sources, and content hashes. Updated automatically on install/remove.

## Creating and editing skills

### Use skill-creator for all skill work

The `skill-creator` skill is already installed in this project. It provides the full workflow for creating new skills and iteratively improving existing ones.

**When to invoke skill-creator:**
- Creating a new Koniverse skill from scratch
- Modifying an existing skill's instructions
- Optimizing a skill's description for better triggering
- Running evaluations to measure skill performance

**The skill-creator workflow (high-level):**

1. **Capture intent** — Clarify what the skill should do, when it should trigger, and what output format to expect.
2. **Write a draft** — Create the `SKILL.md` with frontmatter (`name`, `description`) and markdown instructions.
3. **Test against prompts** — Run the skill on realistic test cases, both with-skill and baseline (without-skill).
4. **Evaluate results** — Review outputs qualitatively and quantitatively. Grade assertions, aggregate benchmarks, launch the eval viewer.
5. **Iterate** — Improve the skill based on feedback, re-run tests, repeat until satisfied.
6. **Optimize description** — Tune the `description` field for accurate triggering.
7. **Package** — Generate the final `.skill` file for distribution.

### Skill directory anatomy

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code for deterministic/repetitive tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output (templates, icons, fonts)
```

### Where to save new skills

New Koniverse skills go under `skills/<skill-name>/`. For example, `skills/koni-docs/` is the documentation management skill.

During active development with skill-creator, iteration results go in a sibling workspace directory: `<skill-name>-workspace/` (not committed to git).

## Current skills

| Skill | Path | Purpose |
|---|---|---|
| koni-docs | `skills/koni-docs/` | Documentation management — SETUP, PRD, LESSONS, CHANGELOG, CONTEXT, DESIGN, Sprints |
| koni-harness | `skills/koni-harness/` | The Koni Agentic Loop standard + the portable commit/release gate (gate-runner + checks) |
| koni-qc | `skills/koni-qc/` | QC methodology & coverage intelligence — AC↔TC matrix, edge taxonomy, NFR, test-organization, security review, skill-grading |
| koni-setup | `skills/koni-setup/` | Day-0 project bootstrapper/onboarder — detect profile, scaffold, wire skills, audit an existing repo |
| koni-nextjs | `skills/koni-nextjs/` | Plugin-skill reference — Next.js rules extending koni-docs (`plugins: [nextjs]`) |
| koni-agent-monitoring | `skills/koni-agent-monitoring/` | Install/verify the Koni Agent Ops monitoring client (content-free usage metrics → ERP dashboard) |

### Relocated skills

| Skill | Now lives in | Why |
|---|---|---|
| koni-ea-dev | [`koni-ea`](https://github.com/Koniverse/koni-ea) `skills/koni-ea-dev/` | The EA/bot domain moved to its own delivery repo — see CONTEXT decision on the koni-ea split |
| koni-ea-ops | [`koni-ea`](https://github.com/Koniverse/koni-ea) `skills/koni-ea-ops/` | same |

Their development history (EPIC-3, US-3.11→US-3.16, FR-41/FR-42) stays in this
repo's `docs/` — that is the record of what happened here. New work on them
happens in `koni-ea`.

## Installed helper skills

| Skill | Source | Purpose |
|---|---|---|
| skill-creator | anthropics/skills | Create, modify, evaluate, and package skills |

## Quick reference — common tasks

| Task | Action |
|---|---|
| Create a new skill | Invoke skill-creator, follow the capture-intent → draft → test → iterate loop |
| Edit an existing skill | Invoke skill-creator, skip to the improvement section |
| Add a script to a skill | Place in `skills/<name>/scripts/`, reference from SKILL.md |
| Add reference docs to a skill | Place in `skills/<name>/references/`, reference from SKILL.md |
| Test a skill | Use skill-creator eval workflow with test prompts |
| Optimize a skill's description | Use skill-creator's description optimization loop |
| Package a skill for distribution | `python .agents/skills/skill-creator/scripts/package_skill.py skills/<name>/` |

## Conventions

- Skill instruction language: English (same as all code, comments, and docs in Koniverse).
- Skill naming: lowercase kebab-case (`koni-docs`, `koni-api`, etc.).
- Every skill must have a `name` and `description` in its frontmatter.
- Descriptions should be specific about WHEN to trigger — include both what the skill does and the contexts where it applies.
- Keep SKILL.md under 500 lines; use bundled resources for additional content.

## Koni-Docs

This project uses `koni-docs` (built in this very repo) for documentation management. All docs follow the structure defined in [`docs/README.md`](docs/README.md). See [`skills/koni-docs/SKILL.md`](skills/koni-docs/SKILL.md) for templates, the 10 enforced rules, and the workflow.

This repo follows two koni-docs conventions worth flagging:

- **Active Context — Pattern B (file-extracted)**: live sprint snapshot
  lives in `.active-context.md` (gitignored). `.active-context.example.md`
  is the committed template; contributors copy it on first checkout. See
  [`skills/koni-docs/references/templates/integration.md`](skills/koni-docs/references/templates/integration.md) §2.
- **AGENTS.md is canonical**: this file is the single source of truth for
  AI instructions; `CLAUDE.md` is a thin pointer + Koni-Docs Integration
  config + Active Context pointer. Same convention is recommended for
  every Koniverse project consuming `koni-docs`. See
  [`skills/koni-docs/references/templates/integration.md`](skills/koni-docs/references/templates/integration.md) §3.1.

> **CLI**: install `@koniverse/koni-docs` (v0.5.0+) for the typed CLI binary. All sync / status / etc. operations described in this skill run via `npx koni-docs <subcommand>`.

For the consolidated Documentation links, see the [§Documentation section
above](#documentation).
