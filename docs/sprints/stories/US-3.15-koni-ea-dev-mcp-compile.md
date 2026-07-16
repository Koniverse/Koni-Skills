---
id: US-3.15
title: "koni-ea-dev — compile-in-the-loop via an MQL5 MCP server"
epic: EPIC-3
status: done
priority: P2
points: 2
sprint: sprint-2026-W29
due:
version_shipped: 0.61.0
prd_ref: [FR-41]
arch_ref: []
depends_on: [US-3.14]
assignee: jindo9986
commit: 767ef9c
created: 2026-07-16
updated: 2026-07-16
external_deps:
---

## Goal

Teach koni-ea-dev to **close the compile loop** — turn "compile clean" from a
prescription the skill leaves to a human into a verifiable loop an agent runs itself,
using an MQL5-compile MCP server (`mcp-server-mql5`) that shells out to a local
MetaEditor. Requested by wiring the server's config.

## Background

koni-ea-dev's [`compilation-and-testing.md`](../../../skills/koni-ea-dev/references/compilation-and-testing.md)
told the reader to compile with zero errors but gave no way to *do* it in-loop. An
MQL5-compile MCP server exposes `compile_mql5(code, filename="ExpertAdvisor")` (source
string → MetaEditor diagnostics) and `search_mql5_docs(search_term)` (docs lookup),
which lets the agent write → compile → read real diagnostics → fix → recompile, and
verify an unfamiliar API against the docs instead of guessing.

The config supplied to wire it was **wrong in three ways** — I verified the server's
own source before documenting it (LESSONS §35): the repo is a **Python** package (no
`package.json`), so `command: npx` can never launch it (the runner is `uvx`); the env
var the server reads is **`MQL5_EDITOR_PATH`**, not `METAEDITOR_PATH`; and `MQL5_DIR`
is referenced nowhere. The skill documents the **corrected** config, not the one
handed over.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §35
(documented here — a handed-over config is an unverified claim; the server's code/
packaging is the authority, and the code won over the README); §29 (a plausible config
can be false, like a resolving-but-untrue pointer); §31 (verify a tool's effect, not
its surface).

## Acceptance criteria

- [x] **AC-1** — `compilation-and-testing.md` gains a "Compile in the loop (an MQL5
  MCP server)" section describing `compile_mql5` and `search_mql5_docs`, framed as an
  **optional** integration, threaded into the file's Contents TOC.
- [x] **AC-2** — the section states the **verified** facts: Python/`uvx` runtime,
  `MQL5_EDITOR_PATH` env var, `MQL5_DIR` unused — and shows the corrected JSON config;
  every claim checked against the upstream `server.py` / `pyproject.toml`.
- [x] **AC-3** — the section states the **scope boundary** honestly: the server
  compiles a source string in a temp dir with **no `/include` root**, so only stock
  `<Trade\...>` includes resolve — it fits a self-contained strategy EA, **not**
  shared-library (`<Koni/...>`), quoted-relative, or `#resource` includes, which are
  routed to [`shared-library.md`](../../../skills/koni-ea-dev/references/shared-library.md)'s
  full `/include` contract.
- [x] **AC-4** — koni-ea-dev is **re-graded** and still clears the ≥95 catalog bar
  (skill-grading: re-grade after any change). Final: **98.1/100** — D1 24, D2 25, D3 25
  (author-blind verified vs the upstream repo), D4 24.1.
- [x] **AC-5** — `check-references.py` → 0 dangling on koni-ea-dev and all skills; the
  shared checker suites pass; the `description` stays under the 1024-byte cap.

## Tasks

- [x] **TASK-3.15.1** — verify the server (tools, env vars, runtime, compile invocation) against its repo (AC: 2, 3)
- [x] **TASK-3.15.2** — write the MCP section with the corrected config + scope boundary (AC: 1, 2, 3)
- [x] **TASK-3.15.3** — author-blind D3 review vs the repo + D4 re-grade; confirm ≥95 (AC: 4)
- [x] **TASK-3.15.4** — check-references; LESSONS §35 (AC: 5)

## Dev notes

### What we explicitly did NOT do

- **Did not transcribe the supplied config.** Three of its four keys were wrong; the
  skill ships the corrected form and flags the correction so a reader who has the old
  snippet fixes it.
- **Did not make the MCP server a hard dependency.** The section is an optional
  accelerator ("when an MQL5-compile MCP server is wired"); the compile-clean
  methodology stands without it.
- **Did not claim MCP compilation covers library mode.** The no-`/include` temp-dir
  invocation only resolves stock includes; library-mode compiles are routed to the
  compile-service contract instead.

### References

- [Source: PRD FR-41](../../PRD.md#functional-requirements)
- [Source: koni-ea-dev compilation-and-testing.md](../../../skills/koni-ea-dev/references/compilation-and-testing.md)
- [Source: LESSONS §29, §31, §35](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2, AC-3 | `rg -n 'compile_mql5\|MQL5_EDITOR_PATH\|uvx\|no `/include`' skills/koni-ea-dev/references/compilation-and-testing.md` |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-ea-dev` → 0 dangling |

## Changelog entry

### Added
- koni-ea-dev: a **compile-in-the-loop** section — wire an MQL5-compile MCP server (`compile_mql5` / `search_mql5_docs`) to verify an EA compiles instead of only prescribing it. Ships the **corrected** config (Python/`uvx`, `MQL5_EDITOR_PATH`, no `MQL5_DIR`) after verifying the server's source, with the honest stock-includes-only scope boundary.

## Implementation notes

Verified the server against `server.py` / `pyproject.toml` before writing a word
(three of four supplied config keys were wrong — LESSONS §35). Author-blind D3 review
re-checked every claim against the upstream repo (24/25 → 25 after two trivial fixes);
D4 24.1. koni-ea-dev holds at 98.1/100.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.14](US-3.14-koni-ea-skill-grading.md)
- [CHANGELOG v0.61.0](../../CHANGELOG.md)
