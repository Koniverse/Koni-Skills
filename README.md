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

## Development

Use the `skill-creator` skill for creating and iterating on skills:

```
Skill → Test prompts → Evaluate → Improve → Repeat
```

See [AGENTS.md](AGENTS.md) for detailed project conventions and workflow.
