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

---

## 18. A rule is only enforced where it is *read* — propagate the rewrite, or the old recipe wins

**What happened**: RULE-2 was rewritten (LESSONS §17) in `rules.md`, and the fix
was verified: pressure-tested agents refused `--amend` and reached the correct
flow every time. It scored 25/25. Then an author-blind reviewer found that the
*changelog template* — the file an agent actually opens when asked "write the
changelog entry for v0.4.0" — still said **"the commit hash goes into the entry
at pre-commit time"**. So did SKILL.md's rule summary, its pre-commit checklist,
and the story template's §12. The rewrite had landed in the file where the rule
is *defined* and in none of the files where the rule is *encountered*. An agent
routed to the template never loads `rules.md`; it would have followed the
impossible recipe and never known a correct one existed.

The same round produced the same shape twice more: `git log --format=%an` was
prescribed as the way to fill `assignee` in three places, while RULE-15 — a
BLOCKER — forbids exactly that value; and `findRedundantDue` shipped as a live
`validate` warning with no mention in any doc, so an agent would meet a warning
the documentation does not know about.

**The lesson**: **rules live at their point of use, not their point of
definition.** Rewriting the canonical rule and stopping there feels complete and
isn't — the corrected text sits in a file most invocations never load, while
every template, checklist, and summary keeps teaching the old one. Two habits:

1. **When a rule changes, grep for its *recipe*, not its *name*.** Searching
   `RULE-2` finds the citations. Searching `pre-commit time`, `--amend`,
   `**Commit**:`, `%an` finds the *behaviour* — which is what agents copy.
2. **A rule with no reachable enforcement is decoration.** RULE-15 forbade git
   `user.name` for months while three files handed out the command that produces
   it. The contradiction was invisible on the author's machine, where `%an`,
   `user.name`, and the GitHub login all happen to coincide — the classic shape of
   a bug that only bites someone else.

**Corollary — a rule with no machine backstop drifts.** "`due` is never
`sprint.end`" was prose-only; a bulk edit setting every story's `due` to the
sprint end passed every gate. It now warns. Prose states the intent; a check is
what keeps it true.

**Grep check** — after rewriting any rule, the old recipe must return nothing:

```bash
rg -n 'pre-commit time|--amend.*SHA|format=%an' skills/ docs/   # must be empty
```

---

## 19. I validated with the same wrong function that generated — and nearly shipped a skill with no description

**What happened**: a grader flagged that the reference files needed tables of
contents. I wrote a generator, ran it across 21 files, then wrote an *audit* to
confirm the anchors resolved. The audit printed **`broken anchors: 0`**, and I
reported the fix as done.

It was wrong three times over.

