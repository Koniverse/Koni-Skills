# Changelog

All notable changes to **Koni-Skills** are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **RULE-1 / RULE-2 (koni-docs)**: every code-shipping commit bumps `VERSION`
> AND adds an entry here in the same commit, with a real commit SHA — never
> `pending`.

---

## [Unreleased]

(empty — track here while in dev but not yet shipped)

---

## [0.2.0] — 2026-05-27 — Dogfood koni-docs on its own repo + 2 conventions + RULE-15 — v0.2.0

Second release of Koni-Skills. **Sprint-2026-W22** ships 7 stories (17
points across EPIC-1 + EPIC-2). The release applies the `koni-docs` skill
to its own home repo end-to-end, adds two recommended-for-teams
conventions (file-extracted Active Context, AGENTS-canonical / CLAUDE-pointer),
adds a new BLOCKER-severity rule (RULE-15: `assignee:` = GitHub login),
and corrects the CHANGELOG home path per skill canon.

After this release:
- The Koni-Skills repo itself is a worked example of a fully scaffolded
  Koni-Skills consumer — every artifact the skill claims to manage exists
  here, the integration block + Active Context are wired in their
  recommended shape, and the sprint discipline runs against the skill's
  own bundled scripts.
- The catalog ships **10 rules** (was 9) and **two project-level
  conventions** documented in `references/templates/integration.md`.
- EPIC-1 (koni-docs skill foundation + ongoing enhancements) and EPIC-2
  (repo dogfood) both close at 100%. EPIC-3 (catalog expansion: plugin
  skills + first non-docs Koniverse skill) remains backlog for a future
  brainstorm.

### Added

**Skill — new convention: file-extracted Active Context (Pattern B)**
- `skills/koni-docs/references/templates/integration.md` §0/§2/§5
  documents Pattern B (file-extracted Active Context) — recommended for
  multi-developer teams to eliminate `CLAUDE.md` merge churn on
  parallel-branch sprint updates. Pattern A (inline in `CLAUDE.md`)
  preserved as solo-dev fallback.
- `SKILL.md` §4 grew a pattern-picker table and §5 activation table now
  routes "adopt active-context split" to `integration.md` §2.
- Story: [US-1.2](sprints/stories/US-1.2-active-context-split-pattern.md).

**Skill — new rule: RULE-15 (`assignee:` = GitHub login)**
- `skills/koni-docs/references/rules.md` adds RULE-15 (Severity BLOCKER)
  — every `assignee:` in koni-docs artifacts MUST be the contributor's
  GitHub login, never git `user.name`, never a display name. Catalog
  count: 9 → 10. `SKILL.md` §2 rule table updated to match.
- `references/templates/story.md` frontmatter comment for `assignee:`
  changed from `# GitHub login (optional)` to `# MANDATORY (RULE-15):
  GitHub login from \`gh api user --jq .login\` — never git user.name`.
- Story: [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md).

**Skill — new convention: AGENTS-canonical / CLAUDE-pointer**
- `references/templates/integration.md` §3 split into §3.1 (new
  convention — AGENTS.md as single source of truth; CLAUDE.md as thin
  pointer that holds only the Koni-Docs Integration config + Active
  Context pointer + optional Claude-Code-only routing) and §3.2
  (existing AGENTS.md Koni-Docs Reference Block).
- `SKILL.md` §5 activation table routes "make AGENTS.md canonical /
  slim CLAUDE.md / AGENTS-canonical convention" to `integration.md` §3.1.
- Story: [US-1.4](sprints/stories/US-1.4-agents-canonical-convention.md).

**This repo — full `docs/` scaffolding (dogfood)**
- `docs/README.md` (doc hub + pre-commit checklist), `BRIEF.md`
  (product brief), `PRD.md` (§1–§11 + epic/story index + FR table),
  `ARCHITECTURE.md` (skill repo + distribution architecture),
  `CONTEXT.md` (decision log D1–D10), `LESSONS.md` (§1–§4 traps +
  patterns), `SETUP.md` (local dev environment).
