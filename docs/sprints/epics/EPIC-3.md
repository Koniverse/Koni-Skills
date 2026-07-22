---
id: EPIC-3
title: "Koniverse skill catalog expansion"
status: done
prd_ref: 'FR-9, FR-10, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25, FR-33, FR-41, FR-42'
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
| FR-21 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md) (+ [US-3.17](../stories/US-3.17-harness-design-trio.md) design-trio, [US-3.18](../stories/US-3.18-harness-skill-grading.md) grading pass, [US-3.19](../stories/US-3.19-mechanize-check-count-drift.md) count-guard, [US-3.21](../stories/US-3.21-koni-docs-standard-pass.md) doc pass, [US-3.22](../stories/US-3.22-review-reporting-contract.md) review contract; [US-3.20](../stories/US-3.20-extend-reference-sweep-to-docs.md) / [US-3.23](../stories/US-3.23-regrade-harness-after-review-contract.md) / [US-3.24](../stories/US-3.24-model-tier-policy.md) backlog) | ✅ shipped (v0.10.0; refined v0.63.0, graded ≥95 v0.64.0, count-guard v0.65.0, docs v0.65.1, review contract v0.66.0) |
| FR-22 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.11.0) |
| FR-23 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.12.0) |
| FR-24 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.13.0) |
| FR-25 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | ✅ shipped (v0.14.0) |
| FR-33 | [US-3.8](../stories/US-3.8-harness-parallel-orchestration.md) | ✅ shipped (v0.27.0) |
| FR-40 | [US-3.9](../stories/US-3.9-harness-security-review-gate.md) | ✅ shipped (v0.55.0) |
| FR-41 | [US-3.11](../stories/US-3.11-koni-ea-mql5-standard.md) (+ [US-3.12](../stories/US-3.12-koni-ea-programming-focus.md) refocus, [US-3.13](../stories/US-3.13-koni-ea-split-dev-ops.md) rename → koni-ea-dev) | ✅ shipped (v0.57.0; renamed v0.59.0) |
| FR-42 | [US-3.13](../stories/US-3.13-koni-ea-split-dev-ops.md) | ✅ shipped (v0.59.0) |

## Stories

