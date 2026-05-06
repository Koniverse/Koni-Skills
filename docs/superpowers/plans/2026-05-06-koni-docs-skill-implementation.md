# koni-docs Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the 677-line REQUIREMENT.md into a proper skill: 1 SKILL.md (~280 lines) + 3 reference files (rules.md, templates.md, sprint-system.md)

**Architecture:** Extract and reorganize content from REQUIREMENT.md into the target structure. Remove technology-specific rules (→ plugin skills). Add pipeline integration guide, CLAUDE.md update mechanism, and filled examples. Keep total under ~980 lines across all files.

**Tech Stack:** Markdown with YAML frontmatter, skill-creator for validation

**Source:** `skills/koni-docs/REQUIREMENT.md` (677 lines)

**Target structure:**
```
skills/koni-docs/
├── SKILL.md                    (~280 lines)
└── references/
    ├── rules.md                (~200 lines)
    ├── templates.md            (~350 lines)
    └── sprint-system.md        (~150 lines)
```

---

### Task 1: Create directory structure and remove old artifacts

**Files:**
- Create: `skills/koni-docs/references/` (directory)
- Remove: `skills/koni-docs/REQUIREMENT.md` (after content extracted)

- [ ] **Step 1: Create references subdirectory**

```bash
mkdir -p skills/koni-docs/references
```

- [ ] **Step 2: Verify structure**

```bash
ls -la skills/koni-docs/
```
Expected: `REQUIREMENT.md` and `references/` directory exist.

- [ ] **Step 3: Commit**

```bash
git add skills/koni-docs/references/
git commit -m "chore: create references directory for koni-docs skill"
```

---

### Task 2: Write references/rules.md — 9 core rules with enforcement details

**Files:**
- Create: `skills/koni-docs/references/rules.md`
- Source: `skills/koni-docs/REQUIREMENT.md` §1 (HARD RULES), §10 (Common mistakes)

**Rules to include (project-agnostic):**
- RULE-1: VERSION + CHANGELOG same commit
- RULE-2: Commit hash mandatory, never "pending"
- RULE-5: STATUS.md auto-generated
- RULE-6: Story ID match filename + PRD §7
- RULE-7: CONTEXT.md append-only
- RULE-10: Mark tasks [x] as you go
- RULE-11: New env var → SETUP + DEPLOY + .env.example
- RULE-13: English-only
- RULE-14: Commit prefix convention

**Rules EXCLUDED (→ plugin skills):** RULE-3, RULE-4, RULE-8, RULE-9, RULE-12

- [ ] **Step 1: Write the rules.md file**

```markdown
# Core Rules — Detailed Reference

> These 9 rules apply to ALL Koniverse projects regardless of technology stack.
> Technology-specific rules live in plugin skills (koni-docs-supabase, koni-docs-nextjs, etc.)

## Rule Groups

| Group | When enforced |
|-------|---------------|
| Pre-commit | Before `git commit` |
| During work | While writing code/docs |
| Post-generation | After running scripts |

---

## Pre-commit Rules

### RULE-1: VERSION + CHANGELOG in same commit

**Severity**: BLOCKER — violations block merge

**What**: Every code-shipping commit must update both the `VERSION` file AND `Docs/CHANGELOG.md` in the SAME commit. Never defer documentation to a follow-up commit.

**Why**: Keeps version tracking and changelog atomically linked to the code change. A follow-up commit can be missed; a `git bisect` won't find the changelog entry.

**How to comply**:
1. Bump `VERSION` file according to semver rules
2. Add new CHANGELOG entry at top (below `[Unreleased]`)
3. Commit both together with the code changes

**Semver rules**:
| Change type | Bump |
|---|---|
| Breaking schema / public API change | MAJOR |
| New backward-compatible feature (default) | MINOR |
| Bug fix, no new feature | PATCH |

**Grep check**: `git diff --cached --name-only | grep -E "VERSION|CHANGELOG" | wc -l` — must be 2 when code files are staged.

**See**: `templates.md` §CHANGELOG entry, §CHANGELOG safe insertion

---

### RULE-2: Commit hash in CHANGELOG mandatory

**Severity**: BLOCKER

**What**: Every CHANGELOG entry must end with `**Commit**: <7-char SHA>`. The SHA must be real — `pending` is NEVER acceptable.

**Why**: Allows `git log --grep` to find which commit shipped which version. A placeholder SHA breaks bisectability and erodes trust.

**How to comply**:
1. Write the CHANGELOG entry with all content
2. Commit everything
3. Note the 7-char SHA from `git log -1 --format=%h`
4. `git commit --amend` to fill in the SHA
5. Push

**Grep check**: `grep -n "Commit.*pending" Docs/CHANGELOG.md` — must return empty.

**See**: `templates.md` §CHANGELOG entry

---

### RULE-11: New env var → update all three files

**Severity**: BLOCKER

**What**: Adding a new environment variable requires updating ALL three files in the same commit: `Docs/SETUP.md` + `DEPLOY.md` + `.env.example`.

**Why**: A missing env var in SETUP.md blocks new developers. Missing in DEPLOY.md causes production outages. Missing in .env.example makes it undiscoverable.

**How to comply** — all three in same commit:
1. `Docs/SETUP.md` — add to the `.env.local` example block + one-line description
2. `DEPLOY.md` — add to the production env vars table
3. `.env.example` — add the key with placeholder value

**Format for .env.example**:
```bash
# <Category / Feature name> (added in vX.Y.Z)
# <One sentence: what this controls, where to get the value>
NEW_ENV_VAR=<placeholder_or_description>
```

**Format for SETUP.md env block**:
```markdown
# <Category name> (added in vX.Y.Z)
# <What it does — 1 line>
NEW_ENV_VAR=<example_value_or_instructions>
```

**See**: `templates.md` §SETUP.md + DEPLOY.md + .env.example

---

### RULE-14: Commit message prefix

**Severity**: WARNING

**What**: Every commit message must use a conventional prefix: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`.