- `docs/sprints/` subtree: `README.md` (sprint schema pointer),
  `STATUS.md` (auto-generated kanban — RULE-5),
  `epics/EPIC-1.md`, `EPIC-2.md`, `EPIC-3.md`,
  7 story files: `US-1.1`, `US-1.2`, `US-1.3`, `US-1.4`, `US-2.1`,
  `US-2.2`, `US-2.3`, `US-2.4`, plus backlog `US-3.1`,
  active-then-archived `sprint-2026-W22.md`, archived `sprint-2026-W19.md`.
- Story: [US-2.1](sprints/stories/US-2.1-bootstrap-docs-structure.md).

**This repo — file-extracted Active Context (Pattern B)**
- `.active-context.example.md` (committed template) + `.active-context.md`
  (gitignored snapshot) at repo root. `.gitignore` updated.
- Story: [US-2.2](sprints/stories/US-2.2-wire-integration-blocks.md).

**This repo — VERSION + CHANGELOG seeded**
- `VERSION` at repo root (`0.2.0` on this release; was `0.1.0`).
- `docs/CHANGELOG.md` (canonical location per skill SKILL.md §0;
  initially shipped at repo root in error, relocated mid-sprint per
  [CONTEXT D10](CONTEXT.md)) — header, RULE-1/2 reminder, retroactive
  v0.1.0 entry covering the 22-commit koni-docs skill initial release,
  and this v0.2.0 entry.
- Story: [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md).

### Changed

**Project file architecture (this repo)**
- `CLAUDE.md` slimmed **40 → 28 lines**: kept only the AGENTS.md-is-canonical
  pointer paragraph, the `Koni-Docs Integration` config block, and the
  Active Context pointer (Pattern B). Removed `## Quick start` and
  `## Documentation` sections (duplicated content moved to AGENTS.md).
- `AGENTS.md` grew a canonical-source-of-truth blockquote preamble at the
  top, a consolidated `## Documentation` section listing every artifact
  in docs/ + VERSION + CHANGELOG with markdown links, an updated Project
  structure diagram (adds VERSION, .active-context.example.md,
  .active-context.md, docs/), and a `## Koni-Docs` section naming the
  two conventions adopted by this repo (Pattern B from US-1.2 +
  AGENTS-canonical from US-1.4) with pointers into the skill template.
- Story: [US-2.4](sprints/stories/US-2.4-apply-agents-canonical.md).

**This repo — `assignee:` migration to GitHub login**
- 4 pre-existing story files (US-1.1, US-2.1, US-2.2, US-2.3) updated
  `assignee: AnhMTV` (git `user.name`) → `assignee: saltict` (GitHub login).
- US-1.1 implementation notes updated: 24 commits → **22 commits** (actual
  count); added contributor table attributing 20 commits to `saltict`
  and 2 commits to `bluezdot`.
- Story: [US-1.3](sprints/stories/US-1.3-rule-15-assignee-github-login.md).

**This repo — CHANGELOG.md location**
- Relocated `CHANGELOG.md` from repo root → `docs/CHANGELOG.md` to match
  the skill's §0 orientation. Six cross-references updated (docs/README.md,
  AGENTS.md, US-1.1, US-2.3, archive/sprint-2026-W19.md, PRD). No
  dangling root references survive. Decision recorded as
  [CONTEXT D10](CONTEXT.md).
- Story: folded into [US-2.3](sprints/stories/US-2.3-version-changelog-seed.md)
  (AC-2 rewritten "at repo root" → "at docs/, not repo root"; new AC-5
  for cross-reference cleanup; TASK-2.3.4 for the relocation).

**Skill — EPIC-1 reopened then closed**
- EPIC-1 (`koni-docs foundation`) was `done` at v0.1.0; reopened in
  sprint-2026-W22 to track three new stories (US-1.2 active-context
  split, US-1.3 RULE-15, US-1.4 AGENTS-canonical convention). All three
  ship in v0.2.0; EPIC-1 closes at 100% (`status: done`).

### Fixed

