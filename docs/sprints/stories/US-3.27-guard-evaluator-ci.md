---
id: US-3.27
title: "Guard evaluator — one command runs every check self-test and proves the coverage against gates.conf, reproduced in CI"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W36
due:
version_shipped: 0.70.0
prd_ref: [FR-45]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: pending
created: 2026-09-04
updated: 2026-09-04
external_deps:
---

## Goal

Make "the gate's checks are all tested and green" a claim a machine can reproduce, on a
shell that is not the author's. Before this, there was no command that ran the harness
suites, no statement of which checks had suites at all, and no CI anywhere in the repo.

## Background

The comparison against `awslabs/aidlc-workflows` credited it with an `aidlc-evaluator`
(golden test cases + CI) that Koni appeared to lack. Reading this repo properly corrected
that: koni-docs' `check-references.py` already carries a *more* rigorous apparatus than
AI-DLC's — a planted-defect suite, a mutation suite that kills narrowed checkers, and a
branch-coverage gate that derives the corpus from the code (LESSONS §27/§28).

So the real gap was narrower and more specific:

1. **No CI at all.** Every guard was local-only, meaning "all green" was reproduced by
   exactly one machine, one shell, one toolchain — whichever the author had.
2. **The discipline was not applied to the gate's own checks.** Five of ten shipped checks
   had self-tests; the other five had none, and nothing named the gap. There was no runner,
   so running them was a hand-assembled list — which is a list that drifts.

The borrowed idea, restated in this repo's terms: **derive coverage from the config, not
from memory.** `run-all.sh` reads `gates.conf`, and a check named by no suite fails the
run. Adding a row without a test is now a red build instead of a quiet gap.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§20** (a guard
is a hypothesis until you try to break it — every new suite plants its defects, and both
new evaluator assertions were proven to fail before being trusted); **§22** (trust silence
only after you have made the guard speak); **§28** (a hand-written corpus lags, because the
same memory writes the tests and the mutants — hence coverage derived from `gates.conf`);
**§36** (a guard that advertises a class but implements an instance — *found again in this
story*, see below); **§39** (a guard that bails out on the case it was written for is a
false green — the direct warrant for the `koni-docs-validate` suite's design, where three
skip-passes make a permanent `0` possible).

## What ships

- **`skills/koni-harness/scripts/__tests__/run-all.sh`** (new) — runs every suite under
  `scripts/__tests__/` and `scripts/checks/__tests__/`, then derives coverage from the
  **shipped** `gates.conf` and fails on any `UNCOVERED` check. Two floors
  (`MIN_SUITES` / `MIN_CHECKS`) stop an emptied corpus from reading as a pass — the same
  bottom-turtle role as koni-docs' `MIN_CLASSES`.
- **Four new check suites** (42 assertions): `test-changelog-anchor.sh` (8),
  `test-credential-scan.sh` (12), `test-koni-docs-validate.sh` (10),
  `test-story-status-consistency.sh` (12).
- **`skills/koni-harness/scripts/checks/story-status-consistency.sh`** — regex fix (below),
  mirrored into the vendored `.koni-harness/checks/`.
- **`.github/workflows/ci.yml`** (new) — three independent jobs so a red build names the
  broken layer: harness guards (matrix `sh`/dash **and** bash), skill-reference guards
  (self-test → mutants → coverage → sweep), and the `@koniverse/koni-docs` package tests.
- **`skills/koni-harness/references/gate-catalog.md`** — a *Testing a check* section (the
  three obligations, the floors, the CI matrix), self-test lines on the four newly covered
  checks, and step 4 in *Adding a custom check*.

## Acceptance criteria

- [x] AC-1 — One command runs every harness self-test and reports per-suite pass/fail.
- [x] AC-2 — Coverage is derived from `gates.conf`, not a hand-kept list; an uncovered
  check fails the run and is named.
- [x] AC-3 — Coverage is scoped to the **shipped** config, so a consumer repo's local rows
  are not held to a rule the harness has no standing to make.
- [x] AC-4 — Floors exist so that deleting suites or config rows fails rather than passes.
- [x] AC-5 — Every check in the shipped `gates.conf` has a self-test (10/10).
- [x] AC-6 — Each new suite plants the defect classes it claims to catch, pins the
  skip-passes *as* skip-passes, and pins at least one real failure.
- [x] AC-7 — Both new evaluator assertions were proven able to fail (planted defects).
- [x] AC-8 — CI runs the evaluator under both dash and bash on push and PR.
- [x] AC-9 — The obligation is documented where check authors read it (gate-catalog), not
  only where it is implemented (§18).

## Implementation notes

**Verification evidence:**

```
$ sh skills/koni-harness/scripts/__tests__/run-all.sh | tail -3
----
suites: 15 run, 0 failed | checks: 10 declared, 0 uncovered
$ bash .../run-all.sh >/dev/null; echo $?      → 0
```

215 assertions across 15 suites. Both guards were made to speak before being believed:

```
# planted: a gates.conf row with no suite
UNCOVERED  brand-new-check   brand-new-check.sh  <-- no suite references this check
runner exit = 1
# planted: hide scripts/checks/__tests__
EVALUATOR: found 9 suites, floor is 12 — suites went missing
```

**A live defect surfaced while writing the suites — the story's most useful output.**
`story-status-consistency.sh` documented tolerance for "surrounding markdown emphasis", and
its own catalog entry gave `**status:** done` as the example. The pattern
`^[*_ ]*status:?[*_ ]*…` could not match `**status**: done` — emphasis *before* the colon —
which is the more common bold spelling. A story written that way was skipped in silence for
as long as the check has existed.

This is [LESSONS §36](../../LESSONS.md) with no modification needed: a guard advertising a
class (`emphasis`) while implementing an instance (`emphasis inside the colon`). It is
therefore **not** filed as a new lesson — §36 already says it, and a §42 restating it would
add length without adding knowledge. The catalog entry now states both spellings, and the
suite pins both plus the `doneish` guard.

The fix widens what the check flags. Re-running it over this repo's corpus reports the same
7 stories as before, so no pre-existing warn-level result changed.

**The credential-scan suite blocked its own commit, and the allowlist was the wrong
fix.** Writing secret-shaped fixtures into a file that is itself staged trips the check —
correctly. The obvious remedy is `.koni-harness/secret-allow`, which is the documented
escape hatch and is exactly what test #10 asserts works. It was rejected here: the
allowlist is a **substring** filter with no file scoping, so exempting
`-----BEGIN … PRIVATE KEY-----` to satisfy a fixture would exempt the first line of a
*real* leaked key, in every future commit, repo-wide. The fixtures are assembled from
concatenated halves instead — the exact string exists at runtime, never on a line in the
file — which keeps the guard at full strength. Taking the convenient escape hatch here
would have quietly widened the one blocking check that guards credentials.

**Scope note — `skill-references` is deliberately uncovered by this evaluator.** It is
monorepo-only, absent from the shipped `gates.conf`, and already carries a stronger guard
chain of its own (self-test + mutants + branch coverage), which CI now runs as a separate
job.
