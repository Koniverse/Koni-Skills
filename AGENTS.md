# AGENTS.md — Koni-Skills Project

## Project purpose

This repository builds and maintains **skills for the Koniverse ecosystem**. Each skill is a packaged set of instructions, scripts, references, and assets that extend AI agent capabilities for specific Koniverse workflows.

## Project structure

```
Koni-Skills/
├── AGENTS.md              ← You are here — project guide for AI agents
├── CLAUDE.md              ← Entry point, references this file
├── README.md              ← Human-facing project overview
├── skills-lock.json       ← Tracks installed skills (auto-generated)
├── skills/                ← Custom skills built for Koniverse
│   └── <skill-name>/
│       └── SKILL.md       ← Skill definition + instructions
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
