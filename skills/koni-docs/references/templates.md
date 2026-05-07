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

### Decision entry (D`<N>`)

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

### Finding the next D`<N>` number

```bash
grep -n "^### D[0-9]" Docs/CONTEXT.md | tail -5
```

Increment by 1.

### Revision entry (revision of D`<M>`)

```markdown
### D<N>. <Title> (revision of D<M>)

**What changed**: <what was wrong or outdated in D<M>>

**New decision**: <the corrected or updated decision>

**Rationale**: <why the revision was needed>

**Date**: YYYY-MM-DD
**Version**: vX.Y.Z
```

### Anti-patterns (RULE-7)

| Wrong                                | Correct                               |
| ------------------------------------ | ------------------------------------- |
| Edit body of past entry D`<M>`     | Add new D`<N>` referencing D`<M>` |
| Delete a wrong decision              | Add correction entry                  |
| Leave rationale blank ("we chose X") | Always include "because Y"            |
| One huge entry covering 10 decisions | One entry per decision                |

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

## BRIEF.md — Product Brief

**Use when**: User asks to create/update product brief, executive brief, or after BMad brainstorm produces a brief that needs standardization.

**File location**: `docs/BRIEF.md`

**Source**: Maps directly from BMad `brief.md` (planning artifact). The Brief is the executive-facing document that defines the product vision before detailed requirements are written.

```markdown
# Product Brief: {Product Name}

## Executive Summary

[2-3 paragraph narrative: What is this? What problem does it solve?
Why does it matter? Why now? This should be compelling enough to stand
alone — if someone reads only this section, they should understand the
vision.]

## The Problem

[What pain exists? Who feels it? How are they coping today? What's the
cost of the status quo? Be specific — real scenarios, real frustrations,
real consequences.]

## The Solution

[What are we building? How does it solve the problem?
Focus on the experience and outcome, not the implementation.]

## What Makes This Different

[Key differentiators vs alternatives. Why this approach? What's the
unfair advantage? Be honest — if the moat is execution speed, say so.]

| Competitor | What They Do | Our Advantage |
|-----------|-------------|---------------|
| {name} | {description} | {why we're better} |

## Who This Serves

**Primary user: {persona name}**
- {demographics, context, behavior}
- {core need they're trying to satisfy}

**Secondary user: {persona name}** (if applicable)
- {demographics, context, behavior}

## Success Criteria

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| {metric 1} | {target} | {target} |
| {metric 2} | {target} | {target} |

## Scope

### In Scope (MVP)
- {feature / capability included in first release}

### Out of Scope (v1.0)
- {feature explicitly deferred to future versions}

## Vision

[Where does this go if it succeeds? What does it become in 2-3 years?
Inspiring but grounded — 1 paragraph.]
```

### Updating BRIEF.md

- **When**: During initial product definition, or after BMad brainstorm → brief pipeline produces output.
- **How**: Write the full brief. On major pivots, update in-place and record the change in CONTEXT.md.
- **Cross-reference**: PRD §1 Executive summary derives from BRIEF.md. Link to BRIEF.md from PRD header.

---

## PRD — Product Requirements Document

**Use when**: User asks to create/update PRD, product spec, or after BMad produces PRD artifacts that need standardization.

**File location**: `docs/PRD.md`

**Source**: Maps from BMad `prd.md` + extracts §1 from `brief.md`. The PRD is the canonical product specification — it absorbs the Brief's executive summary and expands it with detailed requirements, personas, and the epic/story index.

### Full PRD template (§1–§7)

