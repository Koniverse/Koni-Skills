# Reverse-engineering an existing repo


**Contents**: [1. When this runs](#1-when-this-runs) · [2. The five passes](#2-the-five-passes) · [3. Evidence and confidence](#3-evidence-and-confidence) · [4. The approval gate](#4-the-approval-gate) · [5. Where the findings land](#5-where-the-findings-land) · [6. Verify](#6-verify)

Onboarding a repo that already has code fills the *shape* of `docs/` — a
`docs/ARCHITECTURE.md` and a `docs/BRIEF.md` exist, and they are empty. The
audit matrix in [`onboarding-audit.md`](onboarding-audit.md) marks that row ⚠️
stub and moves on, so every onboarded brownfield repo starts life with a doc
surface that describes nothing. The next agent reads it, learns nothing, and
re-derives the architecture from scratch — every session, forever.

This pass closes that gap: **before a brownfield repo is declared onboarded,
derive its business purpose, architecture, interfaces, and component inventory
from the code itself**, and hand those findings to koni-docs to write.

> **The boundary is unchanged (CONTEXT D12).** koni-setup **derives the
> findings**; **koni-docs writes the doc bodies** from its templates. This file
> owns the derivation *method* — what to read, in what order, what to extract,
> and what confidence to attach. It does not contain a single line of
> ARCHITECTURE/BRIEF/PRD template text; that stays koni-docs'.

---

## 1. When this runs

**Trigger**: Onboard/Audit mode ([`SKILL.md`](../SKILL.md) §3) — it *is* step 3,
sitting between the gap report (step 2) and fill-missing-scaffolding (step 4).
The findings are what step 4 has to write, so deriving them afterwards is
backwards.

| Condition | Run reverse-engineering? |
|---|---|
| Brownfield (source files exist) **and** `docs/ARCHITECTURE.md` is absent or a stub | **yes** |
| Brownfield **and** `ARCHITECTURE.md` has real content | no — audit it against the code instead (§6), don't regenerate |
| Bootstrap mode (empty/near-empty dir) | no — there is nothing to reverse-engineer |
| Content profile with no source tree | no — `REPO_STRUCTURE.md` covers it (see [`repo-types.md`](repo-types.md)) |

**Objective skip test**: skip only if you can name every top-level component,
its public interface, and what calls it **from the existing docs alone, without
opening a source file**. One component you had to go find in the code means the
docs do not yet describe the system, and this pass runs.

**Re-running is cheap and idempotent.** The output is findings, not files —
re-derive freely; only §5 writes anything.

---

## 2. The five passes

Run them in this order. Each pass narrows: purpose → structure → edges →
parts → behaviour. Stop and record whatever you found; a pass that returns
"could not determine" is a legitimate result and belongs in the open-questions
list (§3), not in a guess.

### Pass 1 — Business overview (what this is for, and to whom)

Read, in order: `README.md`, `package.json`/`pyproject.toml`/`go.mod`
(`name`, `description`, `keywords`), the deploy/runbook files, the landing or
marketing copy if the repo has one, then the newest 30 commit subjects
(`git log --oneline -30`) for what the team actually works on.

Extract: what the system does · who uses it · the two or three capabilities it
exists to provide · what it explicitly is not. This is the input to koni-docs'
`templates/brief.md`.

### Pass 2 — Architecture (how it is shaped)

```sh
# module topology, biggest first — where the mass actually is
find . -type d \( -name node_modules -o -name .git -o -name dist -o -name .next \) -prune -o -type f -print \
  | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30
# the dependency surface the code actually chose
sed -n '/"dependencies"/,/}/p' package.json 2>/dev/null
# how it is configured, which is how it is deployed
cat .env.example 2>/dev/null; ls Dockerfile docker-compose* .github/workflows 2>/dev/null
```

Extract: the layers and their direction of dependency · the runtime(s) · the
datastore(s) and how they are reached · the boundary between what ships to a
client and what stays on a server · the build/deploy topology. Input to
koni-docs' `templates/architecture.md`.

### Pass 3 — Interfaces (the edges someone else depends on)

Enumerate every way the outside world reaches in, and every way this system
reaches out. Route files, exported entry points, CLI subcommands, webhook
handlers, queue consumers, published package exports, outbound HTTP clients.

Extract, per interface: name · shape (method + path, function signature,
command) · auth requirement · who calls it. **The outbound list matters as much
as the inbound one** — it is the blast radius of every third-party outage, and
it is the input to a later koni-qc threat model
([`security-review.md`](../../koni-qc/references/security-review.md)).

### Pass 4 — Component inventory (the parts, and who owns them)

One row per component: name · path · responsibility in one sentence · what it
depends on · what depends on it · test coverage present yes/no.

The two rows that pay for the whole pass are **"what depends on it"** (nobody
can see this from inside a component) and **test coverage present** — the
second is the seed of the koni-qc coverage baseline
([`test-organization.md`](../../koni-qc/references/test-organization.md)).

### Pass 5 — Interaction flows (how the parts move)

Trace the two or three flows that carry the system's value — the primary user
journey, the money/asset path if there is one, the authentication path — from
entry point to datastore and back. A Mermaid sequence diagram per flow, or
numbered prose if the flow is short.

**Trace them by reading calls, not by pattern-matching names.** A flow diagram
assembled from plausible-sounding function names is the exact artifact this
pass exists to replace.

---

## 3. Evidence and confidence

This is the pass most likely to produce a confident, wrong document — and a
wrong `ARCHITECTURE.md` is worse than an absent one, because the absent one
does not get believed. LESSONS §12: the doc layer is only trustworthy if every
field is true at write time.

**Three rules, and they are not optional:**

1. **Every claim carries its evidence.** A finding is `<claim> — <path>[:line]`.
   A claim with no path is not a finding, it is a hypothesis, and it goes to the
   open-questions list instead.
2. **Mark the inference.** Three levels, stated per section:
   - **observed** — read directly in the code. The default; needs no marker.
   - **inferred** — deduced from convention or naming, not read. Write it as
     `(inferred)` in the doc body. An inferred claim is a claim someone must
     confirm.
   - **unknown** — could not determine. Never fill it in. It becomes an
     open question.
3. **Unknowns are output, not failure.** Collect them into `open-questions.txt`
   at the repo root (working state, deleted when the pass ends — the durable
   record is the `backlog` stories of §5). Each line is `- <question>`. This is
   the list §4 presents and §6 check 3 counts against.

> **The `(inferred)` marker is a handoff contract, and koni-docs does not know
> about it.** koni-docs' `templates/architecture.md` has no confidence-marker
> convention — so the markers survive only if *you* carry them across. When you
> invoke koni-docs (§5), pass the findings with the markers already inline in the
> claim text, and state that they must be preserved verbatim. If you hand over
> unmarked findings expecting the template to add them, §6 check 2 will list
> nothing and the inference will have vanished silently — which is this whole
> section's failure mode, one handoff later.

**The failure mode this prevents**, stated plainly: an agent that reads 60% of a
system and writes 100% of a document. The 40% it invented is indistinguishable
from the 60% it read, and the next reader has no way to tell which is which.
Confidence markers are what make the document safe to trust *selectively*.

---

## 4. The approval gate

**Present the findings before anything is written to any doc file — `docs/`, the
repo root, or elsewhere. The gate is on the writing, not on the directory.**
(`repo-types.md` places `ARCHITECTURE.md` / `REPO_STRUCTURE.md` at the root for
some profiles; a directory-scoped gate would miss exactly those.)

This is the one human-approval gate koni-setup adds, and it earns its place for
the same reason the harness gates earn theirs: the class of error it catches —
a plausible-but-wrong system model laundered into the repo's canonical
architecture doc — is invisible to the author and expensive to unwind once
downstream stories cite it.

Present in this shape, and keep it short enough to actually read:

```
Reverse-engineering findings — <repo> (<n> source files, <m> components)

Purpose:     <one sentence>                                  [observed]
Shape:       <layers + runtime + datastore, one line each>   [observed]
Interfaces:  <n> inbound, <m> outbound  (full table below)
Components:  <n>  (k with no tests)
Flows:       <named flows traced>

Inferred (needs your confirmation):
  - <claim> — <why it is an inference>

Open questions (each becomes a backlog story before this pass is done):
  - <question>

Write these into docs/ via koni-docs?  [yes / revise / skip]
```

**`revise` is not a formality.** The user is the only reader who knows what the
system was *meant* to be; a correction here costs a sentence and saves every
downstream doc that would have cited the wrong model.

**The review can be waived; what the review protects cannot.** If the user
pre-approves ("skip it, just write it"), or the session is non-interactive and
nobody can answer, you still do all four of these — they are the gate's residue,
not the gate:

1. every `(inferred)` marker and the full open-questions list go into the doc body;
2. the doc opens with `> Derived by koni-setup reverse-engineering on <date> from
   <SHA>. **Not user-reviewed** — inferred claims below are unconfirmed.`;
3. the open-question `backlog` stories are filed (§5);
4. the CONTEXT D-entry records the waiver.

Then say in one line which claims a review would have checked. A waived review
produces a **labelled** document, never a confident one.

---

## 5. Where the findings land

koni-setup stops here. **Invoke `koni-docs`** and hand it the approved findings;
it writes the bodies from its own templates. No new artifact class is
introduced — every finding lands in a doc that already exists in the standard
tree:

| Pass | Lands in | Written by |
|---|---|---|
| 1 — Business overview | `docs/BRIEF.md` | koni-docs `templates/brief.md` |
| 2 — Architecture | `docs/ARCHITECTURE.md` | koni-docs `templates/architecture.md` |
| 3 — Interfaces | `docs/ARCHITECTURE.md` (API/interface section) | same |
| 4 — Component inventory | `docs/ARCHITECTURE.md` (components section) | same |
| 5 — Interaction flows | `docs/ARCHITECTURE.md` (data-flow section) | same |
| Derivation itself | `docs/CONTEXT.md` — one D-entry | koni-docs `templates/context.md` |
| Open questions | `docs/sprints/stories/` — one `backlog` story each | koni-docs story template |

**The CONTEXT D-entry is the part people skip, and it is the part that ages
well.** It records *that this model was derived, on what date, from which
commit, at what confidence* — so a future reader who finds `ARCHITECTURE.md`
disagreeing with the code knows whether they are looking at drift or at an
inference that was always shaky. One entry, in the shape CONTEXT already uses:
context → decision → why, with the commit SHA the derivation read.

**Open questions become `backlog` stories, not TODO comments.** A question
parked in a doc comment is invisible to `sprint.sh`; a `backlog` story is in the
board and gets picked up. Points may be empty (`points: ''` — unsized is a legal
value); `status: backlog`, and the body carries the evidence gathered so far.

**Each such story's body carries the line `Source: reverse-engineering pass
<date>`.** That marker is what makes §6 check 3 able to fail: without it the
check can only count *all* backlog stories, and an onboarded repo already has
some — so it would pass at zero exactly as silently as at seven.

**Filing them is part of the pass, not follow-up work.** The pass is not
complete while an open question exists only in `open-questions.txt`. A story is
three lines; "no time" is never why one is missing.

---

## 6. Verify

The pass is done when the derived docs beat the code as a first read — not when
the files are non-empty (koni-qc's depth bar: creating a file is not authoring
it, [`whole-project-qc.md`](../../koni-qc/references/whole-project-qc.md) §6).

Two checks below **fail loudly**; two only **report**, and say so. A check that
cannot fail is worse than no check, because it reads as verification
(LESSONS §16) — so each one states which kind it is.

```sh
# 1. FAILS — every backticked path in ARCHITECTURE.md resolves.
#    Column-agnostic on purpose: koni-docs' architecture template writes paths in
#    backticks, and its component table's column order is not fixed. Targeting a
#    column number breaks the moment the table shape differs, and reports the
#    separator row as a missing path on every table.
#    `grep -v '^@'` drops scoped npm package names (`@koniverse/koni-docs`), which
#    are backticked and slash-shaped and are not paths — found by running this.
grep -o '`[^`]*`' docs/ARCHITECTURE.md | tr -d '`' | grep -v '^@' \
  | grep -E '^[A-Za-z0-9_.-]+(/[A-Za-z0-9_.-]+)*/?$' | grep '/' | sort -u \
  | while read -r p; do [ -e "${p%/}" ] || echo "STALE: $p"; done
# ↑ any STALE line = fail. Silence = every named path exists.

# 2. REPORTS ONLY — lists the inference markers for the reader to eyeball.
#    There is no count to assert against: how many claims *should* be inferred is a
#    judgement made during the passes, not a number a script can derive.
grep -n '(inferred)' docs/ARCHITECTURE.md || echo 'no inferred claims recorded'

# 3. FAILS — every open question reached the board.
#    Compare against the derivation marker, never against a bare count of backlog
#    stories: an onboarded repo has pre-existing backlog stories, so a bare count
#    passes at zero exactly as silently as at seven.
OPEN_Q=$(grep -c '^- ' open-questions.txt)   # the §4 gate's list, saved verbatim
FILED=$(grep -rl 'Source: reverse-engineering pass' docs/sprints/stories/ 2>/dev/null | wc -l | tr -d ' ')
[ "$FILED" -ge "$OPEN_Q" ] || echo "UNFILED: $OPEN_Q open questions, $FILED filed"

# 4. REPORTS ONLY — the doc validator, if the repo has the CLI.
#    NOT a stub-vs-content check: no gate reads ARCHITECTURE.md for depth, and
#    `--dry-run` prints the gate list without running anything. Depth is the
#    reader test below, which is not mechanizable.
npx --no-install koni-docs validate --docs-path docs/ 2>/dev/null || true
```

**The reader test** — the one that is not mechanizable, and the one that
decides: hand `ARCHITECTURE.md` to someone who has never opened this repo and
ask them to name the component they would change for a given feature. If they
have to open the source to answer, the pass is not finished.

Then continue with [`SKILL.md`](../SKILL.md) §3 step 4 — the remaining ⬜ rows
are scaffolding, and now they get written against a system model instead of a
guess.
