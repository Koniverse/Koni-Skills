---
id: US-3.21
title: "koni-docs-standard doc pass — fix ghost-script instructions, stale counts, FR coverage"
epic: EPIC-3
status: done
priority: P2
points: 2
sprint: sprint-2026-W30
due:
version_shipped: 0.65.1
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.19]
assignee: jindo9986
commit: 01fae57
created: 2026-07-20
updated: 2026-07-20
external_deps:
---

## Goal

Audit the repo's doc surface against the koni-docs §3c pre-commit checklist after the
v0.55.0–v0.65.0 run, and correct every **live** instruction or claim that had gone stale.

## Background

Filed **retroactively**. The work shipped in `01fae57` without a story, on the reasoning
that it was "docs-only, so no story/version needed". That reasoning was wrong and is the
lesson this story records ([LESSONS §37](../../LESSONS.md)): *docs-only* describes which
files moved, not whether the change is substantive. `01fae57` fixed four real defects.
Correct-forward applies — the commit is not rewritten; this story documents it and cites
its real SHA.

The four defects were all classes `check-references.py` already kills. They survived
because the sweep stops at `skills/` and never enters `docs/`:

| Where | Stale claim | Class |
|---|---|---|
| `docs/README.md` pre-commit checklist | ran `agile-sync-up.mjs` / `generate-status.mjs` — **neither exists** (migrated to the CLI, AD-7) | ghost script |
| `docs/sprints/README.md` "Scripts" block | the same five dead `.mjs` invocations | ghost script |
| `docs/PRD.md` TS-1 | measured by `sync-test.mjs`, which does not exist | ghost script |
| `docs/PRD.md` TS-3 | "`koni-docs` 9 rules" — `rules.md` has **13** | stated-count drift |

The sharpest of these: **the checklist that enforces doc integrity was itself broken** —
anyone following it verbatim hit two command-not-found errors.

Filing this story surfaced **three more in a file the original pass had already edited** —
`docs/sprints/README.md` still claimed "`agile-sync-up.mjs` propagates automatically" (a
ghost script *and* a false claim: nothing propagates, because `sync` is deliberately not
run — D39), pointed at `sprint-2026-W22.md` as the active sprint (eight sprints stale), and
called `rules.md` "9 enforced rules" against 13. A pass that edits the top of a file and
misses the same defect class at the bottom is [LESSONS §8](../../LESSONS.md) — each fix
surfaces the next — and it is the direct argument for US-3.20: a human sweep of a doc is not
a guard over it.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §12 (historical
records are corrected forward, never rewritten: the CHANGELOG AD-7 migration table, closed
stories, CONTEXT, and superpowers plans correctly name the `.mjs` scripts *as they were*
and were deliberately left untouched); §28/§36 (a stated count drifts; a guard's scan root
is as much a scope claim as its noun set); §37 (documented here).

## Acceptance criteria

- [x] **AC-1** — every **live** instruction in `docs/` runs: `docs/README.md` and
  `docs/sprints/README.md` name `npx koni-docs status|validate|inject-tasks|backfill-*`
  and `check-references.py`, not the removed `.mjs` files.
- [x] **AC-2** — the `sync` omission is explained where it would be expected, pointing at
  [CONTEXT D39](../../CONTEXT.md) (CLI 0.10.0 over-aggregates the Ship column).
- [x] **AC-3** — `docs/PRD.md` TS-1 measures a command that exists and passes
  (`npm test --prefix packages/koni-docs` → verified exit 0, 144/144); TS-3 states **13**
  rules, matching `rules.md`.
- [x] **AC-4** — `docs/SETUP.md` troubleshooting names the CLI; `docs/ARCHITECTURE.md` no
  longer claims "No more `scripts/` inside skills" (false — `check-references.py` and the
  harness gate assets live there), distinguishing consumer automation from repo-internal
  tooling.
