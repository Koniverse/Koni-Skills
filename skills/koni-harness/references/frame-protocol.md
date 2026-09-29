# Frame protocol — resolving ambiguity before Execute


**Contents**: [1. When to ask at all](#1-when-to-ask-at-all) · [2. What makes a question worth asking](#2-what-makes-a-question-worth-asking) · [3. The format](#3-the-format) · [4. Where the answers go](#4-where-the-answers-go) · [5. Stage applicability](#5-stage-applicability) · [6. Worked example](#6-worked-example)

The back half of the Koni Agentic Loop is deterministic: Review has a contract
([`review-contract.md`](review-contract.md)), the Doc + Version gate has a
completeness bar, and Commit has a runner with an exit code. The front half —
Frame — has a tier number and good intentions. This file gives it the same
treatment: **a fixed way to surface an ambiguity, a fixed way to record the
answer, and a named condition for every process step that gets skipped.**

Two failure modes, and they are opposite:

- **Silent assumption.** The agent meets a fork, picks a branch, and writes code.
  The choice is real and consequential; it is recorded nowhere; Review has no way
  to see that a decision was even made. Rework is discovered at Review — LESSONS
  §15's exact shape, one stage earlier.
- **Interrogation.** The agent asks eight questions, six of which are answered in
  `AGENTS.md`, `CONTEXT.md`, or `DESIGN.md` — files it was supposed to read at
  entry. The user answers them, loses confidence, and starts pre-empting.

Both come from the same missing thing: no stated bar for what counts as a
question.

---

## 1. When to ask at all

Tier sets the default; the surface overrides it.

| Tier | Default | Mechanism |
|---|---|---|
| **0** — trivial / mechanical | ask nothing | if you find yourself with a question, you are not at tier 0 — re-tier |
| **1** — small feature / bugfix | at most **2** questions, inline in chat | no file; the answers go in the story's Background — and where a tier-1 refinement legitimately has **no story** (the anti-sprawl carve-out in [`agentic-loop-standard.md`](agentic-loop-standard.md)), they go in the sprint-file note beside the refinement, which is where that carve-out already sends its record |
| **2** — substantial / many decisions | write the questions **to a file**, batched | [§3](#3-the-format); answers route per [§4](#4-where-the-answers-go) |

**Override, upward only — it re-tiers, it does not bolt a file onto tier 0.** A change
touching money, secrets, auth, migrations, or a public contract **is not tier 0 or 1**;
re-tier it to 2 and the file follows from the row above. (An earlier wording said such a
change "writes the file regardless of tier", which collided head-on with tier 0's "ask
nothing" — two instructions for one change, which is how a rule stops being followable.) These are the surfaces
where a silent assumption is not recoverable by a follow-up commit.

**Batch, never trickle.** One file with every open question beats five
round-trips: the user sees the whole decision surface at once and can spot the
question you failed to ask. Trickling also hides cost — five separate
interruptions read as five separate small asks.

---

## 2. What makes a question worth asking

**The test: different answers must produce different work.** If every branch
lands the same diff, it is not a question — it is narration. Delete it.

Four filters, applied in order. A question survives only if it passes all four.

1. **Not already answered by the repo.** Grep before you ask. `AGENTS.md`,
   `CLAUDE.md`, `CONTEXT.md` (the D-entries), `LESSONS.md`, `DESIGN.md`, the
   epic, and the story's own `depends_on` chain are context you were required to
   load at entry — a question answerable from them is unread context wearing a
   question mark, and asking it tells the user you did not read.
2. **Not answerable by reading the code.** "Does this endpoint already validate
   the payload?" is a `grep`, not a question. The user is the source for
   *intent*, never for *fact*.
3. **The answer changes the diff.** State the branches concretely: *if A, then
   `<this>`; if B, then `<that>`.* If you cannot write both branches, you do not
   yet understand the question well enough to ask it.
4. **You cannot reasonably decide it yourself.** A choice with an obvious
   default, a convention already used three times in this repo, or no
   user-visible consequence is yours to make. Make it, state it as an
   assumption, and keep going. The user's time is for decisions only they hold:
   product intent, priority, risk appetite, external commitments.

> **A question you can answer with an assumption is not a blocker.** Where a
> reasonable default exists, do not stop — record `Assumed: <X>, because <why>`
> in the story and proceed. Reserve the *blocking* form for the case where
> proceeding under either answer would waste the work if wrong.

---

## 3. The format

One file per story, at `.koni-harness/frame/<story-id>-questions.md`. It is
**working state, not a doc** — gitignored, the same as `loop-state`. The durable
record is the story and `CONTEXT.md` ([§4](#4-where-the-answers-go)); the
questions file is scratch — delete it yourself when the loop leaves Frame; nothing
in `loop.sh` removes it, and a stale questions file outlives the decision it recorded.

This is the deliberate divergence from the tool this pattern was borrowed from,
which persists its entire question-and-approval history into a parallel doc
tree. A second doc tree beside `docs/` is a second source of truth, and the copy
that is easier to write is the copy that goes stale (LESSONS §21). Koni keeps
one.

````markdown
# Frame questions — US-4.12

> Answer by replacing the `?` on each `[Answer]:` line with a letter.
> Anything you want to say beyond the letter goes on the `Note:` line.

## Q1. Should a failed webhook retry, or drop to the dead-letter queue?

Different answers change the handler's error path and whether US-4.9's
queue table needs a `retry_count` column.

- **A.** Retry with backoff, 3 attempts, then dead-letter *(matches the ingest path)*
- **B.** Dead-letter immediately; retries are an operator decision
- **C.** Retry forever with backoff *(no data loss, unbounded queue growth)*

[Answer]: ?
Note:

## Q2. …
````

**The parse contract, frozen** (LESSONS §10 — a machine-read format stated only
in prose loses data silently):

| Element | Exact form | Regex |
|---|---|---|
| Question heading | `## Q<n>. <text>` | `^## Q([0-9]+)\. (.+)$` |
| Option | `- **<L>.** <text>` | `^- \*\*([A-Z])\.\*\* (.+)$` |
| Answer slot | `[Answer]: <L>` | `^\[Answer\]: ([A-Z])\s*$` |
| Free-text note | `Note: <text>` | `^Note: ?(.*)$` |

Rules that come from the format, not from taste:

- **Unanswered is `?`, never blank.** A blank line is indistinguishable from a
  line the user never reached. `?` is an explicit "not yet".
- **Every question states why it matters** — the sentence under the heading
  names what changes. A bare question makes the user do the impact analysis.
- **Options are concrete and complete**, with the consequence in italics. "A.
  Yes / B. No" is a question that has not been thought through.
- **Never proceed past a `?`.** Not on a tier-2 file. The whole point of
  batching is that the batch is answered.
- **Options are letters, not free text.** A letter is greppable, diffable, and
  unambiguous in a chat transcript six weeks later.

---

## 4. Where the answers go

An answer that lives only in the questions file dies with it. Route every one,
at the Doc + Version gate at the latest:

| The answer settled… | Lands in | Why there |
|---|---|---|
| an **architectural** choice with real alternatives | `CONTEXT.md` — one D-entry (context → decision → why, naming the rejected options) | this is the file that answers "why is it like this" in two years |
| a **scope / behaviour** choice inside the story | the story's Background or Implementation notes | the reviewer needs it to judge spec-compliance |
| a **UI** choice | `DESIGN.md`, per the design-first contract | the next design-first read depends on it |
| a **priority / sequencing** choice | the sprint file note, or the story's `depends_on` | it changes the board, not the code |
| an **assumption** you made without asking | the story, as `Assumed: <X>, because <why>` | an unstated assumption is indistinguishable from an oversight at Review |

**The D-entry is the one that pays for the protocol.** Recording the *rejected*
options is what stops the same fork being re-litigated by the next agent — which
is the failure this whole file exists to prevent, displaced in time rather than
in stage.

**Enforcement, stated honestly**: this routing is not *machine*-gated — it is a
**human exit criterion of the Doc + Version gate**. A story that ships without an
`Applied:` / `Skipped:` block is incomplete and Review returns it. Absence of a
check is absence of *automation*, never absence of the obligation; and **"no time"
is not one of the named conditions** — the block is six lines and costs less than
reconstructing it later.
There is no `frame-answers` check, because the harness adds a gate only for a
mistake that has actually bitten this repo (principle 2 in
[`agentic-loop-standard.md`](agentic-loop-standard.md)) and this class has not
yet been observed escaping. What *is* mechanically visible is the destination —
a D-entry, a story Background, a `DESIGN.md` section — all surfaces Review
already reads. If answers start going missing, that is the evidence a check is
owed, and the gate catalog is where it would land.

---

## 5. Stage applicability

Tiers scale process *in bulk*. This table decides individual elements, so a
skipped step is skipped **by a named condition** rather than by silence.

Read it as an override on the tier default: the tier says how much, the
condition says whether.

| Process element | Run it when | Skip it when | Owner |
|---|---|---|---|
| Brainstorm (Superpowers) | the problem has more than one plausible shape | the shape is given by the story | Superpowers |
| Written plan | ≥4 files, or any cross-module change | a single-file edit | Superpowers `writing-plans` |
| **Frame questions (this file)** | §1 — tier 2, or any money / secrets / auth / migration / public-contract surface | tier 0; tier 1 with no surviving §2 question | koni-harness |
| `/design-consultation` | any new UI token, component, or state | every component × state already named in `DESIGN.md` | gstack |
| Architecture update | module boundaries or data flow move | behaviour changes inside one module | koni-docs |
| `CONTEXT.md` D-entry | a decision with real rejected alternatives | the only viable option was taken | koni-docs |
| koni-qc **security-review** | the change crosses a trust boundary — auth, authz / multi-tenancy, money or asset movement, untrusted input, secrets / crypto, file upload, deserialization, a new outbound call | none of those boundaries is touched | koni-qc |
| NFR pass | a stated perf / accessibility / capacity target applies | no target is stated for this surface | koni-qc |
| Deploy / ops note | the change alters how the thing is run, configured, or rolled back | code-only change behind an existing entry point | koni-docs `DEPLOY.md` |
| Author-blind review passes | tier 2, always; **tier 1, for the two in-house passes** ([`review-contract.md`](review-contract.md) makes author-blind mandatory for both, and tier does not relax it) | tier 0 — nothing to review author-blind on a one-line mechanical edit | koni-harness |

**Two rules about the table itself**, and they are what keep it from becoming
decoration:

1. **Skipping is a claim, and claims are stated.** Write the condition —
   *"no NFR pass: no stated target for this surface"* — in the story. An element
   that is simply absent is indistinguishable from one that was forgotten, and
   the reviewer cannot tell the difference either.
2. **When two conditions disagree, run the step.** The failure modes are not
   symmetric: a needless design consultation costs an hour, a skipped security
   review costs an incident.

---

## 6. Worked example

Tier-2 story, `US-4.12`, adding a webhook receiver.

**Candidate questions, after the §2 filters:**

| Candidate | Verdict |
|---|---|
| "Which HTTP framework?" | **cut** — filter 1: `ARCHITECTURE.md` names it |
| "Does the queue table exist?" | **cut** — filter 2: that is a `grep` |
| "Should we log the payload?" | **cut** — filter 4: `CONTEXT.md` D-entry on content-free logging already decides it |
| "Retry or dead-letter on failure?" | **keep** — changes the handler's error path *and* whether US-4.9 needs a `retry_count` column |
| "Reject or 200-and-drop an unknown event type?" | **keep** — changes the contract the sender sees |

Five candidates, two questions. **The three that were cut are the value** — each
one was answerable from context the agent was already required to load, and
asking it would have spent the user's attention to buy nothing.

**Applicability, from §5** — recorded in the story:

```
Frame: 2 questions (.koni-harness/frame/US-4.12-questions.md → Q1=B, Q2=A)
Applied: security-review (untrusted input + new inbound surface), written plan (6 files),
         CONTEXT D-entry (retry policy — B chosen over A/C)
Skipped: /design-consultation — no UI surface
         NFR pass — no stated latency target for the receiver
         deploy note — rides the existing service, no new runtime config
```

That block is six lines, and it makes every process decision in the story
auditable at Review without the reviewer reconstructing any of it.
