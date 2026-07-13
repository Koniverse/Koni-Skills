# LESSONS.md — Koni-Skills

> Pattern + trap log. An entry earns its keep if it saves the next
> contributor 30 minutes. Delete entries that go stale (library
> upgraded, behavior changed) — stale advice is worse than no advice.
> Number sequentially; never reuse a number even after deletion.

---

## 1. Sync-script story-row matcher must use word boundaries, not prefix matching

**What happened (sync-test.mjs run, pre-v0.1.0)**: `agile-sync-up.mjs`
updated the wrong epic row when the sprint contained both `US-1.1` and
`US-1.11`. The regex matched `US-1.1` as a prefix of `US-1.11`, so any
status change to either story silently corrupted the other epic row.

**Why**: Naive regex `^|\s|US-1\\.1\s|$` matches `US-1.11` because the
`\\s` after `US-1.1` is not enforced (the `|$` branch ate the boundary).
Word-boundary semantics in JS regex with dotted IDs require explicit
lookahead, not `\\b` (which treats `.` as a word boundary).

**How to avoid**:
- For dotted-ID matching in JS regex, use a positive lookahead for the
  boundary char set explicitly: `(?=\\s|$|[|\\]])`.
- Every sync script that matches story IDs in tables MUST add a
  regression test that pairs `US-N.M` with `US-N.M+10` or `US-N.MN` in
  the same fixture.
- Run `node skills/koni-docs/scripts/__tests__/sync-test.mjs` before
  changing any sync script.

**Pattern**: see `skills/koni-docs/scripts/agile-sync-up.mjs` — the
`epicStoryRowMatcher` function was refined in commit `29898ca` precisely
because of this trap.

---

## 2. Story files MUST have an `id:` frontmatter — scripts now skip + warn instead of crashing

**What happened (pre-v0.1.0)**: A draft story file landed without
`id:` in frontmatter (the author was iterating on the title and
filename). `agile-sync-up.mjs` crashed with an unhelpful
`TypeError: Cannot read properties of undefined (reading 'replace')`,
masking the actual issue.

**Why**: Sync scripts assumed every `docs/sprints/stories/*.md` had a
parseable `id:` field. A missing field surfaced deep in a downstream
matcher rather than at parse time.

**How to avoid**:
- Sync scripts now skip files without `id:` and emit a warning naming
  the offending path (commit `44f9c01`).
- When authoring a new story, populate the full frontmatter from the
  template *before* the first sync-script run — even if values are
  placeholders.
- RULE-6 still requires `id` to match the filename, so the warning is a
  signal to either complete the story or delete the half-baked file.

**Pattern**: see the `parseStoryFile` function in
`skills/koni-docs/scripts/agile-sync-up.mjs` — it returns `null` on
missing `id` and the caller filters before iterating.

---

## 3. `npx skills experimental_install` must run on every fresh clone — or installed helpers are missing

