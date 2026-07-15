---
id: US-5.11
title: "koni-qc security-review — a detailed, adversarial security-testing capability"
epic: EPIC-5
status: done
priority: P1
points: 3
sprint: sprint-2026-W29
due:
version_shipped: 0.53.0
prd_ref: [FR-39]
arch_ref: []
depends_on: [US-5.1, US-5.8]
assignee: jindo9986
commit:
created: 2026-07-13
updated: 2026-07-13
external_deps:
---

## Goal

koni-qc could name *which* security categories a suite should cover — an 8-item
checklist in `nfr.md` §Security — but not *how* to derive the cases, run a rigorous
review, or write a finding a ship decision can rest on. This story adds that depth:
`references/security-review.md`, which brings the rigor of Anthropic's `/security-review`
methodology into koni-qc's "derive exhaustive, traceable coverage from requirements"
idiom. After it, koni-qc can threat-model a surface, derive the security test cases each
trust boundary demands, review adversarially so a plausible-but-wrong finding cannot
survive, and produce a decision-grade findings report with a release sign-off.

## Background

The trigger was a direct request: make koni-qc's security testing *detailed and strong*,
modelled on `/security-review`. The existing `nfr.md` §Security is a good **trigger and
shortlist** — but a checklist is not a method. `/security-review` supplies what was
missing: a threat-model-first frame, a category taxonomy with concrete attacker inputs,
an **adversarial identify → refute → confidence-filter** loop, a finding schema with an
exploit scenario, and — crucially — a **false-positive discipline** (hard exclusions,
precedents, a signal-quality bar) so the report stays trusted.

The design keeps the two in their lanes: `nfr.md` stays the shortlist and points to the
new file for depth (single-source — LESSONS §21, no restated second copy), and the new
file **owns the method and the finding rubric** while **delegating every engine** — the
running exploit to gstack, the live 2-credential RLS harness to `live-harness.md`, the
blocking gate to koni-harness, the report body to koni-docs. That is the same
compose-never-reproduce boundary koni-qc keeps everywhere (US-5.1).

The adversarial review loop is deliberately the same shape as koni-qc's own
`skill-grading.md` (independent agents, an honest bar, a claim that must survive
refutation) and as `/security-review`'s three-step sub-task fan-out. And a confirmed vuln
feeds the existing `regression-learning.md` loop: escaped bug → red-first `SEC`/`REG`
test → class-generalization sweep.

Design input: Anthropic's `/security-review` skill (categories, confidence scoring,
false-positive filtering).

**Lessons applied**: read at Frame from [LESSONS.md](../../LESSONS.md) — §21 (a cheatsheet
that restates a contract is a second contract → nfr.md points to the method, does not
copy it), §22/§26 (a guard that cries wolf gets muted → the false-positive discipline is
first-class, not an afterthought), §13 (one story = one deliverable → the security method
is its own capability, not bolted onto an existing reference).

## Acceptance criteria

- [x] **AC-1** — `references/security-review.md` exists and covers, at minimum:
  threat-model-first framing; a per-category derivation taxonomy (authn, authz/IDOR, RLS,
  injection {SQL/NoSQL/command/path/template/XXE}, XSS, deserialization/RCE, SSRF,
  secrets/crypto, session/CSRF, data-exposure/PII); the adversarial identify → refute →
  confidence-filter method; a finding schema with an **exploit scenario**; severity +
  confidence rubrics; a false-positive discipline; escaped-vuln → REG test; the release
  security sign-off.
- [x] **AC-2** — The file **composes, never reproduces**: it names gstack as the exploit
  runner, `live-harness.md` as the 2-credential RLS harness, koni-harness as the gate,
  koni-docs as the report body — and does not re-implement any of them.
- [x] **AC-3** — `nfr.md` §Security is reduced to the shortlist + trigger and **points**
  to `security-review.md` for the depth (no duplicated method).
- [x] **AC-4** — koni-qc SKILL.md is wired: an ownership row (§1), a mode row (§2), an
  activation row (§3), a reference-index row (§5), and a security-review clause in the
  frontmatter `description` so the intents (threat model, injection, IDOR, SSRF, XSS,
  auth bypass, RLS, "is this safe to ship") route here.