- [x] **AC-5** — `docs/PRD.md` FR-21 and `EPIC-3` FR-21 record the v0.63.0 / v0.64.0 /
  v0.65.0 refinements.
- [x] **AC-6** — historical records untouched; `koni-docs validate` clean; all 8 skills 0
  dangling; STATUS regenerated.
- [x] **AC-7** — the residual gap is filed, not dropped:
  [US-3.20](US-3.20-extend-reference-sweep-to-docs.md) (backlog) to extend the sweep to
  `docs/`.

## Tasks

- [x] **TASK-3.21.1** — audit the doc surface against the §3c checklist (AC: 1–5)
- [x] **TASK-3.21.2** — fix the four live defects + the ARCHITECTURE claim (AC: 1–4)
- [x] **TASK-3.21.3** — update FR-21 coverage in PRD + EPIC-3 (AC: 5)
- [x] **TASK-3.21.4** — verify, file US-3.20, regenerate STATUS (AC: 6, 7)

## Dev notes

### What we explicitly did NOT do

- **Did not rewrite historical `.mjs` references.** The CHANGELOG's AD-7 migration table,
  closed stories, `CONTEXT.md` (append-only, RULE-7), and `docs/superpowers/plans|specs/`
  name those scripts correctly *for their time*. Editing them to satisfy a future checker
  is the tidy-looking rewrite LESSONS §12 forbids.
- **Did not "fix" `docs/PRD.md`'s Phase 2 Exit Criteria**, which still names
  `agile-sync-up.mjs`. Phase 2 shipped at v0.2.0; that line records the bar *as it was
  defined then*, not an instruction anyone runs now. Judged historical — §12. The two PRD
  lines that *were* live instructions (the commit-workflow "Run scripts" step, the BS-2
  grep pattern) were fixed. This triage — live claim vs. narrated past — is precisely the
  policy US-3.20 has to encode before a machine can do it.
- **Did not extend the sweep to `docs/` inline.** That needs a policy for history-bearing
  paths, not a wider glob — filed as US-3.20.
- **Did not rewrite `01fae57`.** The commit stands; this story documents it.

### References

- [Source: US-3.19](US-3.19-mechanize-check-count-drift.md), [US-3.20](US-3.20-extend-reference-sweep-to-docs.md)
- [Source: CONTEXT D39](../../CONTEXT.md), [ARCHITECTURE AD-7](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -rn "node skills/.*scripts/.*\.mjs" docs/README.md docs/SETUP.md docs/sprints/README.md` → no hits |
| AC-3 | `npm test --prefix packages/koni-docs` → exit 0; `grep -cE '^### RULE-[0-9]+' skills/koni-docs/references/rules.md` → 13 |
| AC-6 | `npx koni-docs validate --docs-path docs/` → clean; `check-references.py` on every `skills/*/` → 0 dangling |

## Changelog entry

### Fixed
- **Doc-surface pass to the koni-docs standard.** The pre-commit checklist in `docs/README.md` (and the Scripts block in `docs/sprints/README.md`) named `.mjs` scripts removed in the AD-7 CLI migration — following it verbatim failed. Replaced with `npx koni-docs …` + `check-references.py`, with the `sync` omission explained (CONTEXT D39). `PRD` TS-1 now measures a command that exists and passes (144/144); TS-3 corrected 9 → **13** rules. `SETUP` troubleshooting updated; `ARCHITECTURE`'s false "No more `scripts/` inside skills" corrected. `PRD`/`EPIC-3` FR-21 record the v0.63.0–v0.65.0 refinements. Historical records left as written (LESSONS §12).

## Implementation notes

Shipped in `01fae57`; this story is the retroactive record, filed after the omission was
noticed. The version bump to 0.65.1 is the honest semver signal for corrective doc work —
a patch, since no capability changed.

Lessons: §37 recorded — "docs-only" is a claim about which files moved, not about whether
the change deserves a story.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [CHANGELOG v0.65.1](../../CHANGELOG.md)
