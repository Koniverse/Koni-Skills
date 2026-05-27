---
id: EPIC-1
title: "Koni-docs skill — foundation + ongoing enhancements"
status: done
prd_ref: FR-1, FR-2, FR-3, FR-4, FR-5, FR-11, FR-12, FR-13
created: 2026-05-06
updated: 2026-05-27
---

## Goal

Ship a usable, BMad-pipeline-compatible documentation-management skill
that any Koniverse project can install via `npx skills add` and use to
standardize PRD, ARCHITECTURE, CHANGELOG, CONTEXT, LESSONS, SETUP, and
sprint artifacts. After this epic, downstream Koniverse projects stop
re-inventing doc layouts and sync scripts.

## Overview

### Business context

Before EPIC-1, every Koniverse product invented its own `Docs/` shape,
its own rules, and its own sync scripts. The Koni-ERP-02 layout was the
most mature, but transplanting it to a new project meant manual copy +
silent drift. EPIC-1 closes that gap by extracting the layout, rules,
and scripts into a single skill that ships as a packaged unit.

This epic intentionally does **not** ship plugin skills (Supabase /
Next.js rule extensions) — those belong to EPIC-3. It does not ship a
hosted skill marketplace — that is permanently out of scope.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Core skill body + rules** | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | SKILL.md, 9 enforced rules, activation table, pipeline integration map |
| 2 | **BMad-grade template library** | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | 13 per-type templates with section index + filled mini-examples |
| 3 | **Bundled automation** | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | 5 scripts + self-contained regression test |
| 4 | **Distribution** | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | `npx skills add` + lockfile, README install instructions |

### Out of scope

- **Plugin skills (Supabase, Next.js)** — owned by [EPIC-3](EPIC-3.md). The integration block reserves the `koni-docs-plugins:` slot in v0.1.0.
- **Dogfood on this repo itself** — owned by [EPIC-2](EPIC-2.md). EPIC-1 ships the skill; EPIC-2 proves it on its own home.
- **CI gate / GitHub Action** — deferred. The regression test runs locally for now.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-1 | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | ✅ done (v0.1.0) |
| FR-2 | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | ✅ done (v0.1.0) |
| FR-3 | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | ✅ done (v0.1.0) |
| FR-4 | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | ✅ done (v0.1.0) |
| FR-5 | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | ✅ done (v0.1.0) |
| FR-11 | [US-1.2](../stories/US-1.2-active-context-split-pattern.md) | ✅ done (v0.2.0) |
| FR-12 | [US-1.3](../stories/US-1.3-rule-15-assignee-github-login.md) | ✅ done (v0.2.0) |
| FR-13 (shared with EPIC-2) | [US-1.4](../stories/US-1.4-agents-canonical-convention.md) | ✅ done (v0.2.0) |

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-1 | Skill = self-contained directory | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) |
| AD-2 | Distribution via `npx skills` + lockfile | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) |
| AD-3 | 9 rules + plugin slot | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) |
| AD-4 | Templates split one-file-per-type | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) |
| AD-5 | Pipeline integration as standardizer | [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-1.1](../stories/US-1.1-koni-docs-initial-release.md) | Koni-docs skill — initial release | Ship SKILL.md + 9 rules + 13 templates + 5 scripts + lockfile distribution | ✅ done | v0.1.0 |
| [US-1.2](../stories/US-1.2-active-context-split-pattern.md) | Add file-extracted active-context pattern | Document Pattern B (file-extracted Active Context) in skill so teams avoid CLAUDE.md merge churn | ✅ done | v0.2.0 |
| [US-1.3](../stories/US-1.3-rule-15-assignee-github-login.md) | Add RULE-15: assignee = GitHub login | Expand rule catalog from 9 to 10 rules; make `assignee:` MANDATORY-GitHub-login across the koni-docs framework | ✅ done | v0.2.0 |
| [US-1.4](../stories/US-1.4-agents-canonical-convention.md) | Document AGENTS-canonical / CLAUDE-pointer convention | Add §3.1 to integration.md template — recommend AGENTS.md as single source of truth, CLAUDE.md as thin pointer | ✅ done | v0.2.0 |

## Cross-cutting invariants

- **English-only across all skill artifacts (RULE-13):** SKILL.md, references, templates, scripts, comments — all English even when the maintainer's working language is Vietnamese. Enforced by review.
- **Skill body ≤ 500 lines (NFR-1):** keeps token cost low for on-demand activation. Verified by `wc -l skills/koni-docs/SKILL.md`.
- **Every rule has a grep-style verification example (NFR-2):** `references/rules.md` documents how to verify each rule mechanically.

## Cross-story testing requirements

| Pattern | Stories | Shared infra |
|---|---|---|
| **5-script sync regression** | every script change | `skills/koni-docs/scripts/__tests__/sync-test.mjs` — builds its own fixture, exercises all 5 sync scripts, asserts cell-by-cell |

## Acceptance criteria (propagated from stories)

- [x] `skills/koni-docs/SKILL.md` exists with 9 rules, activation table, pipeline integration (US-1.1)
- [x] 13 per-type templates exist under `references/templates/` (US-1.1)
- [x] 5 sync scripts present and exercised by the self-contained regression test (US-1.1)
- [x] `npx skills add Koniverse/Koni-Skills --skill koni-docs` install path documented + verified (US-1.1)
- [x] Public release tagged at v0.1.0 with CHANGELOG entry (US-1.1)
