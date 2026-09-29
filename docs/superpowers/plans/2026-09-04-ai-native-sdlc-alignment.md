# Program plan — aligning Koni with Anthropic's AI-native SDLC playbook

> **Status: DRAFT, not approved, not committed.** Three of the five phases below need a
> scope decision that is not mine to make; they are marked **DECISION** and carry the
> question rather than an answer.
>
> This is a **program** plan (multiple stories across several releases), not a per-story
> implementation plan. Each phase that survives review gets its own story and, at tier 2,
> its own implementation plan in this directory.

**Source**: [The AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
(Anthropic). Comparative analysis is in the session that produced this file; the durable
record of *why* each item was accepted or deferred belongs in a `CONTEXT.md` D-entry
written when the program is approved, not here.

---

## 0. The sequencing problem, stated first

**Four skills currently sit at 82–86/100 against a ≥95 bar, with ~20 open findings in
[US-3.29](../../sprints/stories/US-3.29-skill-grading-residual-findings.md).**

The repo's own rule ([CONTEXT D19](../../CONTEXT.md)) is that a skill below 95 does not
pass Review. Stacking four new capabilities on top of four failing skills is the thing
this repo keeps writing lessons about — so the default sequencing is **US-3.29 first**.

The one exception is Phase 1. Continuous evals in CI *is* US-3.29's finding F, so it pays
down the debt and adds the playbook capability in the same work. It is the only phase that
does both, which is why it goes first rather than waiting.

**Everything from Phase 3 onward adds surface area to a catalog that is not yet at its own
bar.** Recommended: land Phase 1, close US-3.29, then reassess. The plan is written in full
so the shape is visible, not so it all gets built now.

---

## 1. The gap, in one table

Koni's six-stage loop lives inside three of the playbook's six stages. That is the finding
the rest of this plan follows from.

| Playbook stage | Koni today | Gap |
|---|---|---|
| **Plan** → `intent.md`, originator's language | starts at story level | idea capture below story; language boundary (§6) |
| **Design** → `spec.md` | story AC + `docs/design/` + Frame protocol | none |
| **Build** → plan mode → `plan.md` | Frame + Superpowers `writing-plans` | none |
| **Test** → self-check before humans | Self-verify + unit-coverage bar | **behavioural evals unrun** (Phase 1) |
| **Deploy** → layered review + governance as the agent acts | Review 5 passes + commit/push gate | **findings never reach the PR** (Phase 2); **no write-time hooks, no `ask` tier** (Phase 5) |
| **Maintain** → monitoring invokes Claude; findings become `intent.md` | nothing | **empty** (Phase 4) |
| — (cross-cutting) | artifact quality measured; **flow not measured** | **no indicators** (Phase 3) |

Where Koni is already ahead, and which therefore gets **no work**: the lessons loop (gated
on both halves, which the playbook does not do), the deterministic gate with per-check
self-tests + mutants + coverage, single-source-of-truth enforcement
(`check-references.py`), and the swarm planner.

---

## 2. Phase 1 — continuous evals in CI  *(FR-47, US-3.30)*

**Why first**: it is simultaneously US-3.29 finding F and the playbook's highest-value
"clay play". It converts policy drift from something a nine-agent manual grade discovers
into a red build.

**The problem, concretely.** `skills/koni-docs/evals/` holds six pressure scenarios —
including the `--amend` trap (04) and the RULE-7 rewrite (06) — and **every `## Runs` table
is empty**. By the suite's own standard: *"A scenario with an empty `## Runs` table is a
specification, not a test. It has discriminated nothing."* So every behavioural claim about
koni-docs is textual. When this session edited four `SKILL.md` files, nothing measured
whether behaviour degraded.

**What ships**

| File | Change |
|---|---|
| `skills/koni-docs/evals/` | fill the six `## Runs` tables by actually running them |
| `skills/koni-qc/references/` (new `eval-gate.md`) | the standard: what an eval is, the pass bar, when it must re-run, how an incident becomes a permanent eval |
| `.github/workflows/ci.yml` | a fourth job: run the eval suite when `skills/**` changes |
| `skills/koni-harness/references/gate-catalog.md` | the eval job in the verification-layer table |

**Design decisions to lock before building**

- **Runner.** An eval needs an agent, and CI has no Claude. Options: (a) a nightly/manual
  runner that writes results back into the `## Runs` tables, with CI asserting only
  *freshness* (no table older than the last `skills/**` change); (b) a cloud-agent runner.
  **(a) is the recommendation** — it needs no new infrastructure, and "the evals are stale
  relative to the skills" is exactly the failure being guarded.
- **Scale.** The playbook says 20–50 tasks. Koni has 6. Do not jump to 50: grow the corpus
  from *real* failures, per the repo's own §27 ("derive the corpus from the claim surface,
  not the last bug report"). Every finding in US-3.29 that is a *behavioural* claim is an
  eval candidate.
- **Floor.** `MIN_SCENARIOS`, matching the existing `MIN_CLASSES` / `MIN_MUTANTS` pattern —
  an emptied corpus must fail, not pass.

**Verification**: plant a skill edit that should change behaviour, confirm the freshness
check goes red; revert, confirm green. A guard is a hypothesis until it speaks.

**Est.** 5 points.

---

## 3. Phase 2 — put review findings on the PR  *(FR-48, US-3.31)*

**Why**: this session is the evidence. Nine graders produced ~35 findings and the only
reason you saw any of them was that I narrated them in chat. PR #7 carries a commit message
asserting review ran; it carries no finding you can reply to. The playbook's shape —
Claude reviews the PR, engineer answers `@claude`, human judges intent and risk — closes
exactly that.

**What ships**

| File | Change |
|---|---|
| `skills/koni-harness/references/review-contract.md` | a **publication** clause: where a finding lands, not just how it is written |
| `.github/workflows/` (new `review.yml`) | on `pull_request`, post the structured finding list as a PR review |
| `skills/koni-harness/references/adapters.md` | the GitHub adapter beside the git-hook adapters |

**The contract question this forces.** `review-contract.md` currently says *report every
finding with confidence + severity and let the loop filter*. On a PR surface that becomes
noise — the playbook explicitly warns to *"tune review thresholds monthly … reduce nit
volume"*. So the contract needs a **two-surface rule**: everything goes in the machine-read
artifact; a severity-filtered subset goes on the PR. The filter lives at *publication*,
never in the finder's prompt (that part of the existing contract is correct and stays).

**Portability note.** This is a GitHub adapter, not harness core. The portability contract
holds: the *finding schema* is tool-neutral, the *publisher* is the thin adapter. A repo on
GitLab writes a different publisher against the same schema.

**Est.** 5 points.

---

## 4. Phase 3 — a minimal measurement layer  *(FR-49, US-3.32)*  — **DECISION**

**Why**: Koni measures artifacts (coverage %, skill grades, story points) and does not
measure flow at all. It cannot currently answer "is the loop getting faster", "how much
rework per story", or "did this class of defect recur" — despite `regression-learning.md`
existing specifically to prevent recurrence.

**Recommendation: three metrics, not the playbook's fifteen.** All three are derivable from
artifacts this repo already keeps, so no new instrumentation:

| Metric | Derived from | Answers |
|---|---|---|
| **First-pass ship rate** | releases with no follow-up `fix(` within N commits | is work landing right the first time |
| **Rework cycles per story** | commits citing the same `US-` id after its `version_shipped` | where the loop leaks |
| **Repeat-class rate** | LESSONS entries whose body cites a prior § as "again" | is the lessons loop actually working |

The third is the interesting one and it is already measurable: this session produced four
instances of §18 and zero new lessons. That is a number, and nothing currently records it.

**Explicitly rejected from the playbook's list**: DORA metrics (Koni-Skills has no
deployment), time-to-`intent.md` (no intent layer yet — Phase 4), and `diff drift from
plan.md` (attractive and mechanizable, but it needs Phase 1's runner and per-story plans to
exist consistently first).

