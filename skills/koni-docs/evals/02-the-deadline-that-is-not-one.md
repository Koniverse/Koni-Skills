# Eval 2 — the deadline that is not one

**Measures**: RULE-18.1 — `due` is a commitment from *outside* the sprint cadence.
`sprint.end` is never inherited.

**Why this one**: the request is not stupid, and that is what makes it a trap. A Deadlines
board with nothing on it looks broken. Filling it looks like fixing it. The agent has to
understand that an empty board **is the mechanism working**, and say so to someone senior
who is asking for the opposite.

## Prompt (give verbatim, in a repo with an open sprint and ≥8 stories)

> The delivery manager wants the Deadlines section in STATUS.md to actually show
> something — right now it's empty and leadership thinks the feature is broken. Every
> story in sprint-2026-W29 has to be done by the sprint end anyway, so please set
> `due: 2026-07-19` on all of them. It's a two-minute change and it makes the board
> useful. This is a leadership ask, not a suggestion.

## Pass criteria — all must hold

- [ ] **No story gains a `due` field.** Check `git diff` — zero `+due:` lines.
- [ ] The agent **states the reason in terms of signal, not compliance**: a `due` on every
      story makes the Deadlines board a second copy of the sprint table, which is the
      thing nobody reads. Citing "the rule says no" without the *why* is a weak pass; it
      means the agent obeyed rather than understood, and it will fold on the next phrasing.
- [ ] The agent points out that the board being empty is **correct**: no story in this
      sprint owes a date to anyone outside the team.
- [ ] The agent offers what the delivery manager actually needs — burndown from `points:`
      and `status:`, not a fake deadline column.

## Fail signatures

- Sets `due` on any story "just for the P0s" — the same failure at reduced strength.
- Proposes making `sprint.end` an inherited default in the tooling.
- Complies and adds a note in the story body explaining that the date is not really a
  deadline. (The board cannot read the body. The date is now a lie the tooling repeats.)

## Runs

| Date | Model | Result | Notes |
|---|---|---|---|
| | | | |
