---
id: US-1.6
title: "Story deadlines — a `due` date beside the sprint cadence"
epic: EPIC-1
status: done
priority: P1
points: 3
sprint: sprint-2026-W29
due:
version_shipped: "0.39.0 + 0.40.0"
prd_ref: [FR-38]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: 1511dd9
created: 2026-07-13
updated: 2026-07-13
external_deps:
---

## Goal

Give a story a way to say *"this is owed to someone by the 20th"* — a real
calendar date, distinct from the sprint it happens to sit in. Until now koni-docs
could express a rhythm (`sprint.start` / `sprint.end`) and bookkeeping (`created`
/ `updated`), but never a commitment. Work carrying a contract date, a customer
demo, or an audit window was invisible to every tool in the framework: STATUS.md
showed it as an ordinary in-progress row and `validate` said nothing. After this
story, the date lives in the docs, and the tooling surfaces it before it is
missed rather than after.

## Background

The trigger was a plain request: sprints are weekly, but some tasks come with an
externally-imposed date, and there was nowhere to put it.

The design question that mattered was not *what field to add* but *what a
deadline is*. A sprint is a **cadence** — it repeats, and `sprint.end` is simply
where the week stops; it is not a promise made to anyone. A `due` is a
**commitment** — a date imposed from outside that rhythm. Conflating the two is
what makes deadline tracking useless in most systems: once every item carries an
implicit deadline, the two that carry a real one are buried.

So the design rejects inheritance. An empty `due` does **not** fall back to
`sprint.end`; a story with no `due` has no deadline at all. The field earns its
power by being rare, and the Deadlines section stays short enough to read.

The enforcement level was chosen deliberately: deadlines **inform, they do not
block**. A malformed `due` fails `validate` (that is a schema violation, no
different from a bad `prd_ref`), but a story merely past its date only warns. A
missed date must never wedge someone's commit — a gate that punishes honesty
about slipping is a gate that teaches people to delete the date.

Design spec:
[2026-07-13-koni-docs-story-deadlines-design.md](../../superpowers/specs/2026-07-13-koni-docs-story-deadlines-design.md).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) —

- **§12 — the doc layer is only trustworthy if every field is true at write time.**
  The decisive constraint on this design. It is why `due` has no fallback to
  `sprint.end` (an inherited deadline is a field that is *not* true — nobody
  promised that date to anyone) and why moving a `due` requires a CONTEXT entry
  rather than a silent edit that would let STATUS.md report a slipped story as
  on-track.
- **§13 + §7 — one story = one deliverable; a story is not a release.** The work
  spans the CLI *and* the skill docs, and the temptation was to split it into
  "add the field" + "wire the tooling". A field nobody surfaces is a dead field,
  so schema + status + validate + docs ship as one story.
- **§10 — a machine-parsed contract written in prose breeds silent data loss.**
  `due` is parsed by code, so the contract is frozen as an exact regex
  (`^\d{4}-\d{2}-\d{2}$`) with the accepted-forms behaviour pinned by tests,
  not described in prose. This lesson is also what made me test the *real* YAML
  loader with the exact syntax an author types — which is how the rollover bug
  and the broken `sprintSchema` surfaced at all (now §16).
- **§4 — `version_shipped` is bare semver.** Followed: `0.39.0`, no `v`.
- **§14 / §15 — read the contract at entry, cite it, let review confirm.** This
  block is that citation.

## Acceptance criteria

- [x] **AC-1** — **Given** a story with `due: 2026-07-20`, **When**
  `koni-docs status` runs, **Then** STATUS.md contains a `## ⏰ Deadlines`
  section, positioned **above** the kanban columns, listing that story with its
  due date, signed days-remaining, and state.
- [x] **AC-2** — **Given** a corpus where no story sets `due`, **When**
  `koni-docs status` runs, **Then** the Deadlines section is still present and
  reads `_No stories carry an explicit deadline._` — quiet, not absent, so
  nobody wonders whether the feature ran.
