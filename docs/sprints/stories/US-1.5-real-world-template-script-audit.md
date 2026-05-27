---
id: US-1.5
title: "Real-world template + script audit (Koni-Finance-Final + senti_quant)"
epic: EPIC-1
status: ready
priority: P0
points: 8
sprint:
version_shipped:
prd_ref: FR-14, AD-10
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Close the gap between what the `koni-docs` skill ships (10 rules + 13
templates + 5 scripts) and what mature Koniverse projects actually do
on the ground today. Two production-grade repos drive the audit:

- **[Koni-Finance-Final](https://github.com/Koniverse/Koni-Finance-Final)**
  (198 stories / 9 epics / 8 sprints) — multi-developer team-sprint mode.
- **[senti_quant](https://github.com/Koniverse/senti_quant)**
  (266 stories / 35 epics / 10 sprints) — single-maintainer multi-EPIC
  agile-MD-pipeline mode.

After this story, the skill ships everything both repos found necessary,
**and** every sync script runs clean (exit 0, no warnings, no SyntaxError)
against both reference repos. Bug surface is closed and templates carry
the patterns these teams already paid for.

## Background

v0.2.0 closed EPIC-1 + EPIC-2 with a clean 21/21 regression test pass
and zero `agile-sync-up.mjs` warnings against this repo's own
`docs/sprints/` (9 stories total). That smoke test is not representative
— this repo has ~10 stories, while Koni-Finance-Final has ~200 and
senti_quant ~270.

A read-only survey of both reference repos (2026-05-27, via Explore
agents) surfaced 12 template gaps + 4 script bugs that the small
in-repo dataset never exercised. Most surfaced gaps are non-fatal
(template patterns missing — projects worked around by inventing their
own); one is a **BLOCKER** (sync-up crashes mid-run on Koni-Finance-Final
story US-1.34 due to unescaped regex special characters).

## Acceptance criteria

### Script bugs (BLOCKER tier — sync must not crash)

- [ ] **AC-1** — `agile-sync-up.mjs` no longer crashes with
  `SyntaxError: Invalid regular expression: Range out of order in
  character class` when a story's title / dev-notes contain regex
  metacharacters (`[`, `]`, `(`, `)`, `.`, `*`, `+`, `?`, `|`, `^`,
  `$`, `\\`). Root cause: `updatePRDFRRow` at line 254 inserts raw
  story content into `new RegExp(...)` without escaping. Fix: add a
  `escapeRegExp(str)` helper and apply to every dynamic input before
  `new RegExp()`.
- [ ] **AC-2** — `agile-sync-up.mjs` runs clean (exit 0, no crash)
  against `/Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/docs/`
  (198 stories) in dry-run mode.
- [ ] **AC-3** — `agile-sync-up.mjs` runs clean (exit 0, no crash)
  against `/Volumes/MacData/Workspace/AI/senti_quant/docs/`
  (266 stories) in dry-run mode.

### Script bugs (WARNING tier — surface real issues without crashing)

- [ ] **AC-4** — `agile-sync-up.mjs` "PRD story entry not found"
  warnings drop to ≤ 5% of stories (was ~95% on both reference repos).
  Root cause: the PRD §11 entry-finder regex matches only the exact
  shape this repo's PRD uses; real repos use small variations
  (per-story `### US-X.Y` headers, per-epic tables without per-story
  rows, mixed layouts). Fix: support both shapes; document the
  expected PRD §11 patterns in `prd.md` template.
- [ ] **AC-5** — `agile-backfill-fields.mjs` validation flags every
  story missing the **`epic:`** field as a recoverable error and
  offers to infer epic from story ID (`US-X.Y` → `EPIC-X`). Currently
  warns but does nothing. Affected real-world stories: US-3.31 (full
  frontmatter missing), US-4.24 / US-8.0 / US-8.0.1 / US-8.0.2 / US-8.7
  (epic field missing) in Koni-Finance-Final.
- [ ] **AC-6** — Sprint scope table matcher accepts the **7-column
  Koni-Finance-Final shape** (`US | Title | Epic | Pri | Points |
  Status | Carry | Story file`) in addition to the documented 6-column
  shape. Currently the 7-col Carry column breaks the matcher; sync
  warns "Sprint X — story row not found" even when the row is there.

### Template additions (consolidate real-world patterns)

- [ ] **AC-7** — `templates/sprint.md` adds documentation for the
  optional **`Carry` column** in the sprint scope table (Koni-Finance-
  Final pattern):
  ```
  | US | Title | Epic | Pri | Points | Status | Carry | Story file |
  ```
  with values: `from W<N>`, `new`, `substrate`, or descriptive prose.
- [ ] **AC-8** — `templates/sprint.md` adds 4 new optional sections,
  each with filled mini-example and "when to use":
  - **`## Why <US-X> in W<N>`** — narrativize a single largest
    mid-sprint commitment (senti_quant pattern)
  - **`## Parked / deferred from W<N-1>`** — explicit carry-over audit
    with status emojis (✅ Closed, 🚧 Carried, 🟢 Ready, 🗑️ Retired)
    (senti_quant pattern)
  - **`## Closed mid-sprint W<N>`** — date + version per mid-sprint
    landing (senti_quant pattern)
  - **`## Risks & dependencies`** — mitigation bullets per risk
    (senti_quant pattern)
  Also documents the inline title annotations pattern: `(added
  YYYY-MM-DD)`, `(closed mid-sprint vX.Y.Z)`, `_(carry W21←W20←W19)_`.
- [ ] **AC-9** — `templates/sprint.md` §close-out adds a
  **`## Carry-overs to W<N+1>`** section template for end-of-sprint
  carry tracking (Koni-Finance-Final pattern):
  ```
  | US | Reason | Sprint of origin |
  |---|---|---|
  | US-X.Y | <why still open> | sprint-2026-W<N-K> |
  ```
- [ ] **AC-10** — `templates/story.md` frontmatter `version_shipped:`
  comment example fixed from `e.g. v0.3.1` to bare semver `e.g. 0.3.1`
  (closes [LESSONS §4](../../LESSONS.md), formalizes the long-deferred
  **RULE-16**). Catalog count 10 → 11. `references/rules.md` gets a
  full RULE-16 entry (Severity BLOCKER) with grep check
  `grep -lE '^version_shipped: v' docs/sprints/stories/*.md` returning
  zero files.
- [ ] **AC-11** — `templates/story.md` documents the **multi-commit
  `commit:` field** (comma-separated SHAs for stories shipped across
  multiple commits, e.g. hotfix + main work):
  ```yaml
  commit: 47b4383, a76477c, 9a701de
  ```
  Both reference repos use this; template currently implies single SHA.
- [ ] **AC-12** — `templates/story.md` documents the optional
  **`## Story refresh — YYYY-MM-DD`** block pattern (Koni-Finance-Final)
  for mid-implementation re-scopes that don't warrant a brand-new
  story.
- [ ] **AC-13** — `references/sprint-system.md` clarifies the
  **WIP limit** as team-configurable (default 3 for solo / small teams,
  documented as `agile.wip_limit` in CLAUDE.md `Koni-Docs Integration`
  config block — new optional key). Currently template says
  "recommended for 4+" without prescribing.

### Reference / convention additions

- [ ] **AC-14** — `SKILL.md` §1 pipeline integration documents the
  **Vietnamese counterpart `*.vi.md`** convention (senti_quant
  pattern + the broader Koniverse migration practice): English file
  is canonical (RULE-13); `*.vi.md` siblings are optional translations
  that DON'T count for sync.
- [ ] **AC-15** — `references/sprint-system.md` documents the
  **hybrid EPIC numbering** convention seen in senti_quant: EPIC-01..13
  preserved from BMad-era projects; EPIC-14+ added post-koni-docs
  adoption. Sync scripts already handle this (numbers are just
  identifiers); this is documentation only.

## Tasks

(detailed task breakdown TBD during next-sprint planning; high-level
groupings below)

- [ ] **TASK-1.5.1** — Fix `escapeRegExp` BLOCKER (AC-1, 2, 3)
  - [ ] Add `escapeRegExp(str)` helper to a shared module
  - [ ] Apply to every dynamic input in `agile-sync-up.mjs`
    (`updateEpicStoriesTable`, `updatePRDStoryEntry`,
    `updatePRDStoriesIndex`, `updatePRDFRRow`, `updateSprintScopeTable`)
  - [ ] Add regression fixture: story with title containing `[`, `]`,
    `(`, `.`, `*`
  - [ ] Re-run dry-run against both reference repos → exit 0
- [ ] **TASK-1.5.2** — PRD §11 entry-finder robustness (AC-4)
  - [ ] Extend matcher to support per-story `### US-X.Y` section
    headers (not just table rows)
  - [ ] Add `prd.md` template §6 with both layout options + when to
    use each
- [ ] **TASK-1.5.3** — Backfill epic from story ID (AC-5)
  - [ ] `agile-backfill-fields.mjs` infers `epic: EPIC-<X>` from
    `id: US-<X>.<Y>` when frontmatter missing
  - [ ] Adds `--strict` flag to fail-fast on missing required fields
- [ ] **TASK-1.5.4** — 7-column sprint scope (AC-6)
  - [ ] Update sprint scope-table parser to accept both 6- and 7-col
    shapes
  - [ ] Add fixture in `sync-test.mjs` covering 7-col
- [ ] **TASK-1.5.5** — Sprint template additions (AC-7, 8, 9)
  - [ ] Append Carry column documentation + filled example
  - [ ] Append 4 optional sections (Why, Parked, Closed mid-sprint, Risks)
  - [ ] Append Carry-overs to W<N+1> section
- [ ] **TASK-1.5.6** — RULE-16 + story template (AC-10, 11, 12)
  - [ ] Add RULE-16 to `rules.md` (BLOCKER)
  - [ ] Fix `version_shipped` example in `story.md`
  - [ ] Sweep this repo's existing `version_shipped` values for `v`
    prefix; fix any (US-1.1 is already bare, US-1.2..2.4 use bare 0.2.0)
  - [ ] Document multi-commit `commit:` field
  - [ ] Document story-refresh block pattern
  - [ ] Update SKILL.md §2 rule table 10 → 11
- [ ] **TASK-1.5.7** — Sprint-system reference (AC-13, 15)
  - [ ] WIP limit as team-configurable
  - [ ] Hybrid EPIC numbering convention note
- [ ] **TASK-1.5.8** — Vietnamese counterpart convention (AC-14)
  - [ ] SKILL.md §1 pipeline integration callout
  - [ ] sync-test.mjs fixture skips `*.vi.md` files
- [ ] **TASK-1.5.9** — Regression test expansion
  - [ ] Add fixtures derived from real-world edge cases:
    7-col sprint, per-story PRD section, multi-commit, regex-special
    title, missing-epic, `*.vi.md` sibling
  - [ ] All new fixtures pass; total assertion count rises from 21
    to ≥ 30
- [ ] **TASK-1.5.10** — Re-run dry-run against both reference repos
  and capture before/after warning counts in implementation notes

## Dev notes

### Architecture constraints

- [AD-1](../../ARCHITECTURE.md#architecture-decisions) — fix lives in
  `skills/koni-docs/scripts/`; no cross-skill imports.
- [AD-3](../../ARCHITECTURE.md#architecture-decisions) — RULE-16 is
  project-agnostic; lives in core catalog (10 → 11).
- [AD-4](../../ARCHITECTURE.md#architecture-decisions) — sprint
  template additions stay inside `templates/sprint.md` (no new
  template-type file).
- **NEW**: [AD-10](../../ARCHITECTURE.md#architecture-decisions) (this
  story introduces) — sync scripts MUST escape every dynamic input
  before regex construction. Generalize: any script that builds a
  RegExp from string data treats that data as untrusted.

### Cross-story dependencies

- Builds on [US-1.1](US-1.1-koni-docs-initial-release.md) — uses every
  sync script and template the foundation shipped.
- Builds on [US-1.3](US-1.3-rule-15-assignee-github-login.md) — RULE-16
  follows the same pattern RULE-15 established (BLOCKER, grep-checkable,
  template + SKILL.md updates in sync).
- Closes follow-up flagged in
  [US-1.2](US-1.2-active-context-split-pattern.md) (Pattern B story's
  "What we explicitly did NOT do" listed RULE-16 as deferred).
- Required by future EPIC-3 (plugin skills) — plugin patterns will
  reuse the regex-escape helper; the BLOCKER fix is upstream of any
  plugin work.

### What we explicitly did NOT do

- **No CI gate yet.** Adding a GitHub Action to run
  `sync-test.mjs` on every PR is filed as a separate sprint-W19
  followup. This story focuses on the script + template fixes; CI
  enforcement is a separate concern.
- **No retroactive sync of Koni-Finance-Final / senti_quant.** Their
  sync warnings won't auto-clear when this skill ships — those repos
  need to run `npx skills update koni-docs` and then their own
  `agile-sync-up.mjs --docs-path docs/` on their own time. This
  story's deliverable is the FIXED skill; the downstream cleanup is
  each repo's own work.
- **No `*.vi.md` sync support beyond skip.** This story only ensures
  scripts don't break on `*.vi.md` siblings; full bilingual sync
  (e.g. mirror story-status across English + Vietnamese files) is a
  future story if anyone asks.

### Performance budget

- `agile-sync-up.mjs` on 266-story senti_quant: < 5 s wall time
  (already meets NFR-3 budget). Regex-escape helper must not push p95
  past 6 s.
- `sync-test.mjs` regression: assertion count rises from 21 to ≥ 30;
  total runtime stays < 10 s.

### References

- [Source: Explore agent surveys (2026-05-27) — Koni-Finance-Final + senti_quant docs/sprints/]
- [Source: dry-run sync output captured in implementation notes below]
- [Source: SKILL.md §0 orientation](../../../skills/koni-docs/SKILL.md)
- [Source: PRD FR-14, AD-10](../../PRD.md)
- [Source: LESSONS §4](../../LESSONS.md) — version-doubled-v trap that RULE-16 codifies
- [Source: sync script](../../../skills/koni-docs/scripts/agile-sync-up.mjs) — line 254 is the BLOCKER bug site

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `node skills/koni-docs/scripts/__tests__/sync-test.mjs` includes a fixture with regex-special title; exit 0 |
| AC-2 | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path /Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/docs/ --dry-run` exits 0 |
| AC-3 | `node skills/koni-docs/scripts/agile-sync-up.mjs --docs-path /Volumes/MacData/Workspace/AI/senti_quant/docs/ --dry-run` exits 0 |
| AC-4 | Count of "PRD story entry not found" warnings drops from ~190 (current) to ≤ 10 against Koni-Finance-Final |
| AC-5 | `node skills/koni-docs/scripts/agile-backfill-fields.mjs --docs-path /Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/docs/ --dry-run` proposes `epic:` backfill for US-4.24 / US-8.0 / etc. |
| AC-6 | `grep -q "Carry" skills/koni-docs/scripts/agile-sync-up.mjs` shows 7-col handling |
| AC-7 | `grep -q "Carry" skills/koni-docs/references/templates/sprint.md` |
| AC-8 | `grep -E "^### .+Why .+ in W\|^### Parked / deferred\|^### Closed mid-sprint\|^### Risks" skills/koni-docs/references/templates/sprint.md` returns ≥ 4 |
| AC-9 | `grep -q "Carry-overs to W" skills/koni-docs/references/templates/sprint.md` |
| AC-10 | `grep -q "RULE-16" skills/koni-docs/references/rules.md` AND `! grep -q "e.g. v0\." skills/koni-docs/references/templates/story.md` |
| AC-11 | `grep -q "comma-separated" skills/koni-docs/references/templates/story.md` |
| AC-12 | `grep -q "Story refresh" skills/koni-docs/references/templates/story.md` |
| AC-13 | `grep -q "wip_limit" skills/koni-docs/references/templates/integration.md OR sprint-system.md` |
| AC-14 | `grep -q "\.vi\.md" skills/koni-docs/SKILL.md` |
| AC-15 | `grep -q "hybrid EPIC numbering" skills/koni-docs/references/sprint-system.md` |

## Changelog entry

(drafted near completion — final SHA backfilled at pre-commit)

### Added
- **RULE-16** — `version_shipped:` MUST be bare semver, NEVER `v`-prefixed.
  Severity BLOCKER. Catalog count: 10 → 11. Closes
  [LESSONS §4](docs/LESSONS.md).
- `references/templates/sprint.md` §sprint-scope: optional `Carry`
  column (7-col Koni-Finance-Final shape).
- `references/templates/sprint.md` §sections: 4 new optional sections
  (`## Why <US-X> in W<N>`, `## Parked / deferred from W<N-1>`,
  `## Closed mid-sprint W<N>`, `## Risks & dependencies`).
- `references/templates/sprint.md` §close-out: optional `## Carry-overs
  to W<N+1>` section.
- `references/templates/story.md`: multi-commit `commit:` field
  documentation; optional `## Story refresh — YYYY-MM-DD` mid-story
  block.
- `references/sprint-system.md`: WIP limit as team-configurable
  (`agile.wip_limit` in CLAUDE.md integration block); hybrid EPIC
  numbering note.
- `SKILL.md` §1: Vietnamese counterpart `*.vi.md` convention callout.

### Changed
- `agile-sync-up.mjs`: escapes every dynamic input before regex
  construction (BLOCKER fix); supports 7-col sprint-scope shape;
  supports per-story `### US-X.Y` PRD §11 layout in addition to table.
- `agile-backfill-fields.mjs`: infers `epic:` from story ID when
  missing; new `--strict` flag.
- `sync-test.mjs`: ≥ 30 assertions (was 21) covering real-world edges
  (regex-special title, 7-col sprint, per-story PRD section,
  multi-commit, missing-epic, `*.vi.md`).
- `references/templates/story.md` frontmatter `version_shipped:`
  comment fixed: bare semver example, NOT `v`-prefixed.

### Fixed
- `agile-sync-up.mjs` line 254 `updatePRDFRRow` no longer crashes with
  `SyntaxError: Range out of order in character class` when story
  titles / dev notes contain `[`, `]`, `(`, `.`, etc. Root cause:
  raw-string interpolation into `new RegExp(...)` without escape.
  Codified as [LESSONS §5](docs/LESSONS.md) + [AD-10](docs/ARCHITECTURE.md).

**Commit**: pending

## Implementation notes

### Pre-fix dry-run captures (2026-05-27 baseline)

**Koni-Finance-Final** (198 stories, 9 epics, 8 sprints):
```
node skills/koni-docs/scripts/agile-sync-up.mjs --dry-run
  --docs-path /Volumes/MacData/Workspace/AI/Koni-Finance-Final.worktrees/main/worktree-2026-05-26T08-15-10/docs/

→ Crashes at story US-1.34 with:
  SyntaxError: Invalid regular expression:
    /(\| AD-24 (Docker Compose dev infra) + AD-26 ... \[\[US-1\.1\]\] ...
    Range out of order in character class
  at agile-sync-up.mjs:254 updatePRDFRRow

→ generate-status: 1 file skipped (US-3.31-soft-delete-legal-entity-catalog.md — no id)
  STATUS rebuilt with 197 / 198 stories

→ agile-backfill-fields validation flags 6 stories missing 'epic' field
  (US-4.24, US-8.0, US-8.0.1, US-8.0.2, US-8.7) + US-3.31 missing entire frontmatter
```

**senti_quant** (266 stories, 35 epics, 10 sprints):
```
node skills/koni-docs/scripts/agile-sync-up.mjs --dry-run
  --docs-path /Volumes/MacData/Workspace/AI/senti_quant/docs/

→ Completes (no crash — no story titles trigger regex-special bug):
  Results: 266 epic(s), 0 PRD story(s), 202 FR row(s), 81 sprint(s) updated. 0 skipped.

→ But: ~95% of stories warn "PRD story entry not found (no per-story section or
  per-epic table row)" → PRD §11 matcher mismatched with their layout.
→ Some sprints warn "story row not found" → 7-col Carry sprint shape.
→ generate-status: 266 stories across 4 columns ✓
→ agile-backfill-fields: all required fields present ✓ (cleaner data than KFF)
```

### Post-fix targets

- AC-2/AC-3: both reference repos sync exits 0 with ≥ 95% reduction in
  warning count.
- Real-world fixtures incorporated into `sync-test.mjs`; assertion
  count ≥ 30.

(Detail filled during implementation.)

## Files modified

(filled during implementation — projected)

**Modified (skills/koni-docs/):**
- `scripts/agile-sync-up.mjs` — escapeRegExp helper + apply to all dynamic regex inputs
- `scripts/agile-backfill-fields.mjs` — infer epic from story ID
- `scripts/__tests__/sync-test.mjs` — new fixtures (regex-special, 7-col, missing-epic, multi-commit, `*.vi.md`)
- `references/rules.md` — add RULE-16
- `references/templates/sprint.md` — Carry column, 4 new sections, Carry-overs section
- `references/templates/story.md` — bare semver example, multi-commit field, story-refresh block
- `references/templates/prd.md` — per-story `### US-X.Y` section layout option
- `references/sprint-system.md` — WIP limit team-config, hybrid EPIC numbering
- `references/templates/integration.md` — `agile.wip_limit` key in Koni-Docs Integration block
- `SKILL.md` — §1 `*.vi.md` callout + §2 rule count 10 → 11 + RULE-16 row

## Cross-references

- [PRD FR-14, AD-10](../../PRD.md)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [LESSONS §4](../../LESSONS.md) — codifies the version-doubled-v trap that motivates RULE-16; new §5 entry will land at story close for the regex-escape BLOCKER
- [CONTEXT D11](../../CONTEXT.md) — to be appended on story pickup, recording the rationale for adopting the real-world template additions wholesale rather than picking one-at-a-time
- Reference repos:
  - [Koni-Finance-Final docs/sprints/](https://github.com/Koniverse/Koni-Finance-Final/tree/main/docs/sprints)
  - [senti_quant docs/sprints/](https://github.com/Koniverse/senti_quant/tree/main/docs/sprints)