**Why**: Enables automatic changelog generation and makes `git log --oneline` scannable by intent.

**Note**: Doc-only commits (typo, formatting) do NOT bump VERSION.

---

## During-Work Rules

### RULE-6: Story ID must match across all docs

**Severity**: BLOCKER

**What**: A story's `id:` in frontmatter must exactly match:
1. The filename prefix (e.g., `US-3.7` in `US-3.7-pod-project-management.md`)
2. The PRD §7 entry identifier

One canonical ID per story across all documentation layers.

**Why**: Prevents ID drift between the story file, the sprint board, and the PRD. Mismatched IDs break the 5-layer consistency system.

**How to comply**:
1. Before creating a story, check PRD §7 to confirm the ID
2. If the story doesn't exist in PRD §7, add it first
3. Use the exact same ID in filename, frontmatter `id:`, and PRD reference

**Grep check**: `grep -rn "US-X.Y" Docs/sprints/stories/ Docs/PRD.md` — all references to a story ID must be consistent.

**See**: `templates.md` §Story file, `sprint-system.md` §Naming conventions

---

### RULE-7: CONTEXT.md is append-only

**Severity**: BLOCKER

**What**: Never edit or delete a past CONTEXT.md entry. Corrections get a new `D<N> (revision of D<M>)` entry appended at the end of the current phase.

**Why**: The decision log is a historical record. Rewriting history destroys the "why did we choose X?" trail that future contributors depend on.

**How to comply**:
- **Correction needed?** → Append `### D<N>. <Title> (revision of D<M>)` with `What changed`, `New decision`, `Rationale`
- **Wrong entry?** → Add correction entry; never delete the original
- **Missing rationale?** → "because Y" is mandatory in every entry

**Anti-patterns**:
| Wrong | Correct |
|---|---|
| Edit body of past entry D<M> | Add new D<N> (revision of D<M>) |
| Delete a wrong decision | Add correction entry |
| Leave rationale blank | Always include "because Y" |
| One huge entry for 10 decisions | One entry per decision |

**See**: `templates.md` §CONTEXT.md, §CONTEXT revision entry

---

### RULE-10: Mark tasks as you complete them

**Severity**: WARNING

**What**: Mark story Tasks `[x]` individually as each task is completed, not all at once when the story finishes. Same rule applies to Acceptance Criteria checkboxes.

**Why**: Incremental checkmarks give visibility into progress. Batch-marking at the end hides blockers and makes sprint status inaccurate.

**How to comply**: After completing each Task or AC, immediately update its checkbox from `[ ]` to `[x]` using the Edit tool.

**See**: `sprint-system.md` §Story status flow

---

### RULE-13: English-only for all deliverables

**Severity**: WARNING

**What**: All code, comments, UI strings, error messages, commit messages, and documentation must be in English. Vietnamese is reserved for user chat prompts only.

**Why**: English is the lingua franca of software. Non-English strings in code or docs create barriers for international contributors and tooling.

---

## Post-Generation Rules

### RULE-5: STATUS.md is auto-generated

**Severity**: BLOCKER

**What**: `Docs/sprints/STATUS.md` is auto-generated by `npm run agile:status`. Never hand-edit it.

**Why**: Hand-edits to STATUS.md will be overwritten by the next script run. The file is a derived artifact from story frontmatter — the source of truth is the story files.

**How to comply**: Always run `npm run agile:status` before committing any story status change. If STATUS.md looks wrong, fix the story frontmatter, not STATUS.md.

**Grep check**: N/A — this is a process rule. The script regeneration is the enforcement mechanism.