```markdown
# {Project Name} — Product Requirements Document

> **Version**: X.Y.Z — see [VERSION](../VERSION) for the live value.
> **Status**: {Live at URL / In development}
> **Format**: Agile (Epics → User Stories → Tasks).
> Convention: `EPIC-<N>` / `US-<EPIC>.<N>` / `TASK-<US>.<N>`.

---

## 1. Executive summary

[2-3 paragraph narrative derived from BRIEF.md §Executive Summary.
What is this? What problem does it solve? Why does it matter?
Include key differentiators — this section should stand alone.]

## 2. Background & strategic decisions

[Key decisions that shaped the product direction. Each decision gets
an ID, description, date, and rationale. Maps from BMad Architecture
ADs and CONTEXT.md entries.]

| ID | Decision | Date | Rationale |
|----|----------|------|-----------|
| A1 | {decision title} | YYYY-MM-DD | {1-2 sentence rationale} |

## 3. Personas

### V1 — {Primary persona name} ({segment})
- **Trigger**: {what prompts them to seek a solution}
- **Pain**: {concrete pain points}
- **Uses the product**: {how they interact, key JTBD}
- **Won't pay if**: {deal-breakers}

### V2 — {Secondary persona name} ({segment}) (if applicable)
- **Trigger**: {what prompts them}
- **Pain**: {concrete pain points}
- **Uses**: {how they interact}
- **Won't pay if**: {deal-breakers}

## 4. Functional requirements (FR)

| ID | Requirement | Priority | Status | Epic |
|----|-------------|----------|--------|------|
| FR-1 | {requirement description} | P0/P1/P2/P3 | {status} (vX.Y.Z) | EPIC-N |

Priority: `P0` = must-ship/blocking, `P1` = high, `P2` = medium, `P3` = nice-to-have.
Status: `✅ shipped (vX.Y.Z)` / `🚧 in-progress` / `📋 backlog` / `⏪ reverted in vX.Y.Z` / `🗑️ deprecated vX.Y.Z`.

## 5. Non-functional requirements (NFR)

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-1 | {requirement} | {measurable target} | {status} |

## 6. Out of scope (V1)

- {feature / capability explicitly excluded from current version}
- {rationale — brief, one line each}

---

## 7. Epics & user stories

### EPIC-1: {Epic Title}

**Goal**: {1 sentence — the user outcome this epic delivers}

**Status**: {📋 backlog / 🚧 in-progress / ✅ Done (vX.Y.Z)}

| Story | Title | Status | Version |
|-------|-------|--------|---------|
| [US-1.1](../sprints/stories/US-1.1-<slug>.md) | {title} | {status} | {version} |
| [US-1.2](../sprints/stories/US-1.2-<slug>.md) | {title} | {status} | {version} |

### EPIC-2: {Epic Title}

**Goal**: {1 sentence}

**Status**: {status}

| Story | Title | Status | Version |
|-------|-------|--------|---------|
| [US-2.1](../sprints/stories/US-2.1-<slug>.md) | {title} | {status} | {version} |

[Repeat for all epics]
```

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

### §7 Epics & Stories Index

<BMad standard: this index lives in PRD §7. Each story entry links to its
canonical story file in docs/sprints/stories/. The index is updated when
stories are created or their status changes.>

```markdown
## §7. Epics & Stories Index

### EPIC-1 — {Epic Title}
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-1.1 | {title} | 📋 Backlog | — |
| US-1.2 | {title} | 🚧 in-progress | — |

### EPIC-2 — {Epic Title}
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-2.1 | {title} | 📋 Backlog | — |
```

> **Sync rule**: When the `agile-sync-up.mjs` script runs, it propagates story status
> changes to this index. The index is the single source of truth for "what stories exist."

---

## ARCHITECTURE.md — System Architecture

**Use when**: User asks to create/update system architecture, document tech stack, record component architecture, or after BMad produces architecture artifacts that need standardization.

**File location**: `docs/ARCHITECTURE.md`

This is a structured reference document — updated in-place unlike CONTEXT.md which is append-only. Individual architecture decisions are recorded in CONTEXT.md; ARCHITECTURE.md is the synthesized view.

