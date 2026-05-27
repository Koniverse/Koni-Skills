# Sprint File — Template

> **File location**: `docs/sprints/sprint-YYYY-WNN.md`
>
> **Use when**: User asks to create a new sprint file, open a sprint, or
> close a sprint with a retrospective. ISO-8601 week numbering — `WNN` is
> two digits (`W04`, `W19`, `W47`).
>
> **One rule above all others**: AC + Tasks live inside each *story file*,
> not in the sprint file. The sprint file is a planning surface that lists
> committed stories at a glance and captures the goal + retrospective. If
> you find yourself copy-pasting AC into the sprint file, stop.

---

## 1. Template skeleton

```markdown
---
id: sprint-YYYY-WNN
status: planned            # planned | in-progress | closed
start: YYYY-MM-DD
end: YYYY-MM-DD
goal: "<Sprint goal — one sentence naming the deliverable, not the activity>"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-X.Y | <title> | EPIC-X | P1 | 5 | 🚧 in-progress | [link](stories/US-X.Y-<slug>.md) |

> **Convention**: AC + Tasks live inside each story file. This sprint file lists planned
> stories at a glance only. Design + decision docs cross-linked at the bottom.

## Sprint goal recap

<1-2 paragraphs: why these stories were chosen for this window, any
dependencies or sequencing constraints. State the deliverable cut
(what's in, what's deferred), and why-this-now (which prior decision or
incident motivated the timing).>

## Phased plan

<Optional but recommended for sprints with 4+ stories. Sequence the
work into phases by dependency, not by calendar. State the rough day-
budget per phase against the sprint length so reviewers see whether
the scope fits.>

1. **Phase 1 — <name>** (~<N> days): <what ships>
2. **Phase 2 — <name>** (~<N> days): <what ships>
3. **Phase N — QA + docs** (~<N> day): /qa-only, design-review, CHANGELOG, story flip to done, run sync scripts

## Per-Epic Retrospective

<BMad pattern: each epic gets a lightweight retro. Optional per epic — flag as
"done" when completed, "optional" if skipped.>

| Epic | Retro Status | Notes |
|------|-------------|-------|
| EPIC-X | optional | |
| EPIC-Y | done | See [retro notes](#retrospective) |

## Retrospective

<Filled on sprint close. Leave empty until close.>

### What went well

- TBD

### What didn't

- TBD

### Followups

- TBD

## Cross-references

- [Story US-X.Y](stories/US-X.Y-<slug>.md) — canonical AC + Tasks
- [Design doc](../design/US-X.Y-<slug>-design.md) — full architecture + decision log (if applicable)
- [EPIC-X](epics/EPIC-X.md) — parent epic
- [PRD §N](../PRD.md) — spec
- [CONTEXT D<N>](../CONTEXT.md) — motivating decision (if applicable)
- [README.md](README.md) — sprint schema + naming convention
- [STATUS.md](STATUS.md) — auto-rendered kanban board
```

---

## 2. Sprint lifecycle

- **planned** — sprint file created, scope locked, no stories started yet.
  Status flips when the first story moves to `in-progress`.
- **in-progress** — work has begun. Story status mirrors reality; sync via
  `agile-sync-up.mjs`.
- **closed** — every story is `done` or `removed`. Retrospective filled.
  `STATUS.md` regenerated. Sprint file may be moved to `docs/sprints/archive/`.

---

## 3. Filled example (condensed)

```markdown
---
id: sprint-2026-W19
status: in-progress
start: 2026-05-04
end: 2026-05-10
goal: "Ship US-3.7..3.12 (pod project surface — v0.45-v0.50) + Phase 1 permissions tier US-1.7 + US-1.8 (v0.54.0)"
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Story file |
|---|---|---|---|---|---|---|
| US-3.7 | Per-pod project management view (Projects v2-style) | EPIC-3 | P1 | 13 | ✅ done (v0.45.1) | [stories/US-3.7-pod-project-management.md](stories/US-3.7-pod-project-management.md) |
| US-3.8 | Per-pod doc tabs (PRD / Context / Lessons / Changelog) | EPIC-3 | P1 | 8 | ✅ done (v0.46.0) | [stories/US-3.8-pod-doc-tabs.md](stories/US-3.8-pod-doc-tabs.md) |
| US-3.10 | Project Table polish — group by EPIC/Sprint | EPIC-3 | P1 | 5 | ✅ done (v0.48.0) | [stories/US-3.10-project-table-polish.md](stories/US-3.10-project-table-polish.md) |
| US-1.7 | Capability gating Owner/Admin/Member | EPIC-1 | P0 | 8 | ✅ done (v0.54.0) | [stories/US-1.7-capability-gating.md](stories/US-1.7-capability-gating.md) |
| US-1.8 | Invitation email auto-send via Resend | EPIC-1 | P0 | 5 | 🚧 in-progress | [stories/US-1.8-invitation-email-resend.md](stories/US-1.8-invitation-email-resend.md) |

## Sprint goal recap

Ship V1 read-only per-pod project view. Reads `Docs/sprints/` from each
repo in the pod's `selected_repo_ids` via Octokit, parses YAML frontmatter
into typed Story / Epic / Sprint records, caches with `unstable_cache`
keyed `(workspace_id, pod_slug)`, renders Table + Board views.

**Deliverable cut**: read-only. No drag-write, no inline edit, no GitHub
Projects v2 API sync. Defer to V2 once V1 demand is validated.

**Why this sprint, why now**: the 2026-05-02 BMAD-agile activation
(CONTEXT D59) proved the agile-MD convention works for the Koni dev team.
Extending it as a UI inside Koni so other pods inherit the pattern is the
next logical step — minimal new code, zero data migration.

## Phased plan

1. **Phase 1 — Backend foundation** (~1 day): mig 0028, types, frontmatter parser, fetch + cache layer.
2. **Phase 2 — API + page scaffolding** (~0.5 day): GET / refresh route, page.tsx, shell.
3. **Phase 3 — Table view** (~1 day): shadcn Table, sortable, click-row external link.
4. **Phase 4 — Board view** (~1 day): kanban columns, status grouping, mobile stack.
5. **Phase 5 — Settings UI for path config** (~0.5 day): pod drawer field, validation.
6. **Phase 6 — Sync hook integration** (~0.5 day): extend `syncOneSource` to revalidateTag on every sync.
7. **Phase 7 — QA + docs** (~0.5 day): `/qa-only`, `/design-review`, CHANGELOG, CONTEXT D60, story flip to done.

## Retrospective

(filled on sprint close — 2026-05-10 EOD)

## Cross-references

- [Story US-3.7](stories/US-3.7-pod-project-management.md) — canonical AC + Tasks
- [Design doc](../design/US-3.7-pod-project-management-design.md) — full architecture
- [EPIC-3 GitHub connector](epics/EPIC-3.md) — parent epic
- [CONTEXT D59](../CONTEXT.md) — BMAD-agile activation rationale
```