**Cosmetic — `vv0.1.0` double-prefix in synced epic table**
- First sync pass against US-1.1 (which had `version_shipped: v0.1.0`)
  produced `vv0.1.0` in the EPIC-1 Stories table — `agile-sync-up.mjs`
  unconditionally prepends `v` to whatever `version_shipped` contains.
  Fixed by changing US-1.1 frontmatter to bare semver (`0.1.0`).
  Codified as [LESSONS §4](LESSONS.md). RULE-16 (formalize bare-semver
  `version_shipped`) remains deferred for a later EPIC-1 sprint.

### Notes

Decisions recorded in [CONTEXT.md](CONTEXT.md) (append-only per RULE-7):

| ID | Decision | Story |
|---|---|---|
| D6 | Dogfood koni-docs on this repo | sets up EPIC-2 |
| D7 | Adopt file-extracted Active Context pattern (Pattern B) | US-1.2 / US-2.2 |
| D8 | Adopt RULE-15 — `assignee:` is GitHub login | US-1.3 |
| D9 | AGENTS-canonical / CLAUDE-pointer convention | US-1.4 / US-2.4 |
| D10 | Relocate `CHANGELOG.md` from root → `docs/` per skill canon | folded into US-2.3 |

Architecture decisions surfaced in PRD §6: AD-6, AD-7, AD-8, AD-9.

### Followups (deferred to next sprint)

- **RULE-16** (bare-semver `version_shipped:`) — would close
  [LESSONS §4](LESSONS.md) cleanly. Needs template touch-ups across
  story / epic / sprint / PRD frontmatter and a sweep of existing
  `version_shipped` values across consumer repos. Filed for a later
  EPIC-1 sprint.
- **EPIC-3** (catalog expansion: plugin-skill pattern + first non-docs
  Koniverse skill) — backlog. Needs an `/office-hours` brainstorm to
  scope US-3.1 + identify the second skill candidate. Will likely open
  sprint-2026-W2x once EPIC-3 stories are scoped.
- **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](ARCHITECTURE.md).

### Contributors

Sprint-2026-W22: **1 contributor, 7 stories, 17 points, 0 outside-help**.

| GitHub login | Git name | Stories shipped | Points |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4 | 17 |

Sprint retrospective: see
[sprints/archive/sprint-2026-W22.md §Retrospective](sprints/archive/sprint-2026-W22.md).

**Commit**: v0.2.0 release commit — to be tagged at sprint-W22 close. SHA
will be backfilled by `changelog-backfill-commits.mjs` at pre-commit.

---

## [0.1.0] — 2026-05-27 — koni-docs skill — initial release — v0.1.0

First public cut of the `koni-docs` skill: a documentation-management skill
that standardizes how Koniverse projects produce and maintain PRD,
ARCHITECTURE, CHANGELOG, CONTEXT, LESSONS, SETUP, and sprint artifacts.
Distributable via `npx skills add Koniverse/Koni-Skills --skill koni-docs`.

### Added
- `skills/koni-docs/SKILL.md` — core skill instructions, 9 project-agnostic
  rules, 7 CLAUDE.md trigger points, pipeline integration map
  (BMad → GStack → Superpowers → Koni-docs).
- `skills/koni-docs/references/rules.md` — 9 enforced rules with severity,
  compliance steps, and grep checks.
- `skills/koni-docs/references/sprint-system.md` — agile conventions,
  5-layer consistency check, script inventory.
- `skills/koni-docs/references/templates.md` + per-type template files
  (`brief.md`, `prd.md`, `architecture.md`, `changelog.md`, `context.md`,
  `lessons.md`, `setup.md`, `epic.md`, `story.md`, `sprint.md`,
  `design-spec.md`, `okr.md`, `integration.md`) — BMad-grade templates,
  one file per document type, each with section index, per-section
  guidance, and a filled mini-example.
- `skills/koni-docs/references/bmad-template-analysis.md` — BMad pipeline →
  koni-docs mapping reference.