**See**: `sprint-system.md` §Scripts reference
```

- [ ] **Step 2: Verify line count under 250 lines**

```bash
wc -l skills/koni-docs/references/rules.md
```

- [ ] **Step 3: Verify all 9 rules present**

```bash
grep -c "^### RULE-" skills/koni-docs/references/rules.md
```
Expected: 9

- [ ] **Step 4: Verify no technology-specific rules leaked in**

```bash
grep -i "supabase\|next\|unstable_cache\|NOT NULL\|db push\|SECURITY DEFINER\|npx next build\|RSC" skills/koni-docs/references/rules.md
```
Expected: only in exclusion notes, not as active rules.

- [ ] **Step 5: Commit**

```bash
git add skills/koni-docs/references/rules.md
git commit -m "feat: add koni-docs core rules reference (9 project-agnostic rules)"
```

---

### Task 3: Write references/templates.md — All document templates with filled examples

**Files:**
- Create: `skills/koni-docs/references/templates.md`
- Source: `skills/koni-docs/REQUIREMENT.md` §2 (CHANGELOG), §3 (PRD), §4 (CONTEXT), §5 (LESSONS), §6 (SETUP), §7 (DESIGN), §8 (Sprint templates)

- [ ] **Step 1: Extract and write all templates**

Templates to include (order matters — most-used first):

1. **CHANGELOG entry** — template + filled example + safe insertion method
2. **CONTEXT.md — Decision entry** (D<N>) + Revision entry + Phase header + Anti-patterns table
3. **LESSONS.md — Entry** + Maintenance rules
4. **PRD — FR table row** (§4) + Story entry (§7) + Removal/revert entry
5. **Story file** — Full template with frontmatter (all fields + valid values) + filled example
6. **Epic file** — Template with frontmatter
7. **Sprint file** — Template with frontmatter
8. **DESIGN spec for a story** — Template
9. **SETUP.md env block** + **.env.example format**
10. **CLAUDE.md koni-docs integration block** — The `<!-- koni-docs:auto-update -->` block template
11. **AGENTS.md koni-docs reference block**

```markdown
# Document Templates

> Use the template that matches the user's intent. Each template includes a filled example showing what finished output looks like.

---

## CHANGELOG entry

**Use when**: User asks to write changelog, ship a version, or close a story.

**Template**:
```markdown
## [X.Y.Z] — YYYY-MM-DD — <short descriptive title> — vX.Y.Z

<1-3 sentence description: what shipped and why. Include root cause for bug fixes.>

### Added
- <Feature / component added>

### Changed
- <Behavior or API changed — old vs new>

### Fixed
- <Bug description + root cause in one sentence>

### Removed
- <What was dropped and why>

### Security
- <CVE or hardening detail>

**Commit**: <7-char SHA>
```

**Filled example**:
```markdown
## [0.63.4] — 2026-01-15 — Add pod project management — v0.63.4

Shipped pod-based project grouping with drag-and-drop reordering. Users can now organize projects into custom pods for better workspace navigation.

### Added
- Pod creation and deletion UI in workspace settings
- Drag-and-drop project-to-pod assignment
- Pod filter chips in project list

### Fixed
- Project list not updating after workspace switch (missing `revalidatePath` in workspace change handler)

**Commit**: a1b2c3d
```

**Rules**:
- Only include sections that have content. Omit empty sections.
- `**Commit**: pending` is NEVER acceptable (RULE-2).
- Entries in reverse-chronological order — newest at top.
- Never reorder or edit past entries.
- Version tag appears twice: `[X.Y.Z]` in header AND `— vX.Y.Z` inline — both required for `git log --grep`.

### Safe CHANGELOG insertion

**WRONG** (eats headers):
```
oldString = "## [0.63.3] — ..."
newString = "## [0.63.4] ...\n\n## [0.63.3] — ..."
```

**CORRECT** — anchor on `[Unreleased]`:
```
oldString = "## [Unreleased]\n\n(empty — track here while in dev but not yet shipped)\n\n---"
newString = "## [Unreleased]\n\n(empty...)\n\n---\n\n## [X.Y.Z] — ...\n\n...content..."
```

---

## CONTEXT.md — Decision Log

### Phase header

```markdown
---

## Phase N — <Phase name> (YYYY-MM-DD, shipped vX.Y.Z)
```

### Decision entry (D<N>)

```markdown
### D<N>. <Short decision title>

**Context**: <1-2 sentences: what problem triggered this decision>

**Decision**: <what was decided, specific and concrete>

**Rationale**: <why this option over alternatives — the "because" is mandatory>

**Alternatives considered** (optional):
- Option A — why rejected
- Option B — why rejected

**Impact**: <what this changes in the codebase or product>

**Date**: YYYY-MM-DD
**Version**: vX.Y.Z
```

### Finding the next D<N> number

