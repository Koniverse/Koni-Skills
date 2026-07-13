---
name: koni-docs
description: >
  Use when working on any koni-docs artifact — PRD, ARCHITECTURE, CHANGELOG,
  CONTEXT, LESSONS, SETUP, DESIGN, or Sprints (epics / stories / STATUS): update
  docs, create or split a story, record a decision, write a LESSONS entry, write
  a changelog entry, run the pre-commit doc checklist, open or close a sprint,
  regenerate STATUS.md / the kanban, or run the koni-docs CLI (sync / status /
  validate). Also for a story's deadline — setting or moving its `due` date,
  "when is this due", "what's overdue or due soon". Also when BMad / GStack /
  Superpowers output needs standardizing into docs/. NOT test docs or QC
  (koni-qc); NOT commit gates or the agentic loop (koni-harness); NOT repo
  bootstrap (koni-setup).
---
# koni-docs — Documentation Management

> **One rule above all others**: every code-shipping commit updates docs in
> the SAME commit. Never defer documentation to a follow-up.
>
> One carve-out, and only one: a commit's own SHA cannot be inside it. If a SHA
> is recorded at all, it is backfilled by a follow-up commit — never `--amend`-ed
> in, which orphans it (RULE-2).

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
├── sprints/
│   ├── README.md      ← agile schema + workflow
│   ├── STATUS.md      ← AUTO-GENERATED kanban (never hand-edit)
│   ├── epics/         ← EPIC-N.md
│   ├── stories/       ← US-X.Y-<slug>.md (canonical task source)
│   ├── sprint-YYYY-WNN.md  ← active sprint
│   └── archive/       ← closed sprints
└── tests/
    ├── test-cases/    ← EPIC-N.md (epic-level scenarios: E2E + REG + SMK + matrix)
    │   └── README.md
    └── test-reports/  ← execution history (path owned by koni-qc test-organization)
        ├── EPIC-NN/<MMDDYYYY>/report.md  ← per-execution detail (auto; report-manual.md = manual)
        └── releases/  ← vX.Y.Z.md (per-release aggregate)

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

These 12 rules apply to ALL Koniverse projects. Full enforcement details in `references/rules.md`.

| Rule    | Summary                                                       | Group      |
| ------- | ------------------------------------------------------------- | ---------- |
| RULE-1  | VERSION + CHANGELOG in same commit                            | Pre-commit |
| RULE-2  | A recorded SHA is real + reachable — never "pending", never `--amend`-ed in | Pre-commit |
| RULE-5  | STATUS.md auto-generated, never hand-edit                     | Post-gen   |
| RULE-6  | Story id must match filename + PRD `Epics & User Stories`    | During     |
| RULE-7  | CONTEXT.md append-only, corrections via revision entry        | During     |
| RULE-10 | Mark tasks [x] as you complete them                           | During     |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example in same commit   | Pre-commit |
| RULE-13 | English-only for code, comments, UI, errors, commits, docs    | During     |
| RULE-14 | Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: | Pre-commit |
| RULE-15 | `assignee:` is the GitHub login — never git user.name         | During     |
| RULE-16 | `version_shipped:` is bare semver — never `v`-prefixed        | During     |
| RULE-17 | Frontmatter ID fields = bare canonical IDs only, never prose  | During     |

**Technology-specific rules** (Supabase, Next.js) live in plugin skills. When a project declares `koni-docs-plugins: [supabase, nextjs]` in its CLAUDE.md, load those plugin skills for the additional rules.
See [`references/plugin-pattern.md`](references/plugin-pattern.md) for how plugin skills are structured, discovered (`koni-docs-plugins:`), and composed; `koni-nextjs` is the reference.

---

## 3. Workflow — task lifecycle

### 3a. Before writing any code

1. **Read LESSONS.md** — skim all entry titles; full-read 2-4 entries matching your domain.
2. **Read DESIGN.md** if any UI is involved.
3. **Find or create the story** in `docs/sprints/stories/`:
   - Flip `status:` → `in-progress`
   - Set `sprint:` to the active sprint id
   - Set `due:` **only** if the work owes someone a date from *outside* the
     sprint rhythm (contract, customer demo, audit, filing). "Must land this
     sprint" is not a `due` — `sprint:` already says that, and `sprint.end` is
     never inherited. When you do set it, write the date in frontmatter and the
     *reason* in the story's `## Deadline` section. See
     [`sprint-system.md` §Deadlines vs sprint cadence](references/sprint-system.md).
   - If no story exists, create a stub using the full story template (`references/templates/story.md`) before starting.
   - **Size it.** Fibonacci only (1/2/3/5/8/13). For non-engineering work
     (sales / marketing / content / ops), invoke the domain skill to cross-check
     the estimate *before* assigning `points:` — gut-feel undersizes that work by
     30-40%, especially when it waits on external parties. `/sales-engineer` for
     B2B sales artifacts; `/marketing-ops` for lifecycle / CRO / content / ads;
     both when the story spans them; skip for pure engineering. The calibration
     scale and the evidence behind it:
     [`sprint-system.md` §Story sizing](references/sprint-system.md).