1. **Generator and audit shared the same blind spot.** Both scraped `## ` lines
   with a plain regex — including the `## ` lines *inside* ` ```markdown ` fences,
   which are template skeletons, not headings. GitHub emits no anchor for fenced
   text. **150 anchors were dead**, and my audit confidently certified them
   because it computed "valid" targets with the same broken function that had
   produced the links. A validator that shares its bug with the thing it
   validates always passes.
2. **The slug algorithm was wrong in a way that looked right.** GitHub strips
   punctuation and then hyphenates *each remaining space*; I collapsed runs of
   whitespace. So `usage — the loops` is `usage--the-loops` on GitHub and
   `usage-the-loops` in my output. Every em-dash heading silently missed.
3. **The generator inserted a TOC into SKILL.md's YAML frontmatter.** Its
   "insert after the title" logic assumed the file opened with an H1; SKILL.md
   opens with `---`. The result was a `**Contents**:` line sitting between `---`
   and `name:`, which **destroyed the frontmatter** — the skill lost its
   `description` entirely, meaning it would no longer trigger for anything. The
   tell was not in my audit output. It was in the harness's own skill list, where
   the description had silently degraded to the H1 heading.

**The lesson**: **a check written by the same mind, in the same sitting, with the
same mental model as the thing it checks, is not an independent check.** It
reproduces the misconception faithfully in both directions and returns green. To
actually verify a generated artifact, the check must come from *outside* that
model: run the real renderer, diff against the real consumer, or — cheapest and
most reliable here — have someone (or something) else look. Every one of these
three defects was caught by an author-blind grader, not by me, and I had already
declared the work done.

The recursive sting: this is LESSONS §16's exact shape ("a validator that has
silently matched nothing for months looks identical to one that has found no
problems") — a lesson **I wrote earlier the same day**, and then walked straight
back into. Knowing the failure mode is not the same as being immune to it. The
only durable defence is structural: an independent reviewer, or a check you did
not author.

**Grep check** — headings inside fences are not headings:

```bash
python3 - <<'PY'
import re, glob
strip = lambda s: re.sub(r'^(```|````).*?^\1', '', s, flags=re.S|re.M)
slug  = lambda h: re.sub(r'[^\w\s-]', '', re.sub(r'`','',h).lower()).strip().replace(' ', '-')
for p in glob.glob('skills/**/*.md', recursive=True):
    raw = open(p).read()
    heads = [l.lstrip('#').strip() for l in strip(raw).split('\n') if re.match(r'^#{2,4} ', l)]
    seen, valid = {}, set()
    for h in heads:
        a = slug(h); n = seen.get(a, 0); seen[a] = n + 1
        valid.add(a if not n else f'{a}-{n}')
    for m in re.finditer(r'\]\(#([^)]+)\)', raw):
        if m.group(1) not in valid and raw[:m.start()].count('```') % 2 == 0:
            print('DEAD', p, m.group(1))
