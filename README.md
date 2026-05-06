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

Each Koniverse project should include this repo's skills. In the project's Claude Code session:

```
/claude install /path/to/Koni-Skills/skills/koni-docs
```

Or add to your project's `CLAUDE.md`:

```markdown
# CLAUDE.md

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

### Setting up this repo for skill development

```bash
git clone https://github.com/Koniverse/Koni-Skills.git
cd Koni-Skills
```

The repo comes with `skill-creator` pre-installed in `.agents/skills/`. To verify:

```
ls .agents/skills/skill-creator/
```

### Creating a new skill

1. **Brainstorm** — Use `bmad-brainstorming` + `/office-hours` to explore the problem
2. **Draft** — Write `skills/<skill-name>/SKILL.md` with YAML frontmatter + markdown body
3. **Add references** — Place bundled resources in `references/`, `scripts/`, or `assets/`
4. **Test** — Run evals via `skill-creator` (test prompts → with-skill vs baseline → grade)
5. **Iterate** — Review results in the eval viewer, improve based on feedback
6. **Package** — Generate `.skill` file for distribution

See [AGENTS.md](AGENTS.md) for detailed conventions and the full skill-creator workflow.

### Installing third-party skills (like BMad)

Third-party skills are installed via Claude Code and tracked in `skills-lock.json`:

```
/claude install bmad-creator/bmad-skills
```

Installed skills land in `.agents/skills/` and their lock entries are committed to the repo so other developers get the same versions.