**What happened (this repo's own onboarding)**: A new contributor cloned
Koni-Skills, ran `npx skills list`, and saw only `koni-docs` (the
locally-developed skill). `skill-creator`, which is declared in
`skills-lock.json` but installed under `.agents/skills/`, was missing.
The contributor spent ~15 minutes wondering why `skill-creator` was
"broken" before realizing it was never installed locally.

**Why**: `.agents/skills/` is gitignored (it should be — it's a managed
install destination). The lockfile declares what *should* be installed,
but `git clone` doesn't run install hooks.

**How to avoid**:
- Always run `npx skills experimental_install` immediately after
  `git clone` on this repo.
- The `docs/SETUP.md` initial-setup block documents this prominently.
- If you see `npx skills list` returning fewer skills than
  `skills-lock.json` declares, that is the signal to run
  `experimental_install`.

**Pattern**: `docs/SETUP.md` §"Initial setup" — the install line is the
second command, right after `cd Koni-Skills`.

---

## 4. Story `version_shipped` frontmatter is bare semver, NOT prefixed with `v`

**What happened (Koni-Skills v0.2.0 dogfooding)**: Authored
`docs/sprints/stories/US-1.1-koni-docs-initial-release.md` with
`version_shipped: v0.1.0` (following the misleading template example
in `references/templates/story.md` which shows `# set when status → done
(e.g. v0.3.1)`). Ran `agile-sync-up.mjs --docs-path docs/`. The Epic
Stories table propagated to `vv0.1.0` — script prepends `v`, frontmatter
already had `v`, result is doubled.

**Why**: `agile-sync-up.mjs` line 155 does
`` `v${version}` `` unconditionally on a bare semver value
(`version_shipped: 0.1.0`). The story template's example
(`# set when status → done (e.g. v0.3.1)`) is misleading — the actual
convention is bare, NOT `v`-prefixed. The script's behavior is the
canonical contract; the template comment is the bug.

**How to avoid**:
- Always write `version_shipped: <bare-semver>` in story frontmatter,
  e.g. `version_shipped: 0.1.0`. Never `v0.1.0`.
- Output columns (Epic Stories, PRD Epics & User Stories, PRD Functional Requirements row, Sprint scope) get
  the `v` prefix added by the script.
- If you see a `vvX.Y.Z` in a synced doc, the cause is double-`v` in
  frontmatter — strip the `v` and re-run sync.
- TODO: file a story under EPIC-1 to fix the misleading template
  example in `skills/koni-docs/references/templates/story.md`.

**Pattern**: see [US-1.1](sprints/stories/US-1.1-koni-docs-initial-release.md)
frontmatter — bare `0.1.0` is the canonical shape.

> **Update (v0.3.0)**: formalized as **[RULE-16](../skills/koni-docs/references/rules.md)**
> (BLOCKER, catalog 10 → 11). The story template comment that originally
> read `(e.g. v0.3.1)` now reads `MANDATORY (RULE-16); bare semver e.g.
> 0.3.1, NEVER v0.3.1`. Grep check
> `grep -lE '^version_shipped: v' docs/sprints/stories/*.md` must return
> zero files. Shipped via [US-1.5](sprints/stories/US-1.5-real-world-template-script-audit.md) (AC-10).

---

## 5. Sync scripts MUST escape every dynamic input before regex construction

**What happened (v0.2.0 → v0.3.0, surfaced 2026-05-27 during US-1.5 real-world retro)**:
Ran `node skills/koni-docs/scripts/agile-sync-up.mjs --dry-run` against
**Koni-Finance-Final** (198 stories, 9 epics). Script processed ~30
stories cleanly, then crashed at `US-1.34` with:

```
SyntaxError: Invalid regular expression:
  /(\| AD-24 (Docker Compose dev infra) + AD-26 (...); no dedicated FR
    — dev-experience substrate, sibling of [[US-1\.1]] (dev compose) ...
    \. \*\*Inherits the deploy-artifact contract from [[US-1\.34]]\*\* ...
    \| [^|]+ \| [^|]+ \| )[^|]+( \|)/g
  Range out of order in character class
at agile-sync-up.mjs:254 updatePRDFRRow
```

Mid-run crash — partial state for some files. Sync silently fell over.
The senti_quant repo (266 stories, cleaner data) was unaffected — no
story title carried the trigger characters.

**Why**: `updatePRDFRRow` at line 254 built a regex by string-interpolating
the story's `prd_ref:` value into `new RegExp(...)` **without escape**.
`prd_ref:` was supposed to be `FR-N` tokens; this story used it as a
free-form descriptive field containing `[`, `]`, `(`, `)`, `.`, `*`,
`+`, and other regex metacharacters. A single unescaped `[` makes the
regex literal invalid at construction time, and the script aborts.

**How to avoid**:

- **Iron rule**: ANY script that builds a `new RegExp(...)` from data
  pulled out of frontmatter, story body, or any user-authored content
  MUST treat that content as untrusted. Apply `escapeRegExp(str)`
  before interpolation.

  ```js
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  ```

- **Defense in depth**: where the script expects a structured value
  (`prd_ref:` → comma-separated `FR-N` tokens), extract the tokens with
  a strict matcher (`/\bFR-[0-9]+(?:\.[0-9]+)?\b/g`) BEFORE interpolating.
  Free-form prose in the field still won't crash — it'll just produce
  zero matches and short-circuit.

- **Test fixture**: any sync-script change must add a fixture in
  `scripts/__tests__/sync-test.mjs` exercising a story with regex-special
  characters in title AND in `prd_ref`. See `Test 7` in that file for the
  current shape.

**Codified as**:
- [RULE / AD-10](../docs/PRD.md#6-background--strategic-decisions) — sync scripts MUST escape all dynamic input before regex construction
- Story [US-1.5](sprints/stories/US-1.5-real-world-template-script-audit.md) AC-1, AC-2, AC-3
- Fix in [`skills/koni-docs/scripts/agile-sync-up.mjs`](../skills/koni-docs/scripts/agile-sync-up.mjs) — `escapeRegExp` helper applied to every dynamic input

**Cross-references**:
- See [CONTEXT D11](CONTEXT.md) — to be appended when the v0.3.0 ship lands and the team agrees on the regex-escape contract for future scripts.
- See [LESSONS §1](#1-sync-script-story-row-matcher-must-use-word-boundaries-not-prefix-matching) for the W19 trap that motivated the regression-test discipline. §5 is the second sync-script bug caught by exercising real-world data; both share the lesson "small in-repo fixtures don't cover real-world edges".

---

## 6. A scaffold skill's copy-paste command MUST match its own tree diagram — verify with a sandboxed dry run

**What happened (v0.9.0, surfaced 2026-06-26 while building `koni-setup`)**:
The first draft of `koni-setup` shipped a `create-tree` bash command next to a
directory-tree diagram in the same reference file. A sandboxed sanity test —
two independent subagents, one running the bootstrap path and one the onboard
path against throwaway dirs — independently flagged that the command **did not
create several files the tree promised**: `docs/README.md`,
`docs/sprints/README.md`, the first `sprint-YYYY-WNN.md`, and
`docs/tests/test-cases/README.md`. A literal executor would have produced a
visibly incomplete scaffold while believing it had followed the skill.

The same dry run surfaced a cluster of sibling defects, all of the same family
("the instructions look right but break when executed verbatim"):

- **CHANGELOG double-handling** — a generic stub loop wrote `docs/CHANGELOG.md`,
  then a separate seed block tried to write it again; the `[Unreleased]` anchor
  the seed intended never landed if the loop ran first.
- **Empty leaf dirs vanish on commit** — `epics/`, `stories/`, `archive/`,
  `design/`, the test-report dirs were created empty with no `.gitkeep`; git
  drops them, breaking the "structure validates" promise.
- **Onboard append-vs-overwrite dead-end** — "never overwrite CLAUDE.md"
  contradicted "CLAUDE.md must carry the integration block" for the most common
  onboard case (existing CLAUDE.md, no block). The skill never said appending is
  allowed.
- **Missing `git init`** — bootstrap referenced `.gitignore` / commits but never
  initialised the repo.
- **Profile/command mismatch** — the stub loop created `PRD.md` + `ARCHITECTURE.md`
  unconditionally while the prose said "skip them for content repos."
- **Doubly-specified version pin** — `^0.8.1` hardcoded in one place, "pin to
  `Koni-Skills/VERSION`" in another; the two drift apart silently.

**Why**: a skill that bundles an executable command alongside a human-readable
diagram has *two sources of truth that can disagree*. Prose is forgiving — a
human fills gaps; a literal command is not — it does exactly what it says. When
the two are authored separately and never run end-to-end, the command quietly
diverges from the diagram it's supposed to realise.

**How to avoid**:

- **Dry-run every scaffold/codegen skill in a sandbox before shipping it.**
  Spawn an independent agent (one with no authoring context) to follow the skill
  verbatim against a throwaway dir, and diff what it produced against what the
  skill *claims* it produces. Authoring context hides gaps; a cold executor
  exposes them. Two agents on the two main paths (here: bootstrap + onboard)
  caught everything.
- **One source of truth per artifact.** If a command and a diagram both describe
  the tree, make the command generate the tree the diagram shows (or generate
  the diagram from the command). Don't maintain them in parallel by hand.
- **Make the unhappy path explicit.** "Don't overwrite" needs its complement
  spelled out — *appending a missing section is allowed*; only destroying
  content is forbidden. Silence on the boundary is where executors stall.
- **Scaffolds must account for git's quirks**: `.gitkeep` for intentional empty
  dirs, `git init` for genuinely-new repos.

**Codified as**:
- Story [US-3.2](sprints/stories/US-3.2-koni-setup-bootstrapper.md) TASK-3.2.4
- [CONTEXT D12](CONTEXT.md) — the koni-setup ↔ koni-docs boundary this skill operates within
- Fixes applied across `skills/koni-setup/references/{scaffold-checklist,onboarding-audit,skill-wiring}.md` + `SKILL.md`

**Cross-references**:
- Mirrors the §1 / §5 lesson ("small in-repo fixtures don't cover real-world
  edges") one level up: here the gap is between a skill's *instructions* and its
  *execution*, caught the same way — by running it against data/throwaway dirs
  the author didn't hand-curate.

---

## 7. A story is a deliverable, not a release — don't open one story per version

**What happened (v0.10.0 → v0.15.1, surfaced 2026-06-28 on review)**:
The `koni-harness` skill was built in five phases (gate → loop-runner →
context-loader → sprint-sequencer → session-adapters), and each phase was tracked
as its **own** story — US-3.3, US-3.4, US-3.5, US-3.6, US-3.7 — because each
shipped its own version (v0.10.0 … v0.14.0). EPIC-3 ended up with **seven**
stories for **three** real deliverables (koni-setup, koni-harness, the plugin
pattern). On review the user flagged the sprawl: the story count tracked
*releases*, not *work*. The five were consolidated into one US-3.3 (16 pts, a
version→commit table + AC grouped by phase); the four extra files were deleted.

**Why it happens**: the subagent-driven loop ships a version per phase, and the
natural reflex is "new version → new story." But a version is an *increment*; a
story is a *unit of work / a deliverable*. One skill shipped five times is one
story shipped five times, not five stories. Per-phase stories also scatter the AC
across files and make the epic unreadable.

**How to avoid**:

- **Open ONE story per deliverable, up front.** When a skill/feature will be
  built in phases, create a single story and *append* a per-phase AC sub-section
  + a `version → commit` table row at each ship. Don't spawn a story per phase.
  (Codified as [CONTEXT D14](CONTEXT.md).)
- **Split only on genuine independence.** Separate stories are right when the
  pieces are distinct deliverables (koni-setup vs koni-harness vs the plugin
  pattern), not when they're sequential phases of one thing.
- **Let versions/CHANGELOG carry the increment history.** The append-only
  CHANGELOG already records each `vX.Y.Z`; the live story tracker should not
  duplicate that granularity.
- **This is the right-sizing principle applied to docs** — the same "scale the
  artifact to the work" rule the koni-harness Standard preaches for the loop
  itself. Ceremony (stories, reviews, specs) should track real units of work,
  not multiply with releases.

**How to fix it after the fact (consolidation is append-only-safe)**:
merge the phase-stories into the lowest-id one (version→commit table + phased
AC), delete the rest, collapse the EPIC / PRD-index / sprint rows to one, and
**leave CHANGELOG + spec/plan history untouched** (they are the point-in-time
record). Re-run `koni-docs sync` + `validate` to confirm no dangling refs.

**Codified as**:
- [CONTEXT D14](CONTEXT.md) — phase-built work is one story with phase sub-sections
- Consolidated story [US-3.3](sprints/stories/US-3.3-koni-harness-agentic-loop.md) (the worked example)

**Cross-references**:
- Complements [§6](#6-a-scaffold-skills-copy-paste-command-must-match-its-own-tree-diagram--verify-with-a-sandboxed-dry-run): both are about *right-sizing* — §6 keeps a skill's instructions honest, §7 keeps the story tracker honest. Sibling skills `koni-setup` and the koni-harness "Right-sizing the loop" tiers encode the same scale-to-the-work instinct.

---

## 8. Grading a skill is iterative: author-blind review + variance-averaged rubric, and expect your own fix to introduce the next finding

**What happened (v0.17.2, 2026-06-30)**: grading koni-harness + koni-qc to a "≥95/100"
bar took **three** find→fix→re-verify rounds, not one. Each round's fixes *created*
the next round's findings: the worked example added to lift the discoverability score
showed a gate output the shipped `gates.conf` couldn't produce; the Author-mode
carve-out added to make the pilot's self-grade honest introduced a Band-A item
name-collision ("Coverage matrix" vs "Coverage % reported"). A single rubric pass
also disagreed with itself across runs (koni-qc scored 24 then 21.5 on the *same*
files) — grader variance, not a real regression.

**Why it matters**: a one-shot "review it and fix" understates the work and can ship a
fix that quietly breaks something adjacent. Skill quality converges; it isn't a single
gate.

**How to do it**: grade across **independent dimensions** (triggering / rule-robustness /
content / best-practices), each by a *separate* agent — triggering via a blind router
(route realistic should/should-not queries by description alone, measure precision+recall),
rule-robustness via writing-skills pressure-tests (does the rule hold under deadline
pressure?), content via an **author-blind** code-reviewer, best-practices via the Anthropic
rubric. **Re-verify after every fix round** (the fix is new code → new test), and **run the
subjective rubric ≥2× and average** to cancel grader variance. Stop when a full round yields
only Suggestions, not Important/Critical findings, **and the total is ≥95 — the catalog bar**.

**Re-grade the *whole* skill, not just the diff.** (Added 2026-06-30, v0.21.1.) A
skill that already passed at ≥95 can silently slip below it after later edits, because
a change drifts a *different* dimension than the one you touched: koni-qc fell 97 → ~91
when three later features (skill-grading, test-organization, by-US) left a rule
("boundary-or-edge") un-propagated to two files and opened a triggering gap — yet each
change's *own* review had passed. **The fix is not to trust a passing review of the
change; re-run all four dimensions on the whole skill and confirm it still clears 95.**
The ≥95 bar + this whole-skill re-grade rule are now the standard ([CONTEXT D19](CONTEXT.md)),
enforced by the koni-harness Review stage.

**Codified as**:
- [CONTEXT D15](CONTEXT.md) — the tool-split the grading hardened
- [CONTEXT D19](CONTEXT.md) — ≥95 catalog bar + re-grade-the-whole-skill rule
- CHANGELOG [0.17.2] / [0.21.1] — per-dimension scores; the 97→91→97 regression-and-recovery

**Cross-references**:
- This *is* the koni-harness Review stage ([D15](CONTEXT.md)) dogfooded on the skills themselves: spec-compliance → koni-qc → `/design-review` → code-quality, with the author-blind reviewer being the same two-stage review the loop prescribes.

---

## 9. A scaffold's `for f in $unquoted_var` silently breaks under zsh — iterate literal lists

**What happened (v0.20.1, 2026-06-30, found by grading koni-setup)**: koni-setup's
bootstrap created the root doc stubs with
`docs_root="README SETUP …"; for f in $docs_root; do …`. POSIX sh and bash
word-split an unquoted `$docs_root` into separate words; **zsh does not**
(`SH_WORD_SPLIT` is off by default). On the default macOS shell the loop ran
**once** with `f` = the whole string and wrote a single file literally named
`README SETUP BRIEF CONTEXT LESSONS PRD ARCHITECTURE.md` — **zero** real stubs. The
block's header even said "run with bash" but never warned about zsh, the likeliest
Mac default. An author-blind reviewer running it via its shell tool hit it immediately.

**Why it matters**: shell snippets in a skill are *executed*, not just read. A
portability gap that an LLM reviewer reproduces is a correctness defect, not a
style nit — and it was invisible to every prior review that didn't actually run the
block under the user's shell.

**How to fix / avoid**:
- **Iterate a literal word list** — `for f in README SETUP BRIEF …; do …` — which the
  parser splits in *every* shell. Never `for x in $var` for a list you control.
- If you must loop a variable, either force the interpreter (`bash <<'EOF' … EOF`),
  or `setopt sh_word_split` (zsh), or split on a real array.
- Same family of bug: a **bare glob** (`ls foo-*`) **errors under zsh on no-match**
  (`no matches found`) — use `find … -name 'foo-*'` for counts/audits.
- **Test shell snippets under the actual default shell** (zsh on macOS), not only bash.

**Codified as**:
- CHANGELOG [0.20.1]; the fixed loop in `koni-setup/references/scaffold-checklist.md`.

**Cross-references**:
- Found via [§8](#8-grading-a-skill-is-iterative-author-blind-review--variance-averaged-rubric-and-expect-your-own-fix-to-introduce-the-next-finding)'s author-blind dimension — concrete proof that the grading method catches real execution bugs, not just prose.

## 10. A machine-parse contract written in prose breeds silent data loss — freeze it as an exact regex + a shipped self-test

**What happened**: koni-qc's reporter contract (v0.24.0) specified the TC-token parse
rule as prose — *"the leading `TC-<EPIC>.<TYPE>-<n>` token"*. A field implementation
(Koni-ERP-02) reasonably wrote the TYPE slot as `[A-Z]+` — which silently drops every
digit-bearing type: all `E2E` and `A11Y` cases vanished from the counts (9 lost before
anyone noticed — ERP LESSONS §227). A second prose gap: nothing said to skip the
`| TC-ID |` table-header row when scanning specs, so headers were counted as cases
(total inflated by 30). Both bugs produced *plausible* numbers — the worst kind.

**The lesson**: when a contract will be parsed by code, prose is not a contract.
Specify the **exact regex** (`TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+`), state the negative
rules ("a row counts only if its first cell matches"), and **ship a self-test fixture
with the contract** so a regressed implementation fails a test instead of shipping
wrong counts. Applied in v0.33.0: the parse contract is frozen in
`test-automation.md` §2 and enforced by `skills/koni-qc/scripts/qc-report.mjs` + its
25-assertion self-test. Corollary (same release): a "no vendored reference
implementation" stance (D21) loses to field evidence when every re-implementation
re-introduces the same bugs — ship the reference impl WITH the frozen test.

**Grep check**: any reference describing a machine-parsed format should contain a
fenced regex or a fixture path — `grep -L 'regex\|fixture\|self-test' <new-ref>` on a
parsing contract is a smell.

## 11. The standard follows the field — absorb an adopter's reorg, don't outlaw it

**What happened**: koni-qc shipped a layout contract (epic-first reports, single-file
epic specs, a strict four-form Covered-by set) — and within a day the flagship adopter
(ERP-02, under real load at 452 TCs / 794 tests) reorganized: per-US spec files,
date-first reports with latest-state rollups, an `env-pending` lane status, and a
free-text design-review marker. Our validator would have called the *better* layout
non-conformant.

**The lesson**: a standard's job is to encode the best-known field practice, not to
freeze the first authored guess. When the adopting repo outgrows the contract under
real load: (1) absorb the reorg back into the skill **promptly** (same-week, before
cross-references rot), (2) keep the superseded shape **legacy-accepted** in every
validator/scanner so no adopted repo is stranded, (3) extend closed sets (the form
list) rather than letting the field invent free text — a closed set only survives if
it absorbs what the field genuinely needs. Corollary of §10: the contract is code, so
absorbing a reorg means updating the regex/validator + self-test in the same commit
as the prose.

## 12. The doc layer is only trustworthy if every field is true at write time — honesty beats completeness theater

**What happened**: a 3-day audit found the per-version records (CHANGELOG / CONTEXT /
FR / commit SHA) complete and correct, but the sprint layer quietly false: 12 stories
executed after sprint-2026-W26's end date (06-28) had been appended to the closed
sprint's table — its totals rewritten to "15 stories / 66 points" while its own goal
text still said "3 stories / 24 pts" — and 8 stories were created without the
mandatory `points:` field. Each individual edit looked like diligent bookkeeping;
the aggregate was a false record (CONTEXT D32).

**The lesson**: filling a template is not documenting — **a field you fill wrong is
worse than a field left visibly empty**, because it reads as verified. Concretely:

1. **Check the container before filing into it.** "Add the story to the active
   sprint" requires checking the sprint's *dates*, not its `active` label — a sprint
   past its end date is closed; open the next file, even mid-flow, even for one story.
2. **Fill every mandatory field at creation** (`points:`, `sprint:`, `commit:` as
   `pending` → backfilled same-day). A missing field discovered by a *reader* is an
   honesty bug, not a chore.
3. **Correct forward, never rewrite history**: fixes leave a visible correction note
   (the W26 note, D32); dated editHistory/CHANGELOG entries stay as written.
4. **Audit on cadence**: the same change-sweep discipline koni-qc mandates for test
   coverage (regression-learning.md) applies to the doc layer itself — periodically
   diff what the records *claim* against what git *shows*.

## 13. Story count is not progress — one story = one deliverable; rounds extend the anchor

**What happened**: in one two-day drive the same theme (absorb ERP-02 field evidence
into koni-qc) produced three separate stories (US-5.8, US-5.9, US-5.10), and a
standardization round of an existing standard got its own US-5.6. The user called it:
"đỡ vụn vặt" — the board was fragmenting. The D32 audit had already shown the cost:
the sprawled stories were exactly the ones with missing fields.

**The lesson**: a user story is a *deliverable*, not a work-session or a version
bump. Before creating a US, ask what NEW capability it names — if the honest Goal
sentence repeats an existing story's Goal with a newer version, it is a **round of
that story**: add a `## Round N` section, sum the points, append the version/commit.
Refinements of an existing FR need no story at all (D14). When sprawl already exists,
consolidate and **retire the IDs forever** with visible "was US-X.Y" notes — immutable
history (commit messages, old CHANGELOG entries) keeps citing the old IDs, so the
retirement note is what keeps those citations resolvable. Full rule: CONTEXT D33 +
koni-harness `agentic-loop-standard.md` §Story granularity.

## 14. A lessons file is only memory if reading is evidenced and writing is a verdict

**What happened**: the loop nominally "skimmed LESSONS on the way in" and "captured
lessons if a trap surfaced" — yet the D32 audit and story-lint's first real run (D34)
caught the *same field-hygiene class* recurring months apart. Nothing forced the loop
to actually look, and nothing distinguished "no lesson this time" from "forgot to
write".

**The lesson**: for any cross-session memory file (LESSONS, CONTEXT, a change
ledger), the two failure modes are **skimming** and **silence** — and both are fixed
by making the invisible step produce an artifact: reading produces a **citation**
(`Lessons applied: §N — <how>` / `none — <why>`), writing produces a **verdict**
(the entry, or `Lessons: none new — <reason>`). Gate the artifact, never the
judgment — a check can verify "the verdict was recorded", only a human can decide
"a lesson was learned", and forcing entries breeds filler. Corollary: date-gate any
new evidence rule at its adoption date (the D33 pattern) so history doesn't
retro-fail.

## 15. A contract discovered at review is rework — feed it in at entry with a citation; review only confirms

**What happened**: UI work kept cycling build → `/design-review` fails on a rule
`DESIGN.md` had stated all along → redo. The contract existed; nothing forced it to
be an *input*. The same shape as §14 (skimmed lessons), one stage later and paid in
rework instead of regressions.

**The lesson**: for every standing contract a stage must obey (DESIGN.md for UI,
LESSONS for traps, ARCHITECTURE for boundaries), the cheap fix is always the same
three-step: **read it in full at stage entry → cite what applies (an artifact:
`Design applied:` / `Lessons applied:`) → let the reviewer confirm instead of
discover**. Enumerate decisions the contract governs (the component × state matrix)
*before* producing, because a decision made mid-production defaults to off-contract.
Corollary for the write side: a doc is finished when the next reader can act
without opening the diff — docs written "to pass" are D32's class with a green
checkmark (the doc-completeness bar, D36).

---

## 16. YAML eats a bad date before your validator ever sees it — and the same rule was silently rejecting every real file

**What happened**: while adding the `due` field (US-1.6), two things surfaced from
one root cause. First, a test asserting that `due: 2026-02-31` is rejected as an
impossible date *failed*: js-yaml parses an unquoted date as a timestamp and
**silently rolls it over** to `2026-03-03`. The typo is destroyed a layer beneath
the tooling — no downstream validator can ever catch it, because by the time
koni-docs reads the frontmatter the original text is gone. Only the quoted form
(`due: "2026-02-31"`) survives as a string.

Second, and worse: the same coercion means an unquoted `start: 2026-06-29` arrives
as a JS `Date`, not a string — so `sprintSchema`'s `^\d{4}-\d{2}-\d{2}$` **string**
regex had been rejecting **every sprint file in the repo**. The schema had been
wrong for months and nobody noticed, because nothing failed loudly: the validator
simply never matched, and the corpus round-tripped `2026-06-29` into
`2026-06-29T00:00:00.000Z` in the files themselves — the evidence was sitting in
git, visible, unread.

**The lesson**: a schema does not validate the file, it validates **whatever the
parser handed you** — and a parser is free to coerce, roll over, and reinvent your
value before you get it. Two habits follow. (1) When adding a typed field, write a
test that round-trips through the *real* loader with the *exact* syntax an author
will type — not a hand-built object. The unit test that constructs
`{due: '2026-02-31'}` passes and proves nothing. (2) When a schema rule never
fires, that is not evidence it is satisfied; it is evidence worth checking. A
validator that has silently matched nothing for months looks identical to one that
has found no problems.

**Corollary**: when the parser can destroy information (an impossible date rolled
over), no amount of downstream rigor recovers it. Say so in the docs and pin the
behaviour with a test that asserts the rollover, rather than shipping a validator
that quietly promises a guarantee it cannot keep.

---

## 17. A commit cannot contain its own SHA — `--amend` is not the fix, it's the bug

**What happened**: RULE-2 (BLOCKER) says a CHANGELOG/story SHA must be real, never
`pending` — and then prescribed: *"commit everything → note the SHA from
`git log -1` → `git commit --amend` to fill it in."* Following that recipe this
session produced a story whose `commit:` field pointed at `10df1467`, a commit
that **no longer existed on any branch**. Of course it didn't: `--amend` rewrites
the commit, which mints a *new* SHA. The value written was the pre-amend SHA,
orphaned the instant it was written. Nothing failed loudly. `git log 10df1467`
still resolved it (via reflog), so the number looked fine — it just wasn't in the
history anymore. Meanwhile SKILL.md §7.5 taught the *opposite* flow (`commit
--m "..."  # CHANGELOG SHA still "pending"` → `backfill-commits`), which the same
rule calls a BLOCKER. Three sources, three incompatible stories, and the one the
rule endorsed was the only one that was mathematically impossible.

**The lesson**: **self-reference is a fixed-point problem, and `--amend` doesn't
solve it — it moves it.** Any content that names the commit containing it has
exactly two honest shapes: *don't record it* (a version anchor plus a git tag is
already a durable join key — this repo's CHANGELOG has quietly done this since
v0.37.0), or *record it in a follow-up commit* (ship, read `git rev-parse HEAD`,
write, commit again). A third "shape" — amend the SHA in — is a loop that never
converges, and it fails silently, which is why it survived in a BLOCKER rule for
months.

**The deeper lesson**: this was found by *executing the rule*, not by reading it.
The prose was fluent and confident, and three separate documents agreed it was
authoritative. A procedure is only verified when someone runs it and checks the
artifact it produced — "the doc says do X" is not evidence that X terminates.

**Grep check**: every recorded SHA must be reachable from HEAD, not merely
resolvable:

```bash
grep -hoE '^commit: [0-9a-f]{7,40}' docs/sprints/stories/*.md | awk '{print $2}' \
  | xargs -I{} sh -c 'git merge-base --is-ancestor {} HEAD 2>/dev/null \
      && echo "{}: ok" || echo "{}: UNREACHABLE"'
```

`git log <sha>` succeeding proves nothing — reflog resolves orphans. Ancestry is
the check that catches this.
