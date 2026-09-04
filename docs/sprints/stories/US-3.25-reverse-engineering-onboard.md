---
id: US-3.25
title: "koni-setup reverse-engineering pass — a brownfield repo gets its system model derived from the code before it is called onboarded"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W36
due:
version_shipped: 0.70.0
prd_ref: [FR-43]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: c62be91
created: 2026-09-04
updated: 2026-09-04
external_deps:
---

## Goal

Close the gap that made every brownfield onboard produce a doc surface describing
nothing. `koni-setup` §3 laid down `docs/ARCHITECTURE.md` and `docs/BRIEF.md`, the
audit matrix marked them ⚠️ stub, and the loop moved on — so the next agent re-derived
the system from source, every session, forever.

## Background

The audit matrix asked whether a *file* exists. For a brownfield repo that is the wrong
question: a shaped-but-empty `ARCHITECTURE.md` passes a file-existence check and teaches
nobody anything. AWS Labs' `aidlc-workflows` has a dedicated Reverse Engineering stage
(brownfield-only, gated on user approval) that produces a business overview, architecture,
API list, component inventory, and interaction diagrams. That stage is the one thing in
its Inception phase that Koni had no equivalent of.

Borrowing it required one adjustment and one addition.

The **adjustment** is the ownership boundary ([CONTEXT D12](../../CONTEXT.md)): koni-setup
lays down scaffolds, koni-docs writes content. So this pass owns the *derivation method*
and hands the findings to koni-docs' templates. It contains no template text.

The **addition** is the part AI-DLC does not have: an agent that reads 60% of a system and
writes 100% of a document produces something indistinguishable from a document that was
read in full. Confidence markers and an evidence rule are what make the output safe to
trust *selectively*, and they are why this pass is safe to run at all.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§12** (the doc
layer is only trustworthy if every field is true at write time — hence observed / inferred
/ unknown as a hard rule, and unknowns becoming `backlog` stories instead of prose);
**§18** (a rule is only enforced where it is read — the new pass is wired into the audit
matrix and the SKILL.md mode table, not only into its own reference file); **§38** (an
unspecified step is one whose constraint you cannot see — the pass states what each of the
five passes must extract, rather than being a named step in a checklist).

## What ships

- **`skills/koni-setup/references/reverse-engineering.md`** (new) — trigger + objective
  skip test, the five passes (business overview → architecture → interfaces → component
  inventory → interaction flows), the evidence-and-confidence discipline, the approval
  gate, the landing map into koni-docs templates, and verification.
- **`skills/koni-setup/SKILL.md`** — brownfield callout in §0, the pass inserted as §3
  step 3 (steps renumbered 4–7), a reference-table row, and description triggers for
  "document this existing codebase" / "write ARCHITECTURE.md from the source".
- **`skills/koni-setup/references/onboarding-audit.md`** — a *Brownfield system model*
  section whose rows ask whether the doc **says anything**, not whether the file exists.

Design decisions worth naming:

- **The approval gate is kept.** It is the one human gate koni-setup adds, and it earns
  its place by the harness's own principle 2 test: the error class it catches — a
  plausible-but-wrong system model laundered into the repo's canonical architecture doc —
  is invisible to its author and expensive once downstream stories cite it.
- **No new artifact class.** Findings land in `BRIEF` / `ARCHITECTURE` / `CONTEXT` /
  `backlog` stories, all of which already exist. This is the deliberate divergence from
  `aidlc-docs/`, a parallel doc tree beside the real one.
- **The CONTEXT D-entry is the part that ages well** — it records that the model was
  derived, when, from which commit, and at what confidence, so a future reader finding
  `ARCHITECTURE.md` disagreeing with the code knows whether they are looking at drift or
  at an inference that was always shaky.

## Acceptance criteria

- [x] AC-1 — A brownfield onboard has a named, ordered method for deriving purpose,
  architecture, interfaces, components, and flows from source.
- [x] AC-2 — The method states an objective skip test, so "we already have docs" is a
  checkable claim rather than an opinion.
- [x] AC-3 — Every finding carries evidence (a path); inferred claims are marked
  `(inferred)`; unknowns become `backlog` stories rather than invented text.
- [x] AC-4 — The findings are presented for approval before anything is written to `docs/`.
- [x] AC-5 — Each pass has a named landing place in an **existing** koni-docs artifact; no
  new doc type is introduced.
- [x] AC-6 — The pass is reachable from the surfaces an agent actually reads: the SKILL.md
  mode table, the §3 workflow, the reference table, and the audit matrix (§18).
- [x] AC-7 — `check-references.py` reports 0 dangling references for `skills/koni-setup`.

## Implementation notes

**Verification evidence:**

```
$ python3 skills/koni-docs/scripts/check-references.py skills/koni-setup
0 dangling reference(s) in .../skills/koni-setup
```

The checker earned its keep during this story: an earlier draft of the sibling
`gate-catalog.md` edit named a placeholder script path, and the checker flagged it as a
script that does not exist. That is the guard behaving exactly as LESSONS §19/§20 intend.

**Renumbering was the risk.** Inserting the pass as §3 step 3 shifted steps 3–6 to 4–7,
which invalidated two pointers inside the new reference file itself ("continue with §3
step 3"). Both were repointed and re-verified; grepping for the *recipe* rather than the
step number is what caught them (§18).
