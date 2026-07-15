---
id: US-3.9
title: "koni-harness uses the new koni-qc security-review — Review-stage trigger + a warn-level gate"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W29
due:
version_shipped: 0.55.0
prd_ref: [FR-40]
arch_ref: []
depends_on: [US-5.11]
assignee: jindo9986
commit:
created: 2026-07-13
updated: 2026-07-13
external_deps:
---

## Goal

koni-qc gained a detailed security-review method in US-5.11 (v0.53.0–0.54.0), but the
koni-harness loop had no way to *use* it: the Review stage invoked koni-qc for AC↔TC
coverage, the unit-coverage bar, skill-grading, and design-review — never security. And
koni-qc's own `security-review.md` named a harness gate to enforce it as *"proposed, not
yet built — koni-harness's to own."* This story closes both: a Review-stage trigger that
tells the loop *when* to run the security review, and the warn-level `security-review`
gate that backstops it — so a change to a security boundary is not shipped silently.

## Background

The two skills pointed at each other with a hole in the middle. security-review.md said
"the gate is koni-harness's to own"; koni-harness's loop said nothing about security
review. An author-blind review of koni-qc (round 2, v0.54.0) caught the "composes" table
citing that gate as if it existed — a fictional pointer. Building it here makes the
pointer true and the loop complete.

The gate is deliberately **precise and opt-in**, because a noisy security reminder gets
muted — the exact failure koni-qc's own method warns against. So the boundary is
*declared by the repo* (`.koni-harness/security-paths` globs), never guessed by a content
heuristic, and the check is **warn-only** (whether a change truly needs a review is a
judgment; a false trigger must never wedge a commit).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §20/§24 (a guard
is unproven until you make it speak *and* fail: the check ships with a plant→assert test
run against three mutations); §28 (a count in prose drifts: de-numbered the gate-catalog's
"eight built-in checks" heading while documenting the two undocumented checks); §21 (the
fictional-gate pointer in koni-qc is the same class as a cheatsheet that restates a
contract — fixed by making the pointer true, not by weakening it).

## Acceptance criteria

- [x] **AC-1** — `.koni-harness/checks/security-review.sh` (vendored into
  `skills/koni-harness/scripts/checks/`) warns when a staged change matches a
  repo-declared boundary glob in `.koni-harness/security-paths`, and is a **silent no-op**
  (exit 0, no output) when no `security-paths` file exists.
- [x] **AC-2** — a matched path is suppressed once listed in
  `.koni-harness/security-review-ack`; a non-boundary change never fires.
- [x] **AC-3** — the check is `warn` severity in `gates.conf` (both live and vendored), so
  it prints `WARN` and **never blocks** a commit.
- [x] **AC-4** — the warn output points at `skills/koni-qc/references/security-review.md`,
  a doc that exists.
- [x] **AC-5** — a repeatable test
  (`skills/koni-harness/scripts/checks/__tests__/test-security-review.sh`) asserts all five
  behaviours and is proven to fail against three planted mutations (guard removed,
  never-warns, wrong reference path).
- [x] **AC-6** — the koni-harness loop's **Review stage** (`agentic-loop-standard.md`) and
  the SKILL.md Review/QA row name koni-qc security-review, triggered when the change crosses
  a security trust boundary.
- [x] **AC-7** — `gate-catalog.md` documents `security-review` (and the previously
  undocumented `skill-references`); its "N built-in checks" count is de-numbered so it
  cannot drift.
- [x] **AC-8** — koni-qc's `security-review.md` "composes" table reflects the shipped gate
  (no longer "proposed, not yet built"). All six skills: 0 dangling references.

## Tasks

- [x] **TASK-3.9.1** — `security-review.sh`: opt-in, path-glob, warn-only, ack-suppressible (AC: 1, 2, 3, 4)
- [x] **TASK-3.9.2** — the plant→assert test + mutation proof (AC: 5)
- [x] **TASK-3.9.3** — `gates.conf` row (live + vendored); `gate-catalog.md` entry + de-number + document `skill-references` (AC: 3, 7)
- [x] **TASK-3.9.4** — Review-stage trigger in `agentic-loop-standard.md` + SKILL.md Review row (AC: 6)
- [x] **TASK-3.9.5** — koni-qc `security-review.md` composes table (AC: 8)

## Dev notes

### What we explicitly did NOT do

- **No content-heuristic detection.** Grepping the diff for `auth|crypto|sql|exec` would
  be noisy, and a noisy warn gets muted — the failure koni-qc's method is built to avoid.
  Boundaries are repo-declared globs. Trigger to revisit: a repo asks for a default
  content-signal layer *and* accepts the false-positive cost.
- **No blocking.** Security review is a judgment call; the gate reminds. A repo opts it up
  to `block` once its boundaries are declared and reviews are consistently recorded.
- **No auto-detection that a review actually happened.** A machine cannot verify a
  judgment was made; the ack file is the human's record. The gate surfaces the boundary
  touch; it does not certify the review.

### References

- [Source: PRD FR-40](../../PRD.md#functional-requirements)
- [Source: US-5.11](US-5.11-security-review-capability.md) — the koni-qc capability this wires in
- [Source: koni-harness gate-catalog](../../../skills/koni-harness/references/gate-catalog.md)
- [Source: LESSONS §20, §24, §28](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2, AC-4, AC-5 | `sh skills/koni-harness/scripts/checks/__tests__/test-security-review.sh` |
| AC-3 | `sh .koni-harness/gate-runner.sh --phase release-commit --dry-run \| grep security-review` shows `[warn]` |
| AC-6, AC-7, AC-8 | `rg -l 'security-review' skills/koni-harness/SKILL.md skills/koni-harness/references/agentic-loop-standard.md skills/koni-harness/references/gate-catalog.md skills/koni-qc/references/security-review.md` returns all four |
| AC-8 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-harness` → 0 dangling |

## Changelog entry

### Added
- koni-harness `security-review` gate (warn, release-commit, opt-in via `.koni-harness/security-paths`) + its plant→assert test; wired koni-qc security-review into the loop's Review stage.

## Implementation notes

Shipped implement-and-verify in one commit. The gate check was proven across five cases
and three mutations before wiring — the session's standing discipline that a guard's green
means nothing until you have made it both speak and fail.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-5.11](US-5.11-security-review-capability.md)
- [CHANGELOG v0.55.0](../../CHANGELOG.md)
