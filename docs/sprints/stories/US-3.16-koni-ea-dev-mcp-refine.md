---
id: US-3.16
title: "koni-ea-dev — refine the MCP compile section from a deeper read of the server"
epic: EPIC-3
status: done
priority: P3
points: 1
sprint: sprint-2026-W29
due:
version_shipped: 0.62.0
prd_ref: [FR-41]
arch_ref: []
depends_on: [US-3.15]
assignee: jindo9986
commit: pending
created: 2026-07-16
updated: 2026-07-16
external_deps:
---

## Goal

Sharpen koni-ea-dev's MCP compile section (US-3.15) with facts surfaced by reading the
server's **whole** source (`server.py` + README), not just its tool signatures. Prompted
by a "does this MCP create code?" question that warranted a full re-read.

## Background

The first pass (US-3.15) verified the tools, env var, and runtime. A closer read added
three accurate refinements:

1. **Division of labor.** The server exposes only two tools and **no** prompt/resource/
   code-generation tool — it is a *verification* engine, not a generator. The README's
   own headline is an "auto-fixing loops" workflow: **this skill authors the EA; the MCP
   compiles it and looks up docs.** Stating this settles the recurring "does the MCP write
   code?" confusion and tells the reader where code-authoring responsibility sits.
2. **Auto-detection.** `MQL5_EDITOR_PATH` is **optional** — `find_metaeditor()` globs the
   common MT5 install paths, so it is set only if detection fails.
3. **`search_mql5_docs` returns the matched page's actual text** (source URL + content,
   truncated ~12k), not just a link — so it verifies an API's parameters before you write
   the call.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §35 (a tool's real
behaviour is in its *whole* source, not its headline — the deeper read found auto-detection
and the return-shape the first pass missed); §29/§31 (verify the effect, not the surface).

## Acceptance criteria

- [x] **AC-1** — the section states the **division of labor** (verification engine, not a
  generator; this skill authors, the MCP compiles/looks-up), tied to the server's
  "auto-fixing loops" framing.
- [x] **AC-2** — the config note records that `MQL5_EDITOR_PATH` is **optional** (server
  auto-detects `metaeditor64.exe`), and `search_mql5_docs` is described as returning the
  page **text** (truncated), not a link.
- [x] **AC-3** — every new claim is verified against the upstream `server.py`/README by an
  author-blind reviewer; no over-claim; the section stays concise (no bloat/duplication of
  `shared-library.md`); koni-ea-dev holds ≥95 (D1/D2 untouched; the delta is D3-accurate and
  D4-clean).
- [x] **AC-4** — `check-references.py` → 0 dangling on koni-ea-dev and all skills; the
  `description` is unchanged (still under the 1024-byte cap).

## Tasks

- [x] **TASK-3.16.1** — read the full `server.py` + README; extract the three refinements (AC: 1, 2)
- [x] **TASK-3.16.2** — edit the MCP section surgically (AC: 1, 2)
- [x] **TASK-3.16.3** — author-blind review of the delta vs the repo; check-references (AC: 3, 4)

## Dev notes

### What we explicitly did NOT do

- **Did not re-run the full four-dimension grade** for a ~10-line additive, source-verified
  refinement. D1 (description byte-identical) and D2 (no rule change) are untouched; the
  reviewer confirmed the delta is D3-accurate and D4-clean, so the 98.1 grade (US-3.14/3.15)
  stands. Any future substantive change re-triggers the full re-grade.
- **Did not claim the MCP generates code.** It does not — the section says so explicitly.

### References

- [Source: PRD FR-41](../../PRD.md#functional-requirements)
- [Source: US-3.15](US-3.15-koni-ea-dev-mcp-compile.md) — the section this refines
- [Source: LESSONS §29, §31, §35](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | `rg -n 'Division of labor\|optional\|auto-detects\|matched page' skills/koni-ea-dev/references/compilation-and-testing.md` |
| AC-4 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea-dev` → 0 dangling |

## Changelog entry

### Changed
- koni-ea-dev MCP compile section refined from a full read of the server: states the **division of labor** (the MCP is a verify/docs engine, not a code generator — this skill authors the EA), that `MQL5_EDITOR_PATH` is **optional** (auto-detected), and that `search_mql5_docs` returns the page **text** (truncated), not a link.

## Implementation notes

A source-grounded doc refinement — no new capability, no code. Author-blind reviewer
confirmed all three added claims against `server.py`/README (SHIP; one plural-wording nit
applied). koni-ea-dev holds at ~98/100.

Lessons: none new — this deepened the application of §35 (read a tool's whole source, not
just its tool surface: the fuller read found auto-detection and the docs-return shape the
first pass missed); no new principle to record.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.15](US-3.15-koni-ea-dev-mcp-compile.md)
- [CHANGELOG v0.62.0](../../CHANGELOG.md)
