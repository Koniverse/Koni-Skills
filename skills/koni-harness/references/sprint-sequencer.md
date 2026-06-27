# sprint-sequencer (`sprint.sh`)

A portable, dependency-free POSIX script that answers two cross-story questions
over a koni-docs sprint: **"what should I start next?"** and **"where is the
sprint?"** It reads koni-docs story frontmatter under
`docs/sprints/stories/*.md` and **never writes** — koni-docs owns status; this is
a read-only query layer on top of it.

## What it computes

**`next`** — the ready set, in priority order.

- A story is *ready* iff it is **not** `done` **and** every id in its
  `depends_on` resolves to a story whose `status` is `done`. A dep that resolves
  to a non-`done` status, or that resolves to no story at all (outside the
  corpus), counts as **not satisfied** → the story is held back.
- Ready stories are ordered by **priority** (`P0` → `P1` → `P2` → `P3`, anything
  missing/unknown sorts last), then by **id** as a tiebreak.
- Prints one `- <id>  —  <title>` line per ready story and suggests the
  top pick: `→ start: loop.sh start <id>`.
- If nothing is ready it prints `No ready stories in <sprint>. Run 'sprint.sh
  status' to see blockers.` and still exits `0`.

**`status`** — the sprint at a glance.

- A one-line summary: `Sprint <id> — <done>/<total> done, <pts-done>/<pts-total> pts`.
- A counts line by status: `in-progress · planned · blocked(status) · other`.
  (`blocked(status)` counts stories whose frontmatter `status` is literally
  `blocked`; it is distinct from the dependency-blocked list below.)
- A **"Blocked by unmet dependencies"** list — for every not-`done` story with at
  least one unsatisfied dep, a line `- <id> blocked by: <dep> [<dep> …]` naming
  the unmet dep ids. Points fields that aren't a plain integer count as `0`.

## Usage

```sh
sh .koni-harness/sprint.sh next   [--sprint <id>] [--docs <dir>] [--root <dir>]
sh .koni-harness/sprint.sh status [--sprint <id>] [--docs <dir>] [--root <dir>]
```

Defaults:

- `--root` — the git toplevel (`git rev-parse --show-toplevel`), else the cwd.
- `--docs` — `<root>/docs`. Stories are read from `<docs>/sprints/stories/*.md`.
- `--sprint` — when omitted, taken from the `active_sprint:` line in the repo's
  `CLAUDE.md`.

Exit codes: `0` on success (**including** the "none ready" case); `2` on a usage
error (unknown arg) or an unresolvable sprint (no `--sprint` and no
`active_sprint` in `CLAUDE.md`).

## How it fits the loop

`sprint.sh next` (pick the story) → `loop.sh start <id>` (drive that one story
through the six stages) → the gate fires at commit. The sequencer is the
**cross-story** complement to the per-story loop-runner: it chooses *which* story
to run; `loop.sh` runs it.

## Limits

- **Single sprint.** It scopes to one sprint (the resolved `active_sprint` or
  `--sprint`); there is no multi-sprint view.
- **No parallel fan-out.** It reports a priority-ordered ready set, not a
  parallel work plan (dropped as YAGNI).
- **Corpus-bounded deps.** A dependency on a story that is not in the scanned
  corpus resolves to no status and therefore counts as unmet — it surfaces as a
  blocker in `status` and holds the dependent story out of `next`.
