# Product Brief: Koni-Skills

## Executive Summary

**Koni-Skills** is the source repository for **Koniverse-specific AI agent
skills** — packaged units of instructions, scripts, references, and assets
that extend agent capabilities for the workflows Koniverse teams actually
run (documentation, agile process, plugin patterns). Each skill is
self-contained, installable via `npx skills add Koniverse/Koni-Skills
--skill <name>`, and version-locked through `skills-lock.json`.

The first shipping skill is `koni-docs`, which standardizes
documentation output across every Koniverse product (PRD, ARCHITECTURE,
CHANGELOG, CONTEXT, LESSONS, SETUP, sprints) into a single
BMad-compatible structure with enforced rules and bundled automation.
Future skills extend the catalog: plugin skills for tech stacks
(Supabase, Next.js), and domain skills as Koniverse needs surface.

The opportunity: every Koniverse product today reinvents its docs layout,
its rule set, and its agile process. A shared, versioned skill catalog
collapses that to one upgrade path — `npx skills update` —  and lets
agents (Claude Code, Codex, Cursor, Gemini, Copilot) read consistent
scaffolding everywhere.

## The Problem

A Koniverse engineer or PM starting on a new project today faces three
recurring frictions:

1. **Inconsistent doc layout.** Koni-ERP-02 has a mature `Docs/` folder;
   Koni-Finance-Final ships another shape; a new project usually
   half-copies one of them and silently diverges. Agents that learned one
   structure miss artifacts in the other.
2. **Rules live in tribal knowledge.** "Bump VERSION and CHANGELOG in the
   same commit," "STATUS.md is generated, never hand-edit," "CONTEXT.md
   is append-only" — these are nine rules in `koni-docs` that have been
   re-discovered (and re-violated) on every project.
3. **No shared automation.** Each project rewrote the same sync scripts
   (story → epic → PRD → sprint propagation, STATUS.md generation,
   CHANGELOG backfill) in slightly different ways, with slightly
   different bugs.

The status quo is "copy the latest Koni-ERP `Docs/` folder, hand-fix what
breaks, and hope the next refactor lands before too much drift." That is
the friction Koni-Skills removes.

## The Solution

A single GitHub repo (`Koniverse/Koni-Skills`) that publishes each
Koniverse skill as a self-contained directory under `skills/<name>/`,
with the `npx skills` CLI handling install, update, lock, and removal.

Each skill bundles its own templates, references, scripts, and assets;
its `SKILL.md` is the contract the agent reads at activation. The
project that consumes the skill installs it once (`npx skills add`),
adds a 12-line integration block to its `CLAUDE.md`, and inherits the
full Koniverse documentation discipline.

## What Makes This Different

| Competitor | What They Do | Our Advantage |
|-----------|-------------|---------------|
| Hand-copied `Docs/` folders | Each project clones a previous project's docs and edits | Versioned, lockfile-tracked, one upgrade command |
| Generic skill libraries (e.g. `anthropics/skills`) | Cross-domain general skills (skill-creator, etc.) | Koniverse-specific rules, pipelines, and tooling baked in |
| Inline CLAUDE.md instructions | Each project writes its own agent rules | Skills + plugins compose; rules survive across projects |
| BMad alone | Strong planning templates, weak structural enforcement | Koni-docs adopts BMad's content shape AND adds enforced 9-rule pre-commit gate |

## Who This Serves

**Primary user: Koniverse engineer / PM working in a product repo**
- Already familiar with at least one Koniverse project's `Docs/` folder
- Wants `npx skills add Koniverse/Koni-Skills --skill koni-docs` and
  immediate parity with the most mature Koniverse project
- Cares about: zero re-implementation of sync scripts, no doc drift, no
  RULE-6/RULE-7 violations creeping in

**Secondary user: AI coding agent (Claude Code, Codex, Cursor, Gemini, Copilot)**
- Reads the project's `CLAUDE.md` / `AGENTS.md` at session start
- Needs an unambiguous activation table ("user says X → load template Y")
- Cares about: token-efficient on-demand loading, deterministic scripts

## Success Criteria

| Metric | Target (Month 3) | Target (Month 12) |
|--------|------------------|-------------------|
| Koniverse projects consuming koni-docs via `npx skills` | 3 | 8+ |
| Skills shipped from this repo | 1 (koni-docs) | 4+ (koni-docs + 2 plugins + 1 domain) |
| Time from "new project init" to "full docs scaffolding" | < 5 min | < 5 min |
| Cross-project doc-layout divergence (manually audited) | 0 critical | 0 critical |
| Re-implemented sync scripts in consumer projects | 0 | 0 |

## Scope

### In Scope (v0.1 — shipped)
- `koni-docs` skill with 9 rules, 13 templates, 5 scripts, BMad pipeline map.
- `npx skills` distribution + lockfile (`skills-lock.json`).
- Self-contained integration test for sync scripts.

### In Scope (v0.2 — current sprint)
- Apply `koni-docs` to this repo itself (dogfood).
- Wire `koni-docs` integration block into `CLAUDE.md` + `AGENTS.md`.
- Seed VERSION + CHANGELOG from git history.

### In Scope (future)
- Plugin skill pattern: `koni-supabase`, `koni-nextjs` extending core rules.
- Additional Koniverse-specific skills as needs surface.
- Skill evaluation harness (`skill-creator` evals integrated into CI).

### Out of Scope (v1.0)
- A web UI for browsing skills (the CLI + GitHub page is enough).
- Cross-vendor skill marketplace (this is internal-first).
- Auto-PR refactoring of consumer repos when a skill updates.

## Vision

In 12 months, **every Koniverse product repo opens with the same
`Active Context` block, the same `STATUS.md` kanban, and the same
pre-commit gate** — because they all `npx skills add` from this repo
and `npx skills update` together. New engineers ramp on one
documentation discipline, not N variants. New skills (e.g. a domain
skill for an internal compliance flow) ship as a new `skills/<name>/`
directory and reach every project the day they're tagged.
