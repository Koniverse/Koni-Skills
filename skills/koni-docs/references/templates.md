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

Shipped pod-based project grouping with drag-and-drop reordering. Users can now
organize projects into custom pods for better workspace navigation.

### Added
- Pod creation and deletion UI in workspace settings
- Drag-and-drop project-to-pod assignment
- Pod filter chips in project list

### Fixed
- Project list not updating after workspace switch (missing `revalidatePath` in
  workspace change handler)

**Commit**: a1b2c3d
```

**Rules**:
- Only include sections that have content. Omit empty sections.
- `**Commit**: pending` is NEVER acceptable (RULE-2).
- Entries in reverse-chronological order — newest at top.
- Never reorder or edit past entries.
- Version tag appears twice: `[X.Y.Z]` in header AND `— vX.Y.Z` inline — both required for `git log --grep`.

### Safe CHANGELOG insertion

**WRONG** (eats previous version header):
```
oldString = "## [0.63.3] — ..."
newString = "## [0.63.4] ...\n\n## [0.63.3] — ..."
```

**CORRECT** — anchor on `[Unreleased]` section:
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

> **Convention**: AC + Tasks live inside each story file. This sprint file lists planned
> stories at a glance only.

## Sprint goal recap

<1-2 paragraphs: why these stories were chosen for this window, any
dependencies or sequencing constraints.>

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

### Env var update checklist (RULE-11)

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
