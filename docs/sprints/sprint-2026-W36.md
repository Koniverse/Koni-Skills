---
id: sprint-2026-W36
status: in-progress
start: 2026-08-31
end: 2026-09-06
goal: 'Absorb five patterns from a comparative read of `awslabs/aidlc-workflows` into the Koni skills: give brownfield onboarding a reverse-engineering pass (US-3.25), make the Frame stage as specified as the back half of the loop (US-3.26), put the gate checks under a coverage-derived evaluator and CI (US-3.27), and name the second extension axis the catalog has been running unnamed (US-3.28).'
---
## Sprint scope

| US      | Title                                                           | Epic   | Pri | Points | Status | Ship    | Story file                                                                                       |
| ------- | --------------------------------------------------------------- | ------ | --- | ------ | ------ | ------- | ------------------------------------------------------------------------------------------------ |
| US-3.25 | koni-setup reverse-engineering pass for brownfield onboarding    | EPIC-3 | P2  | 3      | ✅ done | v0.70.0 | [stories/US-3.25-reverse-engineering-onboard.md](stories/US-3.25-reverse-engineering-onboard.md) |
| US-3.26 | Frame protocol + stage-applicability table                       | EPIC-3 | P1  | 5      | ✅ done | v0.70.0 | [stories/US-3.26-frame-protocol.md](stories/US-3.26-frame-protocol.md)                           |
| US-3.27 | Guard evaluator — run every check self-test, prove the coverage  | EPIC-3 | P1  | 5      | ✅ done | v0.70.0 | [stories/US-3.27-guard-evaluator-ci.md](stories/US-3.27-guard-evaluator-ci.md)                   |
| US-3.28 | Concern extensions — the second koni-docs extension axis          | EPIC-3 | P2  | 3      | ✅ done | v0.70.0 | [stories/US-3.28-concern-extensions.md](stories/US-3.28-concern-extensions.md)                   |

**Total**: 4 stories / 16 pts / 1 contributor.

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

**Opened on the real date, from `date` — and the first attempt got it wrong.**
This sprint was initially opened as W35 (2026-08-24 → 2026-08-30) from an inferred
date. `date` says 2026-09-04, which is **W36**. The wrong file was deleted rather
than kept "for continuity" — a sprint whose dates were guessed is the exact artifact
[D40](../CONTEXT.md) was written about, and it was made twice now. The date comes
from the clock, never from arithmetic in someone's head.

**W30 closed at its real end date; W31–W35 not opened.** W30 sat at
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