```markdown
# ARCHITECTURE — <Project Name>

> Last updated: YYYY-MM-DD (vX.Y.Z)
> Maintainer: <team or lead>

## System overview

<3-5 sentence executive summary: what the system does at a high level,
the primary architectural style (monolith, microservices, serverless, etc.),
and the key architectural drivers (scale, latency, compliance, cost).>

## Tech stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js / Python / Go | X.Y | <one sentence why> |
| Framework | Next.js / FastAPI / etc. | X.Y | <one sentence why> |
| Database | PostgreSQL / etc. | X.Y | <one sentence why> |
| Cache | Redis / etc. | X.Y | <one sentence why> |
| Queue | — | — | — |
| Hosting | Vercel / Fly.io / AWS | — | <one sentence why> |
| Auth | NextAuth.js / Clerk / etc. | X.Y | <one sentence why> |
| Monitoring | Sentry / Datadog / etc. | — | <one sentence why> |

## Component architecture

```

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Web App    │────▶│   API Layer  │────▶│   Database   │
│  (Next.js)   │     │  (tRPC/REST) │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│    Auth      │     │    Queue     │
│ (NextAuth)   │     │  (optional)  │
└──────────────┘     └──────────────┘

```

| Component | Responsibility | Tech | Key files |
|-----------|---------------|------|-----------|
| Web App | UI rendering, client state, routing | Next.js 14 (App Router) | `app/`, `components/` |
| API Layer | Business logic, validation, DB queries | tRPC / REST | `server/api/`, `app/api/` |
| Database | Persistent storage, migrations | PostgreSQL + Prisma | `prisma/schema.prisma` |
| Auth | Session management, OAuth flows | NextAuth.js | `server/auth.ts` |

## Data architecture

### Core models

| Model | Table | Key fields | Indexes |
|-------|-------|------------|---------|
| User | `users` | id, email, name, created_at | `email (unique)` |
| Task | `tasks` | id, user_id, title, status, priority, created_at | `user_id`, `status` |

### Data flow

```

Client (browser)
  │  POST /api/tasks  { title, description }
  ▼
API Route (Next.js Route Handler)
  │  validate input (zod)
  │  check auth (getServerSession)
  ▼
Prisma Client
  │  INSERT INTO tasks ...
  ▼
PostgreSQL
  │  returns new row
  ▼
API Route
  │  return JSON response
  ▼
Client (optimistic update + revalidate)

```

## API architecture

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/tasks` | GET | Required | List user's tasks |
| `/api/tasks` | POST | Required | Create task |
| `/api/tasks/[id]` | PATCH | Required | Update task |
| `/api/tasks/[id]` | DELETE | Required | Delete task |

### Error response format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "field": "title"
  }
}
```

## Security architecture

| Concern          | Approach                 | Detail                                                 |
| ---------------- | ------------------------ | ------------------------------------------------------ |
| Authentication   | NextAuth.js JWT sessions | HttpOnly cookie, 30-day expiry                         |
| Authorization    | Row-level ownership      | All queries filter by `user_id = session.user.id`    |
| Input validation | Zod schemas              | Every API input validated at the boundary              |
| CSRF             | NextAuth built-in        | Double-submit cookie pattern                           |
| Secrets          | Environment variables    | `.env.local` (never committed), validated at startup |

## Deployment architecture

```
GitHub (main branch)
  │  git push
  ▼
GitHub Actions (CI)
  │  lint → typecheck → test → build
  ▼
Vercel (hosting)
  ├── Production (main)     → app.koni.app
  └── Preview (PR branches) → *.vercel.app
  │
  ▼
Supabase (PostgreSQL)
  └── Production database
```

| Environment | URL                 | Branch    | DB               |
| ----------- | ------------------- | --------- | ---------------- |
| Production  | app.koni.app        | main      | Supabase prod    |
| Preview     | `<pr>.vercel.app` | feature/* | Supabase staging |

## Integration architecture

| External service   | Purpose            | Auth method     | Fallback                   |
| ------------------ | ------------------ | --------------- | -------------------------- |
| `<Service name>` | `<what it does>` | API key / OAuth | `<graceful degradation>` |

## Architecture decisions

<BMad standard: each architecture decision gets an AD-N identifier.
Summary table here; full rationale in CONTEXT.md D<N> entries.
Use AD-N IDs in story Dev Notes to reference which decisions apply.>

| ID  | Topic       | Summary                        | Version | CONTEXT Ref      |
| --- | ----------- | ------------------------------ | ------- | ---------------- |
| AD-1 | `<title>` | <one sentence summary>         | vX.Y.Z  | [D1](CONTEXT.md) |
| AD-2 | `<title>` | <one sentence summary>         | vX.Y.Z  | [D2](CONTEXT.md) |

Individual decisions that shaped this architecture are recorded in [CONTEXT.md](CONTEXT.md).
Link new architecture decisions from CONTEXT.md here as they are recorded.

## Open architecture questions

- [ ] 
  <unresolved architecture question>
- [ ] 
  <tradeoff being evaluated>

```

