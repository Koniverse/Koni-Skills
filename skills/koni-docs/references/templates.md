# Document Templates — Index

> Each Koniverse document type has its own template file under
> [`templates/`](templates/). This index lists what exists, when to use
> each, and where the canonical content lives. Load only the template
> file the user's request needs.


**Contents**: [Template files](#template-files) · [Conventions every template follows](#conventions-every-template-follows) · [Activation](#activation) · [Quick frontmatter cheatsheet](#quick-frontmatter-cheatsheet)

---

## Template files

| Template | File | Use when |
|---|---|---|
| **CHANGELOG entry** | [templates/changelog.md](templates/changelog.md) | Writing a changelog entry, shipping a version, closing a story |
| **CONTEXT.md — Decision Log** | [templates/context.md](templates/context.md) | Recording a product/architecture decision or revision (append-only, RULE-7) |
| **LESSONS.md — Lessons Learned** | [templates/lessons.md](templates/lessons.md) | Codifying a recurring trap, library quirk, or pattern that would save someone 30 minutes |
| **BRIEF.md — Product Brief** | [templates/brief.md](templates/brief.md) | Creating/updating the executive brief (precedes PRD §1) |
| **PRD — Product Requirements Document** | [templates/prd.md](templates/prd.md) | Creating/updating the full PRD section set; FR table rows; the PRD `Epics & User Stories` index |
| **ARCHITECTURE.md — System Architecture** | [templates/architecture.md](templates/architecture.md) | Documenting tech stack, components, data flow, AD-N summary table |
| **DESIGN Spec for a Story** | [templates/design-spec.md](templates/design-spec.md) | A story has visual/interaction complexity warranting a dedicated spec |
| **Epic File — Full Template** | [templates/epic.md](templates/epic.md) | Creating/updating an epic (BMad-grade: Mermaid maps, invariants, budgets) |
| **Story File — Full Template** | [templates/story.md](templates/story.md) | Creating/stubbing/updating a story (AC + Tasks + Verification commands) |
| **Sprint File** | [templates/sprint.md](templates/sprint.md) | Opening a sprint, planning scope, closing with retrospective |
| **SETUP.md + DEPLOY.md + .env.example** | [templates/setup.md](templates/setup.md) | Adding an env var (RULE-11 — all three files in same commit) |
| **OKR — File-Native Quarterly Ledger** | [templates/okr.md](templates/okr.md) | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md` |
| **CLAUDE.md + AGENTS.md integration blocks** | [templates/integration.md](templates/integration.md) | Wiring koni-docs into a new project, refreshing Active Context |
| **Test Cases — per-epic scenarios** | [templates/test-cases.md](templates/test-cases.md) | Capturing end-to-end + regression + smoke scenarios at the EPIC level (complements per-story AC) |
| **Test Report — per-execution + per-release** | [templates/test-report.md](templates/test-report.md) | Recording an execution run (`test-reports/EPIC-NN/<MMDDYYYY>/report.md`) or aggregating a release (`releases/`) |

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

## Activation

**Single source: [SKILL.md §5](../SKILL.md).** A 16-row copy of that 29-row table
used to live here and had already drifted out of date. A mirror that must be kept
in sync is a mirror that will not be.

## Quick frontmatter cheatsheet

For agents that just need the frontmatter shape without loading the full
template:

### Story (`docs/sprints/stories/US-X.Y-<slug>.md`)

```yaml
---
id: US-X.Y
title: "<Story title>"
epic: EPIC-X
status: backlog            # backlog | ready | in-progress | review | done | blocked | deprecated
priority: P1               # P0 | P1 | P2 | P3
points: 5                  # Fibonacci: 1 / 2 / 3 / 5 / 8 / 13
sprint:                    # sprint-YYYY-WNN once committed
due:                       # OPTIONAL — a deadline imposed from OUTSIDE the sprint cadence (contract / demo / audit), bare YYYY-MM-DD. Leave EMPTY when "this sprint" is the only requirement: sprint.end is NEVER inherited. Explain the date in the body's `## Deadline`, never here.
version_shipped:           # bare semver, set when status → done (RULE-16 — never `v`-prefixed)
prd_ref: [FR-N]            # FR / NFR only — bare IDs, list form (RULE-17)
arch_ref: [AD-N]           # AD only — omit if none. AD-N must NEVER go in prd_ref.
depends_on: [US-X.Y]       # US only — omit if none
assignee:                  # GitHub login (RULE-15) — mandatory when shipping
commit:                    # SHA of the landing commit. A commit cannot contain its own SHA — backfill it in a follow-up commit (RULE-2). Never "pending" at rest.
created: YYYY-MM-DD
updated: YYYY-MM-DD
external_deps:             # OPTIONAL — planning-only today; no tooling reads it yet
---
```

> **The ID-typed fields are the trap.** `prd_ref` / `arch_ref` / `depends_on`
> hold **bare canonical IDs and nothing else** — no parentheticals, no ranges
> (`FR-28 .. FR-45`), no slash-joins, no cross-namespace mixing. Every qualifier
> you are tempted to add belongs in the body. RULE-17; full contract + the
> anti-pattern catalog in [`frontmatter-spec.md`](frontmatter-spec.md).

### Epic (`docs/sprints/epics/EPIC-N.md`)

```yaml
---
id: EPIC-X
title: "<Epic title>"
status: backlog            # backlog | in-progress | done
prd_ref: [FR-1, FR-2]      # FR / NFR only — enumerate every ID; ranges (`FR-1 .. FR-9`) are INVALID (RULE-17)
arch_ref: [AD-N]           # AD only — omit if none
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

### Test cases (`docs/tests/test-cases/EPIC-N.md`)

```yaml
---
id: EPIC-N-tests
epic: EPIC-N
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Each TC inside the file carries its own YAML metadata block:

```yaml
id: TC-N.E2E-1
type: e2e                  # smoke | regression | e2e | integration | unit | performance | security
mode: manual               # manual | automated | hybrid
priority: P0               # P0 | P1 | P2 | P3
maps_to:
  fr: [FR-N]
  ac: [US-X.Y/AC-1, US-X.Z/AC-2]
  ad: [AD-N]               # optional
  rule: [RULE-N]           # optional
```

### Test report — per-execution (`docs/tests/test-reports/EPIC-NN/<MMDDYYYY>/report.md`)

```yaml
---
epic: EPIC-N
run_id: YYYY-MM-DD-EPIC-N-runN
run_at: YYYY-MM-DDTHH:MM:SS+07:00
env: staging               # local | staging | production
version: vX.Y.Z
commit: <full SHA>
executor: <GitHub login | "CI">
trigger: per-release       # per-PR | per-release | per-sprint | nightly | on-demand
---
```

### Test report — per-release (`docs/tests/test-reports/releases/vX.Y.Z.md`)

```yaml
---
version: vX.Y.Z
released_at: YYYY-MM-DD
commit: <SHA of the release commit>
epics_covered: [EPIC-N, EPIC-M]
ship_status: shipped       # shipped | held | rolled-back
---
```
