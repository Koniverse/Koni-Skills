---
id: EPIC-3
title: "Koniverse skill catalog expansion"
status: in-progress
prd_ref: 'FR-9, FR-10, FR-20, FR-21, FR-22, FR-23'
created: 2026-05-27T00:00:00.000Z
updated: 2026-06-27T00:00:00.000Z
---
## Goal

Move Koni-Skills beyond `koni-docs` alone. Define the plugin-skill
pattern (extending core rules for specific tech stacks like Supabase /
Next.js), and ship at least one non-docs Koniverse skill so the catalog
proves itself as a multi-skill home rather than a single-skill repo.

## Overview

### Business context

The PRD and ARCHITECTURE both reserve a plugin slot
(`koni-docs-plugins: [supabase, nextjs]`) but no plugin skill has been
written yet, and no skill exists in this repo other than `koni-docs`.
EPIC-3 is the bridge from "we shipped one skill" to "we run a catalog."

This epic is now **in-progress** (sprint-2026-W26): pillar 2 ("first non-docs
Koniverse skill") is delivered twice over — US-3.2 `koni-setup` at v0.9.0 and
US-3.3 `koni-harness` at v0.10.0. Pillar 1 (plugin-skill pattern, US-3.1)
remains backlog pending a future brainstorm + plan pass.

### Feature pillars

| # | Pillar                              | Stories                                                                                                               | Purpose                                                                                                                              |
| - | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | **Plugin pattern**                  | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)                                                                   | Define how a plugin skill extends koni-docs rules; reference implementation                                                          |
| 2 | **First non-docs Koniverse skills** | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md) ✅ · [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md) ✅ | `koni-setup` (day-0 bootstrapper/onboarder) + `koni-harness` (Agentic Loop standard + portable gate) — prove the multi-skill catalog |

### Out of scope

- **Hosted skill marketplace / web UI** — permanently out of scope (PRD §3 boundaries).
- **Cross-vendor skill distribution** — Koni-Skills is Koniverse-internal-first.
- **Auto-PR refactoring of consumer repos on skill update** — opt-in pull only.

## FR Coverage

| FR    | Story                                                      | Status              |
| ----- | ---------------------------------------------------------- | ------------------- |
| FR-9  | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)        | 📋 backlog          |
| FR-10 | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)     | ✅ shipped (v0.9.0)  |
| FR-20 | [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)     | ✅ shipped (v0.9.0)  |
| FR-21 | [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)   | ✅ shipped (v0.10.0) |
| FR-22 | [US-3.4](../stories/US-3.4-koni-harness-loop-runner.md)    | ✅ shipped (v0.11.0) |
| FR-23 | [US-3.5](../stories/US-3.5-koni-harness-context-loader.md) | ✅ shipped (v0.12.0) |

## Stories

| ID                                                         | Title                       | Goal                                                                                                                                                    | Status     | Version |
| ---------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| [US-3.1](../stories/US-3.1-plugin-skill-pattern.md)        | Define plugin-skill pattern | Document how plugin skills (`koni-supabase`, `koni-nextjs`) extend koni-docs rules + provide one reference implementation                               | 📋 backlog | —       |
| [US-3.2](../stories/US-3.2-koni-setup-bootstrapper.md)     | koni-setup bootstrapper     | Ship the first non-docs Koniverse skill: detect repo profile + scaffold/wire/onboard a repo to the shared standard, delegating doc bodies to koni-docs  | ✅ done     | v0.9.0  |
| [US-3.3](../stories/US-3.3-koni-harness-agentic-loop.md)   | koni-harness Phase 1        | Ship the Koni Agentic Loop standard + a portable, additive POSIX pre-commit gate; compose BMAD/Superpowers/gstack/koni-docs without reproducing them    | ✅ done     | v0.10.0 |
| [US-3.4](../stories/US-3.4-koni-harness-loop-runner.md)    | koni-harness Phase 2        | Tier-aware single-story loop-runner: loop.sh state spine + loop-runner brain driving one story through the six stages, Claude-first + portable fallback | ✅ done     | v0.11.0 |
| [US-3.5](../stories/US-3.5-koni-harness-context-loader.md) | koni-harness P3a            | Portable read-only context-load.sh emitting a concise session digest of the context layers (live snapshot + decision/lesson indexes + pointers)         | ✅ done     | v0.12.0 |

## Cross-cutting invariants

- **Plugin skills MUST follow the same self-contained-directory rule (AD-1):** no cross-skill imports; a plugin's rules ship inside its own `references/`.
- **Plugin skills MUST NOT duplicate koni-docs core rules:** they extend or specialize; the agent loads both skills when the project declares both.

## Acceptance criteria (propagated from stories)

- [ ] Plugin-skill pattern documented (where the directory lives, how the agent discovers it, how it composes with koni-docs rules) (US-3.1)
- [ ] At least one plugin skill implemented as reference (`koni-supabase` OR `koni-nextjs`) (US-3.1)
- [x] At least one non-docs Koniverse skill identified + scoped + shipped — `koni-setup` (US-3.2, v0.9.0) + `koni-harness` (US-3.3, v0.10.0)