```bash
grep -n "^### D[0-9]" Docs/CONTEXT.md | tail -5
```
Increment by 1.

### Revision entry (revision of D<M>)

```markdown
### D<N>. <Title> (revision of D<M>)

**What changed**: <what was wrong or outdated in D<M>>

**New decision**: <the corrected or updated decision>

**Rationale**: <why the revision was needed>

**Date**: YYYY-MM-DD
**Version**: vX.Y.Z
```

### Anti-patterns (RULE-7)

| Wrong | Correct |
|---|---|
| Edit body of past entry D<M> | Add new D<N> referencing D<M> |
| Delete a wrong decision | Add correction entry |
| Leave rationale blank ("we chose X") | Always include "because Y" |
| One huge entry covering 10 decisions | One entry per decision |

---

## LESSONS.md — Lessons Learned

**Use when**: A bug required a revert, a library had a non-obvious quirk, a pattern emerged that will recur, or something would save someone 30 minutes.

### Entry template

```markdown
## <N>. <Short title — pattern or trap name>

**What happened (vX.Y.Z → vX.Y+1.Z)**: <concrete incident — 2-4 sentences>

**Why**: <root cause explanation — the mechanism, not just the symptom>

**How to avoid**:
- Rule 1
- Rule 2
- Rule 3

**Pattern** (optional):
```code example if useful```

See [CONTEXT.md D<N>](...) — link to the related decision entry if applicable.
```

### Finding the next entry number

```bash
grep -n "^## [0-9]" Docs/LESSONS.md | tail -5
```

### Maintenance rules
- Number sequentially. Never reuse a number.
- Delete entries only when the library was upgraded or behavior fundamentally changed.
- Reference from commit messages: "Per LESSONS §N".
- Cross-reference from CONTEXT.md and CHANGELOG where relevant.

---

## PRD — Product Requirements Document

### FR table row (§4 Functional requirements)

```markdown
| FR-N | <Requirement description> | P0/P1/P2/P3 | 🚧 In progress / ✅ shipped (vX.Y.Z) / 📋 Backlog | EPIC-N |
```

Priority: `P0` = must-ship/blocking, `P1` = high, `P2` = medium, `P3` = nice-to-have.

### Story entry in PRD §7

```markdown
### US-X.Y — <Story title>

**Status**: 🚧 In progress / ✅ Done (vX.Y.Z) / 📋 Backlog / ⏪ Reverted in vX.Y.Z

**Epic**: EPIC-N

**Goal**: <one sentence — what user outcome this delivers>

**Acceptance criteria**:
- [ ] <criterion 1 — use "Given/When/Then" or declarative>
- [ ] <criterion 2>

**Story file**: [Docs/sprints/stories/US-X.Y-<slug>.md](sprints/stories/US-X.Y-<slug>.md)
```

### Removal / revert entry

```markdown
**Status**: ⏪ Reverted in vX.Y.Z — see CONTEXT D<N>

<One sentence why it was removed. Link to the CONTEXT entry.>
```

---

## DESIGN Spec for a Story

**Use when**: A story has significant visual complexity that warrants a design spec.

**File location**: `Docs/design/US-X.Y-<slug>-design.md`

```markdown
# US-X.Y — <Story title> — Design Spec

## Context
<why this story warrants a design spec — 1 paragraph>

## Screens / states
| Screen | State | Notes |
|---|---|---|
| <name> | empty / loading / populated / error | <any constraint> |

## Layout decisions
<DESIGN.md sections applied (§X) + any deviations with rationale>

## Component inventory
| Component | Source | Notes |
|---|---|---|
| `<Button>` | shadcn/ui primitive | — |
| `<PageHeader>` | `src/components/page-header.tsx` | always use, never inline h1 |

## Open questions
- [ ] <unresolved design choice>
```

---

## Story File — Full Template

**File location**: `Docs/sprints/stories/US-X.Y-<slug>.md`

```markdown
---
id: US-X.Y
title: "<Story title>"
epic: EPIC-X
status: backlog        # backlog | ready | in-progress | review | done | blocked
priority: P1           # P0 | P1 | P2 | P3
points: 5              # Fibonacci: 1 / 2 / 3 / 5 / 8 / 13
sprint:                # nullable while backlog; set to sprint-YYYY-WNN when committed
version_shipped:       # set when status → done (e.g. 0.63.4)
prd_ref: FR-N          # matching PRD §4 functional requirement ID
assignee:              # GitHub login (optional)
commit:                # 7+ char SHA of landing commit (amend-before-push)
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Goal

<1 paragraph: what user outcome this delivers and why it matters now>

## Background

<2-3 paragraphs: why now, what alternatives were considered, surrounding
context that informs the design. Link to CONTEXT.md entries if applicable.>

## Acceptance criteria

- [ ] AC-1: <criterion — use declarative or Given/When/Then>
- [ ] AC-2: <criterion>

## Tasks

- [ ] TASK-X.Y.1 — <first concrete sub-task with file path if applicable>
- [ ] TASK-X.Y.2 — <second>

## Implementation notes

<Workarounds, design tradeoffs, library quirks, security notes
discovered during implementation. Update as you go.>

## Files modified

- `path/to/file.ts` — <what changed and why>

## Cross-references

- [PRD FR-N](../../PRD.md)
- [CHANGELOG vX.Y.Z](../../CHANGELOG.md)
- LESSONS §N — <relevant codified pattern>
- [Design spec](../../design/US-X.Y-<slug>-design.md) (if applicable)
- [CONTEXT D<N>](../../CONTEXT.md) (if a decision was recorded)
```

