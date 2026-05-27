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

## [0.5.0-dev.0] — 2026-05-27 — koni-docs CLI Pillar C — v0.5.0-dev.0

Ships `koni-docs` CLI binary with 5 subcommands backed by the Pillar B lib. Deletes the 5 legacy `.mjs` scripts and `sync-test.mjs`. The W23 Carry-column BLOCKER fix is now live for end-users via `koni-docs sync`. `preview` subcommand deferred to Pillar D alongside the Astro viewer build.

### Added
- `koni-docs status` — replaces `generate-status.mjs` (semver ID sort)
- `koni-docs sync` — replaces `agile-sync-up.mjs`, column-by-NAME (W23 BLOCKER fix)
- `koni-docs inject-tasks` — replaces `agile-inject-tasks.mjs`
- `koni-docs backfill-fields` — replaces `agile-backfill-fields.mjs`
- `koni-docs backfill-commits` — replaces `changelog-backfill-commits.mjs`
- `commander`-based CLI framework with global flags (`--docs-path`, `--dry-run`, `--json`, `--verbose`)

### Removed (BREAKING for consumer repos hardcoding `node skills/...` paths)
- `skills/koni-docs/scripts/generate-status.mjs`
- `skills/koni-docs/scripts/agile-sync-up.mjs`
- `skills/koni-docs/scripts/agile-inject-tasks.mjs`
- `skills/koni-docs/scripts/agile-backfill-fields.mjs`
- `skills/koni-docs/scripts/changelog-backfill-commits.mjs`
- `skills/koni-docs/scripts/__tests__/sync-test.mjs`

### Fixed
- **W23 BLOCKER** — `agile-sync-up.mjs` silently wrote status icons into the `Carry` column of `sprint-2026-W23.md` because cell addressing was by position. `koni-docs sync` now addresses by column NAME and throws clearly if the column is missing.

**Commit**: 7bc86ce

---

## [0.4.0-dev.0] — 2026-05-27 — koni-docs CLI Pillar B lib foundation — v0.4.0-dev.0

Ships `packages/koni-docs/src/lib/` — the reusable typed library that backs the Pillar C CLI subcommands. Composes gray-matter + unified/remark/remark-gfm + zod; replaces the hand-rolled YAML parser and position-based table addressing slated for deletion in Pillar D. 50 exports / 49 unit tests / typecheck clean / .mjs build verified.

### Added
- `@koniverse/koni-docs/lib` exports: corpus / doc / markdown / schemas / refs / changelog / git (9 modules)
- Zod schemas for story, epic, sprint, changelog-entry
- Column-by-NAME table addressing (foundation for the W23 Carry-bug fix to ship in Pillar C `sync`)
- L3 ID-graph traversal: `listChildrenOf` / `listReferrersTo` / `validateRefs`
- Thin git wrappers using `execFileSync` (no shell injection surface)

**Commit**: 074d26b

---

## [0.3.0] — 2026-05-27 — Real-world audit: BLOCKER fix + RULE-16 + 4 new sprint sections + 198/266-story script robustness — v0.3.0

Third release. Ships the **US-1.5 audit** of two production Koniverse
repos (Koni-Finance-Final 198 stories / 9 epics / 8 sprints; senti_quant
266 stories / 35 epics / 10 sprints), fixing one BLOCKER script bug, two
WARNING-tier robustness gaps, and consolidating template patterns the
two repos invented but the koni-docs skill didn't yet document.

Sprint-2026-W22 reopened mid-day 2026-05-27 to absorb US-1.5 (8 pts P0)
after v0.2.0 closed earlier in the day. EPIC-1 (foundation + ongoing
enhancements) closes again at 100%: 5/5 stories, 27/27 pts.

### Added

**Skill — new rule: RULE-16 (`version_shipped:` is bare semver)**
- `skills/koni-docs/references/rules.md` adds RULE-16 (Severity BLOCKER):
  `version_shipped:` MUST be bare semver (`0.7.0`), NEVER `v`-prefixed.
  Catalog count: 10 → 11. `v` prefix is reserved for narrative
  surfaces (git tags, prose, Active Context summary lines). Closes
  the long-deferred [LESSONS §4](LESSONS.md) trap from v0.2.0.
