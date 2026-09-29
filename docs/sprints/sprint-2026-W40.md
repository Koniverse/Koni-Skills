---
id: sprint-2026-W40
status: in-progress
start: 2026-09-28
end: 2026-10-04
goal: 'Absorb five patterns from a comparative read of `awslabs/aidlc-workflows` into the Koni skills: give brownfield onboarding a reverse-engineering pass (US-3.25), make the Frame stage as specified as the back half of the loop (US-3.26), put the gate checks under a coverage-derived evaluator and CI (US-3.27), and name the second extension axis the catalog has been running unnamed (US-3.28).'
---
## Sprint scope

| US      | Title                                                           | Epic   | Pri | Points | Status | Ship    | Story file                                                                                       |
| ------- | --------------------------------------------------------------- | ------ | --- | ------ | ------ | ------- | ------------------------------------------------------------------------------------------------ |
| US-3.25 | koni-setup reverse-engineering pass for brownfield onboarding    | EPIC-3 | P2  | 3      | ✅ done | v0.70.0 | [stories/US-3.25-reverse-engineering-onboard.md](stories/US-3.25-reverse-engineering-onboard.md) |
| US-3.26 | Frame protocol + stage-applicability table                       | EPIC-3 | P1  | 5      | ✅ done | v0.70.0 | [stories/US-3.26-frame-protocol.md](stories/US-3.26-frame-protocol.md)                           |
| US-3.27 | Guard evaluator — run every check self-test, prove the coverage  | EPIC-3 | P1  | 5      | ✅ done | v0.70.0 | [stories/US-3.27-guard-evaluator-ci.md](stories/US-3.27-guard-evaluator-ci.md)                   |
| US-3.28 | Concern extensions — the second koni-docs extension axis          | EPIC-3 | P2  | 3      | ✅ done | v0.70.0 | [stories/US-3.28-concern-extensions.md](stories/US-3.28-concern-extensions.md)                   |
| US-3.30 | Continuous evals — blind runs on a frozen corpus + CI freshness gate | EPIC-3 | P1 | 5 | ✅ done | v0.73.0 | [stories/US-3.30-continuous-evals-in-ci.md](stories/US-3.30-continuous-evals-in-ci.md) |

**Total**: 5 stories / 21 pts / 1 contributor.

## Goal detail

The trigger was a comparison, not a defect: a read of AWS Labs' `aidlc-workflows`
(a three-phase, stage-gated agentic SDLC ruleset, `aidlc-rules` v1.0.1 on `main`)
against the Koni Agentic Loop.

The comparison's finding was lopsided in a useful way. Koni is well ahead on the
**back half** — deterministic gates with exit codes, VERSION/CHANGELOG atomicity,
the lessons loop, a persistent agile backlog, none of which AI-DLC has at all —
and behind on the **front half**, where AI-DLC has per-stage applicability
criteria and a structured question protocol, and Koni had a three-tier dial and
judgement.

Four of the five borrowed items are that front half plus its verification. The
fifth (US-3.28) is a naming job: the catalog has been running a second extension
axis for versions without a word for it.

**What was deliberately not borrowed**: AI-DLC's ~13 human approval gates per
feature, and its parallel `aidlc-docs/` tree. The first trades away the thing
Koni's gate design exists to protect ("no vibes, no LLM-in-the-loop for a
deterministic rule"); the second is a second source of truth beside `docs/`, and
the copy that is easier to write is the one that goes stale (LESSONS §21).

## Notes

**Opened three times before it was right, and each wrong attempt failed differently.**
First as W35, from a date inferred by arithmetic rather than read — the plain
[D40](../CONTEXT.md) failure. Then as W36, from `date`, which is what D40 prescribes —
and `date` was wrong by 25 days. Only the third reading, cross-checked against git,
`stat`, and an HTTP `Date` header from GitHub, produced **W40**. Every wrong file was
deleted rather than kept "for continuity"; the full account is in
[CONTEXT D44](../CONTEXT.md) and [LESSONS §44](../LESSONS.md).

The lesson D40 did not contain: *read the clock* has no cross-check, and a clock can
lie. The session's own context said 2026-09-29 from the first message while `date` said
2026-09-29, and nothing compared them.

**W30 closed at its real end date; W31–W39 not opened.** W30 sat at
`status: in-progress` for five weeks past its 2026-07-26 end because no work touched
the repo. It is now `done` at its real totals (4 stories / 13 pts). The empty weeks
get no files — nothing shipped in them, and a sprint file with no work in it is
bookkeeping, not history (the W28 precedent). Backdating this work into W30 to keep
the board contiguous is the [D32](../CONTEXT.md) rewrite this repo refuses.

