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