- `SKILL.md` §2 rule table grows to 11 rows.
- `references/templates/story.md` frontmatter comment for
  `version_shipped:` rewritten: bare semver mandatory, `v` prefix
  explicitly forbidden.

**Skill — sprint template additions (5 new optional sections)**
- `templates/sprint.md` §sprint-scope: documents both the canonical
  6-column shape and the extended **7-column shape with `Carry` column**
  (Koni-Finance-Final pattern). Values: `from W<N>` / `new` / `substrate` /
  prose. Documents inline title annotations: `_(added YYYY-MM-DD)_`,
  `_(closed mid-sprint vX.Y.Z)_`, `_(carry W21←W20←W19)_`.
- `templates/sprint.md` 4 new optional sections (senti_quant pattern):
  - `## Why <US-X.Y> in W<N>` — narrativize single load-bearing mid-sprint commitment
  - `## Parked / deferred from W<N-1>` — explicit carry-over audit with status emojis
  - `## Closed mid-sprint W<N>` — date + version per mid-sprint landing
  - `## Risks & dependencies` — per-risk mitigation
- `templates/sprint.md` close-out: optional `## Carry-overs to W<N+1>`
  section (Koni-Finance-Final pattern).

**Skill — story template additions**
- `templates/story.md`: optional `## Story refresh — YYYY-MM-DD` block
  for mid-implementation re-scopes (Koni-Finance-Final pattern).
- `templates/story.md`: multi-commit `commit:` field documented
  (comma-separated SHAs for stories with multiple landing commits).
- `templates/story.md`: `assignee:` comment elevated to MANDATORY (RULE-15);
  `version_shipped:` comment elevated to MANDATORY (RULE-16).

**Skill — convention additions**
- `SKILL.md` §1: **Vietnamese counterpart `*.vi.md`** convention
  documented. English (`*.md`) is canonical (RULE-13); `*.vi.md`
  siblings are optional translations, never authoritative, skipped
  by sync scripts.
- `references/sprint-system.md`: **WIP limit as team-configurable**
  via `koni-docs.agile.wip_limit` key in CLAUDE.md Integration block
  (defaults to 3; raise for atomic-ship sprints).
- `references/sprint-system.md`: **hybrid EPIC numbering** convention
  (zero-padded `EPIC-01..13` from BMad era + plain `EPIC-14+`
  post-koni-docs) documented + fallback behavior of
  `agile-backfill-fields.mjs`.

### Changed

**Script — `agile-sync-up.mjs` regex-escape contract**
- Adds `escapeRegExp(str)` helper at top of script. Applied to every
  dynamic input before `new RegExp(...)` construction:
  - `epicStoryRowMatcher` (was: `\\.`-only escape; now: full escape)
  - `updatePRDStoryEntry` section-header regex
  - `updatePRDFRRow` table-row regex
- `updatePRDFRRow` now **extracts every well-formed `FR-N` token** from
  `prd_ref:` via `/\bFR-[0-9]+(?:\.[0-9]+)?\b/g`. Supports comma-separated
  multi-FR (`prd_ref: FR-1, FR-2`); ignores `AD-N` tokens (PRD §6 AD table
  is hand-maintained); ignores free-form prose (Koni-Finance-Final
  US-1.34 pattern). Each extracted FR row is updated independently.
- `updateSprintScopeTable` switches from hardcoded position-from-end
  to **header-name-based column lookup** via new `findColumnIndex`
  helper. Works on canonical 6-col AND Koni-Finance-Final 7-col Carry
  shape without configuration.
- `updateSprintScopeTable` also searches `<docs>/sprints/archive/` for
  sprint files (some projects move closed sprints there but still
  reference them from done stories).
- "PRD story entry not found" downgraded from `⚠` to `-` (info) when
  story has `prd_ref` set, and **silenced entirely** when `prd_ref`
  is empty. Legacy projects that track stories only in Epic Stories
  tables no longer drown the sync output (Koni-Finance-Final +
  senti_quant pattern).

