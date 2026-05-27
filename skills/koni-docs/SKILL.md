---
name: koni-docs
description: >
  Manages all documentation artifacts in the koni-docs framework: SETUP,
  PRD, ARCHITECTURE, LESSONS, CHANGELOG, CONTEXT, DESIGN, and Sprints (epics /
  stories / sprint files / STATUS). Use when the user asks to update docs,
  create a story, record a decision, log a lesson, write a changelog entry,
  document system architecture, run the pre-commit doc checklist, or when any
  planning tool (BMad, GStack, Superpowers) produces artifacts that need
  standardization into the docs/ structure.
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
├── BRIEF.md           ← product brief: executive summary, problem, solution, scope, vision
├── PRD.md             ← product spec: Epics / User Stories / Tasks
├── ARCHITECTURE.md    ← system architecture: tech stack, components, data, API, infra
├── CHANGELOG.md       ← full release history (every version)
├── CONTEXT.md         ← decision log (append-only, never rewrite)
├── LESSONS.md         ← recurring traps + patterns
├── design/            ← per-story design specs (US-X.Y-<slug>-design.md)
├── okr/               ← (optional) file-native quarterly OKR ledgers (YYYY-QN.md)
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

### Vietnamese counterpart convention (`*.vi.md`)

Some Koniverse projects (e.g. senti_quant) ship Vietnamese translations
of canonical docs as `*.vi.md` siblings — e.g. `docs/PRD.vi.md` next to
`docs/PRD.md`. **English is canonical** (per RULE-13): all sync scripts,
grep checks, and verification commands operate on `*.md` (no `.vi`
infix). The `.vi.md` files are:

- **Optional** — projects opt in per their team's language preference.
- **Never authoritative** — if `*.md` and `*.vi.md` disagree, `*.md` wins.
- **Skipped by sync scripts** — `generate-status.mjs` /
  `agile-sync-up.mjs` filter to `.md`-only files that DON'T match
  `*.vi.md`. Frontmatter parsing, AC counting, status propagation: all
  English-only.
- **Per-story discretion** — translate the stories that need broad
  cross-team review; leave engineering-detail stories English-only.

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

These 11 rules apply to ALL Koniverse projects. Full enforcement details in `references/rules.md`.

| Rule    | Summary                                                       | Group      |
| ------- | ------------------------------------------------------------- | ---------- |
| RULE-1  | VERSION + CHANGELOG in same commit                            | Pre-commit |
| RULE-2  | CHANGELOG commit hash mandatory, never "pending"              | Pre-commit |
| RULE-5  | STATUS.md auto-generated, never hand-edit                     | Post-gen   |
| RULE-6  | Story id must match filename + PRD §11                       | During     |
| RULE-7  | CONTEXT.md append-only, corrections via revision entry        | During     |
| RULE-10 | Mark tasks [x] as you complete them                           | During     |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example in same commit   | Pre-commit |
| RULE-13 | English-only for code, comments, UI, errors, commits, docs    | During     |
| RULE-14 | Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: | Pre-commit |
| RULE-15 | `assignee:` is the GitHub login — never git user.name         | During     |
| RULE-16 | `version_shipped:` is bare semver — never `v`-prefixed        | During     |

**Technology-specific rules** (Supabase, Next.js) live in plugin skills. When a project declares `koni-docs-plugins: [supabase, nextjs]` in its CLAUDE.md, load those plugin skills for the additional rules.

---

## 3. Workflow — task lifecycle

### 3a. Before writing any code

1. **Read LESSONS.md** — skim all entry titles; full-read 2-4 entries matching your domain.
2. **Read DESIGN.md** if any UI is involved.
3. **Find or create the story** in `docs/sprints/stories/`:
   - Flip `status:` → `in-progress`
   - Set `sprint:` to the active sprint id
   - If no story exists, create a stub using the full story template (`references/templates/story.md`) before starting.
4. **Update the sprint file** — ensure the story row exists in the active sprint scope table.

