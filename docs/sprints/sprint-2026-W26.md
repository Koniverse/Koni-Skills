---
id: sprint-2026-W26
status: closed
start: 2026-06-22T00:00:00.000Z
end: 2026-06-28T00:00:00.000Z
goal: 'Deliver EPIC-3 (Koniverse skill catalog expansion) end-to-end: ship `koni-setup` (US-3.2, v0.9.0 — day-0 bootstrapper/onboarder), the full `koni-harness` (US-3.3, v0.10.0–v0.14.0 across 5 phases — gate + loop-runner + context-loader + sprint-sequencer + session-adapters), and the plugin-skill pattern + `koni-nextjs` reference (US-3.1, v0.15.0). 3 stories / 24 pts / 1 contributor. Closes FR-9, FR-10, FR-20–FR-25 — EPIC-3 fully delivered.'
---
## Sprint scope

First sprint after the W22 EPIC-4 push. Scope is intentionally narrow: prove
EPIC-3 can ship a non-docs skill that coexists with koni-docs without
duplicating it.

| US     | Title                                                   | Epic   | Pri | Points | Status | Ship            | Story file                                                                                 |
| ------ | ------------------------------------------------------- | ------ | --- | ------ | ------ | --------------- | ------------------------------------------------------------------------------------------ |
| US-3.2 | koni-setup — Koniverse project bootstrapper & onboarder | EPIC-3 | P1  | 5      | ✅ done | v0.9.0          | [stories/US-3.2-koni-setup-bootstrapper.md](stories/US-3.2-koni-setup-bootstrapper.md)     |
| US-3.3 | koni-harness — portable agentic-loop harness (5 phases) | EPIC-3 | P1  | 16     | ✅ done | v0.10.0–v0.14.0 | [stories/US-3.3-koni-harness-agentic-loop.md](stories/US-3.3-koni-harness-agentic-loop.md) |
| US-3.1 | Plugin-skill pattern + koni-nextjs reference            | EPIC-3 | P1  | 3      | ✅ done | v0.15.0         | [stories/US-3.1-plugin-skill-pattern.md](stories/US-3.1-plugin-skill-pattern.md)           |

**Total**: **3 stories / 24 points** — exactly the committed scope. **EPIC-3
fully delivered** in-sprint (US-3.2 shipped 06-26; US-3.3 + US-3.1 shipped
06-28). (koni-harness was consolidated from 5 phase-stories into one — see
[CONTEXT D14](CONTEXT.md).)

> **Correction note (2026-07-03, [CONTEXT D32](CONTEXT.md))**: this file was
> previously stretched to 15 stories / 66 points by appending every story shipped
> after the sprint's 06-28 end date instead of opening the next sprint. That was
> a documentation-honesty violation ([LESSONS §12](LESSONS.md)). The 12 stories
> executed 06-29 → 07-05 now live where they belong:
> [sprint-2026-W27](sprint-2026-W27.md).

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

- US-3.1 was pulled in and shipped in-sprint (v0.15.0) after US-3.3 landed early.
- The EPIC-5 QC drive (koni-qc and its hardening rounds) opens in
  [sprint-2026-W27](sprint-2026-W27.md).
