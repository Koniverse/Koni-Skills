# koni-docs — Skill Design Spec

**Date**: 2026-05-06
**Status**: Approved
**Target**: `skills/koni-docs/SKILL.md` + bundled references

## 1. Purpose

`koni-docs` is the core skill for documentation management in Koniverse projects. It operates in hybrid mode: generates docs using correct templates, and proactively enforces rules before code ships.

The skill is project-agnostic. Technology-specific rules live in separate plugin skills (e.g., `koni-docs-supabase`, `koni-docs-nextjs`), activated via CLAUDE.md declarations.

## 2. Architecture

```
skills/koni-docs/
├── SKILL.md                    (~250 lines, entry point)
└── references/
    ├── rules.md                (~200 lines, 9 core rules with enforcement)
    ├── templates.md            (~350 lines, all templates + filled examples)
    └── sprint-system.md        (~150 lines, naming, scripts, 5-layer check)
```

### Progressive disclosure

1. **Metadata** (name + description) — always in context, triggers the skill
2. **SKILL.md** (~250 lines) — loaded when skill triggers: orientation, rule summaries, workflow, activation table, CLAUDE.md update mechanism
3. **references/** — loaded on demand based on user intent:
   - User asks about rules → `rules.md`
   - User asks to create/update a doc → `templates.md`
   - User asks about sprint/agile → `sprint-system.md`

### Plugin skills (future)

```
koni-docs-supabase/     → RULE 3 (NOT NULL), RULE 4 (db push), RULE 8 (SECURITY DEFINER)
koni-docs-nextjs/       → RULE 9 (unstable_cache), RULE 12 (next build)
```

Plugin mechanism: project's CLAUDE.md declares `koni-docs-plugins: [supabase, nextjs]`. Agent loads corresponding skills for technology-specific rules.

## 3. SKILL.md Design

### Frontmatter

```yaml
name: koni-docs
description: >
  Manages all documentation artifacts in the koni-docs framework: SETUP,
  PRD, LESSONS, CHANGELOG, CONTEXT, DESIGN, and Sprints. Use when the user
  asks to update docs, create a story, record a decision, log a lesson,
  write a changelog entry, or run the pre-commit doc checklist.
```

### Body sections

**§0 Quick orientation** — Directory structure diagram showing where each doc artifact lives.

**§1 Core rules (summary)** — 9 project-agnostic rules. Full details in `references/rules.md`.

| Rule | Summary | Group |
|------|---------|-------|
| RULE-1 | VERSION + CHANGELOG in same commit | Pre-commit |
| RULE-2 | CHANGELOG commit hash mandatory, never "pending" | Pre-commit |
| RULE-5 | STATUS.md auto-generated, never hand-edit | Post-gen |
| RULE-6 | Story id must match filename + PRD §7 | During |
| RULE-7 | CONTEXT.md append-only, corrections via revision entry | During |
| RULE-10 | Mark tasks [x] as you complete them | During |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example in same commit | Pre-commit |
| RULE-13 | English-only for code, comments, UI, errors, commits, docs | During |
| RULE-14 | Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: | Pre-commit |

**§2 Workflow — task lifecycle**

Three phases: before coding → during implementation → pre-commit checklist.

After the pre-commit checklist, a new step: **Update CLAUDE.md active context block** (see §3).

**§3 CLAUDE.md/AGENTS.md auto-update mechanism**

Every Koniverse project using koni-docs must have a marked block in its CLAUDE.md:

```markdown
## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: <emoji> US-X.Y <title>, ...
- Last Version: vX.Y.Z
- Recent Decisions: D<N>, D<N+1>, ...
- Recent Lessons: §N, §N+1, ...
<!-- /koni-docs:auto-update -->
```

Agent updates this block at 7 trigger points:

| # | Trigger | Action |
|---|---------|--------|
| T1 | Start a story | Add `🟡 US-X.Y <title>` to Active Stories |
| T2 | Close a story | Change `🟡 → ✅`, update Last Version |
| T3 | Start a sprint | Update Sprint ID |
| T4 | Add a lesson | Append LESSONS.md entry + add §N to Recent Lessons |
| T5 | Log a decision | Append CONTEXT.md entry + add D<N> to Recent Decisions |
| T6 | Add an env var | Update SETUP.md + DEPLOY.md + .env.example in same commit |
| T7 | Pre-commit | Run full checklist, verify all doc layers consistent |

Agent uses the `Edit` tool targeting the marked block to make precise updates without touching surrounding content.

**§4 Activation table** — Maps user requests to actions + which reference to load.

**§5 Reference file pointers** — Describes when to load each reference file.

## 4. Reference Files

### references/rules.md

Full details for each of the 9 core rules:
- Severity (BLOCKER / WARNING)
- Group (Pre-commit / During work / Post-generation)
- What the rule enforces and why
- Step-by-step compliance instructions
- Grep/shell verification commands (where applicable)
- Auto-fix workflow (where applicable)
- Cross-reference to relevant template in `templates.md`
- Cross-reference to relevant LESSONS.md pattern (where applicable)

### references/templates.md

Every document template with:
1. When to use it
2. The template itself (markdown with placeholders)
3. A fully filled example showing what finished output looks like
4. Frontmatter field reference (for stories, epics, sprints) listing all fields + valid values
5. Related rules and cross-references

Templates covered: CHANGELOG entry, CHANGELOG safe insertion, CONTEXT decision entry, CONTEXT revision entry, CONTEXT phase header, LESSONS entry, PRD FR table row, PRD §7 story entry, PRD removal/revert entry, DESIGN spec for a story, Story file (full), Epic file, Sprint file, SETUP env block, .env.example format, CLAUDE.md koni-docs integration block.

### references/sprint-system.md

- Naming conventions (canonical table)
- Story status flow + WIP limits
- Epic numbering scheme
- Scripts reference (command → what it does → when to run)
- 5-layer consistency check (Layer/File/What to verify table)
- Setup instructions for new projects

## 5. Plugin Skill Interface

Plugin skills follow this contract:

1. **Naming**: `koni-docs-<technology>` (e.g., `koni-docs-supabase`)
2. **Frontmatter** must include `compatibility: koni-docs`
3. **Content**: Additional rules with same severity/group structure as core rules.md
4. **Activation**: Project CLAUDE.md declares `koni-docs-plugins: [supabase, nextjs]`

When agent loads koni-docs, it checks CLAUDE.md for plugin declarations and loads corresponding plugin skills to extend the rule set.

## 6. Non-Goals (for core skill)

- Technology-specific rules → plugin skills
- UI component conventions → plugin skills (or DESIGN.md in target project)
- Automated script-based sync (Mức 2) → future enhancement
- Claude Code hooks (Mức 3) → future enhancement
- Packaging as .skill file → handled by skill-creator workflow after implementation

## 7. Success Criteria

1. Agent can process user request → load correct reference → produce correctly formatted doc
2. Agent proactively checks rules before committing and surfaces violations
3. Agent updates CLAUDE.md active context block at all 7 trigger points
4. Agent knows to read LESSONS.md and CONTEXT.md entries before starting work
5. Agent can explain which rules were checked and why any failed
6. SKILL.md stays under 300 lines; each reference file under 400 lines
