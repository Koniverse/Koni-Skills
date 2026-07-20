---
id: sprint-2026-W30
status: in-progress
start: 2026-07-20
end: 2026-07-26
goal: >-
  Close the loop on koni-harness self-verification: mechanize the drift class that
  the W29 skill-grading pass had to catch by hand (US-3.19, FR-21, v0.65.0) — a
  stated check-count is now measured against the vendored `gates.conf`.
---
## Sprint scope

| US      | Title                                 | Epic   | Pri | Points | Status | Ship    | Story file                                                                                       |
| ------- | ------------------------------------- | ------ | --- | ------ | ------ | ------- | ------------------------------------------------------------------------------------------------ |
| US-3.19 | Mechanize the check-count drift class | EPIC-3 | P2  | 3      | ✅ done | v0.65.0 | [stories/US-3.19-mechanize-check-count-drift.md](stories/US-3.19-mechanize-check-count-drift.md) |

**Total**: 1 story / 3 pts / 1 contributor.

## Goal detail

W29's skill-grading pass (US-3.18) found koni-harness's docs contradicting its own
`gates.conf` — "six release-commit-only checks" against a seven-row config — a defect
that had survived every gate for several versions because the noun `checks` was not in
the reference checker's counted set. Finding it cost a full four-dimension manual
re-grade.

This sprint removes that cost: the class is now mechanized, proven to speak (a planted
class + the reproduced historical defect) and to fail (a mutant that drops the noun is
killed), with the branch-coverage gate forcing a fixture for every new branch.

## Notes

**Opened on the real ship date, not backdated into W29.** US-3.19 was authored and
shipped on 2026-07-20; sprint W29 closed 2026-07-19. Filing it into the closed sprint to
keep the work "in one place" is exactly the tidy-looking rewrite this repo refuses — see
[CONTEXT D32](../CONTEXT.md) and [LESSONS §12](../LESSONS.md). W29 is marked `done` at 11
stories / 27 pts. The date drift that surfaced this is recorded in
[CONTEXT D40](../CONTEXT.md).
