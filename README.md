# Koni-Skills

Skills repository for the **Koniverse** ecosystem — extending AI agent capabilities with specialized workflows for product development, documentation management, and project operations.

## Structure

```
Koni-Skills/
├── skills/              ← Custom skills built for Koniverse
│   └── koni-docs/       ← Documentation management skill
├── .agents/             ← Managed skill installations (auto-generated)
├── .claude/             ← Claude Code configuration
├── AGENTS.md            ← Project guide for AI agents
├── CLAUDE.md            ← Entry point, references AGENTS.md
└── skills-lock.json     ← Lockfile for installed skills
```

## Skills

### koni-docs

Documentation management skill — the single source of truth for docs in Koniverse projects.

- **9 core rules** (project-agnostic) for pre-commit enforcement
- **11 template types** with filled examples (CHANGELOG, CONTEXT, LESSONS, PRD, stories, epics, sprints, design specs, etc.)
- **Pipeline integration**: BMad → GStack → Superpowers → Koni-docs
- **Auto-update**: CLAUDE.md/AGENTS.md active context block at 7 trigger points
- **Plugin-ready**: Technology-specific rules (Supabase, Next.js) via separate plugin skills

## Installation

### Using skills in your Koniverse project

Install koni-docs from this repo into any project:

```bash
npx skills add Koniverse/Koni-Skills --skill koni-docs
```

Or install all available skills at once:

```bash
npx skills add Koniverse/Koni-Skills --skill '*' --agent '*'
```

To browse available skills before installing:

```bash
npx skills add Koniverse/Koni-Skills --list
```

Then add the integration block to your project's `CLAUDE.md`:

```markdown
## Koni-Docs Integration
koni-docs:
  plugins: []                     # e.g. [supabase, nextjs]
  docs_path: Docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories:
- Last Version:
- Recent Decisions:
- Recent Lessons:
<!-- /koni-docs:auto-update -->
```

### Restoring skills in a cloned project

When cloning a project that already has `skills-lock.json`:

```bash
npx skills experimental_install
```

This reads the lockfile and installs all declared skills automatically — no need to re-run `npx skills add` for each one.

### Setting up this repo for skill development

```bash
git clone https://github.com/Koniverse/Koni-Skills.git
cd Koni-Skills
npx skills experimental_install   # restore skill-creator from lockfile
```

Verify:

```bash
npx skills list
```

### Creating a new skill

```bash
npx skills init koni-<name>       # scaffold skills/<name>/SKILL.md
```

Then iterate through the development loop:

1. **Brainstorm** — Use `bmad-brainstorming` + `/office-hours` to explore the problem
2. **Draft** — Edit `skills/<skill-name>/SKILL.md` with YAML frontmatter + markdown body
3. **Add references** — Place bundled resources in `references/`, `scripts/`, or `assets/`
4. **Test** — Run evals via `skill-creator` (test prompts → with-skill vs baseline → grade)
5. **Iterate** — Review results in the eval viewer, improve based on feedback
6. **Ship** — Commit and push; users install via `npx skills add`

See [AGENTS.md](AGENTS.md) for detailed conventions and the full skill-creator workflow.

### Managing installed skills

```bash
npx skills list                    # list project skills
npx skills list --json             # machine-readable output
npx skills update                  # update all skills to latest
npx skills update koni-docs        # update a specific skill
npx skills remove --skill '*'      # remove all installed skills
```
