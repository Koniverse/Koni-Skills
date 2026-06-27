---
id: sprint-2026-W26
status: active
start: 2026-06-22T00:00:00.000Z
end: 2026-06-28T00:00:00.000Z
goal: >-
  Open EPIC-3 (Koniverse skill catalog expansion) with its first concrete
  delivery: ship `koni-setup` (v0.9.0) — the first non-docs Koniverse skill, a
  day-0 project bootstrapper/onboarder that scaffolds + wires a repo to the
  shared standard while delegating all doc-body templates to koni-docs. Closes
  FR-10 and adds FR-20. Then ship `koni-harness` (v0.10.0, US-3.3) — the Koni
  Agentic Loop standard + portable pre-commit gate (FR-21), then `koni-harness`
  Phase 2 (v0.11.0, US-3.4) — the single-story loop-runner (FR-22). 3 stories /
  13 pts / 1 contributor.
---
## Sprint scope

First sprint after the W22 EPIC-4 push. Scope is intentionally narrow: prove
EPIC-3 can ship a non-docs skill that coexists with koni-docs without
duplicating it.

| US     | Title                                                   | Epic   | Pri | Points | Status | Ship    | Story file                                                                                         |
| ------ | ------------------------------------------------------- | ------ | --- | ------ | ------ | ------- | -------------------------------------------------------------------------------------------------- |
| US-3.2 | koni-setup — Koniverse project bootstrapper & onboarder | EPIC-3 | P1  | 5      | ✅ done | v0.9.0  | [stories/US-3.2-koni-setup-bootstrapper.md](stories/US-3.2-koni-setup-bootstrapper.md)             |
| US-3.3 | koni-harness Phase 1 — Agentic Loop standard + gate     | EPIC-3 | P1  | 5      | ✅ done | v0.10.0 | [stories/US-3.3-koni-harness-agentic-loop.md](stories/US-3.3-koni-harness-agentic-loop.md)         |
| US-3.4 | koni-harness Phase 2 — single-story loop-runner         | EPIC-3 | P1  | 3      | ✅ done | v0.11.0 | [stories/US-3.4-koni-harness-loop-runner.md](stories/US-3.4-koni-harness-loop-runner.md)           |
| US-3.5 | koni-harness P3a — context-loader (session digest)      | EPIC-3 | P1  | 3      | ✅ done | v0.12.0 | [stories/US-3.5-koni-harness-context-loader.md](stories/US-3.5-koni-harness-context-loader.md)     |
| US-3.6 | koni-harness P2.5 — sprint-sequencer                    | EPIC-3 | P1  | 3      | ✅ done | v0.13.0 | [stories/US-3.6-koni-harness-sprint-sequencer.md](stories/US-3.6-koni-harness-sprint-sequencer.md) |
| US-3.7 | koni-harness P3b — multi-tool session adapters          | EPIC-3 | P1  | 2      | ✅ done | v0.14.0 | [stories/US-3.7-koni-harness-session-adapters.md](stories/US-3.7-koni-harness-session-adapters.md) |
| US-3.1 | Plugin-skill pattern + koni-nextjs reference            | EPIC-3 | P1  | 3      | ✅ done | v0.15.0 | [stories/US-3.1-plugin-skill-pattern.md](stories/US-3.1-plugin-skill-pattern.md)                   |

**Total**: **7 stories / 24 points** — shipped v0.9.0 (koni-setup) + v0.10.0–v0.14.0
(koni-harness P1 / P2 / P3a / P2.5 / P3b) + v0.15.0 (plugin pattern + koni-nextjs).
**EPIC-3 fully delivered**: koni-setup + the complete koni-harness roadmap + the
plugin-skill pattern with the koni-nextjs reference. All EPIC-3 FRs shipped.

## Sprint goal recap

The W22 sprint closed EPIC-4 at 100% and left EPIC-3 as the only open epic —
"move beyond koni-docs alone." W26 lands that move: `koni-setup` is the first
sibling skill in the catalog. It was reverse-engineered from six live Koniverse
repos and ships profile-aware (code / devops / content) bootstrap + onboard
flows.

The decisive design choice (logged as [D12](CONTEXT.md)) is the **delegation
boundary**: koni-setup owns scaffolding + wiring + skill-set install + repo-type
detection, and hands every documentation-body need to koni-docs. This is what
lets two skills touch the same `docs/` surface without conflicting — the EPIC-3
cross-cutting invariant ("plugin/sibling skills MUST NOT duplicate koni-docs
core") in practice.

Validated by a sandboxed sanity test (independent bootstrap + onboard subagents)
that surfaced a cluster of real defects in the first draft — captured as
[LESSONS §6](LESSONS.md) and fixed before ship.

## Carry / next

- **US-3.1** (plugin-skill pattern: `koni-supabase` / `koni-nextjs`) — still
  backlog; not yet assigned to a sprint (no execution plan locked).
- Optional follow-up: run koni-setup's description-optimization loop to tune
  trigger accuracy; dogfood koni-setup on the next greenfield Koni repo.
