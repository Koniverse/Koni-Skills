---
name: koni-docs
description: >
  Manages all documentation artifacts in the koni-docs framework: SETUP,
  PRD, LESSONS, CHANGELOG, CONTEXT, DESIGN, and Sprints (epics / stories /
  sprint files / STATUS). Use when the user asks to update docs, create a
  story, record a decision, log a lesson, write a changelog entry, run the
  pre-commit doc checklist, or when any planning tool (BMad, GStack,
  Superpowers) produces artifacts that need standardization into the docs/
  structure.
---
# koni-docs — Documentation Management

> **One rule above all others**: every code-shipping commit updates docs in
> the SAME commit. Never defer documentation to a follow-up.

---

## 0. Quick orientation — what lives where

```
docs/
├── README.md          ← doc hub + pre-commit checklist
├── SETUP.md           ← dev environment (clone → npm run dev)
├── PRD.md             ← product spec: Epics / User Stories / Tasks
├── CHANGELOG.md       ← full release history (every version)
├── CONTEXT.md         ← decision log (append-only, never rewrite)
├── LESSONS.md         ← recurring traps + patterns
├── design/            ← per-story design specs (US-X.Y-<slug>-design.md)
└── sprints/
    ├── README.md      ← agile schema + workflow
    ├── STATUS.md      ← AUTO-GENERATED kanban (never hand-edit)
    ├── epics/         ← EPIC-N.md
    ├── stories/       ← US-X.Y-<slug>.md (canonical task source)
    ├── sprint-YYYY-WNN.md  ← active sprint
    └── archive/       ← closed sprints

DEPLOY.md              ← production runbook (repo root)
VERSION                ← current semver string (repo root)
DESIGN.md              ← design system (repo root)
.env.example           ← env var template (repo root)
```

---

## 1. Pipeline integration

Koni-docs is the **final stage** and **output standardizer** in the Koniverse product development pipeline:

```
BRAINSTORM → BRIEF → PRD → ARCH → EPIC/US → DESIGN → REVIEW → QA → IMPLEMENT → COMMIT/DOCS
   BMAD       BMAD    BMAD   BMAD     BMAD     GSTACK  GSTACK  GSTACK  SUPERPOWERS   KONI-DOCS
```

**Key principle**: Tools process content. Koni-docs standardizes output. When BMad, GStack, or Superpowers produce planning artifacts in their own directories (e.g., `_bmad-output/`), koni-docs maps them to the canonical `docs/` structure and ensures they follow Koniverse templates.

| Pipeline Phase          | Tool                | What it produces                                               |
| ----------------------- | ------------------- | -------------------------------------------------------------- |
| Brainstorm              | BMad + GStack       | Raw ideas, problem framing                                     |
| Product Brief           | BMad                | Executive brief                                                |
| PRD                     | BMad                | Full PRD content                                               |
| Architecture            | BMad                | Architecture decisions                                         |
| EPIC/US Breakdown       | BMad                | Epics + User Stories                                           |
| Design Review           | GStack              | Design review, interaction states                              |
| Plan Review             | GStack              | Architecture review, edge cases, test plan                     |
| QA                      | GStack              | Systematic testing, bug reports                                |
| Implementation          | Superpowers         | Plan → code → tests                                          |
| **docs Finalize** | **Koni-docs** | **Standardized docs, rules enforced, CLAUDE.md updated** |

---

## 2. Core rules (summary)

These 9 rules apply to ALL Koniverse projects. Full enforcement details in `references/rules.md`.

| Rule    | Summary                                                       | Group      |
| ------- | ------------------------------------------------------------- | ---------- |
| RULE-1  | VERSION + CHANGELOG in same commit                            | Pre-commit |
| RULE-2  | CHANGELOG commit hash mandatory, never "pending"              | Pre-commit |
| RULE-5  | STATUS.md auto-generated, never hand-edit                     | Post-gen   |
| RULE-6  | Story id must match filename + PRD §7                        | During     |
| RULE-7  | CONTEXT.md append-only, corrections via revision entry        | During     |
| RULE-10 | Mark tasks [x] as you complete them                           | During     |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example in same commit   | Pre-commit |
| RULE-13 | English-only for code, comments, UI, errors, commits, docs    | During     |
| RULE-14 | Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: | Pre-commit |