**Script — `agile-backfill-fields.mjs` infers `epic:` from story ID**
- New `inferEpicFromId(id)` helper: `US-3.7` → `EPIC-3`; nested
  `US-8.0.1` → `EPIC-8`. When `epic:` is missing, backfill emits the
  inferred value (instead of blank `""`).
- Validation step suggests the inferred value when both `id:` and
  `epic:` blank: `⚠ ... missing required field "epic" (suggest \`epic:
  EPIC-X\` from id US-X.Y)`.

**Regression test — sync-test.mjs**
- Test 7 added: agile-sync-up regex-escape robustness. Two new fixture
  stories cover the exact crash shape (regex-special title + multi-FR
  prd_ref; prose `prd_ref:` with brackets/parens/AD-N tokens — the
  Koni-Finance-Final US-1.34 shape). Assertion count: 21 → 28.

### Fixed

**BLOCKER — `agile-sync-up.mjs` no longer crashes on regex-special story content**
- Was: `SyntaxError: Range out of order in character class` at
  `agile-sync-up.mjs:254` `updatePRDFRRow` when a story's `prd_ref:`
  contained `[`, `]`, `(`, `.`, etc. (Koni-Finance-Final US-1.34).
  Mid-run abort left some files synced and others not.
- Now: zero crashes against 198-story Koni-Finance-Final + 266-story
  senti_quant. Both reference repos exit 0 in dry-run.
- Root cause + fix codified as [LESSONS §5](LESSONS.md) and PRD AD-10
  ("sync scripts MUST escape all dynamic input before regex construction").

**Real-world dry-run delta (before → after, BLOCKER fix)**:
| Reference repo | Stories | Before | After |
|---|---|---|---|
| Koni-Finance-Final | 198 | Crashed at story #34 (SyntaxError) | Exit 0; 164 epic + 168 FR + 78 sprint rows updated, 1 skipped (legitimate — story without `id:`) |
| senti_quant | 266 | Exit 0 but ~190 noisy `⚠ PRD story entry not found` warnings | Exit 0; downgraded to silent/`-` info; only data-hygiene warnings remain (264 PRD FR not found — stories pointing at PRDs that don't list those FRs) |

### Notes

Decision recorded as [CONTEXT D11](CONTEXT.md) — adopt real-world
template additions wholesale (rather than picking one-at-a-time) +
formalize the regex-escape contract as AD-10. Both originated from the
US-1.5 retro against Koni-Finance-Final + senti_quant.

PRD added: FR-14 (US-1.5 deliverable), AD-10 (regex-escape contract).

### Followups (deferred to next sprint, EPIC-1 or EPIC-3)

- **CI gate** — GitHub Action running
  `skills/koni-docs/scripts/__tests__/sync-test.mjs` on every PR.
  Currently runs locally only. Open question in
  [ARCHITECTURE.md](ARCHITECTURE.md).
- **Consumer-repo cleanup** — Koni-Finance-Final + senti_quant will
  pick up the BLOCKER fix on their next `npx skills update koni-docs`.
  Their data-hygiene gaps (stories missing `epic:`, `prd_ref:` pointing
  at non-existent FRs, sprint scope rows missing for done stories)
  remain for each repo to clean up locally.
- **Auto-detect padded EPIC-NN format** in `agile-backfill-fields.mjs`
  (currently emits plain `EPIC-N`; padded projects hand-correct).

### Contributors

Sprint-2026-W22 extension: same single contributor as the v0.2.0 ship.

| GitHub login | Git name | Stories shipped | Points (v0.3.0) |
|---|---|---|---|
| [`saltict`](https://github.com/saltict) | AnhMTV | US-1.5 | 8 |

Sprint-W22 total across v0.2.0 + v0.3.0: 8 stories, 25 points,
1 contributor.

**Commit**: v0.3.0 release commit — to be tagged at sprint-W22
close. SHA backfilled by `changelog-backfill-commits.mjs` at
pre-commit.

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