PY
```

---

## 20. A guard you wrote yourself is a hypothesis until you try to break it — and a rule with no number cannot be grepped

**What happened**: after LESSONS §19 (a validator that shared its author's blind
spot certified 150 dead anchors as green), I shipped a real checker. An
author-blind reviewer then found it **still reported a false green**: it could see
`` `file.md` §Section `` but not the *linked* form `` [`file.md`](file.md) §Section ``
— which the skill used **nine times**, one of them genuinely dead, on the See line
of a BLOCKER rule. Same defect class, one layer up. A second reviewer found the
verdict changed depending on which directory I invoked it from.

Meanwhile, three rules I had written about the `due` field — *set it only for an
external commitment; keep the value a bare date; never move it silently* — held
GREEN under adversarial pressure, and a grader still marked one RED. Why: they
were **not numbered rules**. They lived in prose in a reference file. `grep RULE-`
found nothing. And the only surface an agent reads at commit time phrased the
obligation as *"no story overdue-and-silent"* — conditioned on the story being
**already late**, so an agent proactively pushing a date read straight past it.

**Two lessons, and they are the same lesson.**

1. **A guard is a hypothesis until you try to break it.** Running your checker on
   a clean corpus and getting `0` proves nothing — a checker that always prints 0
   also prints 0. Before trusting it, *plant the defects it claims to catch* and
   confirm each one fails: a dead link, a dead anchor, a dead section pointer, a
   named script that does not exist. Then plant a legitimate case and confirm it
   passes. Silence is only evidence once you have proven the thing can speak.
2. **An obligation that is not addressable is not enforceable.** A rule must have
   a number (so `grep RULE-` finds it), live where the rule is *read* (§18), state
   its trigger unconditionally (not "when it has already gone wrong"), and — where
   possible — carry a machine check. The three `due` obligations became RULE-18 for
   exactly this reason: they were correct, well-argued, and unfindable.

**Grep check** — a rule that cannot be found cannot be followed:

```bash
# Every obligation stated as a MUST/NEVER in a skill should map to a numbered rule.
rg -n 'MUST|NEVER|always requires' skills/*/references/*.md | rg -v 'RULE-\d+'
```

---

## 21. A cheatsheet that restates a contract is a second contract — and it is the copy that gets obeyed

**What happened**: `templates.md` carried a "Quick frontmatter cheatsheet" — 107 of
its 169 lines — restating the story / epic / sprint frontmatter that
`frontmatter-spec.md` already owns. It was billed, in its own words, as the shortcut
"for agents that just need the frontmatter shape without loading the full template."

It had drifted. It described `due` in words the spec does not use. Worse, it taught
**two things RULE-17 explicitly forbids**: `AD-N` inside `prd_ref`, and the banned
range syntax `FR-X.1 .. FR-X.N`. So the copy that was *designed to be obeyed by an
agent in a hurry* was the copy that was wrong — and being a convenience, nobody
audited it.

The same round found the always-loaded SKILL.md teaching a CLAUDE.md key,
`koni-docs-plugins:`, **that does not exist** — the real key is `plugins:` nested
under `koni-docs:`. It said so in four places, and the plugin reference had to paper
over the gap ("this is the `koni-docs-plugins` declaration"). The CHANGELOG had
even *recorded* the correct key years earlier. The wrong name survived because it
lived in the file everyone reads and nobody re-derives.

**The lesson**: **duplication does not fail by going missing — it fails by going
subtly wrong in the copy people actually reach for.** A summary, a cheatsheet, a
"quick reference", an activation table "mirroring" another — each is a promise to
stay in sync with something you do not control, and that promise is always broken
eventually. The correct artifact is a *pointer*: one line naming the single source.
A pointer cannot drift.

Corollary for facts, not just structure: **a name repeated in prose is not a
verified name.** `koni-docs-plugins:` was written confidently in four files for
months. Nothing in the system used it. If a doc names a config key, a script, a
flag, or a section, something must fail loudly when it stops existing — otherwise
the doc is fiction that reads like fact.

**Grep check**:

```bash
# Every config key a doc claims should appear in a real config or schema.
rg -o '`[a-z][a-z0-9_-]*:`' skills/*/SKILL.md | sort -u   # then verify each one exists
```

---

## 22. Trust the guard's silence only after you have made it speak — ship the planted defects with it

**What happened**: `check-references.py` produced **four consecutive false greens**,
one per grading round. Each time I widened it, "verified" it by running it on a clean
corpus, read `0`, and reported it fixed. Each time an author-blind reviewer planted a
syntax I had not imagined — a linked `§`-pointer, a bare one, a `~~~` fence, a
title-attribute link, an HTML `href`, a reference-style definition — and the guard
waved it through while printing the same confident `0`.

Round four, the reviewer named the pattern instead of the bug: *"the guard is validated
only against defects its author imagined. Until it ships with a corpus of planted
defects that CI asserts it catches, the next widening will simply relocate the blind
spot."* That is exactly what had happened, four times.

So the guard now ships with **its own test suite**: a `bad/` fixture carrying one
planted defect per class it claims to catch, a `good/` control that must stay clean,
and a runner asserting every single one is caught. I wrote the tests **first**; they
failed **10 of 15** against the then-current checker, naming the same misses the
reviewer found by hand. Only then did I widen it. And the gate now runs the self-test
*before* trusting the checker's verdict — sabotage the checker and the gate refuses its
green rather than believing it.

**The lesson**: **a validator's silence is evidence only if you have proven it can
speak.** "It printed zero" and "it is broken" are the same observation. The proof is
not a clean run — a clean run is what a dead checker gives you. The proof is a corpus
of known-bad inputs it is asserted to reject, versioned alongside it, run by CI. Any
check without that is a hypothesis wearing a uniform.

Two corollaries, both learned the same day:

- **False positives are the same failure as false greens.** The checker briefly flagged
  `Next.js` as a missing script and `crypto.test.ts` as a missing file. A guard that
  cries wolf gets ignored, and ignored is where silent guards also end up. Precision is
  not politeness; it is what keeps the guard alive.
- **A guard that only inspects what changed hides standing rot.** The gate originally
  swept only the skills a commit touched, so a sibling sat red for four rounds while
  the skill advertised the guard as covering everything. Touch one, sweep all.

---

## 23. The test suite that formalized the blind spot — mutation-test the tests, or you have only moved the lie

**What happened**: LESSONS §22 was written after four consecutive false greens, and its
fix was the obvious one: **ship the guard with a corpus of planted defects.** I did. 15
classes, one fixture each, a clean control, wired into the gate. It felt like the end of
the story.

An author-blind reviewer then did something I had not thought to do: **it attacked the
test suite instead of the checker.** It regressed `SECTION_POINTER` to backticks-only —
blinding the checker to two of the three §-pointer syntaxes, the exact class the checker
was originally written for — and ran my suite.

**The suite passed.**

Because all three syntaxes asserted on the same substring (`§Ghost`), *any one of them
surviving satisfied all three*. My assertions were loose enough that a real regression,
in the flagship defect class, shipped green. The reviewer's summary was the sentence I
should have written myself: *"the guard is validated only against defects its author
imagined — and the suite did not fix that. It formalized it."*

**The lesson**: **a test suite is a claim, and it needs a test too.** The question is not
"do my tests pass?" — a dead test also passes. The question is **"if I break the thing on
purpose, do my tests notice?"** That is mutation testing, and for any guard whose entire
value is its verdict, it is not optional. So this repo now ships
`test-mutations.py`: it deliberately narrows the checker one rule at a time — fences to
backticks-only, script names to backticked-only, the §-pointer regex to one of three
forms — and asserts the suite **kills** each mutant. A surviving mutant is not a hint;
it is a hole, and it names itself.

Two mechanics that made the original suite fake, both worth stealing:

- **Assert on the classified line, not a substring of the report.** `'§Ghost'` is
  satisfied by a coincidence. `'dead §-pointer -> ok.md §GhostLinked'` is satisfied only
  by the checker doing the specific thing you claim it does — under the right
  classification, for the right input.
- **One unique needle per planted line.** Sharing a needle across fixtures means the
  fixtures are not independent, and independence is the only property that makes a
  corpus a corpus rather than a pile.

**The recursion is the point.** §19: don't trust a validator you wrote. §20: prove it can
speak before trusting its silence. §22: ship the planted defects with it. §23: **and then
prove the planted defects can still speak.** Each layer of verification is itself an
unverified claim until something adversarial pushes on it. There is no bottom turtle —
there is only the discipline of asking, at every layer, *"what would I see if this were
broken?"* If the answer is *"exactly what I see now"*, you have learned nothing.

---

## 24. A mutation suite is a lock, not a net — and the guard must never write to the thing it guards

**What happened**: LESSONS §23 shipped `test-mutations.py` — break the checker on
purpose, assert the suite kills each mutant. Six mutants, all killed, and I called the
tower finished.

An author-blind reviewer planted **eight** plausible narrowings. **Five survived both
suites.** The worst deleted, verbatim, a fix I had shipped *the round before* — the
`#fragment` check inside HTML `href`s and reference-style definitions. Nothing in my
corpus planted a dead *fragment*; only dead *paths*. So the fix was unverified by the
very suite that existed to verify it, and the mutation test **attested to a coverage it
did not have**.

