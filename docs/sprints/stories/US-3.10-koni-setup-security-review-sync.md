---
id: US-3.10
title: "koni-setup docs sync — surface the koni-qc security-review capability + the vendored security-review gate"
epic: EPIC-3
status: done
priority: P2
points: 1
sprint: sprint-2026-W29
due:
version_shipped: 0.56.0
prd_ref: [FR-20]
arch_ref: []
depends_on: [US-5.11, US-3.9]
assignee: jindo9986
commit: pending
created: 2026-07-15
updated: 2026-07-15
external_deps:
---

## Goal

Two sibling skills shipped capabilities that koni-setup — the skill that onboards a repo
to the Koniverse standard — did not yet describe: koni-qc gained a **security-review**
method (US-5.11, v0.53.0–0.54.0) and koni-harness gained a **`security-review`** warn gate
that its `install-gate.sh` now vendors into every scaffolded repo (US-3.9, v0.55.0). An
onboarder reading koni-setup's inventory would not learn that either exists. This is a
documentation sync — no scope change to FR-20 — so koni-setup's picture of the trio matches
what the trio actually does today.

## Background

koni-setup delegates the gate install to koni-harness's `install-gate.sh`, so a scaffolded
repo *already* receives the new `security-review` check the day US-3.9 shipped — the code
path needed nothing. What lagged was the **description**: `skill-inventory.md` listed
koni-qc's capabilities without security-review, and neither the inventory nor the
onboarding audit mentioned the opt-in gate a repo can now activate. A skill whose docs
under-describe the tools it installs quietly teaches an onboarder the wrong baseline.

The one subtlety that made this more than a find-and-replace: **what a scaffolded repo
inherits is defined by the *vendored* default `gates.conf`
(`skills/koni-harness/scripts/gates.conf`), not the monorepo's own live
`.koni-harness/gates.conf`.** The vendored default carries `security-review` but **not**
`skill-references` (that gate audits skill docs and ships only inside `Koni-Skills`). The
docs had to state exactly what a product repo gets — claiming it inherits `skill-references`
would have been a plausible, wrong over-claim. See [LESSONS §30](../../LESSONS.md).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §19 (never trust a
self-review: an author-blind reviewer verified all six ground truths against the vendored
files before ship); §30 (documented here — read the vendored config, not the live one, when
describing what a scaffolded repo inherits).

## Acceptance criteria

- [x] **AC-1** — `skill-inventory.md`'s koni-qc bullet lists the **security review**
  (threat-model a surface; derive injection / IDOR / SSRF / XSS / auth-bypass / RLS test
  cases), matching koni-qc's own SKILL.md description.
- [x] **AC-2** — `skill-inventory.md`'s koni-harness bullet states the vendored default
  `gates.conf` now carries the opt-in `security-review` warn check — a no-op until the repo
  declares boundaries in `.koni-harness/security-paths` — and explicitly notes that the
  monorepo-only `skill-references` check is **not** vendored into a scaffolded product repo.
- [x] **AC-3** — `onboarding-audit.md` carries an *optional* audit item pointing a repo with
  trust boundaries at `.koni-harness/security-paths` to activate the gate, framed as opt-in
  (absence is not a scaffolding gap), never-blocks, pointing at koni-qc's `security-review.md`.
- [x] **AC-4** — every claim is true against the vendored files: the vendored `gates.conf`
  has a `security-review` row and no `skill-references` row; `security-review.sh` is present
  in the vendored checks dir; `skills/koni-qc/references/security-review.md` exists. All six
  skills: 0 dangling references; the shared checker's self-test / mutation / coverage suites
  pass.

## Tasks

- [x] **TASK-3.10.1** — koni-qc bullet: add the security-review capability (AC: 1)
- [x] **TASK-3.10.2** — koni-harness bullet: vendored `security-review` gate + the vendored-vs-monorepo `skill-references` distinction (AC: 2)
- [x] **TASK-3.10.3** — onboarding-audit optional item (AC: 3)
- [x] **TASK-3.10.4** — verify against vendored ground truth + guard suite; author-blind review (AC: 4)

## Dev notes

### What we explicitly did NOT do

- **No new scaffolding artifact.** The `security-review` gate arrives via
  `install-gate.sh`, which was already vendored; declaring `.koni-harness/security-paths` is
  a per-repo opt-in a human makes when the repo has boundaries worth guarding, not something
  koni-setup writes for them. The audit item is informational, not a `⬜ missing` row.
- **No edit to SKILL.md's high-level trio summary.** It describes the trio at the level of
  "QC methodology" / "the commit gate" — generic and non-exhaustive, so a new capability does
  not render it stale. The detail belongs in `skill-inventory.md`, and duplicating it in
  SKILL.md would create a second copy to drift (LESSONS §28).
- **No claim that a scaffolded repo inherits `skill-references`.** It does not — that gate is
  monorepo-local. The tempting symmetry ("both new gates ship everywhere") is false.

### References

- [Source: PRD FR-20](../../PRD.md#functional-requirements)
- [Source: US-5.11](US-5.11-security-review-capability.md) — the koni-qc capability
- [Source: US-3.9](US-3.9-harness-security-review-gate.md) — the harness gate it vendors
- [Source: LESSONS §19, §30](../../LESSONS.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2, AC-3 | `rg -n 'security review\|security-review\|security-paths' skills/koni-setup/references/skill-inventory.md skills/koni-setup/references/onboarding-audit.md` |
| AC-2, AC-4 | `grep -c security-review skills/koni-harness/scripts/gates.conf` = 1 (comment + row) and `grep -c skill-references skills/koni-harness/scripts/gates.conf` = 0 |
| AC-4 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-setup` → 0 dangling |
| AC-4 | the checker's self-test / mutation / coverage suites under `skills/koni-docs/scripts/__tests__/` all pass |

## Changelog entry

### Changed
- koni-setup docs now describe koni-qc's security-review capability and the vendored opt-in `security-review` gate a scaffolded repo inherits, and distinguish it from the monorepo-only `skill-references` check.

## Implementation notes

A pure documentation sync — no code, no new scaffolding. The single hazard was over-claiming
what a scaffolded repo inherits; resolved by reading the *vendored* default `gates.conf`
(not the live monorepo one) and confirming with an author-blind review before ship.

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-5.11](US-5.11-security-review-capability.md)
- [US-3.9](US-3.9-harness-security-review-gate.md)
- [CHANGELOG v0.56.0](../../CHANGELOG.md)