### Updating ARCHITECTURE.md

- **When**: After any architecture decision (CONTEXT.md entry), tech stack change, or new integration.
- **How**: Edit the relevant section in-place. Update the `Last updated` date and version.
- **Cross-reference**: Always link the relevant CONTEXT.md entry in the ADR table.
- **Omit empty sections**: If a section (e.g., Queue, Integration) has no content, remove it. Add it back when needed.

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

<1 paragraph: what user outcome this delivers and why it matters now.
Maps to the BMad "So that..." clause — articulate the value, not the mechanism.>

## Background

<2-3 paragraphs: why now, what alternatives were considered, surrounding
context that informs the design. Link to CONTEXT.md entries if applicable.>

## Acceptance criteria

<Use Given/When/Then (BMad standard) for behavioral ACs. Use declarative
for data/constraint ACs. Each AC must be independently testable.>

- [ ] AC-1: **Given** {precondition}, **When** {action}, **Then** {expected outcome} **And** {additional criteria}
- [ ] AC-2: <declarative criterion — for schema, constraints, or static properties>
- [ ] AC-3: **Given** {edge case precondition}, **When** {action}, **Then** {expected error handling}

> **AC Quality**: Include edge cases and error conditions. If this story has a design spec,
> cross-reference relevant interaction states (empty, loading, error, populated).

## Tasks

<Tasks are grouped with AC cross-references (BMad pattern). Each task references
which AC(s) it fulfills. Sub-tasks are indented. Prefer one task per file.>

- [ ] TASK-X.Y.1 — {action} — {rationale} (AC: #)
  - [ ] Subtask X.Y.1.1 — {specific sub-action with file path}
  - [ ] Subtask X.Y.1.2 — {specific sub-action with file path}
- [ ] TASK-X.Y.2 — {action} — {rationale} (AC: #)

## Dev notes

### Architecture constraints

<Relevant architecture decisions (AD-N) and patterns that constrain
implementation. Reference ARCHITECTURE.md sections and CONTEXT.md entries.>

### Project structure notes

<Paths, modules, and naming conventions this story must follow.
Flag any conflicts or variances with rationale.>

### References

<Cite all technical details with source paths and sections.>

- [Source: PRD §4 FR-N](../../PRD.md#4-functional-requirements)
- [Source: ARCHITECTURE §N — {section name}](../../ARCHITECTURE.md)
- [Source: AD-N — {decision title}](../../CONTEXT.md)

## Changelog entry

> This is the exact text that goes into CHANGELOG.md when the story ships.
> Draft it when the story nears completion. On ship, copy this into CHANGELOG.md
> under the new version header (see templates.md §CHANGELOG entry).

### Added
- <Feature / component added>

### Changed
- <Behavior or API changed — old vs new>

### Fixed
- <Bug description + root cause>

### Removed
- <What was dropped and why>

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

## FR Coverage

<How each functional requirement maps to stories in this epic.
This follows the BMad coverage map pattern for traceability.>

| FR | Story | Status |
|----|-------|--------|
| FR-N | US-X.1 | ✅ done (v0.X.0) |
| FR-N | US-X.2 | 🚧 in-progress |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-X.1](../stories/US-X.1-<slug>.md) | <title> | <one-line user outcome> | ✅ done | v0.X.0 |
| [US-X.2](../stories/US-X.2-<slug>.md) | <title> | <one-line user outcome> | 🚧 in-progress | — |

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

## Per-Epic Retrospective

<BMad pattern: each epic gets a lightweight retro. Optional per epic — flag as
"done" when completed, "optional" if skipped.>

| Epic | Retro Status | Notes |
|------|-------------|-------|
| EPIC-X | optional | |
| EPIC-Y | done | See [retro notes](#retrospective) |

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