The reviewer's phrasing is the lesson: *"the mutation suite is a lock, not a net. It
proves that these six hand-picked mutants die. It then prints `all mutants killed` — a
sentence a reader parses as 'narrowings die'. They do not."*

**Three lessons, all bought at the same price.**

1. **A mutation test measures the corpus, not the code.** A mutant survives when no
   fixture pins the behaviour it deletes — so a surviving mutant is not a bug in the
   checker, it is a **named hole in your test data**. That makes it the best tool
   available, and also a liar the moment you read its green as coverage. Every claim in
   a docstring needs a fixture, or the claim is decoration.
2. **Every layer needs a floor.** I emptied `MUST_CATCH` and the suite printed
   *"✓ 0 planted defect classes all caught"*, rc=0, gate green — with a fully blind
   checker underneath. §19 → §20 → §22 → §23 built a tower of verification, and the
   tower had **no bottom turtle**. `MIN_CLASSES` and `MIN_MUTANTS` are that bottom: a
   corpus that shrinks is a corpus that lies.
3. **A guard must never write to the thing it guards.** My mutation test wrote each
   mutant into the live, git-tracked `check-references.py` and restored it in a
   `finally` — inside a *blocking pre-commit hook*. One Ctrl-C, OOM, or killed hook and
   the working tree is left holding a deliberately blinded checker that still prints
   `0`. `import tempfile` sat at the top of that file, imported and never used: I had
   thought of the safe design and abandoned it. Mutate a **copy**, always.

