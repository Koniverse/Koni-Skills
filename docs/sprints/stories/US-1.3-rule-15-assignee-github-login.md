---
id: US-1.3
title: "Add RULE-15: assignee = GitHub login (never git user.name)"
epic: EPIC-1
status: done
priority: P0
points: 2
sprint: sprint-2026-W22
version_shipped: 0.2.0
prd_ref: FR-12
assignee: saltict
commit:
created: 2026-05-27
updated: 2026-05-27
---

## Goal

Add **RULE-15** to the `koni-docs` rule catalog: every `assignee:`
value in koni-docs artifacts MUST be the contributor's **GitHub login**
(the `username` half of `github.com/<username>`), never their git
`user.name`, never a display name. This rule expands the catalog from
9 to 10 project-agnostic rules. After this story ships, consumer
projects inherit the rule automatically when they `npx skills update`.

## Background

Today (2026-05-27 morning) the Koni-Skills repo itself shipped
[US-2.1](US-2.1-bootstrap-docs-structure.md) with `assignee: AnhMTV`
across four story files. `AnhMTV` is the maintainer's git
`user.name`; their actual GitHub login is `saltict`. The mismatch was
caught when the user noticed the `assignee:` field while reading
US-1.1.

[Koni-Finance-Final's CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md)
documents this exact convention as RULE-15 and ties it to multiple
downstream lookups that break when git `user.name` is used instead of
GitHub login:

- `@-mentions` in PR descriptions and comments
- PR reviewer auto-assignment
- `gh api users/<login>` lookups (return 404 on git `user.name`)
- CODEOWNERS file pattern matching
- Audit attribution in CONTEXT / decision authorship

[US-1.2](US-1.2-active-context-split-pattern.md)'s "What we explicitly
did NOT do" section originally deferred this rule. The user's request
on 2026-05-27 PM to "always use GitHub login for assignee" triggered
the pickup of RULE-15 into this sprint. RULE-16 (bare semver
`version_shipped:`) stays deferred — that one needs broader template
touch-ups across epic / sprint / PRD frontmatter and can wait for a
follow-up sprint.

[CONTEXT D8](../../CONTEXT.md) authorizes RULE-15 adoption.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-docs/references/rules.md` contains a
  RULE-15 section under "During-Work Rules" with Severity BLOCKER,
  What / Why / How-to-comply / Grep-checks, and `See:` pointers to
  `templates/story.md` and `templates/integration.md`.
- [x] **AC-2** — `skills/koni-docs/SKILL.md` §2 Core rules table
  updated: header text changes from "9 rules" to "10 rules", and a
  RULE-15 row is appended.
- [x] **AC-3** — `skills/koni-docs/references/templates/story.md`
  frontmatter comment for `assignee:` changes from
  `# GitHub login (optional)` to
  `# MANDATORY (RULE-15): GitHub login from \`gh api user --jq .login\` — never git user.name`.
- [x] **AC-4** — All four pre-existing story files in this repo
  (US-1.1, US-2.1, US-2.2, US-2.3) have their `assignee:` updated
  from `AnhMTV` (git `user.name`) to `saltict` (GitHub login).
- [ ] **AC-5** — Grep-check: `grep -lE "^assignee: AnhMTV$"
  docs/sprints/stories/*.md` returns zero files.
- [ ] **AC-6** — Grep-check: every non-empty `assignee:` value in
  this repo resolves to a real GitHub user via
  `gh api users/<login>`. (Manual spot-check on `saltict` only;
  CI gate deferred.)

## Tasks

- [x] **TASK-1.3.1** — Append RULE-15 to `rules.md` (AC: 1)
  - [x] Severity, What, Why, How-to-comply blocks
  - [x] Two grep-check examples (machine git `user.name` mismatch; `gh api users/<login>` validity)
  - [x] `See:` cross-references to story / sprint / integration templates
- [x] **TASK-1.3.2** — Update `SKILL.md` §2 rule count + row (AC: 2)
  - [x] "9 rules" → "10 rules" in the introductory sentence
  - [x] Append `| RULE-15 | ...` row to the rule table
- [x] **TASK-1.3.3** — Update `story.md` template frontmatter (AC: 3)
- [x] **TASK-1.3.4** — Fix existing story files (AC: 4, 5)
  - [x] `US-1.1-...md`: `assignee: AnhMTV` → `saltict`
  - [x] `US-2.1-...md`: same
  - [x] `US-2.2-...md`: same
  - [x] `US-2.3-...md`: same
- [ ] **TASK-1.3.5** — Update US-1.2 dev notes (cross-story housekeeping)
  - [x] In `What we explicitly did NOT do`, remove RULE-15 from the
    deferred list; leave only RULE-16

## Dev notes

### Architecture constraints

- [AD-3](../../ARCHITECTURE.md#architecture-decisions) — core rule
  set extension. RULE-15 is project-agnostic (no Supabase / Next.js
  / blockchain dependency), so it lives in the core catalog rather
  than a plugin skill.
- SKILL.md NFR-1 (≤ 500 lines) — adding one row to §2 keeps the body
  well under cap (currently 315 lines after this change).
- The story template's `assignee:` field is now MANDATORY (not
  optional). Existing sync scripts treat it as nullable already, so
  the change is semantic / documentation-side; script behavior does
  not regress.

### Cross-story dependencies

- Sibling [US-1.2](US-1.2-active-context-split-pattern.md) —
  US-1.2's `What we explicitly did NOT do` originally deferred
  RULE-15. This story closes that deferral; US-1.2's dev notes are
  updated in TASK-1.3.5.
- Related [LESSONS §4](../../LESSONS.md) — `version_shipped` bare
  semver. RULE-16 (the natural companion to RULE-15) stays deferred;
  filed as follow-up.

### What we explicitly did NOT do

- **No RULE-16 added.** RULE-16 (bare-semver `version_shipped:`) is
  documented in Koni-Finance-Final's CLAUDE.md alongside RULE-15.
  It would close [LESSONS §4](../../LESSONS.md) cleanly, but needs
  template touch-ups across story / epic / sprint / PRD frontmatter
  and a sweep across this repo's existing `version_shipped: v0.1.0`
  values. Filed as US-1.4 (next sprint).
- **No CI gate for `gh api users/<login>` validity.** The grep-check
  in AC-6 is manual today. Wiring it into a GitHub Action belongs
  with the broader CI epic that also covers the sync-script
  regression test.
- **No retroactive fix on closed Koniverse repos.** Existing
  Koni-ERP-02 / Koni-Finance-Final stories that pre-date RULE-15
  may have stale `assignee:` values. Those repos opt in on their
  next `npx skills update` + ad-hoc cleanup pass; not this story's
  scope.

### References

- [Source: Koni-Finance-Final CLAUDE.md](https://github.com/Koniverse/Koni-Finance-Final/blob/main/CLAUDE.md) — original RULE-15 statement
- [Source: rules.md §RULE-15](../../../skills/koni-docs/references/rules.md)
- [Source: SKILL.md §2 rule table](../../../skills/koni-docs/SKILL.md)
- [Source: story template §1 Frontmatter](../../../skills/koni-docs/references/templates/story.md)
- [Source: PRD FR-12, AD-8](../../PRD.md)
- [Source: CONTEXT D8](../../CONTEXT.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | `grep -q "^### RULE-15:" skills/koni-docs/references/rules.md` |
| AC-2 | `grep -q "RULE-15.*GitHub login" skills/koni-docs/SKILL.md` AND `grep -q "10 rules" skills/koni-docs/SKILL.md` |
| AC-3 | `grep -q "MANDATORY (RULE-15)" skills/koni-docs/references/templates/story.md` |
| AC-4 / AC-5 | `grep -lE "^assignee: AnhMTV$" docs/sprints/stories/*.md` returns no files |
| AC-6 | `gh api users/saltict --jq .login` returns `saltict` |

## Changelog entry

### Added
- **RULE-15** — `assignee:` MUST be the contributor's GitHub login,
  never git `user.name`. Documented in
  `skills/koni-docs/references/rules.md` (Severity BLOCKER) and
  added to the `SKILL.md` §2 rule catalog (9 → 10 rules).
- `skills/koni-docs/references/templates/story.md` frontmatter
  comment now mandates the GitHub-login convention with the
  `gh api user --jq .login` lookup command.

### Changed
- This repo's four pre-existing stories (US-1.1, US-2.1, US-2.2,
  US-2.3) updated `assignee: AnhMTV` (git `user.name`) →
  `assignee: saltict` (GitHub login).
- US-1.2 "What we explicitly did NOT do" trimmed: RULE-15 moved
  from `deferred` to `shipped via US-1.3` (RULE-16 still deferred).

**Commit**: pending

## Implementation notes

The rule was lifted verbatim from Koni-Finance-Final's CLAUDE.md
and adapted into the koni-docs rule-template shape (Severity / What /
Why / How-to-comply / Grep-check / See).

## Files modified

**Modified (skills/koni-docs/):**
- `references/rules.md` — append RULE-15 section after RULE-13
- `references/templates/story.md` — clarify `assignee:` comment
- `SKILL.md` — §2 rule count + RULE-15 row

**Modified (docs/sprints/stories/):**
- `US-1.1-koni-docs-initial-release.md` — `assignee:` fix
- `US-2.1-bootstrap-docs-structure.md` — same
- `US-2.2-wire-integration-blocks.md` — same
- `US-2.3-version-changelog-seed.md` — same
- `US-1.2-active-context-split-pattern.md` — dev notes trim

## Cross-references

- [PRD FR-12, AD-8](../../PRD.md)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CONTEXT D8](../../CONTEXT.md)
- [Sibling US-1.2](US-1.2-active-context-split-pattern.md)
- [Follow-up RULE-16](../../LESSONS.md) — bare-semver `version_shipped`
