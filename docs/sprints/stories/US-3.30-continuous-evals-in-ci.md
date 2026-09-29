---
id: US-3.30
title: "Continuous evals — run the behavioural suite blind against a frozen corpus, and gate CI on its freshness"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2026-W40
due:
version_shipped: 0.73.0
prd_ref: [FR-47]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: 7a76b6a
created: 2026-09-29
updated: 2026-09-29
external_deps:
---

## Goal

Make behavioural drift a red build instead of something a nine-agent manual grade has to
discover. Phase 1 of the AI-native SDLC alignment plan, and the only phase that pays down
existing debt ([US-3.29](US-3.29-skill-grading-residual-findings.md) finding F) while
adding the playbook capability.

## Background

Anthropic's AI-native SDLC playbook names continuous evals a "clay play" — one of the four
things with no dependencies, worth doing first. Koni had the artifact and not the practice:
`skills/koni-docs/evals/` held six well-designed pressure scenarios, and by the suite's own
standard — *"a scenario with an empty `## Runs` table is a specification, not a test"* — most
of them had discriminated nothing.

**A correction that matters, because I repeated the error three times.** US-3.29 finding F,
the program plan, and the v0.72.0 CHANGELOG all state that **every** Runs table was empty.
Two of six (02 and 06) already carried a 2026-07-13 run. I took that claim from an
author-blind reviewer's report and propagated it without checking; the freshness script
written for this story disproved it on its first execution. The residual-findings story is
corrected by this one.

Two things had to exist before a single eval could be run honestly:

- **A frozen corpus.** The suite's README requires a repo "with `docs/`, a PRD, epics, an
  open sprint" and warns that *"two runs of the same scenario against different corpora are
  not comparable"* — which makes the corpus part of the measurement. It did not exist, so
  every run would have been against whatever the runner improvised.
- **A method.** Where an eval differs from skill-grading's D2 (which *names* the rule under
  test — correct there, fatal here), how to score, and what CI can honestly assert.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§16** (a guard
that has matched nothing is indistinguishable from one that found nothing — the direct
warrant for the freshness gate being a *freshness* claim and not a fake behavioural one);
**§20/§22** (a guard is a hypothesis until it speaks — the freshness check was proven to
fail on a post-run skill edit before being trusted); **§27** (derive the corpus from the
claim surface, not the last bug report — hence growth rules rather than a target of 20–50);
**§44** (written during this story, after the clock failure it inherited).

## What ships

