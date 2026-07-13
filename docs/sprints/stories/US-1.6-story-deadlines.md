---
id: US-1.6
title: "Story deadlines — a `due` date beside the sprint cadence"
epic: EPIC-1
status: done
priority: P1
points: 3
sprint: sprint-2026-W29
due:
version_shipped: "0.39.0 + 0.40.0 + 0.41.0 + 0.42.0 + 0.43.0 + 0.44.0 + 0.45.0 + 0.46.0 + 0.47.0 + 0.48.0 + 0.49.0 + 0.50.0"
prd_ref: [FR-38]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: 1511dd9, b9c5dc3, e2fccfb, a346b5f, 6f1ff57, 498b608, 146e342, f73e291, 0d0e98b, e47b6ee, b2d99ec
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

## Round 3 — skill-grading re-grade (2026-07-13, v0.41.0)

Re-graded all four dimensions (the rubric forbids inferring "still ≥95" from a
review of the fix alone). **72.5/100** — D1 22→**24**, D2 25→**25**, D3 8→**5**,
D4 17.5→**18.5**.

D3 went *down*. Not because the skill got worse: a round-1 *minor* ("the story
template's worked example breaks RULE-15") turned out on verification to be
**Critical**. The template told agents to fill `assignee` with
`git log -1 --format=%an <sha>` — and `%an` *is* git `user.name`, the exact value
RULE-15 (BLOCKER) forbids. RULE-15's own rationale names the failure
(`user.name = AnhMTV` vs login `saltict`). It survived a fix round because on this
machine `%an`, `user.name`, and the GitHub login all coincide — a contradiction
invisible to its author, visible immediately to a reviewer who ran it.

The second theme: **the RULE-2 rewrite had landed only where the rule is
defined.** The changelog template — the file an agent opens when asked to write a
changelog entry, without ever loading `rules.md` — still taught the impossible
pre-commit-SHA flow. So did SKILL.md's summary, its checklist, and story §12. A
rule is enforced where it is *read*. Written up as LESSONS §18.

That rewrite also let me find the real scar in this repo: US-4.29 carried
`commit: e37c590`, an object that does not exist in git. Repaired to `a1ffc77`;
the full 44-SHA corpus now passes RULE-2's reachability grep.

Also fixed: a real person's name, email, and machine path shipping inside
`templates/integration.md`; a `--include-warnings` flag `validate` declared and
never read; `findRedundantDue` shipping undocumented; every hardcoded CLI version
(including in the file that says "don't hardcode a version"); the description
trimmed 1024 → 727 bytes (v0.40.0 had pushed it to 4 chars under the hard cap);
SKILL.md 528 → 325 lines; the checklist and subcommand table de-duplicated after
the extraction forked them; TOCs on every 100+-line reference — the first
generator's own TOCs were broken, because it collapsed whitespace where GitHub
does not.

## Round 4 — skill-grading re-grade (2026-07-13, v0.42.0)

**80.25/100** (D1 **25/25** · D2 **25/25** · D3 11/25 · D4 19.25/25). D1 and D2 are
done: the blind router got 18/18 (precision and recall both 1.00), and all nine
hard rules held under adversarial pressure — including the three `due` rules and
the rewritten RULE-2, which one pressured agent called "the one I would have
reached for on autopilot."

The round's own finding is the one worth keeping. I fixed the missing TOCs, wrote
an audit to confirm the anchors resolved, and the audit printed **0 broken**. It
was wrong: both the generator and the audit scraped `## ` lines from *inside*
```markdown fences — template skeletons, which GitHub emits no anchor for. **150
anchors were dead**, certified green by a checker that shared its bug with the
thing it was checking. The same generator also wrote a TOC into SKILL.md's YAML
frontmatter and **destroyed the description** — the skill would no longer have
triggered for anything. Neither defect appeared in my output; an author-blind
grader found both. LESSONS §19.

Three of D3's four Importants were one defect: content moved, pointers not swept
(RULE-2's body rewritten but not its heading; the Scripts table deleted but not
its routers; `--include-warnings` removed from the CLI but still called by
koni-setup). So this round ships `scripts/check-references.py` — every link,
anchor, and `§Section` pointer must resolve. It is green on koni-docs,
koni-harness, koni-setup, and koni-nextjs; koni-qc has 4 dangling references,
reported rather than silently fixed.

## Round 5 — skill-grading re-grade (2026-07-13, v0.43.0)

**79/100** (D1 22 · D2 23 · D3 14 · D4 20). D1 and D2 both **fell** from 25 — the
clearest possible demonstration of why the rubric forbids inferring "still ≥95"
from a review of the fix alone.

The checker I shipped as *the* durable fix for dangling references **reported a
false green**. It saw `` `file.md` §Section `` but not `` [`file.md`](file.md) §Section ``
— nine uses, one genuinely dead, on a BLOCKER rule's See line. It also only matched
`.md` targets, ignored H1, and changed its verdict with the working directory. I had
verified it the same way I verified everything else that failed this week: by
running it on a clean corpus and reading `0`. A checker that always prints 0 also
prints 0. It is now proven against **planted** defects (LESSONS §20).

The other lesson is about my own rules. The three `due` obligations held GREEN under
every pressure scenario, and a grader still marked one RED — because they were not
*numbered* rules. They lived in prose; `grep RULE-` found nothing; and the commit-time
surface phrased the CONTEXT-entry obligation as "no story overdue-and-silent",
conditioned on the story being **already late** — so an agent proactively pushing a
date read past it. Correct, well-argued, and unfindable. They are now RULE-18.

## Round 6 — skill-grading re-grade (2026-07-13, v0.44.0)

D4 rose to **21.25** (20.5 + 22 — the highest yet; one grader: *"the skill is now, by
Anthropic's standards, in good shape"*). RULE-18.3 held GREEN: an agent pressured to
push a `due` before a flight refused to edit the date silently and wrote the CONTEXT
entry.

Two findings, and they are the same finding. **The skill taught a CLAUDE.md key that
does not exist** — `koni-docs-plugins:`, in four places in the always-loaded file
(the real key is `plugins:` under `koni-docs:`). And **the frontmatter cheatsheet, 107
of templates.md's 169 lines, was a second contract that had drifted into teaching two
things RULE-17 forbids** — the copy billed as the shortcut for agents in a hurry was
the copy nobody audited. Both are LESSONS §21: duplication does not fail by going
missing, it fails by going subtly wrong in the copy people actually reach for; and a
name repeated confidently in prose is not a verified name.

## Round 7 — skill-grading re-grade (2026-07-13, v0.45.0)

**D1 25/25 · D2 25/25.** The blind router routed 18/18 (precision and recall both 1.00),
and every rule family held under multi-pressure adversarial scenarios — including all
three RULE-18 obligations, which had been the RED two rounds earlier.

D3 15/25, and both its Criticals were the same thing: **the checker's fourth consecutive
false green.** Four rounds running, I widened it, ran it on a clean corpus, read `0`, and
reported it fixed — and four rounds running, an author-blind reviewer planted a syntax I
had not imagined. It also carried a silent trapdoor: an indented closing fence disabled
every check for the rest of the file, with no warning.

The reviewer named the pattern rather than the bug: *"the guard is validated only against
defects its author imagined."* So the guard now ships its own planted-defect suite — 15
classes, one fixture each, plus a clean control. I wrote the tests first; they failed 10
of 15 against the then-current checker. The gate now runs that suite **before** trusting
the checker's verdict: sabotage the checker and the gate refuses its green (verified by
sabotaging it). LESSONS §22.

Also closed: koni-qc had been red for four rounds because the gate swept only *touched*
skills; RULE-16 was a BLOCKER with no blocker (`v0.7.0` would have shipped); and EPIC-3 —
the unbuilt plugin epic, which will be implemented from its own text — still taught the
`koni-docs-plugins` key that does not exist.

All six skills in the repo now report 0 dangling references.

## Round 8 — skill-grading re-grade (2026-07-13, v0.46.0)

**D4 22/25** — the highest of the eight rounds: *"the skill is now genuinely good by
Anthropic's standards … above what most skills ship"*.

The finding is one I have now made three times: **the rule count was corrected in two
files and missed in the third.** That is LESSONS §18 — a fix lands where you look, not
where the fact lives — and the answer is not to be more careful, it is to sweep. Also:
my own find/replace left ungrammatical wreckage behind, including a sentence claiming
to complement itself. A regex sweep changes text, not meaning; the meaning has to be
re-read. And I *rewrote* the tombstones the graders asked me to *delete* — a pointer
needs no autopsy.

The gate caught the one dead anchor this round introduced, before it shipped.

## Round 9 — skill-grading re-grade (2026-07-13, v0.47.0)

**D4 22/25 from both graders** — the highest of nine rounds. **D3 14/25**, and its
Critical is the one worth keeping.

**My test suite was a fifteenth way to print `0`, and a reviewer proved it.** All three
§-pointer syntaxes asserted on the same substring, so any one surviving satisfied all
three. It regressed `SECTION_POINTER` to backticks-only — blinding the checker to two of
three forms, in the exact class the checker exists for — and **my suite passed**. LESSONS
§22's fix did not close the hole. It formalized it.

So this round ships `test-mutations.py`: break the checker on purpose, one rule at a
time, and assert the suite *notices*. Six mutants, all killed. The gate runs it — a
surviving mutant blocks the commit, because a suite that a broken checker can pass is not
a suite. That is LESSONS §23, and it is the through-line of this whole story: §19 don't
trust a validator you wrote → §20 prove it can speak → §22 ship its planted defects →
§23 and then prove the planted defects can still speak. Every layer of verification is
itself an unverified claim until something adversarial pushes on it.

Also fixed: the **fifth false green, self-inflicted** — exempting capitalized stems to
silence a `Next.js` false positive blinded the checker to `SKILL.md`, and therefore to
`[SKILL.md §5](../SKILL.md)`, the pointer that had just replaced a deleted mirror. And
RULE-16's brand-new blocker was enforced on **1 of 57 stories**, because I nested it
inside an unrelated rule's date gate — it would not have caught the very `vv0.7.0` bug
its own comment cites.

## Round 10 — skill-grading re-grade (2026-07-13, v0.48.0)

**D1 25/25 · D2 25/25 · D3 18/25 (from 14) · D4 20.5/25.**

D4 slipped 1.5, and it deserved to: **the round's headline addition shipped a defect of
exactly the class this whole skill exists to prevent.** `test-mutations.py` wrote its
mutants into the live, git-tracked checker and restored them in a `finally` — inside a
blocking pre-commit hook. One Ctrl-C and the tree keeps a blinded checker that still
prints `0`. `import tempfile` was at the top of the file, unused: I had thought of the
safe design and dropped it.

And the mutation suite itself: it proved six mutants die, then printed "all mutants
killed" — which reads as *narrowings die*. A reviewer planted eight; **five survived**,
including one that deleted the `#fragment` fix I had shipped the round before. **A
mutation test measures the corpus, not the code.** A surviving mutant is a named hole in
the test data, and my green was memory dressed as coverage.

Now: 27 defect classes, 11 mutants, floors on both so an emptied suite cannot read as a
passing one, and a sandbox so the guard can never corrupt what it guards. LESSONS §24.

## Round 11 — closing the D3/D4 gap (2026-07-13, v0.49.0)

Targeted at the two things still costing points, neither of which is the skill's content.

**D4 — bloat.** `bmad-template-analysis.md` carried 85 lines of *recommendations* whose
work had all shipped months earlier, in section numbers a later migration retired, citing
a directory that does not exist. A plan filed in the reference directory does not become
a reference; it becomes a fossil that gives instructions (LESSONS §25). Converted to its
outcome. RULE-18's rationale, restated in full in two files, now lives once in `rules.md`.

**D3 — the last checker holes.** Explicit HTML anchors (`<a name>`, `id=`) emit real
anchors and were not collected, so a live link read as dead. The repo root was found by
counting directory levels rather than locating `.git`.

27 defect classes, 12 mutants, all killed; six skills clean.

## Round 12 — behavioural evals (2026-07-13, v0.50.0)

**D1 25/25 · D2 25/25 · D4 22/25** (a new high). D2 also answered the question I was most
worried about: single-sourcing RULE-18's rationale into `rules.md` did **not** create a
LESSONS §18 gap. Three agents pointed at `sprint-system.md` refused the CEO's instruction
*before* opening `rules.md` — because I removed the *rationale*, not the *obligation*.
Obligation where the reader stands, rationale owned in one place, a pointer between them.

The finding that mattered came from both D4 graders at once: **655 lines test the linter;
zero lines test what the skill causes.** Three tiers of rigor around a tool the skill
happens to ship, and nothing at all around the thing it exists to produce — behaviour in
another agent. So this round adds `evals/`: five scenarios, each with the pressure that
makes its rule hard, each scored on observable facts about the artifact rather than
impressions. LESSONS §26: verify the output, not the apparatus.

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
