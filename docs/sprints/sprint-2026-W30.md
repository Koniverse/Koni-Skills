---
id: sprint-2026-W30
status: done
start: 2026-07-20
end: 2026-07-26
goal: 'Close the loop on koni-harness self-verification: mechanize the drift class that the W29 skill-grading pass had to catch by hand (US-3.19, FR-21, v0.65.0) — a stated check-count is now measured against the vendored `gates.conf`.'
---
## Sprint scope

| US      | Title                                 | Epic   | Pri | Points | Status | Ship    | Story file                                                                                       |
| ------- | ------------------------------------- | ------ | --- | ------ | ------ | ------- | ------------------------------------------------------------------------------------------------ |
| US-3.19 | Mechanize the check-count drift class | EPIC-3 | P2  | 3      | ✅ done | v0.65.0 | [stories/US-3.19-mechanize-check-count-drift.md](stories/US-3.19-mechanize-check-count-drift.md) |
| US-3.21 | koni-docs-standard doc pass          | EPIC-3 | P2  | 2      | ✅ done | v0.65.1 | [stories/US-3.21-koni-docs-standard-pass.md](stories/US-3.21-koni-docs-standard-pass.md)         |
| US-3.22 | Review reporting contract            | EPIC-3 | P1  | 5      | ✅ done | v0.66.0 | [stories/US-3.22-review-reporting-contract.md](stories/US-3.22-review-reporting-contract.md)     |
| US-4.37 | Single-line frontmatter — stop js-yaml folding long scalars | EPIC-4 | P1 | 3 | ✅ done | v0.67.0 | [stories/US-4.37-single-line-frontmatter.md](stories/US-4.37-single-line-frontmatter.md) |

**Total**: 4 stories / 13 pts / 1 contributor.

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

**US-4.37 arrived from downstream, mid-sprint.** `Koniverse/Senti-Quant` reported epic
titles rendering as the literal string `>-` and traced it to this repo's `serializeDoc`.
It is a fourth strand rather than a W31 item because the defect was **actively spreading**:
every `sync` any consumer ran folded more titles, and this repo's own corpus had already
accumulated 7. Letting the sprint run to its planned close would have meant knowingly
shipping a corrupting writer for another week.

It also lands **after** US-3.22, which took v0.66.0 while this work was on a branch — so it
ships as **v0.67.0**. The collision is worth noting because `VERSION` merged *cleanly* into
the wrong answer: both sides wrote the identical string `0.66.0`, so git raised no conflict
and a textual merge would have shipped two different releases under one version. A
same-value merge is not agreement.

**US-4.38 is filed, not fixed.** US-4.37's verification plan listed `npm run typecheck`;
the command turned out never to have run at all. It is unrelated to the serializer and the
fix is a design call, so it is a backlog story with the evidence attached — the same
"residual gap filed, not dropped" move as [US-3.20](../sprints/stories/US-3.20-extend-reference-sweep-to-docs.md)
in v0.65.1. It is not counted in the sprint total; it entered the backlog, not the board.

**US-3.21 is a retroactive filing, and says so.** The doc-surface pass it covers shipped in
`01fae57` without a story, justified as "docs-only". That justification was wrong — the
commit fixed four live defects, including a pre-commit checklist that no longer ran. The
commit is not rewritten; the story cites its real SHA and v0.65.1 is the patch that records
it. See [LESSONS §37](../LESSONS.md).

**Closed on 2026-09-04, at its real end date.** All four stories were `done` and shipped
(v0.65.0 → v0.67.0) before 2026-07-26; the sprint file simply sat at `status: in-progress`
for five weeks afterwards because no work touched the repo and nothing forced the close.
That is the [D32](../CONTEXT.md) shape in its quiet form — not a sprint stretched to
swallow later work, but a board that stopped being true while nobody was looking. The
close records the totals as they stood at the end date: **4 stories / 13 pts**.

W31–W35 are **not opened**. Nothing shipped in those weeks, and a sprint file with no work
in it is bookkeeping, not history — the same call as W28. The next sprint is
[W36](sprint-2026-W36.md), opened on the real date work resumed.
