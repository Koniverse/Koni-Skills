---
id: US-5.2
title: "skill-grading — QC for skill artifacts, wired into the harness build/verify loop"
epic: EPIC-5
status: done
priority: P1
points: 3
sprint: sprint-2026-W26
version_shipped: "0.18.0"
prd_ref:
  - FR-27
arch_ref: []
depends_on:
  - US-3.3
  - US-5.1
assignee: jindo9986
commit: 1298899
created: 2026-06-30
updated: 2026-06-30
---

## Goal

Codify the multi-skill grading method that hardened koni-harness + koni-qc
(v0.17.2) into a **reusable capability**, so the harness can *build and verify the
building of* future skills the same way. koni-qc gains a **skill-grading** rubric
(QC applied to a skill artifact, not a product feature); koni-harness **invokes**
it in the Review stage whenever the deliverable is a skill.

Compose-first (CONTEXT [D13](../../CONTEXT.md)/[D15](../../CONTEXT.md)): koni-qc
*owns* the rubric + the four-dimension method; it **delegates** the actual eval
engines — `skill-creator` (triggering), `writing-skills` (pressure-tests + the
Anthropic best-practices doc), `superpowers:code-reviewer` (author-blind content)
— and never reproduces them.

## Background

Surfaced while grading koni-harness (96/100) + koni-qc (97/100) — the method
worked but lived only in a transcript + [LESSONS §8](../../LESSONS.md). This story
turns it into a first-class koni-qc mode + harness wiring. Method of record:
LESSONS §8; decision: CONTEXT D15.

## Acceptance criteria

- [x] **AC-1** — `skills/koni-qc/references/skill-grading.md`: the four-dimension
  rubric (D1 triggering · D2 rule-robustness · D3 author-blind content · D4
  best-practices), each /25 → /100, with a hard bar (≥90 ship, ≥95 foundational),
  the delegated tool per dimension, and the non-negotiable method (one agent per
  dimension, re-verify each fix round, average the subjective axis, stop on
  Suggestions-only).
- [x] **AC-2** — koni-qc `SKILL.md` exposes it: a **"Grade a skill (skill-QC)"**
  mode, an activation row ("grade this skill" / "score this SKILL.md"), a
  delegates row for the eval engines, a reference-index row, and a description
  trigger — without reproducing the delegated tools.
- [x] **AC-3** — koni-harness wires it into **Review**: the standard's tool-split
  note, the `loop-runner.md` review drive row, and `SKILL.md` all state that when
  the deliverable is a skill, the koni-qc review step runs skill-grading to a bar.
- [x] **AC-4** — Compose-not-duplicate holds: skill-grading references
  skill-creator / writing-skills / `superpowers:code-reviewer` / the Anthropic
  best-practices doc **by name** and reproduces none (boundary stated in the file).
- [x] **AC-5** — koni-docs updated: VERSION 0.18.0, CHANGELOG [0.18.0], PRD FR-27 +
  EPIC-5 story row, this story; `validate` green; harness suites still pass.

## Tasks

- [x] **TASK-5.2.1** — Author `references/skill-grading.md` (rubric + method).
- [x] **TASK-5.2.2** — Wire koni-qc SKILL.md (mode / activation / delegates / index / description).
- [x] **TASK-5.2.3** — Wire koni-harness (standard + loop-runner + SKILL.md review step).
- [x] **TASK-5.2.4** — koni-docs layer (VERSION/CHANGELOG/PRD/EPIC/story) + validate.

## References

- [koni-qc skill-grading](../../../skills/koni-qc/references/skill-grading.md)
- [koni-qc SKILL.md](../../../skills/koni-qc/SKILL.md) · [koni-harness SKILL.md](../../../skills/koni-harness/SKILL.md)
- [US-3.3 — koni-harness](US-3.3-koni-harness-agentic-loop.md) · [US-5.1 — koni-qc](US-5.1-koni-qc.md) (the skills this grades)

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [CONTEXT D15 — the loop tool-split](../../CONTEXT.md) · [LESSONS §8 — the grading method](../../LESSONS.md)
- [CHANGELOG 0.18.0](../../CHANGELOG.md)