---

## Epic File — Template

**File location**: `Docs/sprints/epics/EPIC-N.md`

```markdown
---
id: EPIC-X
title: "<Epic title>"
status: in-progress    # backlog | in-progress | done
prd_ref: FR-X.1 .. FR-X.N
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Goal

<1-3 sentences: the user outcome this epic delivers end-to-end>

## Stories

| ID | Title | Status | Version |
|---|---|---|---|
| [US-X.1](../stories/US-X.1-<slug>.md) | <title> | ✅ done | v0.X.0 |
| [US-X.2](../stories/US-X.2-<slug>.md) | <title> | 🚧 in-progress | — |

## Acceptance criteria (propagated from stories)

- [x] <AC from US-X.1>
- [ ] <AC from US-X.2>
```

---

## Sprint File — Template

**File location**: `Docs/sprints/sprint-YYYY-WNN.md`

```markdown
---
id: sprint-YYYY-WNN
status: planned        # planned | in-progress | closed
start: YYYY-MM-DD
end: YYYY-MM-DD
goal: "<Sprint goal — one sentence>"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-X.Y | <title> | EPIC-X | P1 | 5 | 🚧 in-progress | [link](stories/US-X.Y-<slug>.md) |

> **Convention**: AC + Tasks live inside each story file. This sprint file lists planned stories at a glance only.

## Sprint goal recap

<1-2 paragraphs: why these stories were chosen for this window, any
dependencies or sequencing constraints, the "deliverable cut" (what V1 is
and what is deferred to V2).>

## Retrospective

<Filled on sprint close: what went well / what didn't / followups.
Leave empty until close.>
```

---

## SETUP.md + DEPLOY.md + .env.example

### SETUP.md env block format

```markdown
# <Category name> (added in vX.Y.Z)
# <What it does — 1 line>
NEW_ENV_VAR=<example_value_or_instructions>
```

### .env.example format

```bash
# <Category / Feature name> (added in vX.Y.Z)
# <One sentence: what this controls, where to get the value>
NEW_ENV_VAR=<placeholder_or_description>
```

### Checklist (RULE-11)

```
[ ] Docs/SETUP.md  — add to the .env.local example block + one-line description
[ ] DEPLOY.md      — add to the production env vars table
[ ] .env.example   — add the key with placeholder value
```

---

## CLAUDE.md — Koni-Docs Integration Block

**Use when**: Setting up a new Koniverse project, or updating active context.

```markdown
## Koni-Docs Integration
koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: Docs/                   # where docs live
  active_sprint: sprint-YYYY-WNN     # current sprint ID
  version_file: VERSION              # path to semver file

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: 🟡 US-X.Y <title>
- Last Version: vX.Y.Z
- Recent Decisions: D<N>
- Recent Lessons: §N
<!-- /koni-docs:auto-update -->
```

---

## AGENTS.md — Koni-Docs Reference Block

```markdown
## Koni-Docs

This project uses koni-docs for documentation management. All docs follow the
structure defined in `Docs/README.md`. See the koni-docs skill for templates,
rules, and workflows.
```
```

- [ ] **Step 2: Verify line count under 400 lines**

```bash
wc -l skills/koni-docs/references/templates.md
```

- [ ] **Step 3: Verify all 11 template types present**

```bash
grep -c "^## " skills/koni-docs/references/templates.md
```

- [ ] **Step 4: Commit**

```bash
git add skills/koni-docs/references/templates.md
git commit -m "feat: add koni-docs templates reference (11 template types)"
```

---

### Task 4: Write references/sprint-system.md — Sprint conventions, scripts, 5-layer check

**Files:**
- Create: `skills/koni-docs/references/sprint-system.md`
- Source: `skills/koni-docs/REQUIREMENT.md` §8 (sprint system naming, scripts), §9 (5-layer consistency)

- [ ] **Step 1: Write sprint-system.md**

```markdown
# Sprint System — Conventions & Workflow

## Naming conventions (canonical — must match PRD §7 exactly)