**Technology-specific rules** (Supabase, Next.js) live in plugin skills. When a project declares `koni-docs-plugins: [supabase, nextjs]` in its CLAUDE.md, load those plugin skills for the additional rules.

---

## 3. Workflow — task lifecycle

### 3a. Before writing any code

1. **Read LESSONS.md** — skim all entry titles; full-read 2-4 entries matching your domain.
2. **Read DESIGN.md** if any UI is involved.
3. **Find or create the story** in `docs/sprints/stories/`:
   - Flip `status:` → `in-progress`
   - Set `sprint:` to the active sprint id
   - If no story exists, create a stub using the story template (`references/templates.md` §Story file) before starting.
4. **Update the sprint file** — ensure the story row exists in the active sprint scope table.

### 3b. During implementation

- Mark tasks `[x]` in the story file **as you complete them**, not all at the end (RULE-10).
- If you make an architecture or scope decision, append a `CONTEXT.md` entry immediately (see `references/templates.md` §CONTEXT).
- If you encounter a trap or discover a reusable pattern, append a `LESSONS.md` entry.

### 3c. Pre-commit checklist

Run through every item before committing:

```
[ ] VERSION bumped per semver rule
[ ] CHANGELOG.md — story's "Changelog entry" section copied in, commit SHA filled (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] CONTEXT.md has new entry if a decision was made
[ ] SETUP.md + DEPLOY.md + .env.example updated if new env var (RULE-11)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x]
[ ] node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/  (5-layer sync)
[ ] node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/  (STATUS.md — RULE-5)
[ ] CLAUDE.md Active Context block updated (see §4)
```

---

## 4. CLAUDE.md/AGENTS.md auto-update

Every Koniverse project must have an active context block in its CLAUDE.md. Agent updates this block at specific trigger points.

### CLAUDE.md integration block

```markdown
## Koni-docs Integration
koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: 🟡 US-X.Y <title>
- Last Version: vX.Y.Z
- Recent Decisions: D<N>
- Recent Lessons: §N
<!-- /koni-docs:auto-update -->
```

### Trigger points

| #  | Trigger                | Action                                               |
| -- | ---------------------- | ---------------------------------------------------- |
| T1 | Start a story          | Add `🟡 US-X.Y <title>` to Active Stories          |
| T2 | Close a story          | Change `🟡 → ✅`, update Last Version             |
| T3 | Start a sprint         | Update Sprint ID                                     |
| T4 | Add a LESSONS entry    | Append LESSONS.md + add §N to Recent Lessons        |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D`<N>` to Recent Decisions |
| T6 | Add an env var         | Update SETUP + DEPLOY + .env.example (RULE-11)       |
| T7 | Pre-commit             | Run full checklist, verify all doc layers consistent |

**How to update**: Use the `Edit` tool targeting the block between `<!-- koni-docs:auto-update -->` and `<!-- /koni-docs:auto-update -->` markers. This keeps updates precise without touching surrounding content.

---

## 5. Activation — how to use this skill