- [x] **AC-5** — Every reference in koni-qc resolves: `python3
  skills/koni-docs/scripts/check-references.py skills/koni-qc` → 0 dangling. (It caught a
  dead §-pointer in the first draft; fixed.)

## Tasks

- [x] **TASK-5.11.1** — Author `references/security-review.md` (AC: 1, 2)
- [x] **TASK-5.11.2** — Reduce `nfr.md` §Security to shortlist + pointer (AC: 3)
- [x] **TASK-5.11.3** — Wire SKILL.md (ownership / modes / activation / reference index /
  description) (AC: 4)
- [x] **TASK-5.11.4** — Reference-check koni-qc; fix any dangling pointer (AC: 5)

## Dev notes

### Architecture constraints

- No new AD. This is a coverage-intelligence reference plus wiring; it introduces no new
  tooling and reuses the shared `check-references.py` gate.
- The method **delegates** — it must not grow into a scanner or a runner. Running the
  exploit is gstack's; the gate is koni-harness's. If a future story wants an automated
  security gate, that is koni-harness's `gate-catalog`, not this file.

### Cross-story dependencies

- Builds on [US-5.1](US-5.1-koni-qc.md) — the compose-never-reproduce boundary and the
  `docs/tests/` structure this method's cases land in.
- Builds on [US-5.8](US-5.8-layered-suites-report-quality.md) — `regression-learning.md`
  (escaped vuln → REG test) and `live-harness.md` (the 2-credential RLS recipe) are the
  engines this method points at.

### What we explicitly did NOT do

- **No automated scanner / SAST tool.** koni-qc is coverage intelligence, not a runner.
  The method derives cases and reviews findings; gstack drives the attack.
- **No new koni-harness gate in this story.** A blocking "security-review-required on
  high-risk change" gate is named as the harness's to own; wiring it is a separate story.
- **No duplication of the nfr.md checklist.** The method owns the depth; the checklist
  stays the trigger.

### References

- [Source: PRD FR-39](../../PRD.md#functional-requirements)
- [Source: CONTEXT D38](../../CONTEXT.md)
- Anthropic `/security-review` skill — the methodology this adapts

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2, AC-3 | `rg -n 'threat model\|identify → refute\|Composes, never reproduces\|false-positive' skills/koni-qc/references/security-review.md` returns the sections |
| AC-4 | `rg -l 'security-review' skills/koni-qc/SKILL.md` returns the file |
| AC-5 | `python3 skills/koni-docs/scripts/check-references.py skills/koni-qc` → `0 dangling` |

## Changelog entry

### Added
- koni-qc `references/security-review.md`: a detailed, adversarial security-testing method — threat model → per-category case derivation → identify/refute/confidence-filter review → decision-grade finding report + release sign-off → escaped-vuln REG test. Brings `/security-review` rigor into koni-qc's coverage-intelligence idiom.
- koni-qc SKILL.md: a **Security-review** mode, an ownership row, activation + reference-index rows, and security triggers in the description.

### Changed
- `nfr.md` §Security is now the shortlist + trigger, pointing to `security-review.md` for the method (single-source; no duplicated depth).

**Commit**: <backfilled in a follow-up commit>

## Implementation notes

The one real finding during the work was my own: the first draft's §-pointer to
`live-harness.md §2-credential recipe` did not resolve — the section is titled
"Integration: test RLS as a real user (the 2-credential recipe)". The shared
`check-references.py` gate caught it before commit. Fixed by naming the recipe in prose
and linking the file, not a nonexistent §-anchor — the same discipline the checker
enforces across all six skills.

Security review of this change itself: the diff is pure markdown (a method reference +
wiring). Per the method's own hard exclusions (no findings in documentation files) and
the absence of any code/execution surface, there are no security findings to raise.

Lessons: none new — the one self-caught dead §-pointer is already LESSONS §18/§19
(references are enforced where they are read), and the compose-never-reproduce discipline
this applied is established (D-series on koni-qc), not a fresh trap.

## Files modified

**Created (skills/koni-qc):**
- `references/security-review.md` — the security method.

**Modified (skills/koni-qc):**
- `SKILL.md` — ownership / modes / activation / reference index / description.
- `references/nfr.md` — §Security reduced to shortlist + pointer.

## Cross-references

- [PRD FR-39](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D38](../../CONTEXT.md)
- [CHANGELOG v0.53.0](../../CHANGELOG.md)