4. **Update the sprint file** — ensure the story row exists in the active sprint scope table.

### 3b. During implementation

- Mark tasks `[x]` in the story file **as you complete them**, not all at the end (RULE-10).
- If you make an architecture or scope decision, append a `CONTEXT.md` entry immediately (see `references/templates/context.md`).
- If you encounter a trap or discover a reusable pattern, append a `LESSONS.md` entry.

### 3c. Pre-commit checklist

Run through every item before committing:

```
[ ] VERSION bumped per semver rule
[ ] CHANGELOG.md — story's "Changelog entry" section copied in, SAME commit (RULE-1). A recorded SHA is backfilled in a follow-up commit, never `--amend`-ed in (RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] BRIEF.md updated if product vision, scope, or success criteria changed
[ ] CONTEXT.md has new entry if a decision was made
[ ] SETUP.md + DEPLOY.md + .env.example updated if new env var (RULE-11)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x]
[ ] No story overdue-and-silent — close it, or move `due` WITH a CONTEXT.md entry (old → new → why)
[ ] npx koni-docs sync --docs-path docs/  (5-layer sync)
[ ] npx koni-docs status --docs-path docs/  (STATUS.md — RULE-5)
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
| "create a story for US-X.Y"                     | Verify US-X.Y exists in PRD `Epics & User Stories`, use full story template. For retroactive/codebase-discovered stories, set `assignee` to the commit author's GitHub **login** (`gh api repos/{owner}/{repo}/commits/<sha> --jq .author.login`) — never `git log --format=%an` (that is git `user.name`, which RULE-15 forbids) and never the session user | `templates/story.md` §1                    |
| "start story US-X.Y"                            | §3a flow: read LESSONS → DESIGN.md → flip `status: in-progress`                           | `rules.md` §RULE-6                         |
| "close / complete story US-X.Y"                 | §3c checklist + 5-layer check + `npx koni-docs sync` then `status`                                          | `sprint-system.md` §5-layer                |
| "log a decision" / "record architecture choice" | Find highest D`<N>`, append decision entry                                                | `templates/context.md`                     |
| "revise / correct decision D`<N>`"              | Append revision entry, never edit original (RULE-7)                                       | `templates/context.md` §3 (revision entry)           |
| "add a lesson" / "log a lesson"                 | Find highest entry number, append LESSONS entry                                           | `templates/lessons.md`                     |
| "write changelog for vX.Y.Z"                    | Append CHANGELOG entry, bump VERSION simultaneously                                       | `templates/changelog.md`                   |
| "create / update architecture"                  | Create or update ARCHITECTURE.md with tech stack, components, data flow                   | `templates/architecture.md`                |
| "create brief" / "update brief" / "product brief" | Create or update BRIEF.md from BMad brainstorm/brief output                             | `templates/brief.md`                       |
| "update PRD for [feature]"                      | Update both FR table row AND §11 story entry                                              | `templates/prd.md`                         |
| "create design spec for US-X.Y"                 | Use design spec template                                                                  | `templates/design-spec.md`                 |
| "create an epic"                                | Use full epic template                                                                    | `templates/epic.md`                        |
| "create sprint file"                            | Use sprint template                                                                       | `templates/sprint.md`                      |
| "create / update test-cases for EPIC-N"         | Use test-cases template (10-section layout: Scope / Stories in scope / Goals / Env / Cadence / Quick reference / Detail / Coverage matrix / Open) | `templates/test-cases.md`                  |
| "record a test run for EPIC-N"                  | Use per-execution sub-template — write to `test-reports/EPIC-NN/<MMDDYYYY>/report.md` (auto) / `report-manual.md` (path owned by koni-qc test-organization) | `templates/test-report.md` §A              |
| "create release test report for vX.Y.Z"         | Use per-release sub-template — write to `releases/vX.Y.Z.md`, link from CHANGELOG          | `templates/test-report.md` §B              |
| "update setup for new env var"                  | RULE-11: update SETUP + DEPLOY + .env.example in same commit                              | `templates/setup.md`                       |
| "create OKR ledger" / "set up quarterly OKRs"   | Use OKR template (file-native quarterly Markdown ledger)                                  | `templates/okr.md`                         |
| "wire koni-docs into project" / "refresh Active Context" | Update CLAUDE.md + AGENTS.md (+ `.active-context.md` for Pattern B) integration blocks | `templates/integration.md`        |
| "adopt active-context split" / "move active context out of CLAUDE.md" | Pattern B: create `.active-context.example.md` + `.active-context.md` + gitignore + CLAUDE.md pointer | `templates/integration.md` §2 |
| "make AGENTS.md canonical" / "slim CLAUDE.md" / "AGENTS-canonical convention" | Apply §3.1 convention: CLAUDE.md keeps only pointer + Koni-Docs Integration + Active Context; AGENTS.md absorbs project structure / docs links / conventions | `templates/integration.md` §3.1 |
| "what templates exist?"                         | Browse the index                                                                          | `templates.md` (thin index)                |
| "run doc checklist" / "pre-commit check"        | Walk §3c checklist item by item                                                           | `rules.md` + `sprint-system.md`            |
| "regenerate status"                             | `npx koni-docs status --docs-path docs/` → commit                                         | `cli.md` §4                |
| "sync stories to PRD"                           | `npx koni-docs sync --docs-path docs/`                                                    | `sprint-system.md` §5-layer                |
| "inject tasks from AC"                          | `npx koni-docs inject-tasks --docs-path docs/ --story US-X.Y`                             | `cli.md` §4                |
| "backfill changelog SHAs"                       | `npx koni-docs backfill-commits --docs-path docs/`                                        | `cli.md` §4                |
| "standardize output from [tool]"                | Map tool output to canonical docs/ structure                                              | §1 Pipeline                                |
| "fix prd_ref" / "what goes in prd_ref / arch_ref / depends_on" / "AD-N in story frontmatter" / "sync warns row not found" / "migrate frontmatter" | Apply the per-field contract; move AD-N to `arch_ref`, US-X.Y to `depends_on`, prose to body | `frontmatter-spec.md` + `rules.md` RULE-17 |

---

## 6. Reference files

Load these on demand based on user intent:

| File                                  | When to load                                                             | Contents                                                          |
| ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `references/rules.md`                 | User asks about rules, pre-commit check, or rule violation surfaces      | 12 core rules with severity, compliance steps, grep checks        |
| `references/frontmatter-spec.md`      | Authoring / migrating story / epic / sprint frontmatter; debugging `sync` row-not-found warnings | Authoritative per-field contract for `prd_ref` / `arch_ref` / `depends_on` / etc. Per-namespace regex, anti-pattern catalog with real broken values, migration playbook for projects carrying prose-stuffed ref fields. Pair with RULE-17. |
| `references/templates.md`             | User asks "what templates exist?" or needs to navigate templates         | Thin index — names each template, when to use it, links to the canonical file. Also has quick frontmatter cheatsheet for Story/Epic/Sprint. |
| `references/templates/changelog.md`   | Writing changelog entry / shipping a version                             | CHANGELOG entry template, rules (RULE-1/RULE-2), safe-insertion pattern (anchor on `[Unreleased]`), filled example |
| `references/templates/context.md`     | Recording a decision or revision (append-only, RULE-7)                   | Phase header + decision entry + revision entry templates, anti-patterns table, filled example (D3 TAM pivot) |
| `references/templates/lessons.md`     | Codifying a recurring trap / pattern                                     | Entry template, maintenance rules, filled example (`next build` vs `tsc`) |
| `references/templates/brief.md`       | Creating/updating product brief (precedes PRD Executive Summary)         | 8-section template (Exec / Problem / Solution / Differentiator / Persona / Success / Scope / Vision), filled example (Koni ERP brief) |
| `references/templates/prd.md`         | Creating/updating PRD (label-only H2 sections, FR row, story entry, Epics & User Stories index) | Heading convention + full template skeleton, update procedure, FR row format, story-in-PRD entry, condensed filled snippet, legacy-numbered-PRD migration steps |
| `references/templates/architecture.md` | Documenting tech stack / components / data / AD-N summary table         | Full ARCHITECTURE template (overview / stack / components / data / API / security / deploy / integrations / ADs), filled example |
| `references/templates/design-spec.md` | A story has visual or interaction complexity warranting a dedicated spec | Header refs + screens/states + layout decisions + component inventory + open questions, filled example (US-3.7 pod project) |
| `references/templates/epic.md`        | Creating/updating an epic                                                | Full BMad-grade Epic template — per-section guidance, required-vs-optional matrix by epic size, Mermaid patterns for entity maps + happy-path sequence diagrams, filled mini-example |
| `references/templates/story.md`       | Creating/stubbing/updating a story                                       | Full BMad-grade Story template — per-section guidance, required-vs-optional matrix by story size (1-13 pts), AC numbering rules, verification-command table pattern, filled mini-example |
| `references/templates/sprint.md`      | Opening or closing a sprint                                              | Frontmatter + Sprint scope table + goal recap + phased plan + retrospective + cross-references, filled example (sprint-2026-W19) |
| `references/templates/setup.md`       | Adding an env var (RULE-11 — all three files in same commit)             | SETUP block format + .env.example format + DEPLOY env table + RULE-11 checklist, filled examples for all three |
| `references/templates/okr.md`         | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md`                 | File-naming rule, YAML schema, KR formula rules (SELECT-only, end-exclusive boundaries), weekly notes, permissions, filled example (2026-Q2.md) |
| `references/templates/integration.md` | Wiring koni-docs into a new project, refreshing Active Context           | CLAUDE.md `Koni-Docs Integration` block + AGENTS.md reference block + 7 trigger points for Active Context updates, filled example |
| `references/templates/test-cases.md`  | Creating / updating per-epic test scenarios (`docs/tests/test-cases/EPIC-N.md`) | 10-section skeleton — Scope / Stories in scope (emoji status) / Goals / Env / Cadence / Quick reference summary / Detail (Gherkin) / Coverage matrix (with "AC description" column) / Open. Per-section guidance + filled EPIC-02 mini-example |
| `references/templates/test-report.md` | Recording a test run or release-level report (`docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/report.md` + `releases/vX.Y.Z.md`; path owned by koni-qc test-organization) | Two sub-templates: A) per-execution detail (one file per run, append-only) — B) per-release master (aggregate linked from CHANGELOG). Result symbols, append-only discipline, cross-link contract |
| `references/sprint-system.md`         | User asks about sprints, agile workflow, scripts, 5-layer consistency, or test artifacts | Naming conventions, story sizing, deadlines vs cadence, consistency check, setup guide, **§Test artifacts** (10-section test-cases structure + reports lifecycle) |
| `references/bmad-template-analysis.md` | User asks to migrate from BMad, asks about BMad template standards, or maps BMad artifacts to koni-docs | Full BMad pipeline → koni-docs mapping, template differences, update recommendations |
| `references/cli.md`                   | Installing / upgrading / invoking the `koni-docs` CLI; looking up a subcommand, a global flag, or the typed lib API | Install + update modes, global flags, the 7-subcommand inventory, the four commit loops, intent → subcommand map, library API, troubleshooting |