- [x] **AC-3** — **Given** stories due yesterday, today, exactly N days out, and
  N+1 days out (N = `--due-soon-days`, default 3), **Then** they classify as
  `overdue`, `due-soon`, `due-soon`, and `on-track` respectively — the window is
  inclusive on both ends and "due today" is not yet late.
- [x] **AC-4** — **Given** a story with `status: done` or `deprecated` whose
  `due` is long past, **Then** it never appears as overdue anywhere. A shipped
  story cannot be late.
- [x] **AC-5** — **Given** a story with no `due` but a `sprint`, **Then** it has
  no deadline: `sprint.end` is **not** inherited.
- [x] **AC-6** — **Given** a story whose `due` is not a real date (`end of July`,
  `"2026-02-31"`), **When** `koni-docs validate` runs, **Then** it prints a
  malformed-due-date error and exits **1**.
- [x] **AC-7** — **Given** a story that is open and past its `due`, **When**
  `koni-docs validate` runs, **Then** it prints an overdue **warning** and exits
  **0** — deadlines never block a commit.
- [x] **AC-8** — **Given** `due` written unquoted (`due: 2026-07-20`, which YAML
  parses into a `Date`) or as a round-tripped ISO timestamp, **Then** both
  normalize to the same `YYYY-MM-DD` and classify identically.
- [x] **AC-9** — `--due-soon-days` accepts a non-negative integer and exits 2
  with a message on anything else, rather than silently meaning zero.
- [x] **AC-10** — `frontmatter-spec.md`, `templates/story.md`,
  `sprint-system.md`, and `SKILL.md` all document `due`, the no-inheritance rule,
  and the move-requires-CONTEXT rule.

## Tasks

- [x] **TASK-1.6.1** — `lib/deadlines.ts`: `normalizeDue`, `isValidIsoDate`,
  `getDeadlines`, `findMalformedDue` — pure, clock injected (AC: 3, 4, 5, 8)
  - [x] Subtask 1.6.1.1 — Normalize string / `Date` / ISO-timestamp forms.
  - [x] Subtask 1.6.1.2 — Classify against an injected `today`, sort most-overdue first.
- [x] **TASK-1.6.2** — `lib/schemas/story.ts`: add `due` + `STORY_DEFAULTS` entry (AC: 8)
- [x] **TASK-1.6.3** — `cli/status.ts`: `## ⏰ Deadlines` section + summary line + `--due-soon-days` (AC: 1, 2, 9)
- [x] **TASK-1.6.4** — `cli/validate.ts`: malformed = error, overdue = warning (AC: 6, 7)
- [x] **TASK-1.6.5** — Tests: `__tests__/lib/deadlines.test.ts` + status/validate CLI cases (AC: 1-9)
- [x] **TASK-1.6.6** — Skill docs: frontmatter-spec §1.1 + §3.1 + §5.6/§5.7, story template §2b, sprint-system §Deadlines, SKILL.md §3a/§3c/§7.4 (AC: 10)

## Dev notes

### Architecture constraints

- This story introduces no new AD. It extends the existing frontmatter contract
  and the existing `status` / `validate` subcommands.
- `lib/deadlines.ts` follows the lib's mutation contract: pure functions, no I/O,
  no clock reads. `today` is a parameter, which is what keeps the tests from
  rotting.

### Cross-story dependencies

- Builds on [US-4.25](US-4.25-cli-validate.md) — extends the `validate`
  subcommand with a second severity level (warnings that do not fail the run).
- Builds on [US-4.11](US-4.11-cli-status.md) — extends `renderKanban` with a
  section rendered above the columns.
- Builds on [US-4.30](US-4.30-frontmatter-spec-rule17.md) — the Iron Law it
  established for ID-typed fields is extended here to date-typed fields.

### What we explicitly did NOT do

- **No inheritance from `sprint.end`.** Considered and rejected: it would give
  every story an implicit deadline and drown the real ones. Trigger to revisit:
  never, unless the Deadlines section proves consistently empty *and* teams are
  demonstrably missing sprint ends.
