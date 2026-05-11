# Document Templates — Index

> Each Koniverse document type has its own template file under
> [`templates/`](templates/). This index lists what exists, when to use
> each, and where the canonical content lives. Load only the template
> file the user's request needs.

---

## Template files

| Template | File | Use when |
|---|---|---|
| **CHANGELOG entry** | [templates/changelog.md](templates/changelog.md) | Writing a changelog entry, shipping a version, closing a story |
| **CONTEXT.md — Decision Log** | [templates/context.md](templates/context.md) | Recording a product/architecture decision or revision (append-only, RULE-7) |
| **LESSONS.md — Lessons Learned** | [templates/lessons.md](templates/lessons.md) | Codifying a recurring trap, library quirk, or pattern that would save someone 30 minutes |
| **BRIEF.md — Product Brief** | [templates/brief.md](templates/brief.md) | Creating/updating the executive brief (precedes PRD §1) |
| **PRD — Product Requirements Document** | [templates/prd.md](templates/prd.md) | Creating/updating PRD §1–§11; FR table rows; PRD §11 epic/story index |
| **ARCHITECTURE.md — System Architecture** | [templates/architecture.md](templates/architecture.md) | Documenting tech stack, components, data flow, AD-N summary table |
| **DESIGN Spec for a Story** | [templates/design-spec.md](templates/design-spec.md) | A story has visual/interaction complexity warranting a dedicated spec |
| **Epic File — Full Template** | [templates/epic.md](templates/epic.md) | Creating/updating an epic (BMad-grade: Mermaid maps, invariants, budgets) |
| **Story File — Full Template** | [templates/story.md](templates/story.md) | Creating/stubbing/updating a story (AC + Tasks + Verification commands) |
| **Sprint File** | [templates/sprint.md](templates/sprint.md) | Opening a sprint, planning scope, closing with retrospective |
| **SETUP.md + DEPLOY.md + .env.example** | [templates/setup.md](templates/setup.md) | Adding an env var (RULE-11 — all three files in same commit) |
| **OKR — File-Native Quarterly Ledger** | [templates/okr.md](templates/okr.md) | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md` |
| **CLAUDE.md + AGENTS.md integration blocks** | [templates/integration.md](templates/integration.md) | Wiring koni-docs into a new project, refreshing Active Context |

---

## Conventions every template follows

- **Frontmatter** (where applicable) lives at the top in YAML. `id` MUST
  match the filename. Status emojis are stable across the system:
  `📋 backlog / 🚧 in-progress / ✅ done / ⏪ reverted / 🗑️ deprecated`.
- **English-only** (RULE-13). Templates, prose, and generated content
  are all English even on Vietnamese-led projects.
- **Cross-references use markdown links** (`[text](path)`) — not inline
  backticks for file paths. Reviewers must be able to click through.
- **Filled examples are condensed**, not raw copies. The point is to
  show shape and tone; for a full real-world reference, link to the
  upstream repo (Koni-Finance-Final / Koni-ERP-02).
- **Templates are loaded on demand.** Never pre-load every template;
  load the single file that matches the user's intent.

---

## Activation table (mirrors SKILL.md §5)

| User request                                    | Template file                          |
| ----------------------------------------------- | -------------------------------------- |
| "write changelog for vX.Y.Z"                    | [templates/changelog.md](templates/changelog.md) |
| "log a decision" / "record architecture choice" | [templates/context.md](templates/context.md)     |
| "add a lesson" / "log a lesson"                 | [templates/lessons.md](templates/lessons.md)     |
| "create brief" / "product brief"                | [templates/brief.md](templates/brief.md)         |
| "update PRD" / "PRD for <feature>"              | [templates/prd.md](templates/prd.md)             |
| "create / update architecture"                  | [templates/architecture.md](templates/architecture.md) |
| "create design spec for US-X.Y"                 | [templates/design-spec.md](templates/design-spec.md) |
| "create an epic"                                | [templates/epic.md](templates/epic.md)           |
| "create a story for US-X.Y"                     | [templates/story.md](templates/story.md)         |
| "create sprint file"                            | [templates/sprint.md](templates/sprint.md)       |
| "update setup for new env var"                  | [templates/setup.md](templates/setup.md)         |
| "create OKR ledger" / "quarterly OKRs"          | [templates/okr.md](templates/okr.md)             |
| "wire koni-docs into project" / "refresh Active Context" | [templates/integration.md](templates/integration.md) |

---

## Quick frontmatter cheatsheet

For agents that just need the frontmatter shape without loading the full
template:

### Story (`docs/sprints/stories/US-X.Y-<slug>.md`)

```yaml
---
id: US-X.Y
title: "<Story title>"
epic: EPIC-X
status: backlog            # backlog | ready | in-progress | review | done | blocked
priority: P1               # P0 | P1 | P2 | P3
points: 5                  # Fibonacci: 1 / 2 / 3 / 5 / 8 / 13
sprint:                    # sprint-YYYY-WNN once committed
version_shipped:           # set when status → done
prd_ref: FR-N              # PRD §8 FR ID(s) and/or AD-N IDs
assignee:                  # GitHub login (optional)
commit:                    # full SHA of landing commit (never "pending")
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Epic (`docs/sprints/epics/EPIC-N.md`)

```yaml
---
id: EPIC-X
title: "<Epic title>"
status: backlog            # backlog | in-progress | done
prd_ref: FR-X.1 .. FR-X.N  # also list AD-N IDs if architecture-heavy
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Sprint (`docs/sprints/sprint-YYYY-WNN.md`)

```yaml
---
id: sprint-YYYY-WNN
status: planned            # planned | in-progress | closed
start: YYYY-MM-DD
end: YYYY-MM-DD
goal: "<one sentence naming the deliverable, not the activity>"
---
```