| User request                                    | Action                                                                                    | Load                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| "create a story for US-X.Y"                     | Verify US-X.Y exists in PRD §7, use story template                                       | `templates.md` §Story file       |
| "start story US-X.Y"                            | §3a flow: read LESSONS → DESIGN.md → flip `status: in-progress`                      | `rules.md` §RULE-6               |
| "close / complete story US-X.Y"                 | §3c checklist + 5-layer check + run agile:status                                         | `sprint-system.md` §5-layer      |
| "log a decision" / "record architecture choice" | Find highest D`<N>`, use decision template                                              | `templates.md` §CONTEXT          |
| "revise / correct decision D`<N>`"            | Append revision entry, never edit original (RULE-7)                                       | `templates.md` §Revision         |
| "add a lesson" / "log a lesson"                 | Find highest entry number, use LESSONS template                                           | `templates.md` §LESSONS          |
| "write changelog for vX.Y.Z"                    | Use CHANGELOG template, bump VERSION simultaneously                                       | `templates.md` §CHANGELOG        |
| "update PRD for [feature]"                      | Update both FR table row AND §7 story entry                                              | `templates.md` §PRD              |
| "create design spec for US-X.Y"                 | Use design spec template                                                                  | `templates.md` §DESIGN           |
| "create an epic"                                | Use epic template                                                                         | `templates.md` §Epic             |
| "create sprint file"                            | Use sprint template                                                                       | `templates.md` §Sprint           |
| "run doc checklist" / "pre-commit check"        | Walk §3c checklist item by item                                                          | `rules.md` + `sprint-system.md` |
| "update setup for new env var"                  | RULE-11: update all three files                                                           | `templates.md` §SETUP            |
| "regenerate status"                             | `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` → commit         | `sprint-system.md` §Scripts      |
| "sync stories to PRD"                           | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/`                     | `sprint-system.md` §5-layer      |
| "inject tasks from AC"                          | `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --story US-X.Y` | `sprint-system.md` §Scripts      |
| "backfill changelog SHAs"                       | `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/`        | `sprint-system.md` §Scripts      |
| "standardize output from [tool]"                | Map tool output to canonical docs/ structure                                              | §1 Pipeline                        |

---

## 6. Reference files

Load these on demand based on user intent:

| File                                  | When to load                                                             | Contents                                                          |
| ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `references/rules.md`               | User asks about rules, pre-commit check, or rule violation surfaces      | 9 core rules with severity, compliance steps, grep checks         |
| `references/templates.md`           | User asks to create/update any document                                  | 11 template types with filled examples                            |
| `references/sprint-system.md`       | User asks about sprints, agile workflow, scripts, or 5-layer consistency | Naming conventions, scripts, consistency check, setup guide       |
| `references/migration-from-bmad.md` | User asks to migrate from BMad to koni-docs                              | Architecture comparison, artifact mapping, step-by-step procedure |

**Plugin skills**: If the project's CLAUDE.md declares `koni-docs-plugins`, load those skills for technology-specific rules that extend the core rule set.

---

## 7. Bundled scripts

This skill ships with automation scripts in its `scripts/` directory. Per the skill-creator bundled-resources pattern, **scripts are executed directly from the skill path** — no copying into the project is needed.

### How to run

Always run scripts from the skill's own `scripts/` directory via `node`:

```bash
node skills/koni-docs/scripts/<script>.mjs --docs-path docs/
```

All scripts accept:

- `--docs-path <path>` — override the default `docs/` path (always pass this)
- `--dry-run` — preview changes without writing

### Script inventory

| Script                             | Purpose                                                                             | Example                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `generate-status.mjs`            | Regenerate `STATUS.md` kanban from all story frontmatter                          | `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/`                   |
| `agile-sync-up.mjs`              | Propagate story status through all 5 doc layers (EPIC, PRD §7, PRD §4 FR, sprint) | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/`                     |
| `agile-inject-tasks.mjs`         | Regenerate Tasks section from Acceptance Criteria (AC is canonical)                 | `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --story US-2.1` |
| `agile-backfill-fields.mjs`      | Add missing frontmatter fields to existing stories                                  | `node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path docs/`             |
| `changelog-backfill-commits.mjs` | Replace "pending" commit SHAs in CHANGELOG with real SHAs from git history          | `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/`        |

### Optional: npm convenience script

If the project wants `npm run agile:status` for human devs, add to `package.json`:

```json
"scripts": {
  "agile:status": "node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/"
}
```

The agent always uses the direct `node skills/koni-docs/scripts/...` path — the npm script is purely a convenience alias for humans.