- `skills/koni-docs/scripts/` — bundled automation:
  `generate-status.mjs` (regenerate STATUS.md kanban),
  `agile-sync-up.mjs` (propagate story status through 5 doc layers),
  `agile-inject-tasks.mjs` (regenerate Tasks from AC),
  `agile-backfill-fields.mjs` (backfill frontmatter fields),
  `changelog-backfill-commits.mjs` (replace `pending` SHAs with real ones).
- `skills/koni-docs/scripts/__tests__/sync-test.mjs` — self-contained
  integration test that exercises all 5 sync scripts against a fixture in
  tmpdir.
- `README.md`, `AGENTS.md`, `CLAUDE.md` — project scaffolding for the
  Koni-Skills meta-repo.
- `docs/superpowers/specs/2026-05-06-koni-docs-skill-design.md` and
  `docs/superpowers/plans/2026-05-06-koni-docs-skill-implementation.md` —
  early design + implementation plan, preserved for reference.

### Changed
- Distribution moved from manual file copy to `npx skills add` /
  `npx skills experimental_install`, with `skills-lock.json` tracking
  installed skills and content hashes.
- Epic template Stories table extended from 4 to 5 columns (added Goal).
- PRD template expanded §1–§11 to match BMad full output standard.
- Story + CHANGELOG status emojis extended with `🗑️ deprecated` for
  stories retired before shipping.
- `agile-sync-up.mjs` handles both 4-col and new 5-col EPIC tables and
  per-epic PRD §11 tables.

### Fixed
- `agile-sync-up.mjs` story-row matcher no longer false-matches `US-1.1`
  against `US-1.11` (refined boundary regex).
- Sync scripts now skip story files that lack an `id` frontmatter field
  and log a warning instead of crashing.

### Contributors

**22 commits** landed between 2026-05-06 and 2026-05-26 across **2
contributors**. Per [RULE-15](../skills/koni-docs/references/rules.md),
GitHub login is the canonical identifier (the git `user.name` may
differ — `AnhMTV` is `saltict` on GitHub; see
[CONTEXT D8](CONTEXT.md)).

| GitHub login | Git name | Commits | Areas |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | 20 | Skill core, templates, automation, tests |
| [`bluezdot`](https://github.com/bluezdot) | bluezdot | 2 | Template robustness, script story-parsing fixes |

**Commit breakdown by area** (all rolled up into [US-1.1](sprints/stories/US-1.1-koni-docs-initial-release.md)):

- **Skill core + scaffolding** (`saltict`, 10 commits):
  `5ee3bf7` first commit · `f150ca7` design spec · `b5bfe95` pipeline integration
  spec update · `72746cc` implementation plan · `3cf7d9d` 9 rules reference ·
  `41832a0` templates reference · `9fd0607` sprint-system reference ·
  `3937a47` SKILL.md core · `6bd799f` README/AGENTS/CLAUDE scaffolding ·
  `7819f42` install instructions in README · `e443007` npx skills CLI switch.
- **Template polish** (`saltict`, 5 commits):
  `ab1adee` ARCHITECTURE template · `8d55421` BRIEF + PRD §1-§7 + BMad analysis ·
  `aeadfbe` Goal column in Epic Stories table · `435a012` PRD §1-§11 expansion ·
  `3b75119` per-type template split (one file per doc type, AD-4).
- **Automation + tests** (`saltict`, 4 commits):
  `3f62985` bundle automation scripts · `1b4127b` agile-sync-up 5-col EPIC +
  per-epic PRD §11 · `1ebaba0` self-contained integration test ·
  `29898ca` `epicStoryRowMatcher` boundary regex refinement
  ([LESSONS §1](LESSONS.md)).
- **Template + script robustness** (`bluezdot`, 2 commits):
  `facd9a6` `🗑️ deprecated` status for story + changelog templates ·
  `44f9c01` sync scripts skip files missing `id:` instead of crashing
  ([LESSONS §2](LESSONS.md)).

**Commit**: v0.1.0 release commit — git tag `v0.1.0` to be applied at
sprint-2026-W22 close alongside v0.2.0.