**Plugin skills**: If the project's CLAUDE.md declares `koni-docs-plugins`, load those skills for technology-specific rules that extend the core rule set.
See [`references/plugin-pattern.md`](references/plugin-pattern.md) for the pattern (location / discovery / composition / authoring); `koni-nextjs` is the worked example.

---

## 7. CLI tool — `@koniverse/koni-docs`

Every `koni-docs <cmd>` this skill tells you to run comes from the companion CLI,
installed per repo as a devDep (`npx koni-docs …`) or globally. Run
`npx koni-docs --version` to see what you actually have — this skill deliberately
pins no version number.
The seven subcommands, in one line each:

| Subcommand | Does |
|---|---|
| `status` | Regenerate `STATUS.md` — the kanban **and** the `## ⏰ Deadlines` board (RULE-5) |
| `sync` | Propagate a story's status up through Epic / PRD / Sprint |
| `validate` | ID-graph + FR-ref integrity, and `due`-date checking. Exits non-zero on error |
| `inject-tasks` | Rebuild a story's `## Tasks` from its Acceptance criteria |
| `backfill-fields` | Add missing standard frontmatter keys to story files |
| `backfill-commits` | **Repair only** — a CHANGELOG that already shipped with `pending` SHAs |
| `preview` | Astro SSR docs viewer (`--watch` for live-reload) |

**Everything else — install modes, upgrade, global flags, the exact commit
loops, the typed lib API, troubleshooting — lives in
[`references/cli.md`](references/cli.md).** Load it when you need to run, install,
or import the CLI; you do not need it to decide *what* to document.
