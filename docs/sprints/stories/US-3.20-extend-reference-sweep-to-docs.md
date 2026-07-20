---
id: US-3.20
title: "Extend the reference sweep to docs/ — the doc hub is currently unguarded"
epic: EPIC-3
status: backlog
priority: P2
points: 5
sprint:
due:
version_shipped:
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.19]
assignee: jindo9986
commit:
created: 2026-07-20
updated: 2026-07-20
external_deps:
---

## Goal

`check-references.py` sweeps `skills/` only. `docs/` — including the **pre-commit
checklist every contributor follows** — is unguarded, so the same defect classes the
guard exists to kill live there undetected. Extend the sweep to `docs/`.

## Background

Found by hand during the v0.65.0 doc pass, in live (not historical) instructions:

| Where | Stale claim | Class |
|---|---|---|
| `docs/README.md` pre-commit checklist | told you to run `node skills/koni-docs/scripts/agile-sync-up.mjs` / `generate-status.mjs` — **neither file exists** (migrated to the CLI, AD-7) | ghost script |
| `docs/sprints/README.md` "Scripts" block | the same five dead `.mjs` invocations | ghost script |
| `docs/PRD.md` TS-1 | measured by `sync-test.mjs`, which does not exist | ghost script |
| `docs/PRD.md` TS-3 | "`koni-docs` 9 rules" — `rules.md` has **13** | stated-count drift |

All four are classes the checker already implements; they survived only because the
scan root stops at `skills/`. The irony is exact: the checklist that enforces doc
integrity was itself un-integrity-checked.

## Why it is not a one-line change (hence backlog, not a quick fix)

Pointing the sweep at `docs/` will light up a large pre-existing surface, and most of it
must **not** be "fixed":

- **Historical records are correct as written.** `CHANGELOG.md` carries the AD-7 migration
  table naming every `.mjs` script; shipped stories cite commands valid at their time;
  `CONTEXT.md` is append-only (RULE-7); `docs/superpowers/plans|specs/` are frozen
  planning artifacts. Rewriting these to satisfy a checker is precisely the tidy-looking
  rewrite LESSONS §12 forbids.
- So the work is **not** "run it and fix the output" — it is deciding *what a
  historical doc is allowed to say*, then encoding that: an ignore-list of
  history-bearing paths, or a convention (backtick/fence historical commands so they read
  as mentions, the `quote it, or own it` rule the checker already applies to counts).
- Stated counts in `docs/` need the same triage: which are live claims, which narrate a
  past drift.

## Acceptance criteria (draft)

- [ ] **AC-1** — the sweep covers `docs/` with an explicit, documented policy for
  history-bearing paths (ignore-list or mention-convention), argued in-source.
- [ ] **AC-2** — zero false positives on the historical corpus (CHANGELOG, closed
  stories, CONTEXT, superpowers plans/specs).
- [ ] **AC-3** — the four defects listed above are caught by the sweep, proven by
  reverting each and observing the failure (the repo's speak-and-fail bar).
- [ ] **AC-4** — new fixtures + planted classes + a mutant; the three suites and the
  coverage gate stay green.

## Dev notes

Filed rather than fixed inline because the doc-pass that found it was scoped to
correcting live instructions, and this needs its own scope: a policy decision about
historical docs, not just a wider glob. The four live defects were fixed in that pass;
what remains is the guard so they cannot recur.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §36 (a guard
that advertises a class but implements an instance is a false green — here the instance
is the *scan root*, not the noun); §12 (historical records are corrected forward, never
rewritten to satisfy a tool).

## References

- [Source: US-3.19](US-3.19-mechanize-check-count-drift.md) — mechanized the count class within `skills/`
- [Source: ARCHITECTURE AD-7](../../ARCHITECTURE.md#architecture-decisions) — the `.mjs` → CLI migration these ghosts survive from

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
