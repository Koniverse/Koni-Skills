# koni-harness Phase 3a — Context-Loader Design Spec

**Date**: 2026-06-27
**Status**: Approved (brainstorm) — pending implementation plan
**Target**: extend the existing `skills/koni-harness/` skill (additive) — no new skill
**Builds on**: [Phase 1 spec](2026-06-27-koni-harness-agentic-loop-design.md) (the Standard's "Context layers and load order") · [Phase 2 spec](2026-06-27-koni-harness-phase2-loop-runner-design.md) · [CONTEXT D13](../../CONTEXT.md)

> **Decomposition note.** The original Phase 3 was "context-loader + multi-tool
> adapters + DAG". During brainstorm it was split into independent sub-projects:
> **P3a — context-loader (this spec)**, then P2.5 — sprint-sequencer, then
> P3b — multi-tool adapters. The non-portable "parallel subagent fan-out" idea
> from the old Phase 2.5 was dropped (YAGNI: Claude-Task-specific, speculative).

---

## 1. Purpose

The Standard ([agentic-loop-standard.md](../../../skills/koni-harness/references/agentic-loop-standard.md))
documents a context-layer *load order* — `AGENTS.md → CLAUDE.md → LESSONS.md →
CONTEXT.md → .active-context.md` — but Phase 1 explicitly deferred *automating*
that load. P3a delivers the automation: a portable `context-load.sh` that emits
a **concise session digest** of those layers to stdout, so an agent starting a
session learns "where the project is" without opening five files and skimming
hundreds of lines.

It is a **digest, not a dump**: the live `.active-context.md` snapshot verbatim,
plus the VERSION and active sprint, plus the *titles* (not bodies) of the
decision and lesson indexes, plus pointers to the canonical files for detail.
The big bodies (CONTEXT.md ~600 lines, LESSONS.md ~250) are referenced, never
inlined.

P3a only **produces** the digest. Wiring it into a tool's session start (Claude
`SessionStart` hook, Gemini/Codex equivalents) is **P3b** — out of scope here.

### Non-goals (P3a)

- No tool wiring / session-start hooks (P3b).
- No summarization-by-LLM — the digest is deterministic extraction (titles,
  verbatim snapshot), not a generated prose summary.
- No multi-story sequencing (P2.5) and no parallel fan-out (dropped).

---

## 2. First principles (inherited, unchanged)

1. **Deterministic, not vibes** — the digest is produced by grep/sed extraction
   with a fixed format, reproducible across runs and tools.
2. **Portable core, thin adapter** — `context-load.sh` is POSIX, reads files,
   writes stdout. The per-tool session-start wiring is a separate thin adapter
   (P3b). The script is the contract.
3. **Additive-only** — only new files under `skills/koni-harness/`; the existing
   installer is extended to also vendor `context-load.sh`. No existing file is
   rewritten.
4. **Digest, not dump** — high-signal extraction; reference the big bodies,
   don't inline them. Keeps the session-start cost small.
5. **Graceful degradation** — any missing layer is skipped with a one-line note;
   the script never crashes on an absent or partial file.

---

## 3. Deliverable shape & layout (additive)

```
skills/koni-harness/
├── SKILL.md                          # + a short "Load session context" pointer
├── references/
│   └── context-load.md               # NEW — what the digest contains + usage
└── scripts/
    ├── context-load.sh               # NEW — POSIX digest generator
    ├── install-gate.sh               # MODIFIED — also vendor context-load.sh
    └── __tests__/
        └── context-test.sh           # NEW — self-contained POSIX tests
```

The gate (`gate-runner.sh`/checks) and the loop-runner (`loop.sh`) are untouched.

---

## 4. What the digest emits

`context-load.sh` writes a single Markdown document to stdout, in the Standard's
layer order, extracting only high-signal content. Each section is skipped (with a
`_(<file> not found)_` note) if its source file is absent.

### 4.1 Sections (in order)

1. **`# Session context — <repo>`** — header with current `VERSION` and the
   `active_sprint` value parsed from the `koni-docs:` block in `CLAUDE.md`.
