# sprints/ — Agile Workflow

This folder is the source of truth for **active work** in Koni-Skills.
Every story under EPIC-N lives as a single `.md` file under
`stories/`; the active sprint file lists which of those stories are
in this week's commitment.

The schema, naming conventions, scripts, and 5-layer consistency
contract are documented in the canonical reference:
**[skills/koni-docs/references/sprint-system.md](../../skills/koni-docs/references/sprint-system.md)**.

This README is a thin pointer + quick links.

---

## Layout

```
sprints/
├── README.md          ← you are here
├── STATUS.md          ← AUTO-GENERATED kanban — RULE-5 (never hand-edit)
├── epics/             ← EPIC-N.md
├── stories/           ← US-X.Y-<slug>.md (canonical AC + Tasks source)
├── sprint-YYYY-WNN.md ← active sprint
└── archive/           ← closed sprints
```

## Naming conventions

| Artifact | Pattern | Example |
|---|---|---|
| Story file | `US-<EPIC>.<N>-<slug>.md` | `US-2.1-bootstrap-docs-structure.md` |
| Story `id:` frontmatter | `US-<EPIC>.<N>` | `US-2.1` |
| Task ID (inside story) | `TASK-<US-id>.<n>` | `TASK-2.1.1` |
| Epic file | `EPIC-<N>.md` | `EPIC-2.md` |
| Sprint file | `sprint-YYYY-WNN.md` (ISO-8601 week) | `sprint-2026-W22.md` |

## Story status flow

```
backlog → ready → in-progress → review → done
                      ↓
                   blocked  ← document reason in Implementation notes
```

**WIP limit:** at most **3 stories** `in-progress` at once.

**`done` requires**: `version_shipped` set + CHANGELOG entry exists + all
AC `[x]` + all 5 doc layers consistent.

## Scripts (run from repo root)

The `.mjs` scripts these commands used to name were migrated into the
`@koniverse/koni-docs` npm package (ARCHITECTURE AD-7) and **no longer exist on disk** —
invoke the typed CLI instead:

```bash
# Regenerate STATUS.md (RULE-5 — never hand-edit it)
npx koni-docs status --docs-path docs/

# ID-graph + FR-ref integrity, and due-date checking (exits non-zero on error)
npx koni-docs validate --docs-path docs/

# Regenerate Tasks section from AC (AC is canonical)
npx koni-docs inject-tasks --docs-path docs/ --story US-X.Y

# Backfill missing frontmatter fields
npx koni-docs backfill-fields --docs-path docs/

# Repair only — a CHANGELOG that already shipped with `pending` SHAs
npx koni-docs backfill-commits --docs-path docs/
```

All accept `--dry-run` for preview.

> **`npx koni-docs sync` is intentionally not listed.** It propagates story status up
> through epic / PRD / sprint, but at CLI 0.10.0 it over-aggregates the PRD/EPIC "Ship"
> column and corrupts curated `version_shipped` narrative. This repo runs `status` only
> and hand-maintains the FR tables — [CONTEXT D39](../CONTEXT.md).

## 5-layer consistency check

Before merging a story-status change, verify these 5 layers reflect the
same state — **by hand**. There is no propagation step in this repo: `sync` is the
subcommand that would do it, and it is deliberately not run ([CONTEXT D39](../CONTEXT.md)).
Run `npx koni-docs validate --docs-path docs/` to catch ID-graph breakage, then check the
five rows yourself.

| Layer | File | What to verify |
|---|---|---|
| 1 — Story | `stories/US-X.Y-*.md` | `status: done`, `version_shipped` set, all AC + Tasks `[x]` |
| 2 — Epic | `epics/EPIC-N.md` | Story row reflects status + version |
| 3 — PRD Epics & User Stories | `../PRD.md` | Per-epic Stories table row matches |
| 4 — PRD Functional Requirements | `../PRD.md` | FR row `✅ shipped (vX.Y.Z)` |
| 5 — Sprint | `sprint-YYYY-WNN.md` | Sprint scope row matches |

## Cross-references

- [STATUS.md](STATUS.md) — auto-generated kanban
- [Active sprint](sprint-2026-W30.md)
- [EPIC-1](epics/EPIC-1.md) / [EPIC-2](epics/EPIC-2.md) / [EPIC-3](epics/EPIC-3.md)
- [skills/koni-docs/references/sprint-system.md](../../skills/koni-docs/references/sprint-system.md) — canonical schema
- [skills/koni-docs/references/rules.md](../../skills/koni-docs/references/rules.md) — the enforced rules
