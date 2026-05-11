# CLAUDE.md + AGENTS.md — Koni-Docs Integration Blocks

> **File locations** (project repo root):
> - `CLAUDE.md` — Claude Code agent instructions
> - `AGENTS.md` — agent-agnostic project guide (Codex / Cursor / Gemini)
>
> **Use when**: Setting up koni-docs in a new project, or refreshing the
> Active Context block after a sprint roll / story close.
>
> **Why both files**: `CLAUDE.md` is consumed by Claude Code at session
> start; `AGENTS.md` is consumed by other tools. Many projects symlink one
> to the other so the same content drives both. The Koni-Docs blocks
> below differ slightly because the audiences differ.

---

## 1. CLAUDE.md — Koni-Docs Integration Block

```markdown
## Koni-Docs Integration
koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: docs/                   # where docs live
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

### Trigger points (when to update Active Context)

| #  | Trigger                | Action                                               |
| -- | ---------------------- | ---------------------------------------------------- |
| T1 | Start a story          | Add `🟡 US-X.Y <title>` to Active Stories            |
| T2 | Close a story          | Change `🟡 → ✅`, update Last Version                |
| T3 | Start a sprint         | Update Sprint ID                                     |
| T4 | Add a LESSONS entry    | Append LESSONS.md + add §N to Recent Lessons         |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D`<N>` to Recent Decisions   |
| T6 | Add an env var         | Update SETUP + DEPLOY + .env.example (RULE-11)       |
| T7 | Pre-commit             | Run full checklist, verify all doc layers consistent |

**How to update**: target the block between the
`<!-- koni-docs:auto-update -->` and `<!-- /koni-docs:auto-update -->`
markers with `Edit`. The markers keep updates precise without touching
surrounding CLAUDE.md content.

---

## 2. AGENTS.md — Koni-Docs Reference Block

For agent-agnostic project guides, a minimal pointer is enough. Keep it
short — agents read AGENTS.md for orientation, not for full reference.

```markdown
## Koni-Docs

This project uses koni-docs for documentation management. All docs follow the
structure defined in `docs/README.md`. See the koni-docs skill for templates,
rules, and workflows.
```

---

## 3. Filled example — CLAUDE.md Active Context

```markdown
## Koni-Docs Integration
koni-docs:
  plugins: [supabase, nextjs]
  docs_path: docs/
  active_sprint: sprint-2026-W19
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W19
- Active Stories: ✅ US-3.7 Per-pod project view · ✅ US-3.8 Pod doc tabs · 🟡 US-1.8 Invitation email
- Last Version: v0.76.0
- Recent Decisions: D60 (per-pod read-only project view), D59 (BMAD-agile activation)
- Recent Lessons: §29 (unstable_cache + workspace-scoped key), §28 (key= unmounts nested layouts)
<!-- /koni-docs:auto-update -->
```
