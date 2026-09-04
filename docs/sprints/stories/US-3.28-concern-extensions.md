---
id: US-3.28
title: "Concern extensions — name the second koni-docs extension axis the catalog has been running unnamed"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2026-W36
due:
version_shipped: 0.70.0
prd_ref: [FR-46]
arch_ref: []
depends_on: []
assignee: jindo9986
commit: pending
created: 2026-09-04
updated: 2026-09-04
external_deps:
---

## Goal

Separate the two unrelated reasons a repo needs extra rules — *what it is built with* and
*what it must guarantee* — into two declared axes, so a repo that changes framework cannot
silently drop its security posture.

## Background

`plugins:` was the only extension axis, and it is keyed to the stack. AI-DLC's `extensions/`
directory carries a different kind: `security-baseline`, `resiliency-baseline`,
`property-based-testing` — cross-cutting concerns, opt-in via a prompt, with non-optional
ones always enforced.

The important finding was that **Koniverse already runs exactly this shape** and had no word
for it. The `security` concern exists today, spread across three skills: koni-qc owns the
method (`security-review.md`), the repo declares its trust boundaries in
`.koni-harness/security-paths`, and the harness `security-review` gate watches them —
dormant until declared. Nothing named the pattern, so the next concern would have been
invented from scratch rather than instantiated.

So this story **names an axis, it does not invent a framework**. No speculative concern
packs were added; `security` is documented as the worked example the way `koni-nextjs` is
the worked example for the stack axis. Adding `resiliency` or `accessibility` later is now
an authoring checklist, not a design problem.

The distinction is load-bearing, not cosmetic: a stack plugin is **implied by the code** (a
repo either has a `next.config` or it does not), while a concern is **imposed on it**
(nothing in a Next.js repo tells you whether it moves money). Collapsing them into one list
is how a rule ends up in the wrong place.

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — **§21** (a
convenience copy of a contract is a second contract, and the wrong key `koni-docs-plugins:`
survived in four files because it lived where everyone reads and nobody re-derives — hence
the nesting under `koni-docs:` is restated at every point the key is taught, and the
concern *registers* the method rather than restating it); **§18** (a rule is only enforced
where it is read — hence `concerns:` landed in the integration template's four config
blocks, not only in `plugin-pattern.md`); **§20** (an obligation that is not addressable is
not enforceable — hence a concern must name a trigger surface, or it is not ready).

## What ships

- **`skills/koni-docs/references/plugin-pattern.md`** — a *Two axes of extension* section
  up front, and a *Concern extensions* section covering discovery (`concerns:` nested under
  `koni-docs:`), the opt-in vs **trigger-enforced** enrolment modes, the declared trigger
  surface, the `security` worked example as an ownership table, and a 6-step authoring
  checklist.
- **`skills/koni-docs/SKILL.md`** — the always-loaded surface now teaches both axes, with
  the nesting stated explicitly in all three places it appears.
- **`skills/koni-docs/references/templates/integration.md`** — `concerns:` added to all
  four config blocks, plus a *two extension keys* subsection where an agent first meets them.
- **`skills/koni-qc/SKILL.md`** — the security-review ownership row now names itself as the
  `security` concern and states that it is trigger-enforced.
- **`CLAUDE.md`** — this repo declares `concerns: []` with the honest reason (no trust
  boundary ships here).

## Acceptance criteria

- [x] AC-1 — The two axes are distinguished by the question each answers, with the reason
  the distinction matters stated.
- [x] AC-2 — `concerns:` is defined as a sibling of `plugins:`, **nested under
  `koni-docs:`**, and the nesting is restated at every point of use (§21).
- [x] AC-3 — Both enrolment modes are defined, and the trigger-enforced case is explicit
  that a repo cannot opt out of the review by omitting a line.
- [x] AC-4 — A concern must name a machine-readable trigger surface; the checklist rejects
  one that cannot (§20).
- [x] AC-5 — `security` is documented as the worked example, as an ownership table naming
  which skill supplies method / surface / gate / loop placement.
- [x] AC-6 — No concern restates another skill's method; the axis registers *when* and
  *where*, the owning skill keeps *how*.
- [x] AC-7 — The composition contract (namespaced rules, no re-opening the core 13, declare
  into the harness gate rather than rebuilding it) holds across the axis change.
- [x] AC-8 — `check-references.py` reports 0 dangling references across every skill.

## Implementation notes

**Verification evidence:**

```
$ for s in skills/*/; do python3 skills/koni-docs/scripts/check-references.py "$s"; done
0 dangling reference(s)   # × 6 skills
```

**No new concern was invented, deliberately.** The temptation was to port AI-DLC's three
extensions (`security-baseline`, `resiliency-baseline`, `property-based-testing`) as a set.
Two of the three have no owner in this catalog and no trigger surface, which by the
checklist's own AC-4 means they are not ready — shipping them would have produced three
empty rule tables that read as capabilities. `property-based-testing` also fails the naming
rule: it is a technique, and the concern it serves is correctness.

**The naming rule earned its place immediately.** Writing the checklist forced the question
"what guarantee does this concern name?" onto AI-DLC's own list, and one of its three
entries did not survive it.
