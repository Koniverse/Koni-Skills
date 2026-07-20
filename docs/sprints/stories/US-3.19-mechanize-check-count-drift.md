---
id: US-3.19
title: "Mechanize the check-count drift class — the guard that would have caught US-3.18's defect"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W30
due:
version_shipped: 0.65.0
prd_ref: [FR-21]
arch_ref: []
depends_on: [US-3.18]
assignee: jindo9986
commit: pending
created: 2026-07-20
updated: 2026-07-20
external_deps:
---

## Goal

Optimize koni-harness by removing the need for the expensive path that found its last
defect. US-3.18's count drift ("six release-commit-only checks" against a seven-row
`gates.conf`) survived every gate for several versions and was caught only by a full
manual re-grade. Make that entire class **mechanically impossible to ship again**.

## Background

The shared guard already owned this class *in its own words* — `check-references.py`
documents itself as checking "a count stated in prose — a promise to stay in sync with
something you do not control." In code it was two nouns: `(rules|subcommands)`. The noun
`checks` was never in scope, so the gate printed green while the docs contradicted the
config. A guard that advertises a category but implements two members is a **false green**
(LESSONS §36, documented here).

Chosen fix follows *compose, never reproduce*: extend the checker that already owns
count-drift rather than build a parallel "gate-inventory" check.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §27 (derive the
corpus from the claim surface, not the last bug report — so the fix covers the noun class,
with the exclusion argued in-source); §28 (a count in prose drifts; de-number what you
cannot count unambiguously); §20/§24 (a guard is unproven until you make it **speak and
fail** — hence the planted class *and* the mutant); §36 (documented here).

## What ships

- **`STATED_COUNT`** now also matches `release-commit-only checks` / `release-only checks`,
  and the word-number set widened (`six|eight|nine|ten` joined `seven|twelve|thirteen`).
- **`count_of()`** gained the ground truth: rows in the **vendored**
  `skills/koni-harness/scripts/gates.conf` whose phase field is exactly `release-commit`
  (comments/blank lines skipped; two-phase and `pre-push` rows correctly excluded). The
  vendored file is the right source because the docs describe what `install-gate.sh` ships,
  not the monorepo's own live `.koni-harness/gates.conf` (LESSONS §30).
- **Deliberate exclusion, argued in-source**: `N built-in checks` is *not* counted — its
  ground truth is ambiguous (is the `tests` passthrough a "built-in check"?), and an
  ambiguous count is one you **de-number** (which koni-harness now does) rather than
  mechanize.

## Acceptance criteria

- [x] **AC-1** — a wrong `N release-commit-only checks` claim is caught with the actual
  count; **proved against the real historical defect**: planting `seven → six` in
  `gate-catalog.md` fails with "claims 6 release-commit-only checks, there are 7", and the
  corrected doc passes.
- [x] **AC-2** — ground truth is the vendored `scripts/gates.conf`, parsed by phase field;
  comments/blanks skipped; `work-commit,release-commit` and `pre-push` rows not counted.
- [x] **AC-3** — fixtures exercise **both** resolution paths: `fixtures/koni-harness/`
  (primary — `root/scripts/gates.conf`, states the count correctly) and `fixtures/bad/`
  (sibling-glob fallback, states it wrongly).
- [x] **AC-4** — the guard is proven to **speak and fail**: a new planted defect class
  (MIN_CLASSES 37→38) and a new mutant that drops the noun (MIN_MUTANTS 20→21) are both
  killed by the suite; the branch-coverage gate still passes (252 lines, up from 234).
- [x] **AC-5** — no false positives: all 8 skills report 0 dangling; `koni-docs validate`
  clean.
- [x] **AC-6** — `gate-catalog.md`'s description of the checker enumerates the counted
  nouns and does not imply `built-in checks` is counted (docs match the guard — otherwise
  the fix would create the drift it removes).

## Tasks

- [x] **TASK-3.19.1** — extend `STATED_COUNT` + `WORD_NUM`; add the `count_of` branch (AC: 1, 2)
- [x] **TASK-3.19.2** — add the koni-harness fixture + the planted wrong claim (AC: 3)
- [x] **TASK-3.19.3** — register the defect class + the mutant; raise both floors (AC: 4)
- [x] **TASK-3.19.4** — prove against the historical defect; sync gate-catalog; LESSONS §36 (AC: 1, 5, 6)

## Dev notes

### What we explicitly did NOT do

- **Did not build a separate `gate-inventory` check.** The checker that already owns
  count-drift owns this too — a second guard for the same class is the drift source
  koni-harness warns about.
- **Did not mechanize `N built-in checks`.** Ambiguous ground truth; §28's answer there is
  de-numbering, already done in US-3.18. The exclusion is written at the regex so it is
  scope, not a silent hole.
- **Did not widen to every possible noun speculatively.** Only the class with a real,
  unambiguous ground truth and a demonstrated failure.

### References

- [Source: US-3.18](US-3.18-harness-skill-grading.md) — the grade that surfaced the defect
- [Source: LESSONS §20, §24, §27, §28, §30, §36](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | plant `seven→six` in `gate-catalog.md`, run `check-references.py skills/koni-harness` → "claims 6 release-commit-only checks, there are 7" |
| AC-4 | the three suites under `skills/koni-docs/scripts/__tests__/` all pass (38 classes · 21 mutants · coverage) |
| AC-5 | `check-references.py` on every `skills/*/` → 0 dangling |

## Changelog entry

### Added
- **Check-count drift is now mechanized.** `check-references.py` counts `N release-commit-only checks` against the vendored `gates.conf`, closing the class that let "six release-commit-only checks" survive several versions against a seven-row config (found only by a manual re-grade in US-3.18). Proven by a new planted defect class (38) and a new mutant (21); `N built-in checks` is deliberately excluded (ambiguous ground truth — de-numbered instead), with the reason argued in-source.
- **LESSONS §36** — a guard that advertises a class but implements an instance is a false green.

## Implementation notes

Composes with the existing guard rather than adding a parallel one. Verified the way this
repo requires: the guard was made to **speak** (planted class + the real historical defect
reproduced and caught) and to **fail** (a mutant dropping the noun is killed), with the
branch-coverage gate forcing fixtures for every new branch.

Lessons: §36 recorded — a guard's stated scope is read as its actual scope.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.18](US-3.18-harness-skill-grading.md)
- [CHANGELOG v0.65.0](../../CHANGELOG.md)
