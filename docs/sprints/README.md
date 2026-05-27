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

```bash
# Regenerate STATUS.md (RULE-5 — never hand-edit it)
node skills/koni-docs/scripts/generate-status.mjs --docs-path docs/

# Propagate story status across epic, PRD §11, PRD §8 FR, sprint
node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path docs/

# Regenerate Tasks section from AC (AC is canonical)
node skills/koni-docs/scripts/agile-inject-tasks.mjs --docs-path docs/ --story US-X.Y

# Backfill missing frontmatter fields
node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path docs/

# Replace `pending` SHAs in CHANGELOG with real ones
node skills/koni-docs/scripts/changelog-backfill-commits.mjs --docs-path docs/
```

All accept `--dry-run` for preview.

## 5-layer consistency check

Before merging a story-status change, verify these 5 layers reflect the
same state. `agile-sync-up.mjs` propagates automatically.

| Layer | File | What to verify |
|---|---|---|
| 1 — Story | `stories/US-X.Y-*.md` | `status: done`, `version_shipped` set, all AC + Tasks `[x]` |
| 2 — Epic | `epics/EPIC-N.md` | Story row reflects status + version |
| 3 — PRD §11 | `../PRD.md` | Per-epic Stories table row matches |
| 4 — PRD §8 | `../PRD.md` | FR row `✅ shipped (vX.Y.Z)` |
| 5 — Sprint | `sprint-YYYY-WNN.md` | Sprint scope row matches |

## Cross-references

- [STATUS.md](STATUS.md) — auto-generated kanban
- [Active sprint](sprint-2026-W22.md)
- [EPIC-1](epics/EPIC-1.md) / [EPIC-2](epics/EPIC-2.md) / [EPIC-3](epics/EPIC-3.md)
- [skills/koni-docs/references/sprint-system.md](../../skills/koni-docs/references/sprint-system.md) — canonical schema
- [skills/koni-docs/references/rules.md](../../skills/koni-docs/references/rules.md) — 9 enforced rules
