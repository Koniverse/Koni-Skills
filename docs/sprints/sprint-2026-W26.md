---
id: sprint-2026-W26
status: active
start: 2026-06-22T00:00:00.000Z
end: 2026-06-28T00:00:00.000Z
goal: >-
  Deliver EPIC-3 (Koniverse skill catalog expansion) end-to-end: ship
  `koni-setup` (US-3.2, v0.9.0 — day-0 bootstrapper/onboarder), the full
  `koni-harness` (US-3.3, v0.10.0–v0.14.0 across 5 phases — gate + loop-runner +
  context-loader + sprint-sequencer + session-adapters), and the plugin-skill
  pattern + `koni-nextjs` reference (US-3.1, v0.15.0). 3 stories / 24 pts / 1
  contributor. Closes FR-9, FR-10, FR-20–FR-25 — EPIC-3 fully delivered.
---
## Sprint scope

First sprint after the W22 EPIC-4 push. Scope is intentionally narrow: prove
EPIC-3 can ship a non-docs skill that coexists with koni-docs without
duplicating it.

| US     | Title                                                                | Epic   | Pri | Points | Status | Ship            | Story file                                                                                           |
| ------ | -------------------------------------------------------------------- | ------ | --- | ------ | ------ | --------------- | ---------------------------------------------------------------------------------------------------- |
| US-3.2 | koni-setup — Koniverse project bootstrapper & onboarder              | EPIC-3 | P1  | 5      | ✅ done | v0.9.0          | [stories/US-3.2-koni-setup-bootstrapper.md](stories/US-3.2-koni-setup-bootstrapper.md)               |
| US-3.3 | koni-harness — portable agentic-loop harness (5 phases)              | EPIC-3 | P1  | 16     | ✅ done | v0.10.0–v0.14.0 | [stories/US-3.3-koni-harness-agentic-loop.md](stories/US-3.3-koni-harness-agentic-loop.md)           |
| US-3.1 | Plugin-skill pattern + koni-nextjs reference                         | EPIC-3 | P1  | 3      | ✅ done | v0.15.0         | [stories/US-3.1-plugin-skill-pattern.md](stories/US-3.1-plugin-skill-pattern.md)                     |
| US-5.1 | koni-qc — QC methodology & coverage-intelligence skill               | EPIC-5 | P1  | 5      | ✅ done | v0.16.0         | [stories/US-5.1-koni-qc.md](stories/US-5.1-koni-qc.md)                                               |
| US-5.2 | skill-grading — QC for skill artifacts, wired into the loop          | EPIC-5 | P1  | 3      | ✅ done | v0.18.0         | [stories/US-5.2-skill-grading.md](stories/US-5.2-skill-grading.md)                                   |
| US-5.3 | test-organization — standard docs/tests taxonomy + scaffolding       | EPIC-5 | P1  | 3      | ✅ done | v0.19.0         | [stories/US-5.3-test-organization.md](stories/US-5.3-test-organization.md)                           |
| US-5.4 | unit-coverage — per-function unit-test process + Self-verify gate    | EPIC-5 | P1  | 3      | ✅ done | v0.23.0         | [stories/US-5.4-unit-coverage.md](stories/US-5.4-unit-coverage.md)                                   |
| US-5.5 | test-automation — spec→test→run→report→sync→CI spine                 | EPIC-5 | P1  | 3      | ✅ done | v0.24.0         | [stories/US-5.5-test-automation.md](stories/US-5.5-test-automation.md)                               |
| US-5.6 | test-doc standardization — scaffold + enforce (ERP-vs-Senti audit)   | EPIC-5 | P1  | 3      | ✅ done | v0.25.0         | [stories/US-5.6-test-doc-standardization.md](stories/US-5.6-test-doc-standardization.md)             |
| US-5.7 | whole-project QC — QA-tracking epic + DoD + depth bar (ERP learning) | EPIC-5 | P1  | 3      | ✅ done | v0.26.0         | [stories/US-5.7-whole-project-qc.md](stories/US-5.7-whole-project-qc.md)                             |
| US-3.8 | koni-harness parallel orchestration — multi-agent swarm + fan-out    | EPIC-3 | P1  | 3      | ✅ done | v0.27.0         | [stories/US-3.8-harness-parallel-orchestration.md](stories/US-3.8-harness-parallel-orchestration.md) |
| US-6.1 | koni-agent-monitoring — content-free Claude Code usage reporter      | EPIC-6 | P1  | 5      | ✅ done | v0.28.0         | [stories/US-6.1-koni-agent-monitoring.md](stories/US-6.1-koni-agent-monitoring.md)                   |

**Total**: **12 stories / 55 points** — US-3.2 koni-setup (v0.9.0) · US-3.3
koni-harness (16 pts across v0.10.0–v0.14.0, 5 phases) · US-3.1 plugin pattern +
koni-nextjs (v0.15.0) · US-5.1 koni-qc (v0.16.0) · US-5.2 skill-grading (v0.18.0)
· US-5.3 test-organization (v0.19.0) · US-5.4 unit-coverage (v0.23.0) · US-5.5
test-automation (v0.24.0) · US-5.6 test-doc standardization (v0.25.0) · US-5.7
whole-project QC (v0.26.0) — seven EPIC-5 · US-3.8 koni-harness parallel
orchestration (v0.27.0) — an EPIC-3 post-completion enhancement · US-6.1
koni-agent-monitoring (v0.28.0) — EPIC-6, the first product/client skill.
**EPIC-3 fully delivered** + EPIC-5 (QC tooling) + EPIC-6 (Agent Ops client) delivered.
(koni-harness was consolidated from 5 phase-stories into one — see [CONTEXT D14](CONTEXT.md).)

**Post-ship refinements (v0.17.0–0.17.2, no new story — refine FR-21 + FR-26 per
[CONTEXT D14](CONTEXT.md)):** the loop's tool-split rule + fixed review order
(`/design-review` + koni-qc) — [CONTEXT D15](CONTEXT.md) — then a multi-skill
grading pass that hardened both non-docs skills to **koni-harness 96/100,
koni-qc 97/100** ([LESSONS §8](LESSONS.md); CHANGELOG \[0.17.0]–\[0.17.2]).

**Post-ship refinement (v0.29.0, no new story — refine FR-21):** koni-harness gains an
explicit **lesson-capture step** at the Doc + Version gate (the loop now writes `LESSONS.md`,
not just reads it) — [CONTEXT D26](CONTEXT.md); CHANGELOG \[0.29.0].

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