| Artifact | Pattern | Example |
|---|---|---|
| Story file | `US-<EPIC>.<N>[.<SUB>]-<slug>.md` | `US-3.7-pod-project-management.md` |
| Story `id:` frontmatter | `US-<EPIC>.<N>[.<SUB>]` | `US-3.7` |
| Task ID (inside story) | `TASK-<US-id>.<n>` | `TASK-3.7.1` |
| Epic file | `EPIC-<N>.md` or `EPIC-DS.md` | `EPIC-3.md` |
| Sprint file | `sprint-YYYY-WNN.md` | `sprint-2026-W19.md` |

## Story status flow

```
backlog → ready → in-progress → review → done
                      ↓
                   blocked  ← document reason in Implementation notes
```

**WIP limit**: at most **3 stories** `in-progress` simultaneously.

**`done` requires**: `version_shipped` set + CHANGELOG entry exists + all AC `[x]`.

## Scripts reference

| Command | What it does | When to run |
|---|---|---|
| `npm run agile:status` | Regenerate `STATUS.md` from all story frontmatter | Before every commit that changes story status |
| `node scripts/agile-sync-up.mjs` | Propagate AC from story → EPIC + PRD §7 | After story status changes |
| `node scripts/agile-inject-tasks.mjs` | Regenerate Tasks from AC (AC is canonical) | When AC changes |
| `node scripts/agile-backfill-fields.mjs` | Backfill `assignee`/`commit`/`sprint` on existing stories | When setting up sprint system in existing project |
| `node scripts/changelog-backfill-commits.mjs` | Backfill missing commit SHAs in CHANGELOG | When SHAs are missing |

**Always run `npm run agile:status` before committing any story status change.**
STATUS.md is auto-generated — never hand-edit it (RULE-5).

## 5-layer consistency check (before merging)

The five layers must be consistent after every story ships. Run `node scripts/agile-sync-up.mjs` to propagate automatically.

| Layer | File | What to verify |
|---|---|---|
| 1 — Story | `Docs/sprints/stories/US-X.Y-*.md` | `status: done`, `version_shipped` set, all AC + Tasks `[x]` |
| 2 — Epic | `Docs/sprints/epics/EPIC-N.md` | Story row checked off; epic `status` updated if all stories done |
| 3 — PRD | `Docs/PRD.md` | FR row `✅ shipped (vX.Y.Z)`; §7 story entry `✅ Done (vX.Y.Z)` |
| 4 — Sprint | `Docs/sprints/sprint-YYYY-WNN.md` | Story row shows done + version |
| 5 — STATUS | `Docs/sprints/STATUS.md` | Regenerated by `npm run agile:status` |

Inconsistency between any two layers = documentation debt. Fix in same commit as the feature.

## Pre-commit checklist

Run through every item before committing:

```
[ ] VERSION bumped per semver rule
[ ] CHANGELOG.md has a new entry — same commit, real SHA, never "pending" (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] CONTEXT.md has new entry if a decision was made
[ ] SETUP.md + DEPLOY.md + .env.example updated if new env var (RULE-11)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x]
[ ] node scripts/agile-sync-up.mjs run  (propagates AC to EPIC + PRD)
[ ] npm run agile:status run  (regenerates STATUS.md — RULE-5)
[ ] CLAUDE.md Active Context block updated (T1-T7 as applicable)
```

## How to set up in a new project

1. Create `Docs/` directory structure per the orientation in SKILL.md §0
2. Add the CLAUDE.md integration block (see `templates.md` §CLAUDE.md)
3. Add the AGENTS.md reference block (see `templates.md` §AGENTS.md)
4. Create initial `VERSION` file (e.g., `0.1.0`)
5. Create initial `CHANGELOG.md` with `[Unreleased]` section
6. If using sprints, create `Docs/sprints/` with `stories/`, `epics/`, `archive/` subdirectories
7. Run `npm run agile:status` to generate initial STATUS.md
```

- [ ] **Step 2: Verify line count under 180 lines**

```bash
wc -l skills/koni-docs/references/sprint-system.md
```

- [ ] **Step 3: Commit**

```bash
git add skills/koni-docs/references/sprint-system.md
git commit -m "feat: add koni-docs sprint-system reference"
```

---

### Task 5: Write SKILL.md — Main skill entry point

**Files:**
- Create: `skills/koni-docs/SKILL.md`
- Source: Synthesize from REQUIREMENT.md §0, §1 (workflow), §11 (activation) + new pipeline integration + CLAUDE.md update mechanism

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: koni-docs
description: >
  Manages all documentation artifacts in the koni-docs framework: SETUP,
  PRD, LESSONS, CHANGELOG, CONTEXT, DESIGN, and Sprints (epics / stories /
  sprint files / STATUS). Use when the user asks to update docs, create a
  story, record a decision, log a lesson, write a changelog entry, run the
  pre-commit doc checklist, or when any planning tool (BMad, GStack,
  Superpowers) produces artifacts that need standardization into the Docs/
  structure.
---

# koni-docs — Documentation Management

> **One rule above all others**: every code-shipping commit updates docs in
> the SAME commit. Never defer documentation to a follow-up.

---

## 0. Quick orientation — what lives where

```
Docs/
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