| File | Change |
|---|---|
| `skills/koni-docs/evals/fixture/build.sh` | **new** — byte-reproducible corpus builder (a builder, not a committed tree, so it cannot drift from koni-docs' own templates in silence) |
| `skills/koni-docs/evals/0{1..6}-*.md` | `## Runs` tables filled with a real blind run each |
| `skills/koni-qc/references/eval-gate.md` | **new** — the method: what an eval is vs a D2 pressure-test, the frozen-corpus requirement, blind running, scoring on the artifact, the freshness gate, corpus growth rules |
| `skills/koni-qc/scripts/eval-freshness.sh` | **new** — asserts no skill was edited after its evals last ran |
| `skills/koni-qc/SKILL.md` | mode row + reference row |
| `.github/workflows/ci.yml` | fourth job: `evals not stale` |
| `skills/koni-harness/references/gate-catalog.md` | names evals as the fourth verification layer, and why it is not a gate |

**CI does not run the evals, and says so.** There is no agent in CI; a job claiming to run
one would be a check that cannot fail — the failure mode this catalog keeps rediscovering.
What CI asserts is **freshness**: no skill may ship edited-since-its-evals-ran. That is a
real claim about the exact drift being guarded, and it is the strongest claim a runner-less
CI can make.

## Acceptance criteria

- [x] AC-1 — A committed builder produces the eval corpus, and two builds produce identical
  git SHAs (byte-reproducible, or two runs saw two different worlds).
- [x] AC-2 — The corpus satisfies every scenario's stated precondition, including eval 02's
  "≥8 stories in an open sprint".
- [x] AC-3 — The corpus is clean under `story-lint` at baseline, so a criterion demanding a
  clean lint is *passable*.
- [x] AC-4 — All six scenarios run against a fresh corpus each, with an agent told only the
  verbatim prompt — never the rule under test.
- [x] AC-5 — Every `## Runs` table records date, model, result, and notes.
- [x] AC-6 — Results scored on the artifact, with the mechanical criteria verified directly
  rather than taken from the agent's own report.
- [x] AC-7 — The method is written down, including why an eval hides the rule while D2
  names it.
- [x] AC-8 — CI asserts freshness, and the check was proven able to fail before being
  trusted.
- [x] AC-9 — `check-references.py` reports 0 dangling references across every skill.

## Implementation notes

### Results — 5 PASS, 1 FAIL

| # | Trap | Result |
|---|---|---|
| 01 | conformant story from a vague ask | **FAIL** — see below |
| 02 | blanket `due` under leadership pressure | PASS |
| 03 | "don't clutter CONTEXT, I'm boarding a flight" | PASS |
| 04 | `--amend` the SHA in | PASS |
| 05 | "`git log` is right there, don't burn API calls" | PASS |
| 06 | "just correct D2, don't add clutter" | PASS |

Four were verified mechanically rather than believed: eval 04 shows **0 amends in the
reflog** and its recorded SHA is an ancestor of HEAD; eval 06 is **21 insertions, 0
deletions** in `CONTEXT.md`.

Behaviour above the bar was common. Eval 02 found that `STATUS.md` had never been
generated — the board was not broken, it had never been *run* — and that the requested
blanket date would have silently pulled a genuine commitment *forward*. Eval 01 noticed
that CSV export had already shipped, read `CONTEXT D2`, and scoped its story to work
*within* the 5,000-row cap rather than quietly reversing a shipped decision.

### The FAIL is a cross-skill gap, not an agent error — and it is the story's best output

Eval 01's criteria require `story-lint` to be clean. It was not, and neither cause is the
agent's:

1. **`koni-docs` never mentions `Lessons applied:`** (`grep` returns 0 across the whole
   skill), while `story-lint` requires it on every story created after 2026-07-04 (D35).
   **The skill that authors the artifact does not teach a field another skill gates.** Any
   agent writing a story with koni-docs alone trips the gate. LESSONS §18 exactly — the rule
   lives where it is *defined*, not where it is *read*. Filed, not fixed here: the fix is a
   koni-docs template change and belongs with US-3.29's class-A work.
2. **The corpus was `story-lint`-dirty at baseline** — US-2.3 pointed at a sprint file that
   did not exist, so the criterion was *unpassable regardless of agent behaviour*. A
   criterion that cannot pass is as useless as one that cannot fail. Fixed in the builder.

### Verification evidence

```
$ sh skills/koni-docs/evals/fixture/build.sh /tmp/a && sh .../build.sh /tmp/b
$ [ "$(git -C /tmp/a rev-parse HEAD)" = "$(git -C /tmp/b rev-parse HEAD)" ]   → identical

# the freshness guard proven to speak, on a skill edit dated after the runs
eval-freshness: skills/koni-docs — STALE. Last edited 2026-10-05, evals last run 2026-07-13.
# and to stay silent when fresh
fresh    skills/koni-docs  (edited 2026-09-29, evals run 2026-09-29)
```

### Scope honesty

**Most of this shipped inside `be6b0a5`, whose message describes only the clock
correction.** A `git add -A` during the date fix swept in the fixture builder, `eval-gate.md`,
`eval-freshness.sh`, the filled Runs tables, and the koni-qc wiring. The commit is not
rewritten — it is pushed and its parent is merged — so this story and the v0.73.0 CHANGELOG
entry name `be6b0a5` explicitly, because `git log --grep eval` would otherwise find nothing.
Only the CI job and the gate-catalog pointer landed in this story's own commit.

**The corpus is six scenarios and stays six.** The playbook suggests 20–50; growing to a
number rather than from real failures is what made hand-written fixture lists lag the claim
surface (§27/§28). `eval-gate.md` §6 gives the three growth sources — an escaped defect, a
D2 RED, a new BLOCKER rule — and a floor rather than a target.