### 3b. During implementation

- Mark tasks `[x]` in the story file **as you complete them**, not all at the end (RULE-10).
- If you make an architecture or scope decision, append a `CONTEXT.md` entry immediately (see `references/templates/context.md`).
- If you encounter a trap or discover a reusable pattern, append a `LESSONS.md` entry.

### 3c. Pre-commit checklist

Run through every item before committing:

```
[ ] VERSION bumped per semver rule
[ ] CHANGELOG.md — story's "Changelog entry" section copied in, commit SHA filled (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] BRIEF.md updated if product vision, scope, or success criteria changed
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

Every Koniverse project must have an active context block. Agent updates that block at specific trigger points (T1–T7 below).

There are **two valid patterns** for where the Active Context block lives. Pick one per project; do not mix. Full template + rationale lives in [`references/templates/integration.md`](references/templates/integration.md) §0.

| Pattern | When to use | Active Context lives in |
|---|---|---|
| **A — Inline** | Solo developer, one active branch, low merge volume | `CLAUDE.md` between `koni-docs:auto-update` markers |
| **B — File-extracted (recommended for teams)** | 2+ developers, parallel branches, frequent sprint churn | `.active-context.md` (gitignored) — `CLAUDE.md` keeps a pointer; `.active-context.example.md` committed as template |

**Why a separate file for teams**: the Active Context block changes on every story start, close, sprint roll, decision, and lesson — many times per week. Two devs editing it on parallel branches always merges as a conflict. Pattern B moves the volatile content into a gitignored snapshot; the durable record stays in `docs/sprints/`, `CHANGELOG.md`, `CONTEXT.md`, `LESSONS.md`. Conflicts go to zero.

### CLAUDE.md integration block (config — common to both patterns)

```markdown
## Koni-Docs Integration

koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION
```

### Active Context — Pattern A (inline in CLAUDE.md)

```markdown
## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: 🟡 US-X.Y <title>
- Last Version: vX.Y.Z
- Recent Decisions: D<N>
- Recent Lessons: §N
<!-- /koni-docs:auto-update -->
```

### Active Context — Pattern B (file-extracted, recommended for teams)

`CLAUDE.md` keeps only a pointer:

```markdown
## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md)
> for the template and the gitignored-on-purpose rationale.
```

`.active-context.md` (gitignored) holds the live snapshot — both a `Local developer` block (GitHub login, git name/email, workspace, current branch) and the auto-update `Project sprint context` block. `.active-context.example.md` is committed as the team template; contributors copy it on first checkout. Full template in [`references/templates/integration.md`](references/templates/integration.md) §2.

### Trigger points (same for both patterns)

| #  | Trigger                | Action                                               |
| -- | ---------------------- | ---------------------------------------------------- |
| T1 | Start a story          | Add `🟡 US-X.Y <title>` to Active Stories          |
| T2 | Close a story          | Change `🟡 → ✅`, update Last Version             |
| T3 | Start a sprint         | Update Sprint ID                                     |
| T4 | Add a LESSONS entry    | Append LESSONS.md + add §N to Recent Lessons        |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D`<N>` to Recent Decisions |
| T6 | Add an env var         | Update SETUP + DEPLOY + .env.example (RULE-11)       |
| T7 | Pre-commit             | Run full checklist, verify all doc layers consistent |

**How to update**: Use the `Edit` tool targeting the block between `<!-- koni-docs:auto-update -->` and `<!-- /koni-docs:auto-update -->` markers. For Pattern A the markers live in `CLAUDE.md`; for Pattern B they live in `.active-context.md`. Either way, only the marker block changes — surrounding content stays untouched.

---

## 5. Activation — how to use this skill

Every document template lives in its own file under
[`references/templates/`](references/templates/). Load only the template
file matching the user's request.

| User request                                    | Action                                                                                    | Load                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| "create a story for US-X.Y"                     | Verify US-X.Y exists in PRD §11, use full story template                                  | `templates/story.md`                       |
| "start story US-X.Y"                            | §3a flow: read LESSONS → DESIGN.md → flip `status: in-progress`                           | `rules.md` §RULE-6                         |
| "close / complete story US-X.Y"                 | §3c checklist + 5-layer check + run agile:status                                          | `sprint-system.md` §5-layer                |
| "log a decision" / "record architecture choice" | Find highest D`<N>`, append decision entry                                                | `templates/context.md`                     |
| "revise / correct decision D`<N>`"              | Append revision entry, never edit original (RULE-7)                                       | `templates/context.md` §Revision           |
| "add a lesson" / "log a lesson"                 | Find highest entry number, append LESSONS entry                                           | `templates/lessons.md`                     |
| "write changelog for vX.Y.Z"                    | Append CHANGELOG entry, bump VERSION simultaneously                                       | `templates/changelog.md`                   |
| "create / update architecture"                  | Create or update ARCHITECTURE.md with tech stack, components, data flow                   | `templates/architecture.md`                |
| "create brief" / "update brief" / "product brief" | Create or update BRIEF.md from BMad brainstorm/brief output                             | `templates/brief.md`                       |
| "update PRD for [feature]"                      | Update both FR table row AND §11 story entry                                              | `templates/prd.md`                         |
| "create design spec for US-X.Y"                 | Use design spec template                                                                  | `templates/design-spec.md`                 |
| "create an epic"                                | Use full epic template                                                                    | `templates/epic.md`                        |
| "create sprint file"                            | Use sprint template                                                                       | `templates/sprint.md`                      |
| "update setup for new env var"                  | RULE-11: update SETUP + DEPLOY + .env.example in same commit                              | `templates/setup.md`                       |
| "create OKR ledger" / "set up quarterly OKRs"   | Use OKR template (file-native quarterly Markdown ledger)                                  | `templates/okr.md`                         |
| "wire koni-docs into project" / "refresh Active Context" | Update CLAUDE.md + AGENTS.md (+ `.active-context.md` for Pattern B) integration blocks | `templates/integration.md`        |
| "adopt active-context split" / "move active context out of CLAUDE.md" | Pattern B: create `.active-context.example.md` + `.active-context.md` + gitignore + CLAUDE.md pointer | `templates/integration.md` §2 |
| "make AGENTS.md canonical" / "slim CLAUDE.md" / "AGENTS-canonical convention" | Apply §3.1 convention: CLAUDE.md keeps only pointer + Koni-Docs Integration + Active Context; AGENTS.md absorbs project structure / docs links / conventions | `templates/integration.md` §3.1 |
| "what templates exist?"                         | Browse the index                                                                          | `templates.md` (thin index)                |
| "run doc checklist" / "pre-commit check"        | Walk §3c checklist item by item                                                           | `rules.md` + `sprint-system.md`            |
| "regenerate status"                             | `node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/` → commit            | `sprint-system.md` §Scripts                |
| "sync stories to PRD"                           | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/`                       | `sprint-system.md` §5-layer                |
| "inject tasks from AC"                          | `node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --story US-X.Y`   | `sprint-system.md` §Scripts                |
| "backfill changelog SHAs"                       | `node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/`          | `sprint-system.md` §Scripts                |
| "standardize output from [tool]"                | Map tool output to canonical docs/ structure                                              | §1 Pipeline                                |

---

## 6. Reference files

Load these on demand based on user intent:

