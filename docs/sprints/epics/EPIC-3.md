---
id: EPIC-3
title: "Koniverse skill catalog expansion"
status: backlog
prd_ref: FR-9, FR-10
created: 2026-05-27
updated: 2026-05-27
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

This epic is **backlog** in v0.2.0 — work begins after EPIC-2 closes and
v0.2.0 is tagged. Stories within EPIC-3 will be drafted in a future
brainstorm + plan pass (likely a `/office-hours` session).

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Plugin pattern** | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md) | Define how a plugin skill extends koni-docs rules; reference implementation |
| 2 | **First non-docs Koniverse skill** | TBD | Prove the catalog supports more than one skill type — candidate identified via brainstorm |

### Out of scope

- **Hosted skill marketplace / web UI** — permanently out of scope (PRD §3 boundaries).
- **Cross-vendor skill distribution** — Koni-Skills is Koniverse-internal-first.
- **Auto-PR refactoring of consumer repos on skill update** — opt-in pull only.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-9 | [US-3.1](../stories/US-3.1-plugin-skill-pattern.md) | 📋 backlog |
| FR-10 | TBD | 📋 backlog |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-3.1](../stories/US-3.1-plugin-skill-pattern.md) | Define plugin-skill pattern | Document how plugin skills (`koni-supabase`, `koni-nextjs`) extend koni-docs rules + provide one reference implementation | 📋 backlog | — |

## Cross-cutting invariants

- **Plugin skills MUST follow the same self-contained-directory rule (AD-1):** no cross-skill imports; a plugin's rules ship inside its own `references/`.
- **Plugin skills MUST NOT duplicate koni-docs core rules:** they extend or specialize; the agent loads both skills when the project declares both.

## Acceptance criteria (propagated from stories)

- [ ] Plugin-skill pattern documented (where the directory lives, how the agent discovers it, how it composes with koni-docs rules) (US-3.1)
- [ ] At least one plugin skill implemented as reference (`koni-supabase` OR `koni-nextjs`) (US-3.1)
- [ ] At least one non-docs Koniverse skill identified + scoped (TBD story)