**US-3.27 found a live defect while being written.** The new
`story-status-consistency` suite failed on its own sixth assertion: the check
advertised tolerance for markdown emphasis but could not read `**status**: done`,
the most common bold spelling — so a story written that way was passed in silence.
That is [LESSONS §36](../LESSONS.md) exactly ("a guard that advertises a class but
implements an instance"), found the way §36 predicts: by enumerating the class the
guard *claims*. Fixed in the same commit, with both spellings pinned.

**One new lesson, one deliberate non-lesson.** The idempotence trap in
`install-gate.sh` — "marker block present" short-circuiting the whole step, so every
already-installed repo was frozen at its install-day config — is new, and is
[LESSONS §41](../LESSONS.md). The `story-status` false negative is *not* a new
lesson: it is a fresh instance of §36, and a §42 restating it would grow the file
without growing what it knows.

**Scope honesty — what this sprint did not do.** The Frame protocol's answer-routing
(`frame-protocol.md` §4) is **documented, not gated**. No `frame-answers` check
exists, because harness principle 2 earns a gate with an observed failure and this
class has not yet escaped this repo. If answers start going missing, that is the
evidence the check is owed.

**v0.70.1 — the doc surface v0.70.0 did not finish.** The release shipped its
CHANGELOG / CONTEXT / LESSONS / PRD / EPIC / story surface and stopped there. Four
surfaces were left stale, and one of them was a live defect rather than a gap:
`ARCHITECTURE.md`'s **activation contract** still listed `plugins` alone after
`concerns` shipped — the canonical description of what an agent reads at session
start, teaching an incomplete key set. That is [LESSONS §18](../LESSONS.md) again
(a rule is only enforced where it is *read*), and the diff-to-doc mapping missed it
because "adding a config key" did not look like "module boundaries move" — but an
activation contract **is** architecture.

The other three were gaps: `SETUP.md` had no way to run the new guards (and still
taught `koni-docs sync`, which [D39](../CONTEXT.md) forbids in this repo), `AGENTS.md`'s
structure tree predated `.github/` and `.koni-harness/`, and `STATUS.md` had not been
regenerated since 2026-07-23.

**No story, deliberately.** This refines four already-shipped FRs rather than
delivering a new one, which the anti-sprawl rule sends to a sprint note + CHANGELOG
rather than a US ([D33](../CONTEXT.md)). It is *not* the [LESSONS §37](../LESSONS.md)
"docs-only" excuse: that lesson is about a commit fixing live defects while claiming to
be cosmetic, and the one live defect here is named above rather than waved past.

**One honesty correction while writing it.** A draft line described `docs/tests/` as
carrying "test docs (koni-qc test-organization standard)". The directory is empty and
untracked — the claim would have been exactly the [LESSONS §12](../LESSONS.md) failure
this repo keeps auditing for. `docs/README.md` now states plainly why the taxonomy is
absent and that the empty directory is not the standard half-applied.

Lessons: none new — the one real defect in this round (ARCHITECTURE's activation
contract still teaching `plugins` alone after `concerns` shipped) is LESSONS §18
recurring, not a new trap; §18 already prescribes the fix, which is to grep for the
rule's *recipe* rather than its name. Adding a §42 that restated it would lengthen the
file without teaching anything it does not already say. The `docs/tests/` honesty catch
is likewise §12 working as intended, caught in draft rather than shipped.

**v0.70.2 — the CI added in v0.70.0 failed on its first run, which is the result.** Two
defects, opposite in shape, neither visible on any developer machine: a suite that
inherited the author's global git identity (hard failure, latent since it was written),
and a courtesy-skip that removed three assertions while printing green — the assertions
guarding LESSONS §9, absent from the one environment that most needed them. Both fixed;
the class swept across all ten suites that call `git init`. Recorded as
[LESSONS §42](../LESSONS.md).

The sequence is worth keeping: US-3.27 argued that a guard's green is only worth what its
own verification is worth, and then the guard it added immediately proved the point
against the repo's existing suites.

**v0.71.0 — the skill-grading pass this sprint owed and had not run.** The koni-harness
loop says that when the deliverable is a *skill*, Review runs koni-qc **skill-grading**
(≥95/100, [D19](../CONTEXT.md)) instead of the product AC↔TC gate. Four skills changed in
v0.70.0 and none was graded — the Review stage was declared complete on a step that never
ran, which is [LESSONS §38](../LESSONS.md)'s shape exactly (a stage resolves, so nobody
asks what it resolved over).

**D4 (best-practices) found two defects, both mechanical and both mine:**

1. `koni-harness`'s `description` was **1282 chars against a 1024 platform maximum** — over
   the limit it truncates at load, and a truncated description is a skill that stops
   triggering. It had sat at 1013/1024 for versions; one round of added triggers crossed it.
   Rewritten triggers-only (the rubric forbids workflow/ownership prose in frontmatter):
   876 chars. New: [LESSONS §43](../LESSONS.md).