| File                                  | When to load                                                             | Contents                                                          |
| ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `references/rules.md`                 | User asks about rules, pre-commit check, or rule violation surfaces      | 9 core rules with severity, compliance steps, grep checks         |
| `references/templates.md`             | User asks "what templates exist?" or needs to navigate templates         | Thin index — names each template, when to use it, links to the canonical file. Also has quick frontmatter cheatsheet for Story/Epic/Sprint. |
| `references/templates/changelog.md`   | Writing changelog entry / shipping a version                             | CHANGELOG entry template, rules (RULE-1/RULE-2), safe-insertion pattern (anchor on `[Unreleased]`), filled example |
| `references/templates/context.md`     | Recording a decision or revision (append-only, RULE-7)                   | Phase header + decision entry + revision entry templates, anti-patterns table, filled example (D3 TAM pivot) |
| `references/templates/lessons.md`     | Codifying a recurring trap / pattern                                     | Entry template, maintenance rules, filled example (`next build` vs `tsc`) |
| `references/templates/brief.md`       | Creating/updating product brief (precedes PRD §1)                        | 8-section template (Exec / Problem / Solution / Differentiator / Persona / Success / Scope / Vision), filled example (Koni ERP brief) |
| `references/templates/prd.md`         | Creating/updating PRD §1–§11, FR row, story entry, §11 index             | Full §1–§11 template, update procedure, FR table row format, story-in-PRD entry, condensed filled snippet |
| `references/templates/architecture.md` | Documenting tech stack / components / data / AD-N summary table         | Full ARCHITECTURE template (overview / stack / components / data / API / security / deploy / integrations / ADs), filled example |
| `references/templates/design-spec.md` | A story has visual or interaction complexity warranting a dedicated spec | Header refs + screens/states + layout decisions + component inventory + open questions, filled example (US-3.7 pod project) |
| `references/templates/epic.md`        | Creating/updating an epic                                                | Full BMad-grade Epic template — per-section guidance, required-vs-optional matrix by epic size, Mermaid patterns for entity maps + happy-path sequence diagrams, filled mini-example |
| `references/templates/story.md`       | Creating/stubbing/updating a story                                       | Full BMad-grade Story template — per-section guidance, required-vs-optional matrix by story size (1-13 pts), AC numbering rules, verification-command table pattern, filled mini-example |
| `references/templates/sprint.md`      | Opening or closing a sprint                                              | Frontmatter + Sprint scope table + goal recap + phased plan + retrospective + cross-references, filled example (sprint-2026-W19) |
| `references/templates/setup.md`       | Adding an env var (RULE-11 — all three files in same commit)             | SETUP block format + .env.example format + DEPLOY env table + RULE-11 checklist, filled examples for all three |
| `references/templates/okr.md`         | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md`                 | File-naming rule, YAML schema, KR formula rules (SELECT-only, end-exclusive boundaries), weekly notes, permissions, filled example (2026-Q2.md) |
| `references/templates/integration.md` | Wiring koni-docs into a new project, refreshing Active Context           | CLAUDE.md `Koni-Docs Integration` block + AGENTS.md reference block + 7 trigger points for Active Context updates, filled example |
| `references/sprint-system.md`         | User asks about sprints, agile workflow, scripts, or 5-layer consistency | Naming conventions, scripts, consistency check, setup guide       |
| `references/migration-from-bmad.md`   | User asks to migrate from BMad to koni-docs                              | Architecture comparison, artifact mapping, step-by-step procedure |
| `references/bmad-template-analysis.md` | User asks about BMad template standards, or mapping BMad artifacts to koni-docs | Full BMad pipeline → koni-docs mapping, template differences, update recommendations |

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
| `agile-sync-up.mjs`              | Propagate story status through all 5 doc layers (EPIC, PRD §11, PRD §8 FR, sprint) | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/`                     |
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

### Regression test

Before changing any sync script, run the self-contained integration test:

```bash
node skills/koni-docs/scripts/__tests__/sync-test.mjs
```

The test builds its own fixture in a tmpdir, exercises all 5 sync scripts
against mixed old/new template shapes (4-col EPIC, 5-col EPIC with Goal,
per-story PRD §7 section, per-epic PRD §11 table, 7-col sprint scope),
and asserts the expected outputs cell-by-cell. Use `--keep` to inspect
the fixture after a failure. Exit code 0 = all pass.