**Key principle**: Tools process content. Koni-docs standardizes output. When BMad, GStack, or Superpowers produce planning artifacts in their own directories (e.g., `_bmad-output/`), koni-docs maps them to the canonical `Docs/` structure and ensures they follow koniverse templates.

| Pipeline Phase | Tool | What it produces |
|---|---|---|
| Brainstorm | BMad + GStack | Raw ideas, problem framing |
| Product Brief | BMad | Executive brief |
| PRD | BMad | Full PRD content |
| Architecture | BMad | Architecture decisions |
| EPIC/US Breakdown | BMad | Epics + User Stories |
| Design Review | GStack | Design review, interaction states |
| Plan Review | GStack | Architecture review, edge cases, test plan |
| QA | GStack | Systematic testing, bug reports |
| Implementation | Superpowers | Plan → code → tests |
| **Docs Finalize** | **Koni-docs** | **Standardized docs, rules enforced, CLAUDE.md updated** |

---

## 2. Core rules (summary)

These 9 rules apply to ALL Koniverse projects. Full enforcement details in `references/rules.md`.

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

**Technology-specific rules** (Supabase, Next.js) live in plugin skills. When a project declares `koni-docs-plugins: [supabase, nextjs]` in its CLAUDE.md, load those plugin skills for the additional rules.

---

## 3. Workflow — task lifecycle

### 3a. Before writing any code

1. **Read LESSONS.md** — skim all entry titles; full-read 2-4 entries matching your domain.
2. **Read DESIGN.md** if any UI is involved.
3. **Find or create the story** in `Docs/sprints/stories/`:
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
[ ] CHANGELOG.md has a new entry — same commit, real SHA, never "pending" (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] CONTEXT.md has new entry if a decision was made
[ ] SETUP.md + DEPLOY.md + .env.example updated if new env var (RULE-11)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x]
[ ] node scripts/agile-sync-up.mjs run  (propagates AC to EPIC + PRD)
[ ] npm run agile:status run  (regenerates STATUS.md — RULE-5)
[ ] CLAUDE.md Active Context block updated (see §4)
```

---

## 4. CLAUDE.md/AGENTS.md auto-update

Every Koniverse project must have an active context block in its CLAUDE.md. Agent updates this block at specific trigger points.

### CLAUDE.md integration block

```markdown
## Koni-Docs Integration
koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: Docs/
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

| # | Trigger | Action |
|---|---------|--------|
| T1 | Start a story | Add `🟡 US-X.Y <title>` to Active Stories |
| T2 | Close a story | Change `🟡 → ✅`, update Last Version |
| T3 | Start a sprint | Update Sprint ID |
| T4 | Add a LESSONS entry | Append LESSONS.md + add §N to Recent Lessons |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D<N> to Recent Decisions |
| T6 | Add an env var | Update SETUP + DEPLOY + .env.example (RULE-11) |
| T7 | Pre-commit | Run full checklist, verify all doc layers consistent |

**How to update**: Use the `Edit` tool targeting the block between `<!-- koni-docs:auto-update -->` and `<!-- /koni-docs:auto-update -->` markers. This keeps updates precise without touching surrounding content.

---

## 5. Activation — how to use this skill

| User request | Action | Load |
|---|---|---|
| "create a story for US-X.Y" | Verify US-X.Y exists in PRD §7, use story template | `templates.md` §Story file |
| "start story US-X.Y" | §3a flow: read LESSONS → DESIGN.md → flip `status: in-progress` | `rules.md` §RULE-6 |
| "close / complete story US-X.Y" | §3c checklist + 5-layer check + run agile:status | `sprint-system.md` §5-layer |
| "log a decision" / "record architecture choice" | Find highest D<N>, use decision template | `templates.md` §CONTEXT |
| "revise / correct decision D<N>" | Append revision entry, never edit original (RULE-7) | `templates.md` §Revision |
| "add a lesson" / "log a lesson" | Find highest entry number, use LESSONS template | `templates.md` §LESSONS |
| "write changelog for vX.Y.Z" | Use CHANGELOG template, bump VERSION simultaneously | `templates.md` §CHANGELOG |
| "update PRD for [feature]" | Update both FR table row AND §7 story entry | `templates.md` §PRD |
| "create design spec for US-X.Y" | Use design spec template | `templates.md` §DESIGN |
| "create an epic" | Use epic template | `templates.md` §Epic |
| "create sprint file" | Use sprint template | `templates.md` §Sprint |
| "run doc checklist" / "pre-commit check" | Walk §3c checklist item by item | `rules.md` + `sprint-system.md` |
| "update setup for new env var" | RULE-11: update all three files | `templates.md` §SETUP |
| "regenerate status" | `npm run agile:status` → commit | `sprint-system.md` §Scripts |
| "sync stories to PRD" | `node scripts/agile-sync-up.mjs` | `sprint-system.md` §5-layer |
| "standardize output from [tool]" | Map tool output to canonical Docs/ structure | This file §1 |

