# Behavioural evals — measuring what a skill *causes*, and keeping the measurement fresh


**Contents**: [1. What an eval is, and is not](#1-what-an-eval-is-and-is-not) · [2. The frozen corpus](#2-the-frozen-corpus) · [3. Running one blind](#3-running-one-blind) · [4. Scoring](#4-scoring) · [5. The freshness gate](#5-the-freshness-gate) · [6. Growing the corpus](#6-growing-the-corpus)

Every other guard in this catalog measures an **artifact**: `check-references.py` measures
whether a doc's pointers resolve, `run-all.sh` measures whether a gate check catches what
it claims, skill-grading measures whether a `SKILL.md` reads well and holds under pressure.

None of them measures the thing a skill actually is: **behaviour in another agent.** A
skill can be internally consistent, fully cross-referenced, score well on every rubric, and
still cause non-conformant output. That is the gap evals close, and it is the reason
skill-grading's D2 exists at all — an eval is D2 made repeatable and cheap.

> **Ownership.** koni-qc owns the *method* (this file). The eval **corpus** lives inside
> the skill it measures (`skills/<skill>/evals/`), because a scenario is a claim about
> that skill and travels with it. koni-harness owns the *gate* ([§5](#5-the-freshness-gate)).

---

## 1. What an eval is, and is not

An eval is **one realistic request, carrying the pressure that makes one rule hard**, given
to a fresh agent holding the skill and nothing else, scored against criteria written as
observable facts about the artifact it produced.

| It is | It is not |
|---|---|
| a request a real person would send | a description of the rule under test |
| scored on the artifact | scored on the agent's explanation |
| pass/fail on **every** criterion | "mostly passed" |
| run against a frozen corpus | run against whatever repo was handy |

**The single most important rule: the agent must not know what is being measured.** Naming
the rule, hinting at the trap, or asking the agent to "be careful about X" converts a
behavioural test into a reading-comprehension test. An eval that tells the agent what is
being measured measures nothing.

This is why an eval and a pressure-test are not the same artifact even though they look
alike. Skill-grading's D2 *tells* the grader which rules to attack — that is correct there,
because D2 is auditing the text. An eval hides it, because it is auditing the behaviour.

---

## 2. The frozen corpus

**Two runs of the same scenario against different corpora are not comparable.** That
sentence is cheap to write and expensive to honour: it means the corpus is part of the
measurement, not scaffolding around it.

So the corpus is **built by a committed script**, not improvised and not committed as a
tree:

```sh
sh skills/<skill>/evals/fixture/build.sh /tmp/eval-run-1
```

Requirements on that script, each earned:

- **Deterministic.** No `date`, no random ids, no network. Build it twice and the git SHAs
  must match — if they do not, two runs saw two different worlds and the comparison is
  void.
- **A builder, not a tree.** A committed tree drifts from the skill's own templates in
  silence; a builder can be diffed for intent and reviewed like code.
- **It refuses to overwrite.** An eval that runs against a dirtied previous run measures
  the previous run.
- **It satisfies every scenario's stated precondition.** If a scenario says "a sprint with
  ≥8 stories", a 2-story corpus weakens the pressure to something other than what was
  specified — and the result is then filed under a scenario that did not actually run.

---

## 3. Running one blind

1. Build a **fresh corpus per scenario** — never share one directory across scenarios; a
   later run would inherit the earlier agent's edits.
2. Give a fresh agent: the skill's path, the corpus path, and the scenario's prompt
   **verbatim**. Nothing else.
3. Let it work. Do not steer, do not answer clarifying questions with hints.
4. Collect the artifact — the files it created or modified.

Where a scenario's prompt names IDs or dates that do not exist in the corpus, **adapt the
IDs and keep the pressure identical**, and record the adaptation in the run's notes. The
sentence structure carries the trap; the identifiers do not.

Run on **more than one model tier** where you can. A rule that holds only on the strongest
model is a rule that will break in production, and the cheaper tiers are where the
rationalizations actually happen.

---

## 4. Scoring

Score the **artifact**, against the scenario's criteria, as observable facts. "The agent
explained the rule well" is not a criterion; "`commit:` never contains `pending` at rest"
is.

**Every criterion must hold.** A scenario that "mostly" passes is a fail — these rules are
BLOCKERs, and a BLOCKER that holds four times in five is a BLOCKER that ships the fifth.

The scorer may be the skill's author. This is the one place author-blindness is *not*
required, and the reason is structural: the thing under test is the agent's behaviour, and
the agent was blind. The criteria are mechanical enough that a biased scorer would have to
lie rather than merely flatter. Where a criterion is not mechanical, that is a defect in
the criterion — rewrite it as a fact about the artifact.

Record in the scenario file's `## Runs` table: date, model, result, and notes. **A regression
on a model tier is a finding, not a footnote.**

---

## 5. The freshness gate

CI has no agent, so **CI cannot run an eval**. Pretending otherwise produces the failure
this catalog keeps rediscovering — a check that cannot fail.

What CI *can* assert is **freshness**: no scenario's most recent run may predate the last
change to the skill it measures.

```
skill edited → every Runs table for that skill is now stale → build red
```

That is the honest mechanization. It does not claim the behaviour is good; it claims
**nobody has changed the skill since the last time anyone checked**. Which is exactly the
drift this gate exists to catch, and is the strongest claim a runner-less CI can make.

Consequences worth stating plainly:

- A skill edit is not shippable until its evals are re-run. That is the cost, and it is the
  point — it is the same bargain `run-all.sh` makes for gate checks.
- **A docs-only typo fix in a `SKILL.md` also trips it.** Live with it rather than carving
  out exceptions by file or diff size: "this edit could not possibly change behaviour" is a
  judgement, and the whole apparatus exists because that judgement is unreliable.
- The gate reads the `## Runs` tables and the skill's git mtime. Both are already there; no
  new artifact class is introduced.

---

## 6. Growing the corpus

**Do not jump to a round number.** A corpus sized to a target rather than to real failures
is a memory of what someone imagined, and it lags the claim surface exactly the way
hand-written fixture lists did before coverage was derived from code.

Grow it from three sources, in this order of value:

1. **An escaped defect.** Anything that shipped wrong and was caught downstream becomes a
   permanent scenario. This is the regression-learning loop applied to behaviour rather
   than code — see [`regression-learning.md`](regression-learning.md).
2. **A skill-grading D2 RED.** A rule that folded under pressure during a grade is a rule
   whose failure is already characterized; converting it to an eval makes it cheap to
   re-check forever.
3. **A new BLOCKER rule.** A rule strong enough to block a commit is strong enough to
   deserve a behavioural test that it actually blocks anything.

**A floor, not a target.** Carry a `MIN_SCENARIOS` the way the reference-checker suites
carry `MIN_CLASSES` and `MIN_MUTANTS` — emptying the corpus must fail, because "0 scenarios,
0 failures" has the same exit code as a healthy run.