- **No `due_type` (hard/soft) and no `due_source`.** One field, no taxonomy,
  until the single field proves insufficient in practice. Extra fields invite
  filling-for-the-sake-of-filling.
- **No blocking gate on overdue stories.** A gate that punishes recording a slip
  teaches people to delete the date instead of moving it.
- **No epic-level or sprint-level deadlines.** Story-level only; that is where
  work is actually assigned and shipped.
- **No viewer (Astro) rendering.** Follow-up once the field carries real data.

### References

- [Source: PRD FR-38](../../PRD.md#functional-requirements)
- [Source: design spec](../../superpowers/specs/2026-07-13-koni-docs-story-deadlines-design.md)
- [Source: CONTEXT D37](../../CONTEXT.md)
- [Source: LESSONS §16](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-3, AC-4, AC-5, AC-8 | `cd packages/koni-docs && npm test -- __tests__/lib/deadlines.test.ts` |
| AC-1, AC-2, AC-9 | `cd packages/koni-docs && npm test -- __tests__/cli/status.test.ts` |
| AC-6, AC-7 | `cd packages/koni-docs && npm test -- __tests__/cli/validate.test.ts` |
| AC-10 | `rg -l 'due' skills/koni-docs/references/frontmatter-spec.md skills/koni-docs/references/sprint-system.md skills/koni-docs/references/templates/story.md skills/koni-docs/SKILL.md` returns all four |

## Changelog entry

### Added
- `due` — an optional story frontmatter field holding a hard deadline imposed from outside the sprint cadence (bare `YYYY-MM-DD`). A story without `due` has no deadline; `sprint.end` is deliberately never inherited.
- `koni-docs status` renders a `## ⏰ Deadlines` section above the kanban columns (overdue / due-soon / on-track, most overdue first), plus a deadline line in the Summary. New `--due-soon-days <n>` flag (default 3).
- `koni-docs validate` checks `due` dates: a value that is not a real date is an error (exit 1); a story merely past its date is a warning that does not change the exit code.
- `lib/deadlines.ts` — `getDeadlines`, `findMalformedDue`, `normalizeDue`, `isValidIsoDate`, exported from `@koniverse/koni-docs/lib`.
- Skill docs: frontmatter-spec §1.1 (the Iron Law extended to date-typed fields) + §3.1 `due` row + §5.6/§5.7 anti-patterns; story template §2b Deadline; sprint-system §Deadlines vs sprint cadence.

### Fixed
- `sprintSchema` rejected every real sprint file. YAML parses an unquoted `start: 2026-06-29` into a JS `Date`, which the `^\d{4}-\d{2}-\d{2}$` string regex could never match. Both forms are now accepted.

**Commit**: 1511dd9

## Round 2 — skill-grading (2026-07-13, v0.40.0)

The koni-harness Review stage grades a *skill* deliverable with koni-qc's
four-dimension rubric, one independent agent per dimension, pass bar **≥95/100**.
Round 1 of this story shipped without it. Running it scored **72/100**:

| Dimension | Score /25 | Verdict |
|---|---|---|
| D1 Triggering (blind router, 18 queries) | 22 | The `due` capability had **zero router surface** — the description never said "deadline" or "due". Precision 9/9, recall 8/9; the one miss was the natural phrasing of the deadline intent, which routed to koni-harness. |
| D2 Rule-robustness (pressure scenarios) | 25 | All 7 hard rules held, including the 3 new `due` rules. But it surfaced a contradiction: SKILL.md §7.5 taught the `pending` SHA that RULE-2 calls a BLOCKER. |
| D3 Content (author-blind) | 8 | **FAIL** — 5 Important findings, including a real code bug (below). |
| D4 Best-practices (×2, averaged) | 17.5 | SKILL.md 528 lines over the 500 bar; no TOCs; the cheatsheet taught banned syntax. |

**The finding that justifies the whole exercise**: `normalizeDue` accepted
`due: 2026-07-20 (pending customer confirmation)` — the *literal value*
`frontmatter-spec.md` §5.6 promises `validate` rejects — and rendered it in
STATUS.md as a clean deadline. The `slice(0, 10)` tolerance I added for
round-tripped ISO timestamps swallowed the prose. I wrote the doc, wrote the
guardrail, and wrote a test suite that never crossed the two. An author-blind
reviewer ran the CLI against the doc's own examples and found it in one pass.

Round-2 changes: the `normalizeDue` fix + regression test; RULE-2 rewritten (its
`--amend` recipe was mathematically impossible — LESSONS §17); the frontmatter
cheatsheet regenerated (it taught RULE-17 anti-patterns and never got `due`);
SKILL.md §7 extracted to `references/cli.md` (528 → 365 lines); the description
given deadline triggers + near-miss carve-outs; `validate` given a
`due == sprint.end` warning so the no-inheritance rule has a machine backstop;
`external_deps` demoted to planning-only (it never populated the STATUS flag it
claimed); TOCs on 13 reference files; `Docs/` → `docs/` in rules.md, whose grep
checks had been silently returning empty on a case-sensitive filesystem.

Per LESSONS §13, this round **extends this story** rather than opening US-1.7 —
one story = one deliverable, and the deliverable is not done until it passes the
bar.

## Implementation notes

**YAML destroys impossible dates before koni-docs can see them.** `due: 2026-02-31`
written unquoted is parsed by js-yaml as a timestamp and *silently rolled over*
to `2026-03-03`. No validator downstream can catch that typo — the original text
is gone a layer below the tooling. Only the quoted form (`due: "2026-02-31"`)
survives as a string for `findMalformedDue` to reject. This is documented in the
lib, pinned by a test that asserts the rollover, and written up as LESSONS §16.

The same YAML behaviour exposed a live bug: because unquoted dates become `Date`
objects, `sprintSchema`'s `start` / `end` string regex had been rejecting every
sprint file in the repo. Fixed in the same commit — it is the identical root
cause, and leaving it would have meant shipping `due` onto a known landmine.

`tsc --noEmit` fails on this package with a pre-existing TS2209 ("project root is
ambiguous") unrelated to this work; it reproduces on a clean checkout of HEAD.
Left alone rather than folded into this story's diff.

## Files modified

**Created (packages/koni-docs):**
- `src/lib/deadlines.ts` — deadline model: normalize, classify, find malformed.
- `__tests__/lib/deadlines.test.ts` — boundary, exclusion, sort, and YAML-rollover cases.

**Modified (packages/koni-docs):**
- `src/lib/schemas/story.ts` — `due` field + `STORY_DEFAULTS` entry.
- `src/lib/schemas/sprint.ts` — accept the `Date` form of `start` / `end`.
- `src/lib/index.ts` — export the deadlines surface; lib version 0.9.0.
- `src/cli/status.ts` — Deadlines section, summary line, `--due-soon-days`.
- `src/cli/validate.ts` — `due` errors vs overdue warnings.
- `__tests__/cli/status.test.ts`, `__tests__/cli/validate.test.ts` — new cases.
- `package.json` — 0.8.1 → 0.9.0.

**Modified (skills/koni-docs):**
- `SKILL.md` — §3a `due` guidance, §3c checklist line, §7.4 subcommand rows.
- `references/frontmatter-spec.md` — §1.1 date-typed Iron Law, §3.1 row, §5.6/§5.7.
- `references/sprint-system.md` — §Deadlines vs sprint cadence, checklist line.
- `references/templates/story.md` — `due` frontmatter, §2b Deadline, §1 guidance.

## Cross-references

- [PRD FR-38](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CHANGELOG v0.39.0](../../CHANGELOG.md)
- [CONTEXT D37](../../CONTEXT.md)
- [LESSONS §16](../../LESSONS.md)
- [Design spec](../../superpowers/specs/2026-07-13-koni-docs-story-deadlines-design.md)