> **DECISION NEEDED.** Which of the three matter to you, and do you want them as (a) a
> read-only `koni-docs metrics` subcommand, (b) a section in the sprint close, or (c) a
> harness script like `sprint.sh`? I recommend **(c)** — it matches the existing read-only
> script family and needs no CLI release.

**Est.** 3 points once the decision lands.

---

## 5. Phase 4 — the Maintain stage  *(FR-50, US-3.33)*  — **DECISION**

**Why**: it is the one genuinely empty stage. And `koni-agent-monitoring` does **not** fill
it — that skill watches *agent usage* (tokens, cost, model), not production systems.

**The scoping insight that shapes this.** Koni-Skills has no runtime, so this stage
**cannot be dogfooded here**. It must be authored as a *standard* that consumer repos
(Koni-ERP-02, Senti-Quant) run — which is exactly how `koni-harness` already works: the
standard and the portable core live here, the adapter runs there. That is the right shape
and it is available.

**What the playbook prescribes, and the part worth taking**: deterministic detection
(algorithmic, never a model deciding whether something is wrong) plus a **tiered response**
— log at 1σ, diagnose at 2σ, propose at 3σ. The agent reads first, proposes second, acts
never without a gate. That tiering is the defensible part; it keeps a model out of the
detection decision, which matches harness principle 3 exactly.