| ID                                                            | Title                               | Goal                                                                                                                                                                                                            | Status | Version |
| ------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)           | Plugin-skill pattern + koni-nextjs  | Define the plugin-skill pattern (plugin-pattern.md) + ship the `koni-nextjs` reference (NX- rules extending koni-docs); discovery via `plugins:` in the `koni-docs:` block                                      | ✅ done | v0.15.0 |
| [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)        | koni-setup bootstrapper             | Ship the first non-docs Koniverse skill: detect repo profile + scaffold/wire/onboard a repo to the shared standard, delegating doc bodies to koni-docs                                                          | ✅ done | v0.9.0  |
| [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)      | koni-harness (full harness)         | Portable agentic-loop harness shipped in 5 phases (v0.10.0–v0.14.0): gate + standard (P1), loop-runner (P2), context-loader (P3a), sprint-sequencer (P2.5), session-adapters (P3b). Covers FR-21..25            | ✅ done | v0.14.0 |
| [US-3.8](../stories/US-3.8-harness-parallel-orchestration.md) | koni-harness parallel orchestration | Multi-agent execution mode: `swarm.sh` wave planner + `parallel-orchestration.md` (sprint swarm, worktree per story; within-story fan-out; gate-per-worktree + integration + human-merge). No stage/gate change | ✅ done | v0.27.0 |
| [US-3.9](../stories/US-3.9-harness-security-review-gate.md) | koni-harness uses koni-qc security-review | Review-stage trigger + a warn-level opt-in `security-review` gate (boundary globs in `.koni-harness/security-paths`), proven by a plant→assert test; builds the gate koni-qc named as harness-owned | ✅ done | v0.55.0 |
| [US-3.10](../stories/US-3.10-koni-setup-security-review-sync.md) | koni-setup docs sync | Surface koni-qc's security-review capability + the vendored opt-in `security-review` gate in koni-setup's inventory/audit; distinguish it from the monorepo-only `skill-references` check. Docs sync, refines FR-20, no scope change | ✅ done | v0.56.0 |
| [US-3.11](../stories/US-3.11-koni-ea-mql5-standard.md) | koni-ea — MQL5 EA standard | Ship koni-ea: the MQL5 Expert Advisor authoring standard (SKILL.md + 7 references) — lifecycle, trading & risk mechanics, MQL5 pitfalls, versioning/registry, per-version doc template, shared `.mqh` conventions. Synthesized from Trading-Resources + Senti-Quant, hardened by author-blind review | ✅ done | v0.57.0 |
| [US-3.12](../stories/US-3.12-koni-ea-programming-focus.md) | koni-ea refocus | Narrow koni-ea to the MQL5 **programming** methodology per user feedback: remove the ops reference (versioning/registry/deploy/doc SOP), add a focused `compilation-and-testing.md`, rename+trim the inputs reference, reframe SKILL.md. Ops lifecycle is trading-ops, out of scope | ✅ done | v0.58.0 |
| [US-3.13](../stories/US-3.13-koni-ea-split-dev-ops.md) | koni-ea split → dev + ops | Rename koni-ea → **koni-ea-dev** and ship a new **koni-ea-ops** skill (SKILL + 5 references: versioning, registry & MagicNumber, deployment, backtest & release, per-version docs) for the EA operational lifecycle. Two clean skills instead of one mixed one (executes LESSONS §32) | ✅ done | v0.59.0 |
| [US-3.14](../stories/US-3.14-koni-ea-skill-grading.md) | koni-ea skill-grading pass | Grade koni-ea-dev + koni-ea-ops against koni-qc's 4-dimension skill-grading rubric and fix every finding to clear the ≥95 catalog bar (dev ~97, ops 96.4). 3 rounds; author-blind graders per dimension | ✅ done | v0.60.0 |
| [US-3.15](../stories/US-3.15-koni-ea-dev-mcp-compile.md) | koni-ea-dev compile-in-the-loop | Wire an MQL5-compile MCP server (`compile_mql5`/`search_mql5_docs`) into koni-ea-dev so an agent verifies an EA compiles rather than only prescribing it; ships the verified/corrected config + honest scope boundary. Re-graded 98.1/100 | ✅ done | v0.61.0 |
| [US-3.16](../stories/US-3.16-koni-ea-dev-mcp-refine.md) | koni-ea-dev MCP section refine | Refine the MCP section from a full read of the server: division of labor (verify engine, not code generator — the skill authors), `MQL5_EDITOR_PATH` auto-detected/optional, `search_mql5_docs` returns page text. Author-blind verified vs source | ✅ done | v0.62.0 |
| [US-3.17](../stories/US-3.17-harness-design-trio.md) | koni-harness design-skill trio | UI features always run the trio — gstack `/design-consultation` (Frame) → Anthropic `frontend-design` (Execute) → gstack `/design-review` (Review) — desktop + mobile, to DESIGN.md + design LESSONS. Refines FR-21; tool invariant preserved | ✅ done | v0.63.0 |
| [US-3.18](../stories/US-3.18-harness-skill-grading.md) | koni-harness skill-grading pass | Verify the design-trio change via koni-qc skill-grading; round 1 = 83.9 FAIL surfaced count drift + skill-references mis-documented-as-vendored; fixed to **96.25 PASS**. Applied LESSONS §8 (re-grade whole) / §28 (de-number counts) | ✅ done | v0.64.0 |
| [US-3.19](../stories/US-3.19-mechanize-check-count-drift.md) | Mechanize check-count drift | Extend the shared checker to count `N release-commit-only checks` against the vendored `gates.conf` — the class that let US-3.18's defect survive every gate. Proven by a planted class (38) + a mutant (21); `built-in checks` deliberately excluded. LESSONS §36 | ✅ done | v0.65.0 |
| [US-3.20](../stories/US-3.20-extend-reference-sweep-to-docs.md) | Extend the reference sweep to `docs/` | The sweep stops at `skills/`, so the doc hub — including the pre-commit checklist — is unguarded. Not a wider glob: needs a policy for history-bearing paths (CHANGELOG, closed stories, append-only CONTEXT, frozen plans) that LESSONS §12 forbids rewriting | 📋 backlog | — |
| [US-3.22](../stories/US-3.22-review-reporting-contract.md) | Review reporting contract | Two of Review's five passes had **no spec** — six mentions, all routing-table names. New `review-contract.md`: report everything with confidence+severity, filter at triage, never a bare pass, **author-blind mandatory** (§19), dismissals recorded. koni-qc sub-7 findings now **recorded, not deleted**. LESSONS §38 | ✅ done | v0.66.0 |
| [US-3.23](../stories/US-3.23-regrade-harness-after-review-contract.md) | Re-grade harness after the contract | US-3.22's own Review could not run author-blind (no subagents in session), so its judgement layer is unverified. Four-dimension skill-grading, whole skill, ≥95, D4 ×2 averaged | 📋 backlog | — |
| [US-3.24](../stories/US-3.24-model-tier-policy.md) | Model + effort tier policy | Per-pass model/effort assignment on the *existing* Tier B fan-out points, **gated on a measured recall floor** against the planted-defect corpus. No orchestrator tier, no mid-session model switch; skill-grading + security-review + author-blind content out of scope | 📋 backlog | — |
| [US-3.21](../stories/US-3.21-koni-docs-standard-pass.md) | koni-docs-standard doc pass | Fix four live doc defects — a pre-commit checklist invoking `.mjs` scripts deleted in AD-7, PRD TS-1 measuring a nonexistent test, TS-3 stating 9 rules against 13. **Filed retroactively**: shipped in `01fae57` with no story on a "docs-only" justification. LESSONS §37 | ✅ done | v0.65.1 |

## Cross-cutting invariants

- **Plugin skills MUST follow the same self-contained-directory rule (AD-1):** no cross-skill imports; a plugin's rules ship inside its own `references/`.
- **Plugin skills MUST NOT duplicate koni-docs core rules:** they extend or specialize; the agent loads both skills when the project declares both.

## Acceptance criteria (propagated from stories)

- [x] Plugin-skill pattern documented (where the directory lives, how the agent discovers it, how it composes with koni-docs rules) — `skills/koni-docs/references/plugin-pattern.md` (US-3.1, v0.15.0)
- [x] At least one plugin skill implemented as reference — `koni-nextjs` (US-3.1, v0.15.0)
- [x] At least one non-docs Koniverse skill identified + scoped + shipped — `koni-setup` (US-3.2, v0.9.0) + `koni-harness` (US-3.3, v0.10.0)