2. **`## Live state`** — the `.active-context.md` "Project sprint context" block
   (between the `koni-docs:auto-update` markers) **verbatim**. Fallback order if
   `.active-context.md` is absent (it is gitignored, so a fresh clone won't have
   it): the inline Pattern-A `koni-docs:auto-update` block in `CLAUDE.md`; else a
   `_(no active-context snapshot)_` note.
3. **`## Decisions`** — every `### D<n>. <title>` heading from `CONTEXT.md`, as a
   list (titles only, no bodies), in file order. One trailing line: "full bodies
   in `docs/CONTEXT.md`".
4. **`## Lessons`** — every `## <n>. <title>` heading from `LESSONS.md`, as a
   list. Trailing pointer to `docs/LESSONS.md`.
5. **`## Canonical references`** — fixed pointers: "AGENTS.md — project
   conventions / structure / commit discipline (read for any non-trivial work)";
   "the koni-harness Standard — the loop + gate"; "this digest is a summary; open
   the named files for detail."

### 4.2 Extraction rules (deterministic)

- `active_sprint`: `grep` the `active_sprint:` line in `CLAUDE.md`, take the
  value up to any `#` comment.
- Live block: print lines between `<!-- koni-docs:auto-update -->` and
  `<!-- /koni-docs:auto-update -->` (from `.active-context.md`, else `CLAUDE.md`).
- Decision titles: `grep -E '^### D[0-9]+\.' docs/CONTEXT.md`.
- Lesson titles: `grep -E '^## [0-9]+\.' docs/LESSONS.md`.
- VERSION: read the `VERSION` file (trimmed).

---

## 5. CLI

```
context-load.sh [--root <dir>] [--docs <dir>]
```

- `--root` — repo root; default: `git rev-parse --show-toplevel` if available,
  else the current directory. `VERSION`, `CLAUDE.md`, `AGENTS.md`,
  `.active-context.md` are resolved under root.
- `--docs` — docs directory under root; default `docs/`. `CONTEXT.md` /
  `LESSONS.md` resolved here.
- Output: the digest to stdout. Exit `0` always on a readable repo (missing
  layers are notes, not errors); exit `2` only on a usage error.

No other flags (YAGNI — a `--recent N` cap on the decision/lesson lists can be
added later if an index grows long; current indexes are short).

---

## 6. Verification (P3a)

`context-test.sh` (self-contained POSIX, runs under `sh` and `dash`):

- **Full repo**: a fixture with all layers → assert the digest contains the
  VERSION value, the parsed `active_sprint`, the verbatim active-context line(s),
  each `D<n>` decision title, each lesson title, and the canonical-references
  section.
- **Fallback**: no `.active-context.md` but a Pattern-A block in `CLAUDE.md` →
  digest's Live state shows the CLAUDE.md block.
- **Missing layers**: no `CONTEXT.md` / `LESSONS.md` → the digest prints the
  `_(... not found)_` notes and still emits the other sections (exit 0, no
  crash).
- **Installer**: extend the existing install test — after install,
  `.koni-harness/context-load.sh` is vendored and executable.

Plus an author-blind sandbox: run `context-load.sh` against this very repo and
confirm the digest is accurate and useful.

---

## 7. Roadmap after P3a

- **P2.5 — sprint-sequencer**: extend `loop.sh` to pick the next story by
  `depends_on` (koni-docs frontmatter) and track sprint-level loop state.
- **P3b — multi-tool adapters**: wire the gate + context-loader into Claude
  `SessionStart` and document Gemini/Codex session-start equivalents.

---

## 8. Open questions (resolve during planning)

- **Marker-block parsing**: `.active-context.md` uses `<!-- koni-docs:auto-update
  -->` / `<!-- /koni-docs:auto-update -->`. The extractor uses `sed -n
  '/start/,/end/p'` and strips the marker lines themselves. Confirm the exact
  marker strings against the live `.active-context.example.md`.
- **`active_sprint` comment stripping**: the CLAUDE.md line carries a trailing
  `# ...` comment; the extractor must cut at the first `#` after the value.
