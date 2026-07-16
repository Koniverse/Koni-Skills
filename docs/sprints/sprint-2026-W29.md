---
id: sprint-2026-W29
status: in-progress
start: 2026-07-13
end: 2026-07-19
goal: >-
  Teach koni-docs to hold a calendar commitment: ship story deadlines (US-1.6,
  FR-38, v0.39.0) — a `due` field distinct from the sprint cadence, surfaced in
  STATUS.md and warned about (never blocked) by validate.
---
## Sprint scope

| US     | Title                                              | Epic   | Pri | Points | Status | Ship    | Story file                                                     |
| ------ | -------------------------------------------------- | ------ | --- | ------ | ------ | ------- | -------------------------------------------------------------- |
| US-1.6 | Story deadlines — a `due` date beside the cadence  | EPIC-1 | P1  | 3      | ✅ done | v0.39.0 + v0.40.0 | [stories/US-1.6-story-deadlines.md](stories/US-1.6-story-deadlines.md) |

| US-3.9 | koni-harness uses koni-qc security-review              | EPIC-3 | P2  | 3      | ✅ done | v0.55.0           | [stories/US-3.9-harness-security-review-gate.md](stories/US-3.9-harness-security-review-gate.md) |
| US-3.10 | koni-setup docs sync — security-review capability + gate | EPIC-3 | P2  | 1      | ✅ done | v0.56.0           | [stories/US-3.10-koni-setup-security-review-sync.md](stories/US-3.10-koni-setup-security-review-sync.md) |
| US-3.11 | koni-ea — MQL5 Expert Advisor authoring standard skill | EPIC-3 | P2  | 5      | ✅ done | v0.57.0           | [stories/US-3.11-koni-ea-mql5-standard.md](stories/US-3.11-koni-ea-mql5-standard.md) |
| US-3.12 | koni-ea refocus — scope to the MQL5 programming methodology | EPIC-3 | P2  | 2      | ✅ done | v0.58.0           | [stories/US-3.12-koni-ea-programming-focus.md](stories/US-3.12-koni-ea-programming-focus.md) |
| US-3.13 | Split koni-ea → koni-ea-dev + koni-ea-ops | EPIC-3 | P2  | 3      | ✅ done | v0.59.0           | [stories/US-3.13-koni-ea-split-dev-ops.md](stories/US-3.13-koni-ea-split-dev-ops.md) |
| US-3.14 | koni-ea-dev + koni-ea-ops skill-grading pass (≥95 bar) | EPIC-3 | P2  | 3      | ✅ done | v0.60.0           | [stories/US-3.14-koni-ea-skill-grading.md](stories/US-3.14-koni-ea-skill-grading.md) |
| US-3.15 | koni-ea-dev — compile-in-the-loop via an MQL5 MCP server | EPIC-3 | P2  | 2      | ✅ done | v0.61.0           | [stories/US-3.15-koni-ea-dev-mcp-compile.md](stories/US-3.15-koni-ea-dev-mcp-compile.md) |
| US-3.16 | koni-ea-dev — refine the MCP compile section (deeper read) | EPIC-3 | P3  | 1      | ✅ done | v0.62.0           | [stories/US-3.16-koni-ea-dev-mcp-refine.md](stories/US-3.16-koni-ea-dev-mcp-refine.md) |

**Total**: 9 stories / 23 pts / 1 contributor.

## Carried out of this sprint

[US-1.7](stories/US-1.7-skill-grading-open-findings.md) (backlog, 5 pts) — the open
skill-grading findings. US-1.6's deliverable shipped; what did not converge is the
verification apparatus the grading rounds built around it, plus four unrun evals. Filed as
its own story rather than extending US-1.6 further: the checker is now shared infrastructure
used by all six skills, not this feature's tooling (LESSONS §13).

## Goal detail

koni-docs could express a *rhythm* (`sprint.start` / `sprint.end`) and
*bookkeeping* (`created` / `updated`), but never a *commitment*. Work carrying a
contract date, a customer demo, or an audit window had nowhere to record it, so
no tool could surface it before it was missed.

US-1.6 adds `due` — deliberately sparse (no inheritance from `sprint.end`) and
deliberately non-blocking (a missed date warns, it never fails a commit).

## Notes

Sprint W28 (2026-07-06 → 07-12) was not opened: no work shipped in that week.
Recording the gap rather than back-dating W29's work into it — see
[CONTEXT D32](../CONTEXT.md) and [LESSONS §12](../LESSONS.md) for why sprints are
anchored to real ship dates and corrected forward, never rewritten to look tidy.