**The recursion, restated once more, because it keeps being the answer**: §19 don't
trust a validator you wrote → §20 prove it can speak → §22 ship its planted defects →
§23 prove the planted defects can still speak → §24 **and prove the proof is a net, not
a lock, and that it cannot be emptied, and that it cannot corrupt what it checks.**

There is no final turtle. There is only a discipline: at every layer, ask *"what would
I see if this were broken?"* — and if the honest answer is *"exactly what I see now"*,
you have built a more elaborate way to print zero.

---

## 25. A closed to-do list is not a reference — it is a fossil that instructs

**What happened**: `bmad-template-analysis.md` carried an 85-line section titled
"Template Update Recommendations" — add a `§7` index to the PRD, add Given/When/Then to
the story template, add an FR Coverage table to the epic. **Every one of them had
shipped.** Months ago. The section had never been rewritten because nothing in the system
noticed: it read like a reference, it sat in the reference directory, and it was routed
to from SKILL.md.

So an agent loading it to learn "how does BMad map to koni-docs" was told to add things
that were already there — in section numbers (`PRD §7`) that a later migration had
retired. It also cited an `examples/bmad-raw-sample/` directory that does not exist. A
work artifact, frozen at the moment its work was authorized, wearing the costume of
documentation.

**The lesson**: **a document that recommends is dated the moment the recommendation is
taken.** Reference material describes *what is*; a plan describes *what should be*. When a
plan lands in the reference directory, it does not become a reference — it becomes a
fossil that gives instructions. The fix is not to update it; it is to **convert it into
its outcome**: "here is what we adopted from BMad, here is what we kept, and here is the
one thing we deliberately do differently." That text is true today and stays true.

**The tell, and it is grep-able**: reference files should not contain the words
*recommend*, *should add*, *TODO*, *proposed*, or *phase 2*. If they do, they are either a
plan that escaped, or a promise nobody is tracking.

```bash
rg -ni 'recommend|should add|proposed|phase 2|planned for' skills/*/references/
```

Same class as LESSONS §21 (the cheatsheet that restates a contract) and §18 (a rule lands
where you look, not where the fact lives): **the artifact that nobody re-reads is the
artifact that lies**, and it lies most convincingly to whoever trusted the directory it
was filed in.

---

## 26. I built three tiers of rigor around my tools and zero around what the skill causes

**What happened**: `koni-docs` shipped a reference checker, a suite planting 27 defect
classes to prove the checker works, and a mutation test breaking the checker 12 ways to
prove the suite works. Three tiers, ~650 lines, each one killing a failure the tier below
demonstrably permitted. I was proud of it.

Two independent graders, on the same round, named the same absence: **655 lines test the
linter; zero lines test whether an agent handed this skill actually produces a conformant
story file, appends a CONTEXT entry instead of editing one, or resists setting `due:` for
"must land this sprint."**