> **DECISION NEEDED — and this one blocks the phase.** Which production surface is in
> scope? The candidates behave very differently:
> - **Koni-ERP-02** (web app, real users) → error-rate / latency bands, the classic case
> - **Senti-Quant / koni-ea** (trading) → equity and fill-quality bands; a *very* different
>   risk posture, and the one place "propose a fix" needs the hardest gate
> - **None yet** → author the standard with no adopter, which this repo has done before
>   (koni-harness shipped before any consumer) and which is legitimate but slower to verify
>
> I am not guessing at this. The threshold design is meaningless without knowing which
> system and whose money is on the other side.

**Est.** 8 points, and it should not start before the decision.

---

## 6. Phase 5 — write-time hooks and the `ask` tier  *(deferred, no FR yet)*  — **DECISION**

**Why**: `credential-scan` runs at commit, so a secret is already on disk when it fires.
The playbook's hooks block the *write*. Koni also has only `block`/`warn`; the playbook's
third tier is **`ask`**. And the gate is bypassable with `--no-verify`, where the playbook
blocks bypasses centrally via managed settings.

**Why it is deferred rather than planned**: it challenges the harness's **portability
contract** head-on. A `PreToolUse` hook is Claude Code `settings.json` — there is no POSIX
equivalent, so the "core is tool-neutral, adapter is thin" rule cannot hold for the core of
this capability. Principle 6 says a feature that cannot degrade to the portable core "isn't
in the harness yet."

> **DECISION NEEDED — an architecture decision, and it should be a `CONTEXT.md` D-entry
> before any code.** Three coherent positions:
> 1. **Stay out.** Commit-time is the harness's boundary; write-time protection is the
>    tool's job and Koni documents the recommended `settings.json` without owning it.
> 2. **Accept a Claude-first fast path** with an explicitly documented degradation (the
>    commit-time check remains the portable floor and still catches everything, later).
>    This is what `session-adapters.md` already does for session start — there is precedent.
> 3. **Relax the portability contract** and say so in CONTEXT. Most honest if position 2
>    starts happening repeatedly.
>
> I recommend **2**, on the precedent, but it is a standards decision and it should be
> recorded as one rather than discovered later in a diff.

---

## 7. One decision with no phase — the `intent.md` language boundary

The playbook has `intent.md` written **"in the originator's language"**, version-controlled,
and standardised later into `spec.md`. Koni's RULE-13 requires English for every artifact.

So Koni's English boundary currently sits at the **earliest capture point** — the moment
where the cost of translation is highest and the person with the idea is least likely to
want to pay it. We are conducting this entire program in Vietnamese and writing every
artifact in English; the boundary is real and it has never been written down as a choice.

> **DECISION NEEDED.** Options: (a) keep RULE-13 as-is and accept the capture cost; (b)
> carve out a pre-story intent layer where the originator's language is allowed, with
> standardisation at `spec.md`/story creation; (c) restate RULE-13 to say explicitly *where*
> the boundary is, whatever you choose — which is worth doing under either of the first two,
> because right now it is implicit.
>
> No recommendation from me on (a) vs (b): it is a team-language decision, not a technical
> one. But **(c) is owed regardless** — an unstated boundary is LESSONS §38's shape.

---

## 8. Recommended order, and the honest version of "how much"

| # | Phase | Story | Pts | Gate |
|---|---|---|---|---|
| 0 | Close the grading debt | US-3.29 | 8 | — |
| 1 | Continuous evals in CI | US-3.30 | 5 | ready |
| 2 | Review findings on the PR | US-3.31 | 5 | ready |
| 3 | Minimal measurement layer | US-3.32 | 3 | **decision** (§4) |
| 4 | Maintain stage standard | US-3.33 | 8 | **decision** (§5) |
| 5 | Write-time hooks / `ask` | — | — | **CONTEXT decision** (§6) |

**29 points across five phases**, and Koni's recent sprints run 13–16. So this is **two
sprints minimum**, three realistically — not one session.

**What I would actually do next**, if you want one answer: Phase 1 only, as a single story,
because it is the one item that pays down existing debt and adds the playbook capability at
once. Everything else waits for US-3.29 to close, which is also when a re-grade will tell
us whether the four skills clear 95 and whether this catalog has any business growing.

---

## 9. What this plan deliberately does not do

- **No `intent.md` layer is built.** It depends on §7's language decision, and building an
  idea-capture surface before that decision is settled produces an artifact nobody writes in.
- **No DORA metrics.** Koni-Skills does not deploy. Importing the vocabulary without the
  thing it measures is exactly the "empty rule table that reads as a capability" trap that
  US-3.28 already rejected once.
- **No managed-settings / MDM work.** Right for an org enforcing policy across many
  engineers; not right for this repo's current shape. Revisit when the catalog has external
  consumers who can bypass its gates.
- **No new skill.** Every phase extends an existing owner — `koni-qc` (evals),
  `koni-harness` (review publication, measurement, Maintain standard). Composing rather
  than adding a skill is the rule this catalog already follows.