2. Four **prose assertion-counts** added to `gate-catalog.md` in v0.70.0 — the exact drift
   class US-3.19 mechanized for `checks`. Per [LESSONS §28](../LESSONS.md) an ambiguous
   count is de-numbered rather than mechanized, and this one is genuinely ambiguous (the
   suites report in three dialects; one prints a single line covering five cases). Removed,
   with the reason stated so the next author does not helpfully restore them.

The budget is now guarded rather than remembered: `check-references.py` enforces both
frontmatter limits, pinned by three planted classes, three mutants, and a fixture for the
missing-field branch (the coverage gate rejected the first attempt for exactly that).

**D1 / D2 / D3 have not run.** All three require subagents by method — a blind router
(D1), pressure-test agents (D2), and an author-blind reviewer (D3, and it must not be the
agent that wrote the diff). They are outstanding, not passed.

**v0.72.0 — the grade ran, and all four skills failed it.** Nine graders (one per
dimension per skill; D1 as a single blind router over all six descriptions, because
near-miss detection needs the siblings present). Ceilings: koni-harness ≤85.5,
koni-qc ≤83.9, koni-setup ≤82.7, koni-docs ≤82.0 — all against a ≥95 bar.

**D4 is recorded UNGRADED, not scored.** I ran it myself, ×1, which by the rule the D2
run pressure-tested is not a grade at all. Reporting a self-produced number with a
caveat is exactly the failure that run found in another agent; the caveat does not
survive a copy-paste, the number does. The ceilings above are therefore upper bounds
and the verdict does not depend on D4.

**The findings landed hardest on the executable layer, and the pattern is uniform**: I
wrote good guards for other people and did not run my own. koni-setup's `§6 Verify`
shipped three non-functional checks out of four; the frontmatter budget check went
silent on the one input it was written for; `example-loop.md` did not obey the protocol
this sprint made mandatory. Every one was found by someone running the thing, not
reading it.

Two independent reviewers **disagreed** on whether `security` is opt-in or
trigger-enforced. Both were right about different objects — the obligation vs the gate —
which is itself the evidence the claim was under-specified. Fixed by stating the split
everywhere rather than by picking a side.

Residual findings are filed in
[US-3.29](stories/US-3.29-skill-grading-residual-findings.md) with file:line evidence —
not dropped, and not claimed closed.

Lessons: none new — every defect this round is a fresh instance of a lesson already
written. §39 (a guard bailing out on the case it exists for), §18 (a rule enforced only
where it is defined, not where it is read), §36 (a class advertised, an instance
implemented), §19/§20/§22 (shell written but never run). Four instances of §18 alone.
Writing §44 to say "and again" would grow the file without growing what it knows; the
honest verdict is that the lessons were adequate and I did not apply them.

**This sprint was first filed as W36, from a clock that was wrong.** `date` reported
2026-09-29 for most of this session; the real date is **2026-09-29**, corroborated by git,
`stat`, an HTTP `Date` header from GitHub's servers, and an unrelated blind agent that
volunteered it. 2026-09-29 is W36; 2026-09-29 is **W40**. The six commits `c62be91`…
`18639cf` carry the skewed committer date in git and are **not** rewritten — history is
history. Every doc date is corrected to the true one, and the discrepancy between the two
is recorded in [CONTEXT D44](../CONTEXT.md) so a reader who notices it finds the
explanation rather than a mystery.

`sprint-2026-W40.md` is deleted rather than kept as a void record — it described a week in
which nothing happened, and a board that shows a phantom sprint is the same
doc-dishonesty class as a backdated one. The D33 precedent applies: delete, repoint every
reference, and leave a resolvable note (this paragraph, plus D44).

**v0.73.0 — US-3.30, Phase 1 of the AI-native SDLC alignment.** Six behavioural evals run
blind against a frozen reproducible corpus: 5 PASS, 1 FAIL. The FAIL is the useful one —
koni-docs never teaches `Lessons applied:` while `story-lint` gates it on every new story,
so the skill that authors the artifact does not know about a field another skill enforces.
Filed into US-3.29's class A.

Two of my own claims were disproved by my own tooling this round: "every Runs table is
empty" (two of six already had runs) and a corpus that was lint-dirty at baseline, which
made one eval's criterion unpassable no matter how the agent behaved.

Lessons: none new — the eval work produced no trap that LESSONS does not already name. The
one new lesson this sprint earned was §44, and it came from the clock failure in v0.72.1,
not from here. The "I repeated a reviewer's claim three times without checking it" mistake
is §19's shape (a check that shares its author's blind spot) seen from the other side —
worth noting, not worth a §45.