They were right, and the shape of the mistake is worth naming precisely. The three tiers
verify a **tool the skill happens to ship**. The skill's actual product is **behaviour in
another agent** — and that had no test at all. I had poured all the rigor into the part I
could see failing (a checker that printed the wrong number) and none into the part that
matters (a rule that quietly fails to hold under pressure, in someone else's session, six
months from now).

**The lesson**: **verify the output, not the apparatus.** A skill is not prose and it is
not tooling — it is a *cause*. The only honest question is: *given this skill and nothing
else, what does an agent actually write to disk?* Everything else — the linting, the
cross-references, the anchors, the mutation tests — is hygiene on the delivery mechanism.
Necessary, and not the thing.

So `evals/` now holds five behavioural scenarios, each a realistic request **with the
pressure that makes the rule hard**, each with pass criteria stated as observable facts
about the artifact produced ("zero `+due:` lines in the diff"), not impressions ("the
agent seemed to understand"). Two rules that they must never break:

- **Never tell the agent what is being measured.** An eval that names the trap measures
  nothing but reading comprehension.
- **A partial pass is a fail.** These test BLOCKERs. A BLOCKER that holds four times in
  five is a BLOCKER that ships the fifth.

**The corollary that stings**: it is *easier* to build elaborate verification for the
thing you built than to test the thing you were asked for. The apparatus is legible, it is
yours, and every layer feels like progress. Ask, before adding the next tier: **is this
verifying my work, or my product?**

---

## 27. Derive the corpus from the claim surface, not from the last bug report

**What happened**: after LESSONS §23 and §24, the checker had 27 planted defect classes and
12 mutants, all killed. It felt complete. A reviewer planted 18 fresh narrowings and
**seven survived** — and every one of them deleted a behaviour the checker **documents in
its own source**: H1 anchors, explicit `id=` attributes, numeric §-pointer precision,
same-directory links, non-greedy comment spans, a §-pointer to a file that exists nowhere.

The hole rate had not moved between rounds: 5 of 8 (63%), then 7 of 12 (58%). I had been
adding fixtures for **whatever the last reviewer happened to find**, and calling the result
coverage. `MIN_CLASSES = 27` *reads* like completeness. It is a count of the defects
someone named.

The reviewer's diagnosis is the lesson: *"the corpus was widened to cover my report, not
the checker's claim surface."*

**The lesson**: **a test corpus must be derived from what the code claims, not from what
someone found.** The claim surface is enumerable and finite — every branch that can report
a failure, every behaviour asserted in a docstring or a comment. Walk `grep -n
'problems.append'`, walk the comments that say "this handles X", and require a fixture for
each. Then the standing rule: **a new branch in the checker requires a new entry in the
corpus, in the same commit.** Coverage derived from bug reports converges on the imagination
of whoever last looked; coverage derived from the claim surface converges on the code.

Two things this immediately surfaced that no reviewer had found:

- **An equivalent mutant.** A mutation deleting `heading.replace('`', '')` survived — not
  because a fixture was missing, but because the line was **dead code**: the punctuation
  regex on the next line already stripped backticks. A surviving mutant is usually a hole in
  the tests; sometimes it is a lie in the code. Both are worth knowing, and only the
  mutation test can tell you which.
- **A whole defect class the checker could not see.** `PRD §8` — the numbered form a
  migration retired — survived in three files, including one **copied verbatim into every
  generated story in every consumer repo**, because `SECTION_POINTER` required a `.md` token
  and bare `PRD §8` has none. The rule was updated. The template was updated. The siblings
  never were: LESSONS §18, once more, in the flagship file.

**The uncomfortable part**: this is the fourth consecutive round in which the honest summary
is *"the guard was less complete than its own green suggested."* Each round it got better and
each round that sentence stayed true. That is not a reason to stop verifying. It is the
reason to stop trusting *any* single layer — and to make the corpus answer to the code
rather than to memory, so the next round's finding has to be something genuinely new.
