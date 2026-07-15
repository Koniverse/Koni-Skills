---
id: EPIC-3
title: "Koniverse skill catalog expansion"
status: done
prd_ref: 'FR-9, FR-10, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25, FR-33'
created: 2026-05-27T00:00:00.000Z
updated: 2026-07-15T00:00:00.000Z
---
## Goal

Move Koni-Skills beyond `koni-docs` alone. Define the plugin-skill
pattern (extending core rules for specific tech stacks like Supabase /
Next.js), and ship at least one non-docs Koniverse skill so the catalog
proves itself as a multi-skill home rather than a single-skill repo.

## Overview

### Business context

The PRD and ARCHITECTURE both reserve a plugin slot
(`plugins: [supabase, nextjs]` (under the `koni-docs:` block)) but no plugin skill has been
written yet, and no skill exists in this repo other than `koni-docs`.
EPIC-3 is the bridge from "we shipped one skill" to "we run a catalog."

This epic is **done** (sprint-2026-W26). Pillar 2 ("non-docs Koniverse skills")
delivered `koni-setup` (US-3.2) and the full `koni-harness` (US-3.3 — shipped in
five phases across v0.10.0–v0.14.0), and pillar 1 ("plugin-skill pattern")
delivered the pattern + the `koni-nextjs` reference (US-3.1, v0.15.0). All EPIC-3
FRs (FR-9, FR-10, FR-20–FR-25) shipped. (koni-harness was consolidated from five
phase-stories into US-3.3 — see [CONTEXT D14](../../CONTEXT.md).)

### Feature pillars

| # | Pillar                                                              | Stories                                                                                                               | Purpose                                                                                                                                                             |
| - | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Plugin pattern**                                                  | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md) ✅                                                                 | Define how a plugin skill extends koni-docs rules + ship `koni-nextjs` as the reference implementation                                                              |
| 2 | **First non-docs Koniverse skills**                                 | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md) ✅ · [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md) ✅ | `koni-setup` (day-0 bootstrapper/onboarder) + `koni-harness` (Agentic Loop standard + portable gate) — prove the multi-skill catalog                                |
| 3 | **Harness multi-agent orchestration** (post-completion enhancement) | [US-3.8](../stories/US-3.8-harness-parallel-orchestration.md) ✅                                                       | koni-harness parallel execution mode: sprint swarm (worktree per story, wave-by-wave over the DAG) + within-story fan-out; `swarm.sh` planner, no stage/gate change |

### Out of scope

- **Hosted skill marketplace / web UI** — permanently out of scope (PRD §3 boundaries).
- **Cross-vendor skill distribution** — Koni-Skills is Koniverse-internal-first.
- **Auto-PR refactoring of consumer repos on skill update** — opt-in pull only.

## FR Coverage

| FR    | Story                                                         | Status              |
| ----- | ------------------------------------------------------------- | ------------------- |
| FR-9  | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)           | ✅ shipped (v0.15.0) |
| FR-10 | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)        | ✅ shipped (v0.9.0)  |
| FR-20 | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md) (+ [US-3.10](../stories/US-3.10-koni-setup-security-review-sync.md) docs sync) | ✅ shipped (v0.9.0; refined v0.56.0) |
| FR-21 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.10.0) |
| FR-22 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.11.0) |
| FR-23 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.12.0) |
| FR-24 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.13.0) |
| FR-25 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.14.0) |
| FR-33 | [US-3.8](../stories/US-3.8-harness-parallel-orchestration.md) | ✅ shipped (v0.27.0) |
| FR-40 | [US-3.9](../stories/US-3.9-harness-security-review-gate.md) | ✅ shipped (v0.55.0) |

## Stories

| ID                                                            | Title                               | Goal                                                                                                                                                                                                            | Status | Version |
| ------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)           | Plugin-skill pattern + koni-nextjs  | Define the plugin-skill pattern (plugin-pattern.md) + ship the `koni-nextjs` reference (NX- rules extending koni-docs); discovery via `plugins:` in the `koni-docs:` block                                      | ✅ done | v0.15.0 |
| [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)        | koni-setup bootstrapper             | Ship the first non-docs Koniverse skill: detect repo profile + scaffold/wire/onboard a repo to the shared standard, delegating doc bodies to koni-docs                                                          | ✅ done | v0.9.0  |
| [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | koni-harness (full harness)         | Portable agentic-loop harness shipped in 5 phases (v0.10.0–v0.14.0): gate + standard (P1), loop-runner (P2), context-loader (P3a), sprint-sequencer (P2.5), session-adapters (P3b). Covers FR-21..25            | ✅ done | v0.14.0 |
| [US-3.8](../stories/US-3.8-harness-parallel-orchestration.md) | koni-harness parallel orchestration | Multi-agent execution mode: `swarm.sh` wave planner + `parallel-orchestration.md` (sprint swarm, worktree per story; within-story fan-out; gate-per-worktree + integration + human-merge). No stage/gate change | ✅ done | v0.27.0 |
| [US-3.9](../stories/US-3.9-harness-security-review-gate.md) | koni-harness uses koni-qc security-review | Review-stage trigger + a warn-level opt-in `security-review` gate (boundary globs in `.koni-harness/security-paths`), proven by a plant→assert test; builds the gate koni-qc named as harness-owned | ✅ done | v0.55.0 |
| [US-3.10](../stories/US-3.10-koni-setup-security-review-sync.md) | koni-setup docs sync | Surface koni-qc's security-review capability + the vendored opt-in `security-review` gate in koni-setup's inventory/audit; distinguish it from the monorepo-only `skill-references` check. Docs sync, refines FR-20, no scope change | ✅ done | v0.56.0 |

## Cross-cutting invariants

- **Plugin skills MUST follow the same self-contained-directory rule (AD-1):** no cross-skill imports; a plugin's rules ship inside its own `references/`.
- **Plugin skills MUST NOT duplicate koni-docs core rules:** they extend or specialize; the agent loads both skills when the project declares both.

## Acceptance criteria (propagated from stories)

- [x] Plugin-skill pattern documented (where the directory lives, how the agent discovers it, how it composes with koni-docs rules) — `skills/koni-docs/references/plugin-pattern.md` (US-3.1, v0.15.0)
- [x] At least one plugin skill implemented as reference — `koni-nextjs` (US-3.1, v0.15.0)
- [x] At least one non-docs Koniverse skill identified + scoped + shipped — `koni-setup` (US-3.2, v0.9.0) + `koni-harness` (US-3.3, v0.10.0)