---

## 6. Reference files

Load these on demand based on user intent:

| File | When to load | Contents |
|------|-------------|----------|
| `references/rules.md` | User asks about rules, pre-commit check, or rule violation surfaces | 9 core rules with severity, compliance steps, grep checks |
| `references/templates.md` | User asks to create/update any document | 11 template types with filled examples |
| `references/sprint-system.md` | User asks about sprints, agile workflow, scripts, or 5-layer consistency | Naming conventions, scripts, consistency check, setup guide |

**Plugin skills**: If the project's CLAUDE.md declares `koni-docs-plugins`, load those skills for technology-specific rules that extend the core rule set.
```

- [ ] **Step 2: Verify line count under 300 lines**

```bash
wc -l skills/koni-docs/SKILL.md
```

- [ ] **Step 3: Verify YAML frontmatter is valid**

```bash
head -10 skills/koni-docs/SKILL.md | grep -E "^---$" | wc -l
```
Expected: 2 (opening and closing `---`)

- [ ] **Step 4: Verify all cross-references point to existing files**

```bash
grep -oP 'references/[a-z-]+\.md' skills/koni-docs/SKILL.md | sort -u
```
Expected: `references/rules.md`, `references/templates.md`, `references/sprint-system.md`

- [ ] **Step 5: Commit**

```bash
git add skills/koni-docs/SKILL.md
git commit -m "feat: add koni-docs SKILL.md — core documentation management skill"
```

---

### Task 6: Clean up and final verification

**Files:**
- Remove: `skills/koni-docs/REQUIREMENT.md` (content migrated)

- [ ] **Step 1: Remove old REQUIREMENT.md**

```bash
rm skills/koni-docs/REQUIREMENT.md
```

- [ ] **Step 2: Verify final structure**

```bash
find skills/koni-docs -type f | sort
```
Expected:
```
skills/koni-docs/SKILL.md
skills/koni-docs/references/rules.md
skills/koni-docs/references/sprint-system.md
skills/koni-docs/references/templates.md
```

- [ ] **Step 3: Verify total line counts are within limits**

```bash
wc -l skills/koni-docs/SKILL.md skills/koni-docs/references/*.md
```
Expected: SKILL.md < 300, each reference < 400, total < 1100.

- [ ] **Step 4: Spot-check: count rules in references/rules.md**

```bash
grep -c "^### RULE-" skills/koni-docs/references/rules.md
```
Expected: 9

- [ ] **Step 5: Spot-check: count template types in references/templates.md**

```bash
grep -c "^## [A-Z]" skills/koni-docs/references/templates.md
```

- [ ] **Step 6: Spot-check: verify no technology-specific content leaked**

```bash
grep -i "supabase\|next\.js\|nextjs\|RSC\|unstable_cache\|SECURITY DEFINER\|db push\|npx next\|Recharts\|NavProgressBar\|PageTransition\|PageHeader" skills/koni-docs/SKILL.md skills/koni-docs/references/rules.md
```
Expected: only in plugin/technology exclusion context, not as active rules.

- [ ] **Step 7: Final commit**

```bash
git rm skills/koni-docs/REQUIREMENT.md
git add skills/koni-docs/
git commit -m "feat: complete koni-docs skill — SKILL.md + 3 reference files"
```
```

- [ ] **Step 4: Spot-check: count rules in references/rules.md**

```bash
grep -c "^### RULE-" skills/koni-docs/references/rules.md
```
Expected: 9

- [ ] **Step 5: Spot-check: count template sections**

```bash
grep -c "^## [A-Z]" skills/koni-docs/references/templates.md
```

- [ ] **Step 6: Verify no technology-specific content leaked into core**

```bash
grep -i "supabase\|next\.js\|RSC\|unstable_cache\|SECURITY DEFINER\|npx next build\|Recharts\|NavProgressBar\|PageTransition\|PageHeader" skills/koni-docs/SKILL.md skills/koni-docs/references/rules.md
```
Expected: only in plugin-exclusion notes, not as active rules or implementation details.

- [ ] **Step 7: Final commit**

```bash
git rm skills/koni-docs/REQUIREMENT.md
git add skills/koni-docs/
git commit -m "feat: restructure koni-docs skill — SKILL.md + 3 references, remove old REQUIREMENT.md"
```
