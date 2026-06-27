# koni-harness P2.5 — Sprint-Sequencer Design Spec

**Date**: 2026-06-27
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: extend the existing `skills/koni-harness/` skill (additive) — no new skill
**Builds on**: [Phase 2 loop-runner](2026-06-27-koni-harness-phase2-loop-runner-design.md) · [P3a context-loader](2026-06-27-koni-harness-phase3a-context-loader-design.md) · [CONTEXT D13](../../CONTEXT.md)

> **Decomposition note.** From the Phase 2.5/3 brainstorm: the old "multi-story
> DAG fan-out" was dropped (non-portable, speculative — YAGNI). What remains, and
> what this spec covers, is the **portable, valuable** core: dependency-ordered
> *story selection* at the sprint level. The Phase-2 loop-runner runs one story;
> P2.5 answers "which story next?".

---

## 1. Purpose

The Phase-2 loop-runner (`loop.sh`) drives a single story through the six stages.
But which story to start next in a sprint — given that stories declare
`depends_on` in their koni-docs frontmatter — is a decision nothing automates
today. koni-docs' `STATUS.md` shows *status*; it does not compute *readiness*
(which not-done story has all its dependencies satisfied).

P2.5 adds `sprint.sh`: a portable, read-only helper that reads the active
sprint's stories and answers two questions deterministically — **"what's ready
to start next?"** (`sprint.sh next`) and **"where is the sprint?"**
(`sprint.sh status`). It is the cross-story complement to the per-story
`loop.sh`: `sprint.sh next` → pick a story → `loop.sh start <id>`.

### Non-goals (P2.5)

- **No parallel fan-out / subagent dispatch** (dropped — non-portable).
- **No writing** — `sprint.sh` never mutates story files or status; koni-docs
  owns status. It only reads and recommends.
- **No scheduling/estimation** beyond ordering by priority then id.
- **No new status model** — it consumes koni-docs story frontmatter as-is.

---

## 2. First principles (inherited, unchanged)

1. **Compose, don't reinvent** — `sprint.sh` reads koni-docs story frontmatter;
   it does not reimplement status tracking or STATUS.md. koni-docs owns state.
2. **Deterministic, not vibes** — readiness and ordering are computed from
   `status` + `depends_on` + `priority` with a fixed rule, reproducible.
3. **Portable core** — POSIX, reads files, writes stdout. No Claude-specific
   anything; any tool runs it.
4. **Additive-only** — new files under `skills/koni-harness/`; the installer is
   extended to vendor `sprint.sh`. Read-only at runtime.
5. **Single responsibility** — a separate `sprint.sh` (cross-story queries),
   distinct from `loop.sh` (one story's state). Neither imports the other.

---

## 3. Deliverable shape & layout (additive)

```
skills/koni-harness/
├── SKILL.md                          # + a "Pick the next story" pointer
├── references/
│   └── sprint-sequencer.md           # NEW — what sprint.sh computes + usage
└── scripts/
    ├── sprint.sh                     # NEW — POSIX cross-story sprint query
    ├── install-gate.sh               # MODIFIED — also vendor sprint.sh
    └── __tests__/
        └── sprint-test.sh            # NEW — self-contained POSIX tests
```

`loop.sh`, `context-load.sh`, and the gate are untouched.

---

## 4. What `sprint.sh` computes

Reads every `docs/sprints/stories/*.md`, parsing the frontmatter fields
`id`, `status`, `priority`, `points`, `sprint`, and the (multi-line YAML list)
`depends_on`. The "active sprint" is the `--sprint` value, else the
`active_sprint:` value parsed from `CLAUDE.md`.

### 4.1 `sprint.sh next [--sprint <id>] [--docs <dir>]`

Lists the **ready** stories in the active sprint — `status` not `done` and every
id in `depends_on` resolves to a story whose `status` is `done` (a dependency on
a story outside the corpus, or with no file, counts as *not satisfied* and is
reported). Output: the ready stories ordered by **priority** (P0→P3, missing
last) then **id** ascending, with the first one marked as the suggested next
(`→ start: loop.sh start <id>`). If none are ready, say so and point to
`sprint.sh status` to see what blocks.

### 4.2 `sprint.sh status [--sprint <id>] [--docs <dir>]`

Sprint progress, all deterministic:
- counts by status (done / in-progress / planned / blocked / other),
- points done / total,
- **blocked list**: not-done stories with ≥1 unsatisfied dependency, each line
  naming the unmet dep ids.

### 4.3 Extraction rules

- Scalar field: `grep -E '^<field>:' <file>` → value, trimmed, quotes stripped.
- `depends_on` list: capture the lines after `depends_on:` that match
  `^[[:space:]]*-[[:space:]]*<id>` until the next top-level key; collect the ids
  (via awk). An inline empty `depends_on: []` or absent field → no deps.
- A story belongs to the active sprint if its `sprint:` value equals the target.

---

## 5. CLI

```
sprint.sh next   [--sprint <id>] [--docs <dir>] [--root <dir>]
sprint.sh status [--sprint <id>] [--docs <dir>] [--root <dir>]
```

- `--root` — repo root; default `git rev-parse --show-toplevel` else cwd (used to
  find `CLAUDE.md` for the active-sprint fallback).
- `--docs` — docs dir; default `<root>/docs`. Stories at `<docs>/sprints/stories`.
- `--sprint` — target sprint id; default: parsed from `CLAUDE.md active_sprint:`.
- Output to stdout. Exit `0` on success (including "none ready" — that's a valid
  state, not an error); `2` on usage error or unresolvable sprint.

---

## 6. Verification (P2.5)

`sprint-test.sh` (self-contained POSIX, `sh` + `dash`):

- **next — readiness + ordering**: fixture sprint with US-A (done), US-B
  (`depends_on: [US-A]`, planned → ready), US-C (`depends_on: [US-B]`, planned →
  NOT ready), US-D (P0, no deps, planned → ready). Assert `next` lists US-D and
  US-B (ready), US-D first (P0 < US-B's priority), and excludes US-C and US-A.
- **next — none ready**: every not-done story has an unmet dep → `next` says none
  ready and points to status.
- **status — counts + blocked**: assert correct done/total counts, points sum,
  and that US-C appears in the blocked list naming US-B as the unmet dep.
- **active-sprint fallback**: no `--sprint` → reads `active_sprint:` from a
  fixture `CLAUDE.md`.
- **graceful**: no stories dir / unresolvable sprint → clean message, exit code
  per §5 (0 for empty corpus, 2 for unresolvable sprint).
- **installer**: extend the install test — `.koni-harness/sprint.sh` vendored +
  executable.

Plus an author-blind sandbox: run `sprint.sh next`/`status` against a seeded
sprint and confirm the recommendation + blocked reporting are correct.

---

## 7. Open questions (resolve during planning)

- **`depends_on` multi-line parse**: the awk block must stop at the next
  top-level YAML key (a line matching `^[A-Za-z_]+:`) so it doesn't swallow
  later fields. Pin the exact awk in the plan.
- **priority rank**: map `P0→0 P1→1 P2→2 P3→3`, missing→9. Confirm the story
  files use `priority: P1` form (they do).
- **status vocabulary**: treat anything other than `done` as not-done for
  readiness; the status counts bucket known values (done/in-progress/planned/
  blocked) and lump the rest as "other".

---

## 8. Roadmap after P2.5

- **P3b — multi-tool adapters**: wire the gate + context-loader (and optionally a
  `sprint.sh next` prompt) into Claude `SessionStart` and document Gemini/Codex
  session-start equivalents. Last piece of the harness roadmap.
