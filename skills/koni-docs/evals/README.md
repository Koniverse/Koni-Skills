# Evaluations — does an agent holding this skill actually behave correctly?

**Contents**: [Why this exists](#why-this-exists) · [How to run one](#how-to-run-one) · [The scenarios](#the-scenarios) · [Scoring](#scoring)

## Why this exists

This skill shipped three tiers of rigor around its *reference checker* — a linter, a
suite that plants a defect of every class the linter claims to catch, and a mutation test
that breaks the linter to prove the suite notices. All of that verifies **a tool**.

None of it verified **the skill**.

An author-blind grader named the gap exactly: *"655 lines test the linter; zero lines test
whether an agent handed this skill actually produces a conformant story file, appends a
CONTEXT entry instead of editing one, or resists setting `due:` for 'must land this
sprint.'"* That is the thing the skill exists to cause, and nothing measured it.

So: these are **behavioural** evals. Each is a realistic request, with pressure, given to
a fresh agent that has the skill and nothing else. Each has an observable pass criterion —
not "did it sound right" but "what did it write to disk, and does it survive the gate".

The failure mode being guarded against is the one this repo has hit again and again: a
document that reads beautifully and instructs wrongly. A skill can be internally
consistent, fully cross-referenced, and still produce non-conformant output — and no
amount of linting the skill's own prose would reveal it.

## How to run one

Give a fresh agent **only** this skill and the scenario prompt. Do not name the rule you
are testing, do not hint at the trap. Let it work in a scratch copy of a repo that has
`docs/` and the koni-docs CLI. Then check the artifact it produced against the criteria.

An eval that tells the agent what is being measured measures nothing.

Run each on more than one model tier if you can (a rule that only holds on the strongest
model is a rule that will break in production, and cheaper models are where the
rationalizations actually happen).

## The scenarios

| # | File | What it measures | The trap |
|---|---|---|---|
| 1 | [`01-story-from-a-vague-ask.md`](01-story-from-a-vague-ask.md) | Can the agent turn a loose feature request into a conformant story file? | Frontmatter completeness under a vague ask — the fields nobody volunteers (`prd_ref`, `assignee` as a login, bare semver, AC↔task cross-refs) |
| 2 | [`02-the-deadline-that-is-not-one.md`](02-the-deadline-that-is-not-one.md) | Does it resist `due:` when the date is just the sprint end? | RULE-18.1 — a plausible, well-meaning request to make the Deadlines board "useful" |
| 3 | [`03-moving-a-date-quietly.md`](03-moving-a-date-quietly.md) | Does it write the CONTEXT entry when a date moves *proactively*? | RULE-18.3 — the slip hasn't happened yet, so "there's nothing to record" feels true |
| 4 | [`04-the-sha-that-cannot-exist.md`](04-the-sha-that-cannot-exist.md) | Does it refuse `--amend` and use the two-commit backfill? | RULE-2 — the impossible procedure *feels* like the obvious one |
| 5 | [`05-crediting-the-wrong-person.md`](05-crediting-the-wrong-person.md) | Does it resolve `assignee` to a GitHub login, not a git name? | RULE-15 — `git log --format=%an` is right there and looks correct |

## Scoring

Each scenario passes only if **every** criterion in its file is met — they are written as
observable facts about the artifact, not impressions.

A scenario that "mostly" passes is a fail. The rules these test are BLOCKERs, and a
BLOCKER that holds four times out of five is a BLOCKER that ships the fifth.

Record results in the scenario file under `## Runs`, with the model and date. A rule that
regresses on a model tier is a finding, not a footnote.
