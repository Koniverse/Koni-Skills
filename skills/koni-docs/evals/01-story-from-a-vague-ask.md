# Eval 1 — a conformant story from a vague ask

**Measures**: whether the skill actually causes a *complete* story file, not a plausible
one. This is the base case: if an agent holding koni-docs cannot produce a story that
survives `story-lint` and `koni-docs validate`, nothing else in the skill matters.

**Why this one**: nobody volunteers frontmatter. A vague ask produces a beautiful Goal, a
reasonable AC list, and a frontmatter block missing the four fields that make the story
machine-readable. The document reads finished and is not.

## Prompt (give verbatim, in a repo with `docs/`, an open sprint, and existing epics)

> We need to let users export their transaction history to CSV. Finance keeps asking.
> Write it up as a story so someone can pick it up next sprint.

## Pass criteria — all must hold

Run `npx koni-docs validate --docs-path docs/` and the harness `story-lint` check against
the produced file. Both must be clean. Then, by inspection:

- [ ] `id` matches the filename prefix, and the file is at `docs/sprints/stories/`.
- [ ] `epic` resolves to a real `EPIC-N.md`, and the story is added to that epic's Stories
      table (the skill's 5-layer rule — a story that exists only in one layer is debt).
- [ ] `prd_ref` is a **list of bare FR IDs**, and each one resolves to a real row in the
      PRD's Functional Requirements table. If no FR covers this, the agent **adds one**
      rather than inventing a reference or leaving the field a guess.
- [ ] `due` is **empty**. Nothing in the prompt imposes a date from outside the sprint
      cadence. (An agent that fills `due` with "next sprint" has failed RULE-18.1 while
      believing it was being thorough.)
- [ ] `points` is Fibonacci, and the agent says what it based the estimate on.
- [ ] Every AC has a matching entry in §11 Verification commands. An AC with no runnable
      check is a wish.
- [ ] Every task carries an `(AC: n)` cross-reference.
- [ ] The story is **not** marked `done`, has no `version_shipped`, and no `commit`.

## Fail signatures

- Frontmatter present but hollow: `prd_ref: [FR-N]` left as the literal placeholder, or
  `assignee:` filled with the session user.
- The story is written but never added to the epic or the sprint scope table — it exists
  in one layer and is invisible to every tool.
- ACs that cannot fail: "the export works correctly".

## Runs

| Date | Model | Result | Notes |
|---|---|---|---|
| 2026-09-29 | Opus 5 | **FAIL** | Story content was exemplary — caught that CSV export already shipped, read CONTEXT D2, and scoped *within* the 5,000-row cap rather than silently reversing a shipped decision. Every by-inspection criterion held. Failed this scenario's "`story-lint` must be clean" gate for a reason outside the agent: **koni-docs never mentions `Lessons applied:` and `story-lint` requires it on every story created after 2026-07-04** (D35) — the skill authors the artifact, another skill gates a field it does not teach (LESSONS §18). Filed as a cross-skill gap, not agent error. A second cause — a story-lint-dirty fixture baseline (US-2.3 pointing at a sprint file that did not exist) — was a corpus defect and is fixed. |
| 2026-09-29 | Opus 5 | **PASS** | Re-run after the fix the first run exposed. koni-docs' story template now teaches `Lessons applied:` as a literal, gate-read line (§3b), and the corpus is lint-clean at baseline. Same prompt, same blind conditions, fresh corpus. `story-lint` clean, `validate` clean, `FR-5` added to the PRD rather than invented, `due` correctly empty, story correctly `backlog` with no `version_shipped`/`commit`. The cited lesson (§1) is a real connection, not filler. |
